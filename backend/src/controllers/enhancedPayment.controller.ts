import { Request, Response } from "express";
import { 
  processCashPayment,
  processSplitPayment,
  processAdvancePayment,
  applyAdvancePayment,
  getAdvanceBalance,
  getSplitPaymentDetails,
  completeSplitPayment
} from "../services/enhancedPayment.service";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Process cash payment
 */
export const processCashPaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, denominations, transactionId } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!amount || !denominations || !transactionId) {
      sendError(res, "Amount, denominations, and transaction ID are required");
      return;
    }

    const result = await processCashPayment({
      amount,
      denominations,
      transactionId,
      userId,
      companyId,
    });

    sendSuccess(res, "Cash payment processed successfully", result);
  } catch (error) {
    sendError(res, "Failed to process cash payment", error);
  }
};

/**
 * Process split payment
 */
export const processSplitPaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalAmount, currency, splits } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!totalAmount || !splits || !Array.isArray(splits)) {
      sendError(res, "Total amount and splits array are required");
      return;
    }

    const result = await processSplitPayment({
      totalAmount,
      currency: currency || "GHS",
      splits,
      userId,
      companyId,
    });

    sendSuccess(res, "Split payment processed successfully", result);
  } catch (error) {
    sendError(res, "Failed to process split payment", error);
  }
};

/**
 * Process advance payment
 */
export const processAdvancePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency, description, paymentMethod, paymentDetails } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!amount || !paymentMethod) {
      sendError(res, "Amount and payment method are required");
      return;
    }

    const result = await processAdvancePayment({
      amount,
      currency: currency || "GHS",
      description,
      paymentMethod,
      paymentDetails,
      userId,
      companyId,
    });

    sendSuccess(res, "Advance payment processed successfully", result);
  } catch (error) {
    sendError(res, "Failed to process advance payment", error);
  }
};

/**
 * Apply advance payment to transaction
 */
export const applyAdvancePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, advanceAmount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!transactionId || !advanceAmount) {
      sendError(res, "Transaction ID and advance amount are required");
      return;
    }

    const result = await applyAdvancePayment({
      transactionId,
      advanceAmount,
      userId,
    });

    sendSuccess(res, "Advance payment applied successfully", result);
  } catch (error) {
    sendError(res, "Failed to apply advance payment", error);
  }
};

/**
 * Get user's advance balance
 */
export const getAdvanceBalanceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, "User authentication required");
      return;
    }

    const balance = await getAdvanceBalance(userId);
    sendSuccess(res, "Advance balance retrieved successfully", { balance });
  } catch (error) {
    sendError(res, "Failed to get advance balance", error);
  }
};

/**
 * Get split payment details
 */
export const getSplitPaymentDetailsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { splitPaymentId } = req.params;

    if (!splitPaymentId) {
      sendError(res, "Split payment ID is required");
      return;
    }

    const details = await getSplitPaymentDetails(splitPaymentId);
    sendSuccess(res, "Split payment details retrieved successfully", details);
  } catch (error) {
    if (error instanceof Error && error.message === "Split payment not found") {
      sendNotFound(res, "Split payment not found");
      return;
    }
    sendError(res, "Failed to get split payment details", error);
  }
};

/**
 * Complete split payment
 */
export const completeSplitPaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { splitPaymentId } = req.params;

    if (!splitPaymentId) {
      sendError(res, "Split payment ID is required");
      return;
    }

    const result = await completeSplitPayment(splitPaymentId);
    sendSuccess(res, "Split payment completed successfully", result);
  } catch (error) {
    if (error instanceof Error && error.message === "Split payment not found") {
      sendNotFound(res, "Split payment not found");
      return;
    }
    sendError(res, "Failed to complete split payment", error);
  }
};