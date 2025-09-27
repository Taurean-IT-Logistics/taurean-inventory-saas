import { InventoryItemDocument, InventoryItemModel } from "../models";
import { Types } from "mongoose";
import { InventoryItem } from "../types"; // Assuming this is where your InventoryItem type is defined
import { RentalModel } from "../models/rental.model";

// Create a new inventory item
const createInventoryItem = async (
  itemData: InventoryItem
): Promise<InventoryItemDocument> => {
  try {
    const newItem = new InventoryItemModel(itemData);
    const saved = await newItem.save();
    try {
      const { emitEvent } = await import("../realtime/socket");
      const { Events } = await import("../realtime/events");
      emitEvent(Events.InventoryCreated, { id: saved._id, item: saved });
    } catch {}
    return saved;
  } catch (error) {
    throw new Error("Error creating inventory item" + (error as Error).message);
  }
};

// Get all inventory items, excluding deleted by default.
// If showDeleted = true, includes deleted items (for admin/staff)
const getAllInventoryItems = async (
  showDeleted = false
): Promise<InventoryItemDocument[]> => {
  try {
    const now = new Date();
    const items = await InventoryItemModel.aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      {
        $match: {
          ...(showDeleted ? {} : { isDeleted: false }),
          "company.isActive": true,
          "company.subscription.expiresAt": { $gt: now },
        },
      },
    ]);
    return items as any;
  } catch (error) {
    throw new Error("Error fetching inventory items");
  }
};

// Get company-specific inventory items
const getCompanyInventoryItems = async (
  companyId: string,
  showDeleted = false
): Promise<InventoryItemDocument[]> => {
  try {
    const filter: any = { company: companyId };
    if (!showDeleted) {
      filter.isDeleted = false;
    }
    return await InventoryItemModel.find(filter).populate("associatedFacility");
  } catch (error) {
    throw new Error("Error fetching company inventory items");
  }
};

// Get an inventory item by ID, excluding deleted by default.
// If showDeleted = true, includes deleted item (for admin/staff)
const getInventoryItemById = async (
  id: string,
  showDeleted = false
): Promise<InventoryItemDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    const filter = showDeleted ? { _id: id } : { _id: id, isDeleted: false };
    return await InventoryItemModel.findOne(filter).populate(
      "associatedFacility"
    );
  } catch (error) {
    throw new Error("Error fetching inventory item");
  }
};

// Update an inventory item by ID, excluding deleted by default.
// If showDeleted = true, allows updating deleted items (for admin)
const updateInventoryItem = async (
  id: string,
  updateData: Partial<InventoryItem>,
  newImages?: any[],
  removeImageIds?: string[],
  replaceAllImages = false,
  showDeleted = false
): Promise<InventoryItemDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }

    const filter = showDeleted ? { _id: id } : { _id: id, isDeleted: false };

    // Handle image operations
    if (newImages?.length || removeImageIds?.length || replaceAllImages) {
      const currentItem = await InventoryItemModel.findOne(filter);
      if (!currentItem) {
        throw new Error("Inventory item not found");
      }

      let updatedImages = [...(currentItem.images || [])];

      // Remove specified images
      if (removeImageIds?.length) {
        updatedImages = updatedImages.filter(
          (img: any) => !removeImageIds.includes(img._id?.toString())
        );
      }

      // Handle new images
      if (newImages?.length) {
        if (replaceAllImages) {
          updatedImages = newImages;
        } else {
          updatedImages = [...updatedImages, ...newImages];
        }
      }

      updateData.images = updatedImages;
    }

    const updated = await InventoryItemModel.findOneAndUpdate(
      filter,
      updateData,
      {
        new: true,
      }
    ).populate("associatedFacility");
    if (updated) {
      try {
        const { emitEvent } = await import("../realtime/socket");
        const { Events } = await import("../realtime/events");
        emitEvent(Events.InventoryUpdated, { id: updated._id, item: updated });
      } catch {}
    }
    return updated;
  } catch (error: any) {
    throw new Error(`Error updating inventory item: ${error.message}`);
  }
};

// Alternative MongoDB operator approach (more efficient for large arrays)
const updateInventoryItemWithOperators = async (
  id: string,
  updateData: Partial<InventoryItem>,
  newImages?: any[],
  removeImageIds?: string[],
  replaceAllImages = false,
  showDeleted = false
): Promise<InventoryItemDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }

    const filter = showDeleted ? { _id: id } : { _id: id, isDeleted: false };

    // Build update operations
    const updateOperations: any = { ...updateData };

    if (replaceAllImages && newImages?.length) {
      // Replace all images
      updateOperations.images = newImages;
    } else {
      // Handle add/remove operations
      if (removeImageIds?.length) {
        updateOperations.$pull = {
          images: {
            _id: { $in: removeImageIds.map((id) => new Types.ObjectId(id)) },
          },
        };
      }

      if (newImages?.length) {
        updateOperations.$push = {
          images: { $each: newImages },
        };
      }
    }

    return await InventoryItemModel.findOneAndUpdate(filter, updateOperations, {
      new: true,
    }).populate("associatedFacility");
  } catch (error: any) {
    throw new Error(`Error updating inventory item: ${error.message}`);
  }
};

// Soft delete an inventory item by ID (sets isDeleted = true)
const deleteInventoryItem = async (
  id: string
): Promise<InventoryItemDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    const deleted = await InventoryItemModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (deleted) {
      try {
        const { emitEvent } = await import("../realtime/socket");
        const { Events } = await import("../realtime/events");
        emitEvent(Events.InventoryDeleted, { id: deleted._id });
      } catch {}
    }
    return deleted;
  } catch (error) {
    throw new Error("Error deleting inventory item");
  }
};

// Restore a soft-deleted inventory item by ID (sets isDeleted = false)
const restoreInventoryItem = async (
  id: string
): Promise<InventoryItemDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    return await InventoryItemModel.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error restoring inventory item");
  }
};

// Get inventory items by status, excluding deleted by default
// Include deleted if showDeleted = true
const getInventoryItemsByStatus = async (
  status: string,
  showDeleted = false
): Promise<InventoryItemDocument[]> => {
  try {
    const filter = showDeleted ? { status } : { status, isDeleted: false };
    return await InventoryItemModel.find(filter).populate("associatedFacility");
  } catch (error) {
    throw new Error("Error fetching inventory items by status");
  }
};

// Add a maintenance schedule entry, exclude deleted by default
// Allow on deleted if showDeleted = true
const addMaintenanceSchedule = async (
  id: string,
  scheduleData: any,
  showDeleted = false
): Promise<InventoryItemDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    const filter = showDeleted ? { _id: id } : { _id: id, isDeleted: false };
    return await InventoryItemModel.findOneAndUpdate(
      filter,
      { $push: { maintenanceSchedule: scheduleData } },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error adding maintenance schedule");
  }
};

// Get low stock inventory items (quantity < 5), exclude deleted by default
const getLowStockItems = async (
  showDeleted = false
): Promise<InventoryItemDocument[]> => {
  try {
    const filter: any = showDeleted
      ? { quantity: { $lt: 5 } }
      : { quantity: { $lt: 5 }, isDeleted: false };
    return await InventoryItemModel.find(filter).populate("associatedFacility");
  } catch (error: any) {
    throw new Error(error.message || "Error fetching low stock items");
  }
};

const returnItem = async (
  id: string,
  data: {
    quantity: number;
    condition?: string;
    notes?: string;
    userId?: string;
  }
): Promise<InventoryItemDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID format");
    const current = await InventoryItemModel.findById(id);
    if (!current) return null;
    const newQty = (current.quantity || 0) + (data.quantity || 0);
    const update: any = {
      quantity: newQty,
      status: newQty > 0 ? "in_stock" : current.status,
      $push: {
        returns: {
          date: new Date(),
          returnedBy: data.userId ? new Types.ObjectId(data.userId) : undefined,
          condition: data.condition || "good",
          quantity: data.quantity,
          notes: data.notes,
        },
        history: {
          date: new Date(),
          change: data.quantity,
          reason: "return",
          user: data.userId ? new Types.ObjectId(data.userId) : undefined,
          notes: data.notes,
        },
      },
    };
    const updated = await InventoryItemModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (updated) {
      try {
        const { emitEvent } = await import("../realtime/socket");
        const { Events } = await import("../realtime/events");
        emitEvent(Events.InventoryUpdated, { id: updated._id, item: updated });
      } catch {}
    }
    return updated;
  } catch (e: any) {
    throw new Error(e.message || "Error returning item");
  }
};

/**
 * Enhanced Inventory Service
 * Handles inventory operations with rental integration
 */

/**
 * Get inventory items with rental status
 */
const getInventoryWithRentalStatus = async (
  filters: {
    status?: string;
    category?: string;
    facilityId?: string;
    companyId?: string;
    search?: string;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  items: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = { isDeleted: false };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.facilityId) {
      query.associatedFacility = filters.facilityId;
    }

    if (filters.companyId) {
      query.company = filters.companyId;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { sku: { $regex: filters.search, $options: "i" } },
      ];
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      InventoryItemModel.find(query)
        .populate("associatedFacility", "name")
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InventoryItemModel.countDocuments(query),
    ]);

    // Get rental status for each item
    const itemsWithRentalStatus = await Promise.all(
      items.map(async (item) => {
        const activeRentals = await RentalModel.countDocuments({
          item: item._id,
          status: "active",
          isDeleted: false,
        });

        const overdueRentals = await RentalModel.countDocuments({
          item: item._id,
          status: "overdue",
          isDeleted: false,
        });

        const totalRentals = await RentalModel.countDocuments({
          item: item._id,
          isDeleted: false,
        });

        return {
          ...item.toObject(),
          rentalStatus: {
            activeRentals,
            overdueRentals,
            totalRentals,
            availableQuantity: item.quantity - activeRentals,
          },
        };
      })
    );

    return {
      items: itemsWithRentalStatus,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch inventory with rental status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get inventory item details with rental history
 */
const getInventoryItemWithRentalHistory = async (
  itemId: string
): Promise<any> => {
  try {
    const item = await InventoryItemModel.findById(itemId)
      .populate("associatedFacility", "name")
      .populate("company", "name")
      .populate("history.user", "name email");

    if (!item) {
      throw new Error("Inventory item not found");
    }

    // Get rental history
    const rentalHistory = await RentalModel.find({
      item: itemId,
      isDeleted: false,
    })
      .populate("user", "name email phone")
      .populate("transaction", "amount method paymentStatus")
      .sort({ createdAt: -1 });

    // Get current active rentals
    const activeRentals = await RentalModel.find({
      item: itemId,
      status: "active",
      isDeleted: false,
    })
      .populate("user", "name email phone")
      .populate("transaction", "amount method paymentStatus");

    // Get overdue rentals
    const overdueRentals = await RentalModel.find({
      item: itemId,
      status: "overdue",
      isDeleted: false,
    })
      .populate("user", "name email phone")
      .populate("transaction", "amount method paymentStatus");

    // Calculate rental statistics
    const rentalStats = {
      totalRentals: rentalHistory.length,
      activeRentals: activeRentals.length,
      overdueRentals: overdueRentals.length,
      totalRevenue: rentalHistory.reduce(
        (sum, rental) => sum + rental.amount,
        0
      ),
      averageRentalDuration: 0, // Calculate based on rental periods
    };

    return {
      ...item.toObject(),
      rentalHistory,
      activeRentals,
      overdueRentals,
      rentalStats,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch inventory item with rental history: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Update inventory quantity when item is rented
 */
const rentInventoryItem = async (
  itemId: string,
  quantity: number,
  userId: string,
  reason: string = "Item rented"
): Promise<InventoryItemDocument | null> => {
  try {
    const item = await InventoryItemModel.findById(itemId);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    if (item.quantity < quantity) {
      throw new Error("Insufficient inventory quantity");
    }

    // Update quantity
    const updatedItem = await InventoryItemModel.findByIdAndUpdate(
      itemId,
      { $inc: { quantity: -quantity } },
      { new: true }
    );

    // Add to history
    await InventoryItemModel.findByIdAndUpdate(itemId, {
      $push: {
        history: {
          date: new Date(),
          change: -quantity,
          reason,
          user: userId,
          notes: `Item rented - quantity reduced by ${quantity}`,
        },
      },
    });

    return updatedItem;
  } catch (error) {
    throw new Error(
      `Failed to rent inventory item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Return inventory item
 */
const returnInventoryItem = async (
  itemId: string,
  quantity: number,
  userId: string,
  condition: "good" | "fair" | "damaged" = "good",
  notes?: string
): Promise<InventoryItemDocument | null> => {
  try {
    const item = await InventoryItemModel.findById(itemId);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    // Update quantity
    const updatedItem = await InventoryItemModel.findByIdAndUpdate(
      itemId,
      { $inc: { quantity } },
      { new: true }
    );

    // Add to history
    await InventoryItemModel.findByIdAndUpdate(itemId, {
      $push: {
        history: {
          date: new Date(),
          change: quantity,
          reason: "Item returned",
          user: userId,
          notes: `Item returned - quantity increased by ${quantity}. Condition: ${condition}`,
        },
        returns: {
          date: new Date(),
          returnedBy: userId,
          condition,
          quantity,
          notes,
        },
      },
    });

    return updatedItem;
  } catch (error) {
    throw new Error(
      `Failed to return inventory item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get inventory statistics
 */
const getInventoryStatistics = async (
  companyId?: string
): Promise<{
  totalItems: number;
  totalQuantity: number;
  availableQuantity: number;
  rentedQuantity: number;
  lowStockItems: number;
  maintenanceDueItems: number;
  totalValue: number;
  categories: { [key: string]: number };
}> => {
  try {
    const query: any = { isDeleted: false };
    if (companyId) {
      query.company = companyId;
    }

    const items = await InventoryItemModel.find(query);

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate rented quantity
    const rentedQuantity = await RentalModel.aggregate([
      { $match: { status: "active", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    const availableQuantity = totalQuantity - (rentedQuantity[0]?.total || 0);

    const lowStockItems = items.filter((item) => item.alerts.lowStock).length;
    const maintenanceDueItems = items.filter(
      (item) => item.alerts.maintenanceDue
    ).length;

    const totalValue = items.reduce((sum, item) => {
      const defaultPricing = item.pricing.find((p) => p.isDefault);
      return sum + item.quantity * (defaultPricing?.amount || 0);
    }, 0);

    // Group by categories
    const categories = items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number }
    );

    return {
      totalItems,
      totalQuantity,
      availableQuantity,
      rentedQuantity: rentedQuantity[0]?.total || 0,
      lowStockItems,
      maintenanceDueItems,
      totalValue,
      categories,
    };
  } catch (error) {
    throw new Error(
      `Failed to get inventory statistics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get maintenance due items
 */
const getMaintenanceDueItems = async (
  companyId?: string
): Promise<InventoryItemDocument[]> => {
  try {
    const query: any = {
      isDeleted: false,
      "maintenanceSchedule.completed": false,
      "maintenanceSchedule.scheduledDate": { $lte: new Date() },
    };

    if (companyId) {
      query.company = companyId;
    }

    return await InventoryItemModel.find(query)
      .populate("associatedFacility", "name")
      .populate("company", "name")
      .sort({ "maintenanceSchedule.scheduledDate": 1 });
  } catch (error) {
    throw new Error(
      `Failed to get maintenance due items: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  createInventoryItem,
  getAllInventoryItems,
  getCompanyInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  restoreInventoryItem,
  getInventoryItemsByStatus,
  addMaintenanceSchedule,
  getLowStockItems,
  updateInventoryItemWithOperators,
  returnItem,
  getInventoryWithRentalStatus,
  getInventoryItemWithRentalHistory,
  rentInventoryItem,
  returnInventoryItem,
  getInventoryStatistics,
  getMaintenanceDueItems,
};
