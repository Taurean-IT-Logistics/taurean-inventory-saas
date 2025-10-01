import { TransactionDocument, TransactionModel } from "../models";
import { Types } from "mongoose";
import { Transaction } from "../types"; // Assuming this is where your Transaction type is defined
import { emitEvent } from "../realtime/socket";
import { Events } from "../realtime/events";
import { CompanyModel } from "../models";
import { TaxScheduleModel } from "../models";

// Create a new transaction
const createTransaction = async (
  transactionData: Partial<Transaction>
): Promise<TransactionDocument> => {
  try {
    // If company is provided, capture the active tax schedule snapshot
    if (transactionData.company) {
      console.log("Looking for company:", transactionData.company);
      const company = await CompanyModel.findById(
        transactionData.company
      ).populate("activeTaxSchedule");

      console.log("Company found:", company?.name);
      console.log("Active tax schedule:", company?.activeTaxSchedule);

      if (company && company.activeTaxSchedule) {
        const taxSchedule = company.activeTaxSchedule as any; // Type assertion for populated field
        console.log("Tax schedule components:", taxSchedule.components);

        transactionData.taxScheduleSnapshot = {
          scheduleId: taxSchedule._id,
          name: taxSchedule.name,
          components: taxSchedule.components.map((component: any) => ({
            name: component.name,
            rate: component.rate,
            taxType: component.taxType,
            description: component.description,
          })),
          taxInclusive: taxSchedule.taxInclusive,
          taxExclusive: taxSchedule.taxExclusive,
          taxOnTax: taxSchedule.taxOnTax,
          appliedAt: new Date(),
        };
        console.log(
          "Tax schedule snapshot created:",
          transactionData.taxScheduleSnapshot
        );
      } else {
        console.log("No active tax schedule found for company");
      }
    } else {
      console.log("No company provided for transaction");
    }

    const newTransaction = new TransactionModel(transactionData);
    const saved = await newTransaction.save();
    try {
      emitEvent(Events.TransactionCreated, {
        id: saved._id,
        transaction: saved,
      });
    } catch {}
    return saved;
  } catch (error) {
    console.error("Transaction creation error:", error);
    throw new Error(`Error creating transaction: ${error.message}`);
  }
};

// Get all transactions, excluding deleted by default
const getAllTransactions = async (
  showDeleted = false
): Promise<TransactionDocument[]> => {
  try {
    const filter = showDeleted ? {} : { isDeleted: false };
    return await TransactionModel.find(filter)
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail contactPhone location currency invoiceFormat"
      );
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
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail contactPhone location currency invoiceFormat"
      );
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
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail contactPhone location currency invoiceFormat"
      );
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
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail contactPhone location currency invoiceFormat"
      );
    if (updated) {
      try {
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
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail contactPhone location currency invoiceFormat"
      );
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
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail location currency invoiceFormat"
      );
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
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail contactPhone location currency invoiceFormat"
      );
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
      .populate("user", "name email phone address")
      .populate("booking", "startDate endDate duration totalPrice items")
      .populate("account")
      .populate("facility", "name description location pricing")
      .populate("approvedBy", "name")
      .populate(
        "taxScheduleSnapshot.scheduleId",
        "name components taxInclusive taxExclusive taxOnTax"
      )
      .populate(
        "company",
        "name logo contactEmail contactPhone location currency invoiceFormat"
      )
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

// Create a pending transaction
const createPendingTransaction = async (
  transactionData: Partial<Transaction>
): Promise<TransactionDocument> => {
  try {
    const pendingTransaction = new TransactionModel({
      ...transactionData,
      status: "pending",
      currency: transactionData.currency || "GHS",
      paymentTiming: transactionData.paymentTiming || "full",
    });

    const saved = await pendingTransaction.save();

    try {
      emitEvent(Events.TransactionCreated, {
        id: saved._id,
        transaction: saved,
      });
    } catch {}

    return saved;
  } catch (error) {
    throw new Error(`Failed to create pending transaction: ${error.message}`);
  }
};

// Get pending transactions for a company
const getPendingTransactions = async (
  companyId: string,
  filters: {
    status?: string;
    type?: string;
    facility?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  transactions: TransactionDocument[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const { status, type, facility, page = 1, limit = 10 } = filters;

    const query: any = {
      company: companyId,
      isDeleted: false,
    };

    if (status) query.status = status;
    if (type) query.category = type;
    if (facility) query.facility = facility;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .populate("user", "firstName lastName email")
        .populate("facility", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TransactionModel.countDocuments(query),
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
};

// Process pending transaction (approve/reject)
const processPendingTransaction = async (
  transactionId: string,
  action: "confirmed" | "rejected",
  processedBy: string,
  notes?: string,
  rejectionReason?: string
): Promise<TransactionDocument> => {
  try {
    const updateData: any = {
      status: action,
      processedBy,
      processedAt: new Date(),
    };

    if (notes) updateData.notes = notes;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      transactionId,
      updateData,
      { new: true }
    ).populate("user", "firstName lastName email");

    if (!updatedTransaction) {
      throw new Error("Transaction not found");
    }

    try {
      emitEvent(Events.TransactionUpdated, {
        id: updatedTransaction._id,
        transaction: updatedTransaction,
      });
    } catch {}

    return updatedTransaction;
  } catch (error) {
    throw new Error(`Failed to process pending transaction: ${error.message}`);
  }
};

// Get user's pending transactions
const getUserPendingTransactions = async (
  userId: string,
  filters: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  transactions: TransactionDocument[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const { status, type, page = 1, limit = 10 } = filters;

    const query: any = {
      user: userId,
      isDeleted: false,
    };

    if (status) query.status = status;
    if (type) query.category = type;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .populate("facility", "name")
        .populate("processedBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TransactionModel.countDocuments(query),
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
  createPendingTransaction,
  getPendingTransactions,
  processPendingTransaction,
  getUserPendingTransactions,
};
