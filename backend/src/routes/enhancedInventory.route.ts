import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import {
  getInventoryWithRentalStatusController,
  getInventoryItemWithRentalHistoryController,
  rentInventoryItemController,
  returnInventoryItemController,
  getInventoryStatisticsController,
  getLowStockItemsController,
  getMaintenanceDueItemsController,
} from "../controllers/enhancedInventory.controller";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

// Enhanced inventory routes
router.get(
  "/with-rental-status",
  staffAndAbove,
  RequireActiveCompany(),
  getInventoryWithRentalStatusController
);

router.get(
  "/:id/rental-history",
  staffAndAbove,
  RequireActiveCompany(),
  getInventoryItemWithRentalHistoryController
);

router.post(
  "/:id/rent",
  staffAndAbove,
  RequireActiveCompany(),
  rentInventoryItemController
);

router.post(
  "/:id/return",
  staffAndAbove,
  RequireActiveCompany(),
  returnInventoryItemController
);

router.get(
  "/statistics",
  staffAndAbove,
  RequireActiveCompany(),
  getInventoryStatisticsController
);

router.get(
  "/low-stock",
  staffAndAbove,
  RequireActiveCompany(),
  getLowStockItemsController
);

router.get(
  "/maintenance-due",
  staffAndAbove,
  RequireActiveCompany(),
  getMaintenanceDueItemsController
);

export default router;