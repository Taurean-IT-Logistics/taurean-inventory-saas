import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import {
  createRentalController,
  getRentalsController,
  getRentalByIdController,
  updateRentalStatusController,
  returnRentalController,
  getOverdueRentalsController,
  getRentalStatisticsController,
  deleteRentalController,
} from "../controllers/rental.controller";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

// Rental CRUD operations
router.post(
  "/",
  staffAndAbove,
  RequireActiveCompany(),
  createRentalController
);

router.get(
  "/",
  staffAndAbove,
  RequireActiveCompany(),
  getRentalsController
);

router.get(
  "/statistics",
  staffAndAbove,
  RequireActiveCompany(),
  getRentalStatisticsController
);

router.get(
  "/overdue",
  staffAndAbove,
  RequireActiveCompany(),
  getOverdueRentalsController
);

router.get(
  "/:id",
  staffAndAbove,
  RequireActiveCompany(),
  getRentalByIdController
);

router.put(
  "/:id/status",
  staffAndAbove,
  RequireActiveCompany(),
  updateRentalStatusController
);

router.put(
  "/:id/return",
  staffAndAbove,
  RequireActiveCompany(),
  returnRentalController
);

router.delete(
  "/:id",
  adminOnly,
  RequireActiveCompany(),
  deleteRentalController
);

export default router;