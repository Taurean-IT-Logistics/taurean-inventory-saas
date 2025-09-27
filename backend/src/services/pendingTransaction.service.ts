import { PendingTransactionModel } from "../models/pendingTransaction.model";
import { TransactionModel } from "../models/transaction.model";
import { RentalModel } from "../models/rental.model";
import { BookingModel } from "../models/booking.model";
import { emitEvent } from "../utils/eventEmitter";
import { Events } from "../utils/events";

export interface CreatePendingTransactionData {
  user: string;
  company: string;
  facility?: string;
  type: "rental" | "booking" | "purchase";
  referenceId: string;
  amount: number;
  currency?: string;
  paymentMethod: "cash" | "cheque" | "bank_transfer";
  paymentDetails?: any;
  notes?: string;
}

export interface ProcessPendingTransactionData {
  status: "confirmed" | "rejected";
  processedBy: string;
  notes?: string;
  rejectionReason?: string;
}

export class PendingTransactionService {
  /**
   * Create a pending transaction
   */
  public static async createPendingTransaction(
    data: CreatePendingTransactionData
  ): Promise<any> {
    try {
      const pendingTransaction = new PendingTransactionModel({
        ...data,
        currency: data.currency || "GHS",
        status: "pending",
      });

      await pendingTransaction.save();

      // Emit event for real-time updates
      emitEvent(Events.TransactionCreated, {
        type: "pending_transaction",
        data: pendingTransaction,
      });

      return pendingTransaction;
    } catch (error) {
      throw new Error(`Failed to create pending transaction: ${error.message}`);
    }
  }

  /**
   * Get pending transactions for a company
   */
  public static async getPendingTransactions(
    companyId: string,
    filters: {
      status?: string;
      type?: string;
      facility?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    transactions: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { status, type, facility, page = 1, limit = 10 } = filters;

      const query: any = {
        company: companyId,
        isDeleted: false,
      };

      if (status) query.status = status;
      if (type) query.type = type;
      if (facility) query.facility = facility;

      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        PendingTransactionModel.find(query)
          .populate("user", "firstName lastName email")
          .populate("facility", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        PendingTransactionModel.countDocuments(query),
      ]);

      return {
        transactions,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Failed to get pending transactions: ${error.message}`);
    }
  }

  /**
   * Get pending transaction by ID
   */
  public static async getPendingTransactionById(
    transactionId: string
  ): Promise<any> {
    try {
      const transaction = await PendingTransactionModel.findById(transactionId)
        .populate("user", "firstName lastName email")
        .populate("facility", "name")
        .populate("processedBy", "firstName lastName");

      if (!transaction) {
        throw new Error("Pending transaction not found");
      }

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get pending transaction: ${error.message}`);
    }
  }

  /**
   * Process a pending transaction (confirm or reject)
   */
  public static async processPendingTransaction(
    transactionId: string,
    data: ProcessPendingTransactionData
  ): Promise<any> {
    try {
      const pendingTransaction =
        await PendingTransactionModel.findById(transactionId);

      if (!pendingTransaction) {
        throw new Error("Pending transaction not found");
      }

      if (pendingTransaction.status !== "pending") {
        throw new Error("Transaction has already been processed");
      }

      // Update the pending transaction
      pendingTransaction.status = data.status;
      pendingTransaction.processedBy = data.processedBy;
      pendingTransaction.processedAt = new Date();
      pendingTransaction.notes = data.notes;
      pendingTransaction.rejectionReason = data.rejectionReason;

      await pendingTransaction.save();

      // If confirmed, create the actual transaction
      if (data.status === "confirmed") {
        await this.createActualTransaction(pendingTransaction);
      }

      // Emit event for real-time updates
      emitEvent(Events.TransactionUpdated, {
        type: "pending_transaction_processed",
        data: pendingTransaction,
      });

      return pendingTransaction;
    } catch (error) {
      throw new Error(
        `Failed to process pending transaction: ${error.message}`
      );
    }
  }

  /**
   * Create actual transaction from confirmed pending transaction
   */
  private static async createActualTransaction(
    pendingTransaction: any
  ): Promise<any> {
    try {
      const transactionData = {
        user: pendingTransaction.user,
        company: pendingTransaction.company,
        facility: pendingTransaction.facility,
        type: pendingTransaction.type,
        referenceId: pendingTransaction.referenceId,
        amount: pendingTransaction.amount,
        currency: pendingTransaction.currency,
        paymentMethod: pendingTransaction.paymentMethod,
        paymentDetails: pendingTransaction.paymentDetails,
        status: "completed",
        notes: pendingTransaction.notes,
        processedBy: pendingTransaction.processedBy,
        processedAt: pendingTransaction.processedAt,
      };

      const transaction = new TransactionModel(transactionData);
      await transaction.save();

      // Update the related rental or booking status
      await this.updateRelatedEntityStatus(pendingTransaction);

      // Emit event
      emitEvent(Events.TransactionCreated, {
        type: "transaction",
        data: transaction,
      });

      return transaction;
    } catch (error) {
      throw new Error(`Failed to create actual transaction: ${error.message}`);
    }
  }

  /**
   * Update the status of the related rental or booking
   */
  private static async updateRelatedEntityStatus(
    pendingTransaction: any
  ): Promise<void> {
    try {
      if (pendingTransaction.type === "rental") {
        await RentalModel.findByIdAndUpdate(pendingTransaction.referenceId, {
          status: "confirmed",
          transaction: pendingTransaction._id,
        });
      } else if (pendingTransaction.type === "booking") {
        await BookingModel.findByIdAndUpdate(pendingTransaction.referenceId, {
          status: "confirmed",
          transaction: pendingTransaction._id,
        });
      }
    } catch (error) {
      console.error("Failed to update related entity status:", error);
    }
  }

  /**
   * Cancel a pending transaction
   */
  public static async cancelPendingTransaction(
    transactionId: string,
    userId: string
  ): Promise<any> {
    try {
      const pendingTransaction =
        await PendingTransactionModel.findById(transactionId);

      if (!pendingTransaction) {
        throw new Error("Pending transaction not found");
      }

      if (pendingTransaction.user !== userId) {
        throw new Error("Unauthorized to cancel this transaction");
      }

      if (pendingTransaction.status !== "pending") {
        throw new Error("Transaction has already been processed");
      }

      pendingTransaction.status = "cancelled";
      await pendingTransaction.save();

      // Emit event
      emitEvent(Events.TransactionUpdated, {
        type: "pending_transaction_cancelled",
        data: pendingTransaction,
      });

      return pendingTransaction;
    } catch (error) {
      throw new Error(`Failed to cancel pending transaction: ${error.message}`);
    }
  }

  /**
   * Get user's pending transactions
   */
  public static async getUserPendingTransactions(
    userId: string,
    filters: {
      status?: string;
      type?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    transactions: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { status, type, page = 1, limit = 10 } = filters;

      const query: any = {
        user: userId,
        isDeleted: false,
      };

      if (status) query.status = status;
      if (type) query.type = type;

      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        PendingTransactionModel.find(query)
          .populate("facility", "name")
          .populate("processedBy", "firstName lastName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        PendingTransactionModel.countDocuments(query),
      ]);

      return {
        transactions,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(
        `Failed to get user pending transactions: ${error.message}`
      );
    }
  }
}

export default PendingTransactionService;
