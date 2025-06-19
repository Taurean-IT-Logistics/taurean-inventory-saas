import { Router } from "express";
import { FacilityController } from "../controllers";
import {
  AuthMiddleware,
  AuthorizeRoles,
  storage,
  fileFilter,
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

// Public: Get list of facilities (with pagination, filtering, and sorting), no authentication required
router.get("/", FacilityController.getFacilities);

router.use(AuthMiddleware);

// Public: Get facility by ID
router.get("/:id", FacilityController.getFacilityById);

// Public: Get facility reviews with pagination
router.get("/:id/reviews", FacilityController.getFacilityReviews);

// Admin only: Create a new facility
router.post(
  "/",
  AuthorizeRoles("admin"),
  multer(uploadConfig).array("files"),
  FacilityController.createFacility
);

// Admin and staff: Update a facility by ID
router.put(
  "/:id",
  AuthorizeRoles("admin", "staff"),
  multer(uploadConfig).array("files"),
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

// Admin and staff: Remove availability period
router.delete(
  "/:id/availability",
  AuthorizeRoles("admin", "staff"),
  FacilityController.removeAvailability
);

// Authenticated users: Leave a review for a facility
router.post("/:id/review", FacilityController.addReview);

export default router;
