import { BookingDocument, BookingModel } from "../models";
import { Types } from "mongoose";
import { Booking } from "../types";

// Create a new booking
const createBooking = async (
  bookingData: Booking
): Promise<BookingDocument> => {
  try {
    const booking = new BookingModel(bookingData);
    const saved = await booking.save();
    try {
      const { emitEvent } = await import("../realtime/socket");
      const { Events } = await import("../realtime/events");
      emitEvent(Events.BookingCreated, { id: saved._id, booking: saved });
    } catch {}
    return saved;
  } catch (error) {
    throw new Error("Error creating booking");
  }
};

// Get a booking by ID, excluding deleted by default.
// If showDeleted = true, includes deleted booking (for admin/staff)
const getBookingById = async (
  bookingId: string,
  showDeleted = false
): Promise<BookingDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new Error("Invalid booking ID");
    }
    const filter = showDeleted
      ? { _id: bookingId }
      : { _id: bookingId, isDeleted: false };
    return await BookingModel.findOne(filter).populate(
      "user facility paymentDetails"
    );
  } catch (error) {
    throw new Error("Error fetching booking");
  }
};

// Get all bookings for a user, excluding deleted by default.
// If showDeleted = true, includes deleted bookings (for admin/staff)
const getBookingsByUser = async (
  userId: string,
  showDeleted = false
): Promise<BookingDocument[]> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }
    const filter: any = { user: userId };
    if (!showDeleted) {
      filter.isDeleted = false;
    }
    return await BookingModel.find(filter).populate("facility paymentDetails");
  } catch (error) {
    throw new Error("Error fetching user bookings");
  }
};

// Update a booking, excluding deleted by default.
// If showDeleted = true, allows updating deleted bookings (for admin)
const updateBooking = async (
  bookingId: string,
  updateData: Partial<Booking>,
  showDeleted = false
): Promise<BookingDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new Error("Invalid booking ID");
    }
    const filter = showDeleted
      ? { _id: bookingId }
      : { _id: bookingId, isDeleted: false };
    const updated = await BookingModel.findOneAndUpdate(filter, updateData, {
      new: true,
    });
    if (updated) {
      try {
        const { emitEvent } = await import("../realtime/socket");
        const { Events } = await import("../realtime/events");
        emitEvent(Events.BookingUpdated, { id: updated._id, booking: updated });
      } catch {}
    }
    return updated;
  } catch (error) {
    throw new Error("Error updating booking");
  }
};

// Soft delete a booking by ID (sets isDeleted = true)
const deleteBooking = async (
  bookingId: string
): Promise<BookingDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new Error("Invalid booking ID");
    }
    return await BookingModel.findOneAndUpdate(
      { _id: bookingId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error deleting booking");
  }
};

// Get all bookings (for admin or management purposes)
// If showDeleted = true, includes deleted bookings
const getAllBookings = async (
  showDeleted = false
): Promise<BookingDocument[]> => {
  try {
    const filter: any = {};
    if (!showDeleted) {
      filter.isDeleted = false;
    }
    return await BookingModel.find(filter).populate(
      "user facility paymentDetails"
    );
  } catch (error) {
    throw new Error("Error fetching all bookings");
  }
};

export {
  createBooking,
  getBookingById,
  getBookingsByUser,
  updateBooking,
  deleteBooking,
  getAllBookings,
};
