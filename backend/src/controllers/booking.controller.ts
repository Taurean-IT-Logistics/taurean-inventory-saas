import { Request, Response } from "express";
import { BookingService, UserService } from "../services";
import { sendSuccess, sendError, sendNotFound } from "../utils";

const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingData = req.body;

    if (bookingData.user) {
      const user = await UserService.getUserById(bookingData.user);
      if (!user) {
        sendError(res, "User not found");
        return;
      }
      bookingData.user = user._id;
    }

    if (!req.user || !req.user.id) {
      sendError(res, "User not authenticated");
      return;
    }
    bookingData.user = req.user.id;
    const newBooking = await BookingService.createBooking(bookingData);
    sendSuccess(res, "Booking created successfully", newBooking);
  } catch (error: any) {
    sendError(res, error.message || "Failed to create booking");
  }
};

const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const showDeleted = req.query.showDeleted === "true";
    const booking = await BookingService.getBookingById(bookingId, showDeleted);
    if (!booking) {
      sendNotFound(res, "Booking not found");
      return;
    }

    // Only allow users to access their own bookings
    if (req.user?.role === "user" && booking.user.email !== req.user.email) {
      sendError(res, "You are not authorized to access this booking");
      return;
    }

    sendSuccess(res, "Booking fetched successfully", booking);
  } catch (error: any) {
    sendError(res, error.message || "Failed to fetch booking");
  }
};

const getBookingsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const showDeleted = req.query.showDeleted === "true";
    const bookings = await BookingService.getBookingsByUser(
      userId,
      showDeleted
    );
    sendSuccess(res, "Bookings fetched successfully", bookings);
  } catch (error: any) {
    sendError(res, error.message || "Failed to fetch bookings");
  }
};

const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    const showDeleted = req.query.showDeleted === "true";
    const updatedBooking = await BookingService.updateBooking(
      bookingId,
      updateData,
      showDeleted
    );
    if (!updatedBooking) {
      sendNotFound(res, "Booking not found or cannot be updated");
      return;
    }
    sendSuccess(res, "Booking updated successfully", updatedBooking);
  } catch (error: any) {
    sendError(res, error.message || "Failed to update booking");
  }
};

const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;

    // Only allow users to delete their own bookings
    if (req.user?.role === "user") {
      const bookingDoc = await BookingService.getBookingById(bookingId);

      if (!bookingDoc) {
        sendNotFound(res, "Booking not found");
        return;
      }

      if (bookingDoc.user.email !== req.user.email) {
        sendError(res, "You are not authorized to delete this booking");
        return;
      }
    }

    const deletedBooking = await BookingService.deleteBooking(bookingId);
    if (!deletedBooking) {
      sendNotFound(res, "Booking not found or already deleted");
      return;
    }
    sendSuccess(res, "Booking deleted successfully", deletedBooking);
  } catch (error: any) {
    sendError(res, error.message || "Failed to delete booking");
  }
};

const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const showDeleted = req.query.showDeleted === "true";
    const bookings = await BookingService.getAllBookings(showDeleted);
    sendSuccess(res, "All bookings fetched successfully", bookings);
  } catch (error: any) {
    sendError(res, error.message || "Failed to fetch bookings");
  }
};

const getAuthUserBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      sendError(res, "User not authenticated");
      return;
    }
    const userId = req.user.id;
    const showDeleted = req.query.showDeleted === "true";
    const bookings = await BookingService.getBookingsByUser(
      userId,
      showDeleted
    );
    sendSuccess(res, "User bookings fetched successfully", bookings);
  } catch (error: any) {
    sendError(res, error.message || "Failed to fetch user bookings");
  }
};

export {
  createBooking,
  getBookingById,
  getBookingsByUser,
  updateBooking,
  deleteBooking,
  getAllBookings,
  getAuthUserBookings,
};
