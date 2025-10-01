import { Request, Response } from "express";
import {
  getDocumentsForReview,
  reviewDocument,
  getDocumentReviewStatistics,
  getCompanyDocuments,
  getDocumentById,
  downloadDocument,
} from "../services/documentManagement.service";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";
import { isValidObjectId } from "mongoose";

/**
 * Get documents for super admin review
 */
export const getDocumentsForReviewController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as "pending" | "approved" | "rejected",
      category: req.query.category as string,
      companyId: req.query.companyId as string,
      uploadedBy: req.query.uploadedBy as string,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await getDocumentsForReview(filters, pagination);
    sendSuccess(res, "Documents for review fetched successfully", result);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Review and verify a document
 */
export const reviewDocumentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { status, reviewNotes, rejectionReason } = req.body;
    const reviewedBy = req.user?.id;

    if (!isValidObjectId(documentId)) {
      sendValidationError(res, "Invalid document ID");
      return;
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      sendValidationError(res, "Status must be 'approved' or 'rejected'");
      return;
    }

    if (status === "rejected" && !rejectionReason) {
      sendValidationError(
        res,
        "Rejection reason is required when rejecting a document"
      );
      return;
    }

    if (!reviewedBy) {
      sendError(res, "User authentication required");
      return;
    }

    const reviewData = {
      status,
      reviewedBy,
      reviewNotes,
      rejectionReason,
    };

    const updatedDocument = await reviewDocument(documentId, reviewData);
    sendSuccess(res, "Document reviewed successfully", updatedDocument);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get document review statistics
 */
export const getDocumentReviewStatisticsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const statistics = await getDocumentReviewStatistics();
    sendSuccess(
      res,
      "Document review statistics fetched successfully",
      statistics
    );
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get documents by company for super admin review
 */
export const getCompanyDocumentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const filters = {
      status: req.query.status as "pending" | "approved" | "rejected",
      category: req.query.category as string,
    };

    if (!isValidObjectId(companyId)) {
      sendValidationError(res, "Invalid company ID");
      return;
    }

    const documents = await getCompanyDocuments(companyId, filters);
    sendSuccess(res, "Company documents fetched successfully", documents);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get document details for review
 */
export const getDocumentForReviewController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { documentId } = req.params;

    if (!isValidObjectId(documentId)) {
      sendValidationError(res, "Invalid document ID");
      return;
    }

    const document = await getDocumentById(documentId);
    if (!document) {
      sendNotFound(res, "Document not found");
      return;
    }

    sendSuccess(res, "Document details fetched successfully", document);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Download document for review
 */
export const downloadDocumentForReviewController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { documentId } = req.params;

    if (!isValidObjectId(documentId)) {
      sendValidationError(res, "Invalid document ID");
      return;
    }

    const document = await getDocumentById(documentId);
    if (!document) {
      sendNotFound(res, "Document not found");
      return;
    }

    const fileData = await downloadDocument(documentId);

    res.setHeader("Content-Type", document.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.originalName}"`
    );
    res.setHeader("Content-Length", document.size);

    res.send(fileData);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Bulk review documents
 */
export const bulkReviewDocumentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { documentIds, status, reviewNotes, rejectionReason } = req.body;
    const reviewedBy = req.user?.id;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      sendValidationError(res, "Document IDs array is required");
      return;
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      sendValidationError(res, "Status must be 'approved' or 'rejected'");
      return;
    }

    if (status === "rejected" && !rejectionReason) {
      sendValidationError(
        res,
        "Rejection reason is required when rejecting documents"
      );
      return;
    }

    if (!reviewedBy) {
      sendError(res, "User authentication required");
      return;
    }

    const results = [];
    const errors = [];

    for (const documentId of documentIds) {
      try {
        if (!isValidObjectId(documentId)) {
          errors.push({ documentId, error: "Invalid document ID" });
          continue;
        }

        const reviewData = {
          status,
          reviewedBy,
          reviewNotes,
          rejectionReason,
        };

        const updatedDocument = await reviewDocument(documentId, reviewData);
        results.push(updatedDocument);
      } catch (error: any) {
        errors.push({ documentId, error: error.message });
      }
    }

    sendSuccess(res, "Bulk review completed", {
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};
