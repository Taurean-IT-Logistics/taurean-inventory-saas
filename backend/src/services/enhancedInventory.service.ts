import { InventoryItemModel, InventoryItemDocument } from "../models/inventoryItem.model";
import { RentalModel } from "../models/rental.model";
import { TransactionModel } from "../models/transaction.model";
import { InventoryItem } from "../types";

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
): Promise<{ items: any[]; total: number; totalPages: number; currentPage: number }> => {
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
        .populate('associatedFacility', 'name')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InventoryItemModel.countDocuments(query)
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
const getInventoryItemWithRentalHistory = async (itemId: string): Promise<any> => {
  try {
    const item = await InventoryItemModel.findById(itemId)
      .populate('associatedFacility', 'name')
      .populate('company', 'name')
      .populate('history.user', 'name email');

    if (!item) {
      throw new Error("Inventory item not found");
    }

    // Get rental history
    const rentalHistory = await RentalModel.find({ item: itemId, isDeleted: false })
      .populate('user', 'name email phone')
      .populate('transaction', 'amount method paymentStatus')
      .sort({ createdAt: -1 });

    // Get current active rentals
    const activeRentals = await RentalModel.find({
      item: itemId,
      status: "active",
      isDeleted: false,
    })
      .populate('user', 'name email phone')
      .populate('transaction', 'amount method paymentStatus');

    // Get overdue rentals
    const overdueRentals = await RentalModel.find({
      item: itemId,
      status: "overdue",
      isDeleted: false,
    })
      .populate('user', 'name email phone')
      .populate('transaction', 'amount method paymentStatus');

    // Calculate rental statistics
    const rentalStats = {
      totalRentals: rentalHistory.length,
      activeRentals: activeRentals.length,
      overdueRentals: overdueRentals.length,
      totalRevenue: rentalHistory.reduce((sum, rental) => sum + rental.amount, 0),
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
const getInventoryStatistics = async (companyId?: string): Promise<{
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
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    const availableQuantity = totalQuantity - (rentedQuantity[0]?.total || 0);
    
    const lowStockItems = items.filter(item => item.alerts.lowStock).length;
    const maintenanceDueItems = items.filter(item => item.alerts.maintenanceDue).length;
    
    const totalValue = items.reduce((sum, item) => {
      const defaultPricing = item.pricing.find(p => p.isDefault);
      return sum + (item.quantity * (defaultPricing?.amount || 0));
    }, 0);

    // Group by categories
    const categories = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

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
 * Get low stock items
 */
const getLowStockItems = async (
  companyId?: string,
  threshold: number = 5
): Promise<InventoryItemDocument[]> => {
  try {
    const query: any = {
      isDeleted: false,
      quantity: { $lte: threshold },
    };

    if (companyId) {
      query.company = companyId;
    }

    return await InventoryItemModel.find(query)
      .populate('associatedFacility', 'name')
      .populate('company', 'name')
      .sort({ quantity: 1 });
  } catch (error) {
    throw new Error(
      `Failed to get low stock items: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get maintenance due items
 */
const getMaintenanceDueItems = async (companyId?: string): Promise<InventoryItemDocument[]> => {
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
      .populate('associatedFacility', 'name')
      .populate('company', 'name')
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
  getInventoryWithRentalStatus,
  getInventoryItemWithRentalHistory,
  rentInventoryItem,
  returnInventoryItem,
  getInventoryStatistics,
  getLowStockItems,
  getMaintenanceDueItems,
};