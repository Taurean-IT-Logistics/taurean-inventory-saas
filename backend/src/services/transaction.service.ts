import { TransactionDocument, TransactionModel } from "../models";
import { Types } from "mongoose";
import { Transaction } from "../types"; // Assuming this is where your Transaction type is defined

// Create a new transaction
const createTransaction = async (
  transactionData: Partial<Transaction>
): Promise<TransactionDocument> => {
  try {
    const newTransaction = new TransactionModel(transactionData);
    const saved = await newTransaction.save();
    try {
      const { emitEvent } = await import("../realtime/socket");
      const { Events } = await import("../realtime/events");
      emitEvent(Events.TransactionCreated, {
        id: saved._id,
        transaction: saved,
      });
    } catch {}
    return saved;
  } catch (error) {
    throw new Error("Error creating transaction");
  }
};

// Get all transactions, excluding deleted by default
const getAllTransactions = async (
  showDeleted = false
): Promise<TransactionDocument[]> => {
  try {
    const filter = showDeleted ? {} : { isDeleted: false };
    return await TransactionModel.find(filter)
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company");
  } catch (error) {
    throw new Error("Error fetching transactions");
  }
};

const getAllUserTransactions = async (
  user: string,
  showDeleted = false
): Promise<TransactionDocument[]> => {
  try {
    const filter = showDeleted
      ? { user: user }
      : { isDeleted: false, user: user };
    return await TransactionModel.find(filter)
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company");
  } catch (error) {
    throw new Error("Error fetching transactions");
  }
};

// Get a transaction by ID, excluding deleted by default
const getTransactionById = async (
  id: string,
  showDeleted = false
): Promise<TransactionDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    const filter = showDeleted ? { _id: id } : { _id: id, isDeleted: false };
    return await TransactionModel.findOne(filter)
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company");
  } catch (error) {
    throw new Error("Error fetching transaction");
  }
};

// Update a transaction by ID, excluding deleted by default
const updateTransaction = async (
  id: string,
  updateData: Partial<Transaction>,
  showDeleted = false
): Promise<TransactionDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    const filter = showDeleted ? { _id: id } : { _id: id, isDeleted: false };
    const updated = await TransactionModel.findOneAndUpdate(
      filter,
      updateData,
      {
        new: true,
      }
    )
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company");
    if (updated) {
      try {
        const { emitEvent } = await import("../realtime/socket");
        const { Events } = await import("../realtime/events");
        emitEvent(Events.TransactionUpdated, {
          id: updated._id,
          transaction: updated,
        });
      } catch {}
    }
    return updated;
  } catch (error) {
    throw new Error("Error updating transaction");
  }
};

// Soft delete a transaction by ID (sets isDeleted = true)
const deleteTransaction = async (
  id: string
): Promise<TransactionDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    return await TransactionModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error deleting transaction");
  }
};

// Restore a soft-deleted transaction by ID (sets isDeleted = false)
const restoreTransaction = async (
  id: string
): Promise<TransactionDocument | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    return await TransactionModel.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error restoring transaction");
  }
};

// Get transactions by user ID, excluding deleted by default
const getTransactionsByUserId = async (
  userId: string,
  showDeleted = false
): Promise<TransactionDocument[]> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid User ID format");
    }
    const filter = showDeleted
      ? { user: userId }
      : { user: userId, isDeleted: false };
    return await TransactionModel.find(filter)
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company");
  } catch (error) {
    throw new Error("Error fetching transactions by user ID");
  }
};

// Get transactions by facility ID, excluding deleted by default
const getTransactionsByFacilityId = async (
  facilityId: string,
  showDeleted = false
): Promise<TransactionDocument[]> => {
  try {
    if (!Types.ObjectId.isValid(facilityId)) {
      throw new Error("Invalid Facility ID format");
    }
    const filter = showDeleted
      ? { facility: facilityId }
      : { facility: facilityId, isDeleted: false };
    return await TransactionModel.find(filter)
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company");
  } catch (error) {
    throw new Error("Error fetching transactions by facility ID");
  }
};

// Get a transaction by reference, excluding deleted by default
const getTransactionByReference = async (
  reference: string,
  showDeleted = false
): Promise<TransactionDocument | null> => {
  try {
    const filter = showDeleted
      ? { ref: reference }
      : { ref: reference, isDeleted: false };
    return await TransactionModel.findOne(filter)
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company");
  } catch (error) {
    throw new Error("Error fetching transaction by Paystack reference");
  }
};

// Get company-specific transactions
const getCompanyTransactions = async (
  companyId: string,
  showDeleted = false
): Promise<TransactionDocument[]> => {
  try {
    const filter: any = { company: companyId };
    if (!showDeleted) {
      filter.isDeleted = false;
    }
    return await TransactionModel.find(filter)
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy")
      .populate("company")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching company transactions");
  }
};

// Fix existing transactions by setting company field based on user's company
const fixTransactionCompanyFields = async (): Promise<{
  fixed: number;
  errors: number;
}> => {
  try {
    let fixed = 0;
    let errors = 0;

    // Find all transactions without company field
    const transactionsWithoutCompany = await TransactionModel.find({
      company: { $exists: false },
    }).populate("user", "company");

    console.log(
      `Found ${transactionsWithoutCompany.length} transactions without company field`
    );

    for (const transaction of transactionsWithoutCompany) {
      try {
        if (transaction.user && (transaction.user as any).company) {
          await TransactionModel.findByIdAndUpdate(transaction._id, {
            company: (transaction.user as any).company,
          });
          fixed++;
        } else {
          console.log(
            `Transaction ${transaction._id} has no user or user has no company`
          );
          errors++;
        }
      } catch (error) {
        console.error(`Error fixing transaction ${transaction._id}:`, error);
        errors++;
      }
    }

    return { fixed, errors };
  } catch (error) {
    throw new Error("Error fixing transaction company fields");
  }
};

export {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getAllUserTransactions,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
  getTransactionsByUserId,
  getTransactionsByFacilityId,
  getTransactionByReference,
  getCompanyTransactions,
  fixTransactionCompanyFields,
};
