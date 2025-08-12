import { Router } from "express";
import { BookingController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";
import { RequireActiveCompany } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", AuthMiddleware, RequireActiveCompany(), BookingController.createBooking);
router.get("/me", AuthMiddleware, BookingController.getAuthUserBookings);
router.get("/user/:userId", AuthMiddleware, AuthorizeRoles("admin", "staff"), BookingController.getBookingsByUser);
router.get("/:id", AuthMiddleware, BookingController.getBookingById);
router.put("/:id", AuthMiddleware, RequireActiveCompany(), BookingController.updateBooking);
router.post("/:id/check-in", AuthMiddleware, RequireActiveCompany(), BookingController.checkIn);
router.post("/:id/check-out", AuthMiddleware, RequireActiveCompany(), BookingController.checkOut);
router.delete("/:id", AuthMiddleware, RequireActiveCompany(), BookingController.deleteBooking);
router.get("/", AuthMiddleware, AuthorizeRoles("admin", "staff"), BookingController.getAllBookings);

export default router;
