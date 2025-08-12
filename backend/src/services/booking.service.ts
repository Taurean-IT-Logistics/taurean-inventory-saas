import { BookingDocument, BookingModel } from "../models";
import { Types } from "mongoose";
import { Booking } from "../types";

function hasOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

async function assertNoFacilityConflicts(facilityId: string, start: Date, end: Date, excludeId?: string) {
  const filter: any = {
    facility: new Types.ObjectId(facilityId),
    status: { $in: ["pending", "confirmed"] },
  };
  if (excludeId && Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new Types.ObjectId(excludeId) };
  }
  const candidates = await BookingModel.find(filter).select("startDate endDate");
  for (const c of candidates) {
    if (hasOverlap(start, end, c.startDate as any, c.endDate as any)) {
      throw new Error("Booking conflict: overlapping time for this facility");
    }
  }
}

// Create a new booking
const createBooking = async (
  bookingData: Booking
): Promise<BookingDocument> => {
  try {
    if (!bookingData.startDate || !bookingData.endDate) {
      throw new Error("Start and end dates are required");
    }
    if (new Date(bookingData.startDate) >= new Date(bookingData.endDate)) {
      throw new Error("End date must be after start date");
    }
    await assertNoFacilityConflicts((bookingData as any).facility, new Date(bookingData.startDate), new Date(bookingData.endDate));
    const booking = new BookingModel(bookingData);
    const saved = await booking.save();
    try {
      const { emitEvent } = await import("../realtime/socket");
      const { Events } = await import("../realtime/events");
      emitEvent(Events.BookingCreated, { id: saved._id, booking: saved });
    } catch {}
    return saved;
  } catch (error) {
    throw new Error((error as Error).message || "Error creating booking");
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
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        throw new Error("End date must be after start date");
      }
    }
    const current = await BookingModel.findById(bookingId);
    if (current) {
      const facility = (updateData as any).facility?.toString?.() || current.facility?.toString?.();
      const start = new Date((updateData.startDate as any) || (current.startDate as any));
      const end = new Date((updateData.endDate as any) || (current.endDate as any));
      await assertNoFacilityConflicts(facility, start, end, bookingId);
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
    throw new Error((error as Error).message || "Error updating booking");
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
