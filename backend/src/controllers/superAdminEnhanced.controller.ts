import { Request, Response } from "express";
import { 
  getSystemStatistics,
  getCompanyAnalytics,
  updateCompanyFee,
  activateCompanySubscription,
  deactivateCompanySubscription,
  getSystemTaxManagement,
  getSystemNotifications,
  sendSystemNotification,
  getSystemHealth,
} from "../services/superAdminEnhanced.service";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Get system statistics
 */
export const getSystemStatisticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const statistics = await getSystemStatistics();
    sendSuccess(res, "System statistics fetched successfully", statistics);
  } catch (error) {
    sendError(res, "Failed to fetch system statistics", error);
  }
};

/**
 * Get company analytics
 */
export const getCompanyAnalyticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await getCompanyAnalytics();
    sendSuccess(res, "Company analytics fetched successfully", analytics);
  } catch (error) {
    sendError(res, "Failed to fetch company analytics", error);
  }
};

/**
 * Update company fee
 */
export const updateCompanyFeeController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, feePercent } = req.body;

    if (!companyId || feePercent === undefined) {
      sendError(res, "Company ID and fee percentage are required");
      return;
    }

    const success = await updateCompanyFee(companyId, feePercent);
    if (!success) {
      sendNotFound(res, "Company not found");
      return;
    }

    sendSuccess(res, "Company fee updated successfully", { success: true });
  } catch (error) {
    sendError(res, "Failed to update company fee", error);
  }
};

/**
 * Activate company subscription
 */
export const activateCompanySubscriptionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, plan, expiresAt, licenseKey, paymentReference } = req.body;

    if (!companyId || !plan || !expiresAt || !licenseKey) {
      sendError(res, "Company ID, plan, expiry date, and license key are required");
      return;
    }

    const success = await activateCompanySubscription(companyId, {
      plan,
      expiresAt: new Date(expiresAt),
      licenseKey,
      paymentReference,
    });

    if (!success) {
      sendNotFound(res, "Company not found");
      return;
    }

    sendSuccess(res, "Company subscription activated successfully", { success: true });
  } catch (error) {
    sendError(res, "Failed to activate company subscription", error);
  }
};

/**
 * Deactivate company subscription
 */
export const deactivateCompanySubscriptionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, reason } = req.body;

    if (!companyId) {
      sendError(res, "Company ID is required");
      return;
    }

    const success = await deactivateCompanySubscription(companyId, reason);
    if (!success) {
      sendNotFound(res, "Company not found");
      return;
    }

    sendSuccess(res, "Company subscription deactivated successfully", { success: true });
  } catch (error) {
    sendError(res, "Failed to deactivate company subscription", error);
  }
};

/**
 * Get system tax management
 */
export const getSystemTaxManagementController = async (req: Request, res: Response): Promise<void> => {
  try {
    const taxManagement = await getSystemTaxManagement();
    sendSuccess(res, "System tax management fetched successfully", taxManagement);
  } catch (error) {
    sendError(res, "Failed to fetch system tax management", error);
  }
};

/**
 * Get system notifications
 */
export const getSystemNotificationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await getSystemNotifications();
    sendSuccess(res, "System notifications fetched successfully", notifications);
  } catch (error) {
    sendError(res, "Failed to fetch system notifications", error);
  }
};

/**
 * Send system notification
 */
export const sendSystemNotificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, type, category } = req.body;

    if (!title || !message || !type || !category) {
      sendError(res, "Title, message, type, and category are required");
      return;
    }

    const success = await sendSystemNotification({
      title,
      message,
      type,
      category,
    });

    if (!success) {
      sendError(res, "Failed to send system notification");
      return;
    }

    sendSuccess(res, "System notification sent successfully", { success: true });
  } catch (error) {
    sendError(res, "Failed to send system notification", error);
  }
};

/**
 * Get system health
 */
export const getSystemHealthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const health = await getSystemHealth();
    sendSuccess(res, "System health fetched successfully", health);
  } catch (error) {
    sendError(res, "Failed to fetch system health", error);
  }
};