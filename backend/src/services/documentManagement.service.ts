import { DocumentFileModel, DocumentFileDocument } from "../models/document.model";
import { DocumentFile } from "../types";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

/**
 * Document Management Service
 * Handles file uploads, storage, and management
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads", "documents");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common document types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Upload a document
 */
const uploadDocument = async (
  file: Express.Multer.File,
  documentData: {
    companyId: string;
    userId: string;
    category: "invoice" | "receipt" | "contract" | "license" | "other";
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }
): Promise<DocumentFileDocument> => {
  try {
    const document = new DocumentFileModel({
      company: documentData.companyId,
      name: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      category: documentData.category,
      description: documentData.description,
      tags: documentData.tags || [],
      uploadedBy: documentData.userId,
      isPublic: documentData.isPublic || false,
    });

    return await document.save();
  } catch (error) {
    // Clean up uploaded file if database save fails
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error(
      `Failed to upload document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get documents with pagination and filters
 */
const getDocuments = async (
  filters: {
    companyId?: string;
    category?: string;
    uploadedBy?: string;
    isPublic?: boolean;
    tags?: string[];
    search?: string;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{ documents: DocumentFileDocument[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const query: any = { isDeleted: false };

    if (filters.companyId) {
      query.company = filters.companyId;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.uploadedBy) {
      query.uploadedBy = filters.uploadedBy;
    }

    if (filters.isPublic !== undefined) {
      query.isPublic = filters.isPublic;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { originalName: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      DocumentFileModel.find(query)
        .populate('uploadedBy', 'name email')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DocumentFileModel.countDocuments(query)
    ]);

    return {
      documents,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch documents: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get document by ID
 */
const getDocumentById = async (documentId: string): Promise<DocumentFileDocument | null> => {
  try {
    return await DocumentFileModel.findById(documentId)
      .populate('uploadedBy', 'name email')
      .populate('company', 'name');
  } catch (error) {
    throw new Error(
      `Failed to fetch document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Update document
 */
const updateDocument = async (
  documentId: string,
  updateData: {
    name?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    category?: string;
  }
): Promise<DocumentFileDocument | null> => {
  try {
    return await DocumentFileModel.findByIdAndUpdate(
      documentId,
      updateData,
      { new: true }
    )
      .populate('uploadedBy', 'name email')
      .populate('company', 'name');
  } catch (error) {
    throw new Error(
      `Failed to update document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Delete document
 */
const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    const document = await DocumentFileModel.findById(documentId);
    if (!document) {
      return false;
    }

    // Soft delete
    await DocumentFileModel.findByIdAndUpdate(documentId, { isDeleted: true });

    // Optionally delete the actual file
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    return true;
  } catch (error) {
    throw new Error(
      `Failed to delete document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get document statistics
 */
const getDocumentStatistics = async (companyId?: string): Promise<{
  totalDocuments: number;
  totalSize: number;
  categoryBreakdown: { [key: string]: { count: number; size: number } };
  recentUploads: DocumentFileDocument[];
  storageUsage: {
    used: number;
    limit: number;
    percentage: number;
  };
}> => {
  try {
    const query: any = { isDeleted: false };
    if (companyId) {
      query.company = companyId;
    }

    const documents = await DocumentFileModel.find(query);

    const totalDocuments = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

    // Category breakdown
    const categoryBreakdown = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = { count: 0, size: 0 };
      }
      acc[doc.category].count += 1;
      acc[doc.category].size += doc.size;
      return acc;
    }, {} as { [key: string]: { count: number; size: number } });

    // Recent uploads
    const recentUploads = await DocumentFileModel.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Storage usage (assuming 1GB limit per company)
    const storageLimit = 1024 * 1024 * 1024; // 1GB in bytes
    const storageUsage = {
      used: totalSize,
      limit: storageLimit,
      percentage: (totalSize / storageLimit) * 100,
    };

    return {
      totalDocuments,
      totalSize,
      categoryBreakdown,
      recentUploads,
      storageUsage,
    };
  } catch (error) {
    throw new Error(
      `Failed to get document statistics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Generate document preview URL
 */
const getDocumentPreviewUrl = async (documentId: string): Promise<string | null> => {
  try {
    const document = await DocumentFileModel.findById(documentId);
    if (!document || !fs.existsSync(document.path)) {
      return null;
    }

    // For now, return the file path
    // In production, you might want to generate signed URLs or serve through a CDN
    return `/api/documents/${documentId}/preview`;
  } catch (error) {
    throw new Error(
      `Failed to get document preview URL: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Download document
 */
const downloadDocument = async (documentId: string): Promise<{ path: string; filename: string; mimetype: string } | null> => {
  try {
    const document = await DocumentFileModel.findById(documentId);
    if (!document || !fs.existsSync(document.path)) {
      return null;
    }

    return {
      path: document.path,
      filename: document.originalName,
      mimetype: document.mimetype,
    };
  } catch (error) {
    throw new Error(
      `Failed to download document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentStatistics,
  getDocumentPreviewUrl,
  downloadDocument,
};