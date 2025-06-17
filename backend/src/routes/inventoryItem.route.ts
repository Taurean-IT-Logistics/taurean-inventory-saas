import { Router } from "express";
import { InventoryItemController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";

const router = Router();

// All inventory routes require authentication
router.use(AuthMiddleware);

// Get all inventory items - admin/staff showDeleted flag supported
router.get("/", InventoryItemController.getAllInventoryItems);

// Get low stock inventory items - admin and staff, showDeleted optional
router.get(
  "/low-stock",
  AuthorizeRoles("admin", "staff"),
  InventoryItemController.getLowStockItems
);

// Get a single inventory item by ID - admin/staff showDeleted flag supported
router.get("/:id", InventoryItemController.getInventoryItemById);

// Create new inventory item - admin only
router.post(
  "/",
  AuthorizeRoles("admin"),
  InventoryItemController.createInventoryItem
);

// Update inventory item by ID - admin and staff
router.put(
  "/:id",
  AuthorizeRoles("admin", "staff"),
  InventoryItemController.updateInventoryItem
);

// Soft delete inventory item by ID - admin only
router.delete(
  "/:id",
  AuthorizeRoles("admin"),
  InventoryItemController.deleteInventoryItem
);

// Restore soft deleted inventory item by ID - admin only
router.post(
  "/:id/restore",
  AuthorizeRoles("admin"),
  InventoryItemController.restoreInventoryItem
);

// Add maintenance schedule to inventory item - admin and staff
router.post(
  "/:id/maintenance",
  AuthorizeRoles("admin", "staff"),
  InventoryItemController.addMaintenanceSchedule
);

export default router;
