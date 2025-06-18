import { Router } from "express";
import { BookingController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";

const router = Router();

router.use(AuthMiddleware);

// Route to create a new booking
router.post("/", BookingController.createBooking);

// Route to get bookings for the authenticated user
router.get("/me", BookingController.getAuthUserBookings);

// Route to get all bookings for a specific user
router.get(
  "/user/:userId",
  AuthorizeRoles("staff", "admin"),
  BookingController.getBookingsByUser
);

// Route to get all bookings (admin access)
router.get(
  "/",
  AuthorizeRoles("staff", "admin"),
  BookingController.getAllBookings
);

// Route to get a booking by ID
router.get("/:id", BookingController.getBookingById);

// Route to update a booking by ID
router.put("/:id", BookingController.updateBooking);

// Route to soft delete a booking by ID (admin/staff can delete any, but user can only delete their own)
router.delete("/:id", BookingController.deleteBooking);

export default router;
