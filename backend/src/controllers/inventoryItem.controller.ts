import { Request, Response } from "express";
import { InventoryItemModel } from "../models";
import { InventoryItemService } from "../services";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";
import { Types } from "mongoose";

interface MulterFile {
  path?: string;
  filename?: string;
  originalname: string;
  mimetype: string;
  size: number;
}

// Get all inventory items, with optional showDeleted flag for admin/staff
export const getAllInventoryItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Public listing - only require active companies, subscription check is optional
    const items = await InventoryItemModel.aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      {
        $match: {
          isDeleted: false,
          "company.isActive": true,
          $or: [
            { "company.subscription.expiresAt": { $gt: new Date() } },
            { "company.name": "Taurean IT" }, // Taurean IT is always active
          ],
        },
      },
    ]);
    sendSuccess(res, "Inventory items fetched successfully", items);
  } catch (error: any) {
    sendError(res, "Failed to fetch inventory items", error.message);
  }
};

// Get company-specific inventory items
export const getCompanyInventoryItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const showDeleted = true;
    const items = await InventoryItemService.getCompanyInventoryItems(
      req.user?.companyId!,
      showDeleted
    );
    sendSuccess(res, "Company inventory items fetched successfully", items);
  } catch (error: any) {
    sendError(res, "Failed to fetch company inventory items", error.message);
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
      req.user?.role === "admin" || req.user?.role === "staff" ? true : false;
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
    if (req.files && Array.isArray(req.files)) {
      // Validate file sizes and types
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const invalidFiles = req.files.filter(
        (file: MulterFile) => file.size > maxFileSize
      );

      if (invalidFiles.length > 0) {
        sendValidationError(res, "Some files exceed the 10MB size limit");
        return;
      }

      itemData.images = req.files.map((file: MulterFile) => ({
        path: file.path || file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }));
    } else if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        sendValidationError(res, "File exceeds the 10MB size limit");
        return;
      }

      itemData.images = [
        {
          path: req.file.path || req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      ];
    }

    if (
      itemData.specifications &&
      typeof itemData.specifications === "string"
    ) {
      itemData.specifications = new Map(
        Object.entries(JSON.parse(itemData.specifications))
      );
    }

    itemData.company = req.user?.companyId;

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
    const updateData = { ...req.body };
    const showDeleted = req.user?.role === "admin";

    // Extract image operation parameters
    const removeImageIds = req.body.removeImageIds;
    const replaceAllImages = req.body.replaceAllImages === "true";

    // Clean up image-related fields from updateData
    delete updateData.removeImageIds;
    delete updateData.replaceAllImages;

    let newImages: any[] = [];

    // Handle new image uploads
    if (req.files && Array.isArray(req.files)) {
      // Validate file sizes
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const invalidFiles = req.files.filter(
        (file: MulterFile) => file.size > maxFileSize
      );

      if (invalidFiles.length > 0) {
        sendValidationError(res, "Some files exceed the 10MB size limit");
        return;
      }

      newImages = req.files.map((file: MulterFile) => ({
        path: file.path || file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }));
    } else if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        sendValidationError(res, "File exceeds the 10MB size limit");
        return;
      }

      newImages = [
        {
          path: req.file.path || req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date(),
        },
      ];
    }

    // Handle specifications parsing
    if (
      updateData.specifications &&
      typeof updateData.specifications === "string"
    ) {
      updateData.specifications = new Map(
        Object.entries(JSON.parse(updateData.specifications))
      );
    }

    // Call enhanced service method
    const updatedItem = await InventoryItemService.updateInventoryItem(
      id,
      updateData,
      newImages.length > 0 ? newImages : undefined,
      removeImageIds,
      replaceAllImages,
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

export const returnInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { quantity, condition, notes } = req.body;
    if (!Types.ObjectId.isValid(id)) {
      sendError(res, "Invalid ID", null, 400);
      return;
    }
    if (typeof quantity !== "number" || quantity <= 0) {
      sendError(res, "Quantity must be > 0", null, 400);
      return;
    }
    const updated = await InventoryItemService.returnItem(id, {
      quantity,
      condition,
      notes,
      userId: (req.user as any)?.id,
    });
    if (!updated) {
      sendNotFound(res, "Inventory item not found");
      return;
    }
    sendSuccess(res, "Item returned", updated);
  } catch (e: any) {
    sendError(res, e.message || "Failed to return item");
  }
};

export default {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restoreInventoryItem,
  addMaintenanceSchedule,
  getLowStockItems,
};
