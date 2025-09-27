import { Request, Response } from "express";
import { 
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentStatistics,
  getDocumentPreviewUrl,
  downloadDocument,
} from "../services/documentManagement.service";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Upload a document
 */
export const uploadDocumentController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, "No file uploaded");
      return;
    }

    const { category, description, tags, isPublic } = req.body;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    if (!companyId || !userId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!category) {
      sendError(res, "Category is required");
      return;
    }

    const document = await uploadDocument(req.file, {
      companyId,
      userId,
      category,
      description,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      isPublic: isPublic === 'true',
    });

    sendSuccess(res, "Document uploaded successfully", document);
  } catch (error) {
    sendError(res, "Failed to upload document", error);
  }
};

/**
 * Get documents
 */
export const getDocumentsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      companyId: req.user?.companyId,
      category: req.query.category as string,
      uploadedBy: req.query.uploadedBy as string,
      isPublic: req.query.isPublic === "true" ? true : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await getDocuments(filters, pagination);
    sendSuccess(res, "Documents fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch documents", error);
  }
};

/**
 * Get document by ID
 */
export const getDocumentByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await getDocumentById(id);

    if (!document) {
      sendNotFound(res, "Document not found");
      return;
    }

    sendSuccess(res, "Document fetched successfully", document);
  } catch (error) {
    sendError(res, "Failed to fetch document", error);
  }
};

/**
 * Update document
 */
export const updateDocumentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, tags, isPublic, category } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (tags) updateData.tags = tags.split(',').map((tag: string) => tag.trim());
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (category) updateData.category = category;

    const document = await updateDocument(id, updateData);

    if (!document) {
      sendNotFound(res, "Document not found");
      return;
    }

    sendSuccess(res, "Document updated successfully", document);
  } catch (error) {
    sendError(res, "Failed to update document", error);
  }
};

/**
 * Delete document
 */
export const deleteDocumentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await deleteDocument(id);

    if (!success) {
      sendNotFound(res, "Document not found");
      return;
    }

    sendSuccess(res, "Document deleted successfully", { success: true });
  } catch (error) {
    sendError(res, "Failed to delete document", error);
  }
};

/**
 * Get document statistics
 */
export const getDocumentStatisticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const statistics = await getDocumentStatistics(companyId);
    sendSuccess(res, "Document statistics fetched successfully", statistics);
  } catch (error) {
    sendError(res, "Failed to fetch document statistics", error);
  }
};

/**
 * Get document preview URL
 */
export const getDocumentPreviewController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const previewUrl = await getDocumentPreviewUrl(id);

    if (!previewUrl) {
      sendNotFound(res, "Document not found or preview not available");
      return;
    }

    sendSuccess(res, "Document preview URL generated successfully", { previewUrl });
  } catch (error) {
    sendError(res, "Failed to get document preview URL", error);
  }
};

/**
 * Download document
 */
export const downloadDocumentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const documentData = await downloadDocument(id);

    if (!documentData) {
      sendNotFound(res, "Document not found");
      return;
    }

    res.download(documentData.path, documentData.filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        sendError(res, "Failed to download document");
      }
    });
  } catch (error) {
    sendError(res, "Failed to download document", error);
  }
};