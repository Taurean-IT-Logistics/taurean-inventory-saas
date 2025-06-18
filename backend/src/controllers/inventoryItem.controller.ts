import { Request, Response } from "express";
import { InventoryItemService } from "../services";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";

// Get all inventory items, with optional showDeleted flag for admin/staff
export const getAllInventoryItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const showDeleted =
      req.user?.role === "admin" || req.user?.role === "staff"
        ? req.query.showDeleted === "true"
        : false;
    const items = await InventoryItemService.getAllInventoryItems(showDeleted);
    sendSuccess(res, "Inventory items fetched successfully", items);
  } catch (error: any) {
    sendError(res, "Failed to fetch inventory items", error.message);
  }
};

// Get inventory item by ID, with optional showDeleted flag for admin/staff
export const getInventoryItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const showDeleted =
      req.user?.role === "admin" || req.user?.role === "staff"
        ? req.query.showDeleted === "true"
        : false;
    const item = await InventoryItemService.getInventoryItemById(
      id,
      showDeleted
    );
    if (!item) {
      sendNotFound(res, "Inventory item not found");
      return;
    }
    sendSuccess(res, "Inventory item fetched successfully", item);
  } catch (error: any) {
    sendError(res, "Failed to fetch inventory item", error.message);
  }
};

// Create new inventory item (admin only)
export const createInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Assume authorization middleware handled admin role
    const itemData = req.body;
    const newItem = await InventoryItemService.createInventoryItem(itemData);
    sendSuccess(res, "Inventory item created successfully", newItem);
  } catch (error: any) {
    sendValidationError(
      res,
      "Failed to create inventory item: " + error.message
    );
  }
};

// Update inventory item by ID, with optional showDeleted for admin
export const updateInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const showDeleted = req.user?.role === "admin";
    const updatedItem = await InventoryItemService.updateInventoryItem(
      id,
      updateData,
      showDeleted
    );
    if (!updatedItem) {
      sendNotFound(res, "Inventory item not found");
      return;
    }
    sendSuccess(res, "Inventory item updated successfully", updatedItem);
  } catch (error: any) {
    sendValidationError(
      res,
      "Failed to update inventory item: " + error.message
    );
  }
};

// Soft delete inventory item by ID (admin only)
export const deleteInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedItem = await InventoryItemService.deleteInventoryItem(id);
    if (!deletedItem) {
      sendNotFound(res, "Inventory item not found");
      return;
    }
    sendSuccess(res, "Inventory item deleted successfully");
  } catch (error: any) {
    sendError(res, "Failed to delete inventory item", error.message);
  }
};

// Restore a soft-deleted inventory item (admin only)
export const restoreInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const restoredItem = await InventoryItemService.restoreInventoryItem(id);
    if (!restoredItem) {
      sendNotFound(res, "Inventory item not found or not deleted");
      return;
    }
    sendSuccess(res, "Inventory item restored successfully", restoredItem);
  } catch (error: any) {
    sendError(res, "Failed to restore inventory item", error.message);
  }
};

// Add maintenance schedule to item (admin or staff)
export const addMaintenanceSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const scheduleData = req.body;
    const showDeleted = req.user?.role === "admin";
    const updatedItem = await InventoryItemService.addMaintenanceSchedule(
      id,
      scheduleData,
      showDeleted
    );
    if (!updatedItem) {
      sendNotFound(res, "Inventory item not found");
      return;
    }
    sendSuccess(res, "Maintenance schedule added successfully", updatedItem);
  } catch (error: any) {
    sendValidationError(
      res,
      "Failed to add maintenance schedule: " + error.message
    );
  }
};

// Get low stock items, include deleted if admin/staff & showDeleted flag true
export const getLowStockItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const showDeleted =
      req.user?.role === "admin" || req.user?.role === "staff"
        ? req.query.showDeleted === "true"
        : false;
    const items = await InventoryItemService.getLowStockItems(showDeleted);
    sendSuccess(res, "Low stock inventory items fetched successfully", items);
  } catch (error: any) {
    sendError(res, "Failed to fetch low stock items", error.message);
  }
};
