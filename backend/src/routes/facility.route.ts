import { Router } from "express";
import { FacilityController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";

const router = Router();
router.use(AuthMiddleware);

// Public: Get list of facilities (filtered, showDeleted optional for admin/staff)
router.get("/", FacilityController.getFacilities);

// Public: Get facility by ID (showDeleted optional for admin/staff)
router.get("/:id", FacilityController.getFacilityById);

// Admin only: Create a new facility
router.post("/", AuthorizeRoles("admin"), FacilityController.createFacility);

// Admin and staff: Update a facility by ID
router.put(
  "/:id",
  AuthorizeRoles("admin", "staff"),
  FacilityController.updateFacility
);

// Admin only: Soft delete a facility
router.delete(
  "/:id",
  AuthorizeRoles("admin"),
  FacilityController.deleteFacility
);

// Admin and staff: Add availability period
router.post(
  "/:id/availability",
  AuthorizeRoles("admin", "staff"),
  FacilityController.addAvailability
);

// Admin and staff: Remove (soft remove) availability period by day
router.delete(
  "/:id/availability",
  AuthorizeRoles("admin", "staff"),
  FacilityController.removeAvailability
);

export default router;
