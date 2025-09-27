import { Request, Response } from "express";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../utils/response.util";
import PendingTransactionService from "../services/pendingTransaction.service";

export class PendingTransactionController {
  /**
   * Create a pending transaction
   */
  public static async createPendingTransaction(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const {
        facility,
        type,
        referenceId,
        amount,
        currency,
        paymentMethod,
        paymentDetails,
        notes,
      } = req.body;

      const userId = req.user?.id!;
      const companyId = req.user?.companyId!;

      if (!type || !referenceId || !amount || !paymentMethod) {
        sendValidationError(
          res,
          "Missing required fields: type, referenceId, amount, and paymentMethod are required"
        );
        return;
      }

      const pendingTransaction =
        await PendingTransactionService.createPendingTransaction({
          user: userId,
          company: companyId,
          facility,
          type,
          referenceId,
          amount,
          currency,
          paymentMethod,
          paymentDetails,
          notes,
        });

      sendSuccess(
        res,
        "Pending transaction created successfully",
        pendingTransaction
      );
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  /**
   * Get pending transactions for a company
   */
  public static async getPendingTransactions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const companyId = req.user?.companyId!;
      const { status, type, facility, page = 1, limit = 10 } = req.query;

      const filters = {
        status: status as string,
        type: type as string,
        facility: facility as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await PendingTransactionService.getPendingTransactions(
        companyId,
        filters
      );

      sendSuccess(res, "Pending transactions retrieved successfully", result);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  /**
   * Get pending transaction by ID
   */
  public static async getPendingTransactionById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const pendingTransaction =
        await PendingTransactionService.getPendingTransactionById(id);

      sendSuccess(
        res,
        "Pending transaction retrieved successfully",
        pendingTransaction
      );
    } catch (error: any) {
      sendError(res, error.message, null, 404);
    }
  }

  /**
   * Process a pending transaction (confirm or reject)
   */
  public static async processPendingTransaction(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes, rejectionReason } = req.body;
      const processedBy = req.user?.id!;

      if (!status || !["confirmed", "rejected"].includes(status)) {
        sendValidationError(
          res,
          "Status must be either 'confirmed' or 'rejected'"
        );
        return;
      }

      if (status === "rejected" && !rejectionReason) {
        sendValidationError(
          res,
          "Rejection reason is required when rejecting a transaction"
        );
        return;
      }

      const pendingTransaction =
        await PendingTransactionService.processPendingTransaction(id, {
          status,
          processedBy,
          notes,
          rejectionReason,
        });

      sendSuccess(
        res,
        "Pending transaction processed successfully",
        pendingTransaction
      );
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  /**
   * Cancel a pending transaction
   */
  public static async cancelPendingTransaction(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id!;

      const pendingTransaction =
        await PendingTransactionService.cancelPendingTransaction(id, userId);

      sendSuccess(
        res,
        "Pending transaction cancelled successfully",
        pendingTransaction
      );
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  /**
   * Get user's pending transactions
   */
  public static async getUserPendingTransactions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { status, type, page = 1, limit = 10 } = req.query;

      const filters = {
        status: status as string,
        type: type as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await PendingTransactionService.getUserPendingTransactions(
        userId,
        filters
      );

      sendSuccess(
        res,
        "User pending transactions retrieved successfully",
        result
      );
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }
}

export default PendingTransactionController;
