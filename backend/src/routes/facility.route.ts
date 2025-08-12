import { Router } from "express";
import { FacilityController } from "../controllers";
import {
  AuthMiddleware,
  AuthorizeRoles,
  storage,
  fileFilter,
} from "../middlewares";
import multer from "multer";
import { BookingModel } from "../models";

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
    const bookings = await BookingModel.find({ facility: id, status: { $in: ["pending", "confirmed"] }, endDate: { $gte: now } })
      .select("startDate endDate status")
      .sort({ startDate: 1 });
    res.json({ success: true, message: "Facility calendar", data: { bookings } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: "Failed to fetch calendar", errors: e.message });
  }
});

router.use(AuthMiddleware);

// Public: Get facility reviews with pagination

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
