import { BookingDocument, BookingModel, InventoryItemModel } from "../models";
import { Types } from "mongoose";
import { Booking } from "../types";

function hasOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

// Extract common filter logic to ensure consistency
function buildConflictFilter(facilityId: string, excludeId?: string) {
  const filter: any = {
    facility: new Types.ObjectId(facilityId),
    status: { $in: ["pending", "confirmed"] },
    isDeleted: false,
  };
  if (excludeId && Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new Types.ObjectId(excludeId) };
  }
  return filter;
}

async function assertNoFacilityConflicts(
  facilityId: string,
  start: Date,
  end: Date,
  excludeId?: string
) {
  const filter = buildConflictFilter(facilityId, excludeId);
  const candidates = await BookingModel.find(filter).select(
    "startDate endDate"
  );
  for (const c of candidates) {
    if (hasOverlap(start, end, c.startDate as any, c.endDate as any)) {
      throw new Error("Booking conflict: overlapping time for this facility");
    }
  }
}

async function adjustInventoryForItems(
  items: { inventoryItem: any; quantity: number }[],
  direction: "decrement" | "increment"
) {
  if (!items || items.length === 0) return;
  for (const it of items) {
    if (!it?.inventoryItem || !it?.quantity) continue;
    const id = (it.inventoryItem as any)?.toString?.() || it.inventoryItem;
    const qty = it.quantity;
    const doc = await InventoryItemModel.findById(id);
    if (!doc) throw new Error("Inventory item not found");
    let newQty = doc.quantity;
    if (direction === "decrement") {
      if (doc.quantity < qty)
        throw new Error("Insufficient inventory for booking");
      newQty = doc.quantity - qty;
    } else {
      newQty = doc.quantity + qty;
    }
    await InventoryItemModel.findByIdAndUpdate(id, { quantity: newQty });
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
    await assertNoFacilityConflicts(
      (bookingData as any).facility,
      new Date(bookingData.startDate),
      new Date(bookingData.endDate)
    );
    await adjustInventoryForItems(
      (bookingData as any).items || [],
      "decrement"
    );
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
      const facility =
        (updateData as any).facility?.toString?.() ||
        current.facility?.toString?.();
      const start = new Date(
        (updateData.startDate as any) || (current.startDate as any)
      );
      const end = new Date(
        (updateData.endDate as any) || (current.endDate as any)
      );
      await assertNoFacilityConflicts(facility, start, end, bookingId);
      // Adjust inventory if items changed
      const newItems = (updateData as any).items;
      if (newItems) {
        // First revert previous items
        await adjustInventoryForItems(
          ((current as any).items || []) as any,
          "increment"
        );
        // Then decrement for new items
        await adjustInventoryForItems(newItems as any, "decrement");
      }
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

// Get company-specific bookings
const getCompanyBookings = async (
  companyId: string,
  showDeleted = false
): Promise<BookingDocument[]> => {
  try {
    const filter: any = { company: companyId };
    if (!showDeleted) {
      filter.isDeleted = false;
    }
    return await BookingModel.find(filter).populate(
      "user facility paymentDetails"
    );
  } catch (error) {
    throw new Error("Error fetching company bookings");
  }
};

// Check if a facility is available for the given date range
const checkAvailability = async (
  facilityId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(facilityId)) {
      throw new Error("Invalid facility ID");
    }

    // Use the same filter logic as assertNoFacilityConflicts for consistency
    const filter = buildConflictFilter(facilityId);
    const existingBookings = await BookingModel.find(filter).select(
      "startDate endDate"
    );

    for (const booking of existingBookings) {
      if (
        hasOverlap(
          startDate,
          endDate,
          booking.startDate as any,
          booking.endDate as any
        )
      ) {
        return false; // Conflict found
      }
    }

    return true; // No conflicts found
  } catch (error) {
    throw new Error("Error checking availability");
  }
};

// Get suggested available dates around the requested date range
const getSuggestedDates = async (
  facilityId: string,
  startDate: Date,
  endDate: Date
): Promise<{ startDate: Date; endDate: Date; duration: number }[]> => {
  try {
    if (!Types.ObjectId.isValid(facilityId)) {
      throw new Error("Invalid facility ID");
    }

    const duration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const suggestions: { startDate: Date; endDate: Date; duration: number }[] =
      [];

    // Check availability for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const newStartDate = new Date(startDate);
      newStartDate.setDate(newStartDate.getDate() + i);

      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + duration);

      const isAvailable = await checkAvailability(
        facilityId,
        newStartDate,
        newEndDate
      );

      if (isAvailable) {
        suggestions.push({
          startDate: newStartDate,
          endDate: newEndDate,
          duration,
        });

        // Limit to 5 suggestions
        if (suggestions.length >= 5) break;
      }
    }

    return suggestions;
  } catch (error) {
    throw new Error("Error getting suggested dates");
  }
};

export {
  createBooking,
  getBookingById,
  getBookingsByUser,
  updateBooking,
  deleteBooking,
  getAllBookings,
  getCompanyBookings,
  checkAvailability,
  getSuggestedDates,
};
