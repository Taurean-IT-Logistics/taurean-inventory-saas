import { Router } from "express";
import { InventoryItemController } from "../controllers";
import {
  AuthMiddleware,
  AuthorizeRoles,
  fileFilter,
  storage,
} from "../middlewares";
import multer from "multer";

const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
};

const router = Router();

// All inventory routes require authentication

// Get all inventory items - admin/staff showDeleted flag supported
router.get("/", InventoryItemController.getAllInventoryItems);

// Get low stock inventory items - admin and staff, showDeleted optional
router.get(
  "/low-stock",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  InventoryItemController.getLowStockItems
);

// Get a single inventory item by ID - admin/staff showDeleted flag supported
router.get("/:id", InventoryItemController.getInventoryItemById);

// Create new inventory item - admin only
router.post(
  "/",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  multer(uploadConfig).array("files"),
  InventoryItemController.createInventoryItem
);

// Update inventory item by ID - admin and staff
router.put(
  "/:id",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  multer(uploadConfig).array("files"),
  InventoryItemController.updateInventoryItem
);

// Return an inventory item - admin and staff
router.post(
  "/:id/return",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  InventoryItemController.returnInventoryItem
);

// Soft delete inventory item by ID - admin only
router.delete(
  "/:id",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  InventoryItemController.deleteInventoryItem
);

// Restore soft deleted inventory item by ID - admin only
router.post(
  "/:id/restore",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  InventoryItemController.restoreInventoryItem
);

// Add maintenance schedule to inventory item - admin and staff
router.post(
  "/:id/maintenance",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  InventoryItemController.addMaintenanceSchedule
);

export default router;
