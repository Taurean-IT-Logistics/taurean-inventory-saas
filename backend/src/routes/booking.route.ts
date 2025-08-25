import { Router } from "express";
import { BookingController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";
import {
  RequireActiveCompany,
  RequirePermissions,
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  AuthMiddleware,
  BookingController.createBooking
);
router.post(
  "/check-availability",
  AuthMiddleware,
  BookingController.checkAvailability
);
router.get("/me", AuthMiddleware, BookingController.getAuthUserBookings);
router.get(
  "/user/:userId",
  AuthMiddleware,
  RequirePermissions(["viewBookings"]),
  BookingController.getBookingsByUser
);

// Company-specific: Get bookings for the authenticated user's company
router.get(
  "/company",
  AuthMiddleware,
  RequireActiveCompany(),
  RequirePermissions(["viewBookings"]),
  BookingController.getCompanyBookings
);

router.get("/:id", AuthMiddleware, BookingController.getBookingById);
router.put(
  "/:id",
  AuthMiddleware,
  RequireActiveCompany(),
  RequirePermissions(["editRecords"]),
  BookingController.updateBooking
);
router.post(
  "/:id/check-in",
  AuthMiddleware,
  RequireActiveCompany(),
  RequirePermissions(["editRecords"]),
  BookingController.checkIn
);
router.post(
  "/:id/check-out",
  AuthMiddleware,
  RequireActiveCompany(),
  RequirePermissions(["editRecords"]),
  BookingController.checkOut
);
router.delete(
  "/:id",
  AuthMiddleware,
  RequireActiveCompany(),
  RequirePermissions(["editRecords"]),
  BookingController.deleteBooking
);
router.get(
  "/",
  AuthMiddleware,
  RequirePermissions(["viewBookings"]),
  BookingController.getAllBookings
);

export default router;
