import { Router } from "express";
import { FacilityController } from "../controllers";
import { AuthMiddleware, storage, fileFilter } from "../middlewares";
import multer from "multer";
import { BookingModel } from "../models";
import {
  RequireActiveCompany,
  RequirePermissions,
} from "../middlewares/auth.middleware";

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

// Public: Get facility by ID
router.get("/:id", FacilityController.getFacilityById);

router.get("/:id/reviews", FacilityController.getFacilityReviews);

// Public calendar of booked slots
router.get("/:id/calendar", async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const bookings = await BookingModel.find({
      facility: id,
      status: { $in: ["pending", "confirmed"] },
      endDate: { $gte: now },
    })
      .select("startDate endDate status")
      .sort({ startDate: 1 });
    res.json({
      success: true,
      message: "Facility calendar",
      data: { bookings },
    });
  } catch (e: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch calendar",
        errors: e.message,
      });
  }
});

router.use(AuthMiddleware);

// Create a new facility
router.post(
  "/",
  RequireActiveCompany(),
  RequirePermissions(["manageFacilities"]),
  multer(uploadConfig).array("files"),
  FacilityController.createFacility
);

// Update a facility by ID
router.put(
  "/:id",
  RequireActiveCompany(),
  RequirePermissions(["manageFacilities"]),
  multer(uploadConfig).array("files"),
  FacilityController.updateFacility
);

// Soft delete a facility
router.delete(
  "/:id",
  RequireActiveCompany(),
  RequirePermissions(["manageFacilities"]),
  FacilityController.deleteFacility
);

// Add availability period
router.post(
  "/:id/availability",
  RequireActiveCompany(),
  RequirePermissions(["manageFacilities"]),
  FacilityController.addAvailability
);

// Remove availability period
router.delete(
  "/:id/availability",
  RequireActiveCompany(),
  RequirePermissions(["manageFacilities"]),
  FacilityController.removeAvailability
);

// Authenticated users: Leave a review for a facility
router.post("/:id/review", FacilityController.addReview);

export default router;
