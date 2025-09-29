import { Request, Response } from "express";
import { PaymentScheduleService } from "../services/paymentSchedule.service";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";
import { isValidObjectId } from "mongoose";

/**
 * Create a payment schedule for advance/split payments
 */
export const createPaymentScheduleController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      bookingId,
      rentalId,
      totalAmount,
      paymentType,
      advanceConfig,
      splitConfig,
      scheduledPayments,
    } = req.body;

    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      sendValidationError(res, "Total amount must be greater than 0");
      return;
    }

    if (!paymentType || !["advance", "split", "full"].includes(paymentType)) {
      sendValidationError(res, "Valid payment type is required");
      return;
    }

    if (!bookingId && !rentalId) {
      sendValidationError(res, "Either bookingId or rentalId is required");
      return;
    }

    if (bookingId && !isValidObjectId(bookingId)) {
      sendValidationError(res, "Invalid booking ID");
      return;
    }

    if (rentalId && !isValidObjectId(rentalId)) {
      sendValidationError(res, "Invalid rental ID");
      return;
    }

    const scheduleData = {
      userId,
      companyId,
      bookingId,
      rentalId,
      totalAmount,
      paymentType,
      advanceConfig,
      splitConfig,
      scheduledPayments,
    };

    const schedule =
      await PaymentScheduleService.createPaymentSchedule(scheduleData);

    sendSuccess(res, "Payment schedule created successfully", schedule);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get payment schedules for a user
 */
export const getUserPaymentSchedulesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      sendError(res, "User authentication required");
      return;
    }

    const { status, paymentType, isActive, page = 1, limit = 10 } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (paymentType) filters.paymentType = paymentType;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await PaymentScheduleService.getUserPaymentSchedules(
      userId,
      companyId,
      filters,
      pagination
    );

    sendSuccess(res, "Payment schedules retrieved successfully", result);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get payment schedules for a company (admin view)
 */
export const getCompanyPaymentSchedulesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      sendError(res, "Company authentication required");
      return;
    }

    const { status, paymentType, isActive, page = 1, limit = 10 } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (paymentType) filters.paymentType = paymentType;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await PaymentScheduleService.getCompanyPaymentSchedules(
      companyId,
      filters,
      pagination
    );

    sendSuccess(
      res,
      "Company payment schedules retrieved successfully",
      result
    );
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Process a payment from a schedule
 */
export const processPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { scheduleId, paymentReference, transactionId, notes } = req.body;

    if (!scheduleId || !paymentReference || !transactionId) {
      sendValidationError(
        res,
        "scheduleId, paymentReference, and transactionId are required"
      );
      return;
    }

    if (!isValidObjectId(scheduleId)) {
      sendValidationError(res, "Invalid schedule ID");
      return;
    }

    if (!isValidObjectId(transactionId)) {
      sendValidationError(res, "Invalid transaction ID");
      return;
    }

    const schedule = await PaymentScheduleService.processPayment(
      scheduleId,
      paymentReference,
      transactionId,
      notes
    );

    sendSuccess(res, "Payment processed successfully", schedule);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get pending advance payments
 */
export const getPendingAdvancePaymentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    const schedules = await PaymentScheduleService.getPendingAdvancePayments(
      companyId,
      userId
    );

    sendSuccess(
      res,
      "Pending advance payments retrieved successfully",
      schedules
    );
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get pending split payments
 */
export const getPendingSplitPaymentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    const schedules = await PaymentScheduleService.getPendingSplitPayments(
      companyId,
      userId
    );

    sendSuccess(
      res,
      "Pending split payments retrieved successfully",
      schedules
    );
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Get payment schedule by ID
 */
export const getPaymentScheduleByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { scheduleId } = req.params;

    if (!isValidObjectId(scheduleId)) {
      sendValidationError(res, "Invalid schedule ID");
      return;
    }

    const schedule =
      await PaymentScheduleService.getPaymentScheduleById(scheduleId);

    if (!schedule) {
      sendNotFound(res, "Payment schedule not found");
      return;
    }

    sendSuccess(res, "Payment schedule retrieved successfully", schedule);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

/**
 * Cancel a payment schedule
 */
export const cancelPaymentScheduleController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { scheduleId } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(scheduleId)) {
      sendValidationError(res, "Invalid schedule ID");
      return;
    }

    const schedule = await PaymentScheduleService.cancelPaymentSchedule(
      scheduleId,
      reason
    );

    sendSuccess(res, "Payment schedule cancelled successfully", schedule);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};
