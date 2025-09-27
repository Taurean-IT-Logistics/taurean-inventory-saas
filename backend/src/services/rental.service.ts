import { RentalModel, RentalDocument } from "../models/rental.model";
import { InventoryItemModel } from "../models/inventoryItem.model";
import { TransactionModel } from "../models/transaction.model";
import { Rental } from "../types";

/**
 * Rental Service
 * Handles all rental operations including creation, tracking, and returns
 */

/**
 * Create a new rental
 */
const createRental = async (
  rentalData: Partial<Rental>
): Promise<RentalDocument> => {
  try {
    // Validate inventory item availability
    const item = await InventoryItemModel.findById(rentalData.item);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    if (item.quantity < (rentalData.quantity || 0)) {
      throw new Error("Insufficient inventory quantity");
    }

    // Create rental
    const rental = new RentalModel(rentalData);
    await rental.save();

    // Update inventory quantity
    await InventoryItemModel.findByIdAndUpdate(rentalData.item, {
      $inc: { quantity: -(rentalData.quantity || 0) },
    });

    return rental;
  } catch (error) {
    throw new Error(
      `Failed to create rental: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get all rentals with pagination and filters
 */
const getRentals = async (
  filters: {
    status?: string;
    userId?: string;
    companyId?: string;
    itemId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  rentals: RentalDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = { isDeleted: false };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.userId) {
      query.user = filters.userId;
    }

    if (filters.companyId) {
      query.company = filters.companyId;
    }

    if (filters.itemId) {
      query.item = filters.itemId;
    }

    if (filters.startDate || filters.endDate) {
      query.startDate = {};
      if (filters.startDate) {
        query.startDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.startDate.$lte = filters.endDate;
      }
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [rentals, total] = await Promise.all([
      RentalModel.find(query)
        .populate("item", "name description images")
        .populate("user", "name email phone")
        .populate("transaction", "amount method paymentStatus")
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RentalModel.countDocuments(query),
    ]);

    return {
      rentals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch rentals: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get rental by ID
 */
const getRentalById = async (id: string): Promise<RentalDocument | null> => {
  try {
    return await RentalModel.findById(id)
      .populate("item", "name description images")
      .populate("user", "name email phone")
      .populate("transaction", "amount method paymentStatus")
      .populate("company", "name");
  } catch (error) {
    throw new Error(
      `Failed to fetch rental: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Update rental status
 */
const updateRentalStatus = async (
  id: string,
  status: "active" | "returned" | "overdue" | "cancelled",
  updateData?: {
    returnDate?: Date;
    returnCondition?: "good" | "fair" | "damaged";
    returnNotes?: string;
    lateFee?: number;
    damageFee?: number;
  }
): Promise<RentalDocument | null> => {
  try {
    const rental = await RentalModel.findById(id);
    if (!rental) {
      throw new Error("Rental not found");
    }

    const updateFields: any = { status };

    if (updateData) {
      if (updateData.returnDate)
        updateFields.returnDate = updateData.returnDate;
      if (updateData.returnCondition)
        updateFields.returnCondition = updateData.returnCondition;
      if (updateData.returnNotes)
        updateFields.returnNotes = updateData.returnNotes;
      if (updateData.lateFee) updateFields.lateFee = updateData.lateFee;
      if (updateData.damageFee) updateFields.damageFee = updateData.damageFee;
    }

    // If returning item, restore inventory quantity
    if (status === "returned" && rental.status === "active") {
      await InventoryItemModel.findByIdAndUpdate(rental.item, {
        $inc: { quantity: rental.quantity },
      });
    }

    // If cancelling rental, restore inventory quantity
    if (status === "cancelled" && rental.status === "active") {
      await InventoryItemModel.findByIdAndUpdate(rental.item, {
        $inc: { quantity: rental.quantity },
      });
    }

    return await RentalModel.findByIdAndUpdate(id, updateFields, { new: true })
      .populate("item", "name description images")
      .populate("user", "name email phone")
      .populate("transaction", "amount method paymentStatus")
      .populate("company", "name");
  } catch (error) {
    throw new Error(
      `Failed to update rental status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Return rental item
 */
const returnRental = async (
  id: string,
  returnData: {
    returnDate: Date;
    returnCondition: "good" | "fair" | "damaged";
    returnNotes?: string;
    lateFee?: number;
    damageFee?: number;
  }
): Promise<RentalDocument | null> => {
  try {
    const rental = await RentalModel.findById(id);
    if (!rental) {
      throw new Error("Rental not found");
    }

    if (rental.status !== "active") {
      throw new Error("Rental is not active and cannot be returned");
    }

    // Calculate late fee if applicable
    const isLate = returnData.returnDate > rental.endDate;
    const lateFee = isLate ? returnData.lateFee || 0 : 0;

    // Update rental status
    const updatedRental = await updateRentalStatus(id, "returned", {
      returnDate: returnData.returnDate,
      returnCondition: returnData.returnCondition,
      returnNotes: returnData.returnNotes,
      lateFee,
      damageFee: returnData.damageFee || 0,
    });

    // Create additional transaction for fees if any
    if (lateFee > 0 || (returnData.damageFee && returnData.damageFee > 0)) {
      const totalFees = lateFee + (returnData.damageFee || 0);

      const feeTransaction = new TransactionModel({
        user: rental.user,
        type: "income",
        category: "rental_fees",
        amount: totalFees,
        method: "rental_fee",
        description: `Rental fees for ${rental.item} - Late: ${lateFee}, Damage: ${returnData.damageFee || 0}`,
        company: rental.company,
      });
      await feeTransaction.save();
    }

    return updatedRental;
  } catch (error) {
    throw new Error(
      `Failed to return rental: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get overdue rentals
 */
const getOverdueRentals = async (
  companyId?: string,
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  rentals: RentalDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = {
      isDeleted: false,
      status: "active",
      endDate: { $lt: new Date() },
    };

    if (companyId) {
      query.company = companyId;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [rentals, total] = await Promise.all([
      RentalModel.find(query)
        .populate("item", "name description images")
        .populate("user", "name email phone")
        .populate("transaction", "amount method paymentStatus")
        .populate("company", "name")
        .sort({ endDate: 1 })
        .skip(skip)
        .limit(limit),
      RentalModel.countDocuments(query),
    ]);

    // Update status to overdue for all found rentals
    await RentalModel.updateMany(
      { _id: { $in: rentals.map((r) => r._id) } },
      { status: "overdue" }
    );

    // Refetch updated rentals to ensure status is "overdue" and return as RentalDocument[]
    const updatedRentals = await RentalModel.find({
      _id: { $in: rentals.map((r) => r._id) },
    })
      .populate("item", "name description images")
      .populate("user", "name email phone")
      .populate("transaction", "amount method paymentStatus")
      .populate("company", "name")
      .sort({ endDate: 1 });

    return {
      rentals: updatedRentals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch overdue rentals: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get rental statistics
 */
const getRentalStatistics = async (
  companyId?: string
): Promise<{
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  returnedRentals: number;
  totalRevenue: number;
  pendingFees: number;
}> => {
  try {
    const query: any = { isDeleted: false };
    if (companyId) {
      query.company = companyId;
    }

    const [
      totalRentals,
      activeRentals,
      overdueRentals,
      returnedRentals,
      revenueData,
      feesData,
    ] = await Promise.all([
      RentalModel.countDocuments(query),
      RentalModel.countDocuments({ ...query, status: "active" }),
      RentalModel.countDocuments({ ...query, status: "overdue" }),
      RentalModel.countDocuments({ ...query, status: "returned" }),
      RentalModel.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      RentalModel.aggregate([
        { $match: { ...query, status: { $in: ["overdue", "returned"] } } },
        {
          $group: {
            _id: null,
            total: { $sum: { $add: ["$lateFee", "$damageFee"] } },
          },
        },
      ]),
    ]);

    return {
      totalRentals,
      activeRentals,
      overdueRentals,
      returnedRentals,
      totalRevenue: revenueData[0]?.total || 0,
      pendingFees: feesData[0]?.total || 0,
    };
  } catch (error) {
    throw new Error(
      `Failed to get rental statistics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Delete rental (soft delete)
 */
const deleteRental = async (id: string): Promise<boolean> => {
  try {
    const rental = await RentalModel.findById(id);
    if (!rental) {
      return false;
    }

    // If rental is active, restore inventory quantity
    if (rental.status === "active") {
      await InventoryItemModel.findByIdAndUpdate(rental.item, {
        $inc: { quantity: rental.quantity },
      });
    }

    // Soft delete
    await RentalModel.findByIdAndUpdate(id, { isDeleted: true });
    return true;
  } catch (error) {
    throw new Error(
      `Failed to delete rental: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  createRental,
  getRentals,
  getRentalById,
  updateRentalStatus,
  returnRental,
  getOverdueRentals,
  getRentalStatistics,
  deleteRental,
};
