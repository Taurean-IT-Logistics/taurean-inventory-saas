import { TransactionDocument, TransactionModel } from "../models";
import { Types } from "mongoose";
import { Transaction } from "../types"; // Assuming this is where your Transaction type is defined

// Create a new transaction
const createTransaction = async (
  transactionData: Partial<Transaction>
): Promise<TransactionDocument> => {
  try {
    const newTransaction = new TransactionModel(transactionData);
    return await newTransaction.save();
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
      .populate("approvedBy");
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
      .populate("approvedBy");
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
      .populate("approvedBy");
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
    return await TransactionModel.findOneAndUpdate(filter, updateData, {
      new: true,
    })
      .populate("user")
      .populate("booking")
      .populate("account")
      .populate("facility")
      .populate("approvedBy");
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
      .populate("approvedBy");
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
      .populate("approvedBy");
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
      .populate("approvedBy");
  } catch (error) {
    throw new Error("Error fetching transaction by Paystack reference");
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
};
