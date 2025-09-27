import { Request, Response } from "express";
import { 
  createRental,
  getRentals,
  getRentalById,
  updateRentalStatus,
  returnRental,
  getOverdueRentals,
  getRentalStatistics,
  deleteRental
} from "../services/rental.service";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Create a new rental
 */
export const createRentalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { item, quantity, startDate, endDate, amount, transaction, notes } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!item || !quantity || !endDate || !amount || !transaction) {
      sendError(res, "Item, quantity, end date, amount, and transaction are required");
      return;
    }

    const rentalData = {
      item,
      quantity,
      startDate: startDate || new Date(),
      endDate,
      amount,
      transaction,
      notes,
      user: userId,
      company: companyId,
    };

    const rental = await createRental(rentalData);
    sendSuccess(res, "Rental created successfully", rental);
  } catch (error) {
    sendError(res, "Failed to create rental", error);
  }
};

/**
 * Get all rentals with pagination and filters
 */
export const getRentalsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as string,
      userId: req.query.userId as string,
      companyId: req.user?.companyId,
      itemId: req.query.itemId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await getRentals(filters, pagination);
    sendSuccess(res, "Rentals fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch rentals", error);
  }
};

/**
 * Get rental by ID
 */
export const getRentalByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const rental = await getRentalById(id);

    if (!rental) {
      sendNotFound(res, "Rental not found");
      return;
    }

    sendSuccess(res, "Rental fetched successfully", rental);
  } catch (error) {
    sendError(res, "Failed to fetch rental", error);
  }
};

/**
 * Update rental status
 */
export const updateRentalStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, returnDate, returnCondition, returnNotes, lateFee, damageFee } = req.body;

    if (!status) {
      sendError(res, "Status is required");
      return;
    }

    const updateData = {
      returnDate: returnDate ? new Date(returnDate) : undefined,
      returnCondition,
      returnNotes,
      lateFee,
      damageFee,
    };

    const rental = await updateRentalStatus(id, status, updateData);

    if (!rental) {
      sendNotFound(res, "Rental not found");
      return;
    }

    sendSuccess(res, "Rental status updated successfully", rental);
  } catch (error) {
    sendError(res, "Failed to update rental status", error);
  }
};

/**
 * Return rental item
 */
export const returnRentalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { returnDate, returnCondition, returnNotes, lateFee, damageFee } = req.body;

    if (!returnDate || !returnCondition) {
      sendError(res, "Return date and condition are required");
      return;
    }

    const returnData = {
      returnDate: new Date(returnDate),
      returnCondition,
      returnNotes,
      lateFee,
      damageFee,
    };

    const rental = await returnRental(id, returnData);

    if (!rental) {
      sendNotFound(res, "Rental not found");
      return;
    }

    sendSuccess(res, "Rental returned successfully", rental);
  } catch (error) {
    sendError(res, "Failed to return rental", error);
  }
};

/**
 * Get overdue rentals
 */
export const getOverdueRentalsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await getOverdueRentals(companyId, pagination);
    sendSuccess(res, "Overdue rentals fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch overdue rentals", error);
  }
};

/**
 * Get rental statistics
 */
export const getRentalStatisticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const statistics = await getRentalStatistics(companyId);
    sendSuccess(res, "Rental statistics fetched successfully", statistics);
  } catch (error) {
    sendError(res, "Failed to fetch rental statistics", error);
  }
};

/**
 * Delete rental
 */
export const deleteRentalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteRental(id);

    if (!deleted) {
      sendNotFound(res, "Rental not found");
      return;
    }

    sendSuccess(res, "Rental deleted successfully", { deleted: true });
  } catch (error) {
    sendError(res, "Failed to delete rental", error);
  }
};