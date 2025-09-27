import { Request, Response } from "express";
import { 
  getInventoryWithRentalStatus,
  getInventoryItemWithRentalHistory,
  rentInventoryItem,
  returnInventoryItem,
  getInventoryStatistics,
  getLowStockItems,
  getMaintenanceDueItems
} from "../services/enhancedInventory.service";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Get inventory with rental status
 */
export const getInventoryWithRentalStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as string,
      category: req.query.category as string,
      facilityId: req.query.facilityId as string,
      companyId: req.user?.companyId,
      search: req.query.search as string,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await getInventoryWithRentalStatus(filters, pagination);
    sendSuccess(res, "Inventory with rental status fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch inventory with rental status", error);
  }
};

/**
 * Get inventory item with rental history
 */
export const getInventoryItemWithRentalHistoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getInventoryItemWithRentalHistory(id);
    sendSuccess(res, "Inventory item with rental history fetched successfully", result);
  } catch (error) {
    if (error instanceof Error && error.message === "Inventory item not found") {
      sendNotFound(res, "Inventory item not found");
      return;
    }
    sendError(res, "Failed to fetch inventory item with rental history", error);
  }
};

/**
 * Rent inventory item
 */
export const rentInventoryItemController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!quantity || quantity <= 0) {
      sendError(res, "Valid quantity is required");
      return;
    }

    const result = await rentInventoryItem(id, quantity, userId, reason);
    sendSuccess(res, "Inventory item rented successfully", result);
  } catch (error) {
    sendError(res, "Failed to rent inventory item", error);
  }
};

/**
 * Return inventory item
 */
export const returnInventoryItemController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, condition, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!quantity || quantity <= 0) {
      sendError(res, "Valid quantity is required");
      return;
    }

    const result = await returnInventoryItem(id, quantity, userId, condition, notes);
    sendSuccess(res, "Inventory item returned successfully", result);
  } catch (error) {
    sendError(res, "Failed to return inventory item", error);
  }
};

/**
 * Get inventory statistics
 */
export const getInventoryStatisticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const statistics = await getInventoryStatistics(companyId);
    sendSuccess(res, "Inventory statistics fetched successfully", statistics);
  } catch (error) {
    sendError(res, "Failed to fetch inventory statistics", error);
  }
};

/**
 * Get low stock items
 */
export const getLowStockItemsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const threshold = parseInt(req.query.threshold as string) || 5;
    const items = await getLowStockItems(companyId, threshold);
    sendSuccess(res, "Low stock items fetched successfully", items);
  } catch (error) {
    sendError(res, "Failed to fetch low stock items", error);
  }
};

/**
 * Get maintenance due items
 */
export const getMaintenanceDueItemsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const items = await getMaintenanceDueItems(companyId);
    sendSuccess(res, "Maintenance due items fetched successfully", items);
  } catch (error) {
    sendError(res, "Failed to fetch maintenance due items", error);
  }
};