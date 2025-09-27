import { TransactionModel, CashModel, SplitPaymentModel, TransactionSplitModel } from "../models";
import { Transaction, Cash, SplitPayment, TransactionSplit } from "../types";
import { Types } from "mongoose";

/**
 * Enhanced Payment Service
 * Handles all payment methods including cash, split payments, and advance payments
 */

/**
 * Process cash payment
 */
const processCashPayment = async (paymentData: {
  amount: number;
  denominations: { denomination: number; quantity: number }[];
  transactionId: string;
  userId: string;
  companyId: string;
}): Promise<{ cash: any; transaction: any }> => {
  try {
    // Create cash record
    const cash = new CashModel({
      amount: paymentData.amount,
      denominations: paymentData.denominations,
    });
    await cash.save();

    // Update transaction with cash details
    const transaction = await TransactionModel.findByIdAndUpdate(
      paymentData.transactionId,
      {
        isCash: true,
        cash: cash._id,
        method: "cash",
        paymentDetails: {
          cashDetails: {
            amount: paymentData.amount,
            denominations: paymentData.denominations,
            processedAt: new Date(),
          }
        }
      },
      { new: true }
    );

    return { cash, transaction };
  } catch (error) {
    throw new Error(
      `Failed to process cash payment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Process split payment
 */
const processSplitPayment = async (paymentData: {
  totalAmount: number;
  currency: string;
  splits: {
    transactionId: string;
    splitType: "fixed" | "percentage";
    splitAmount?: number;
    splitPercentage?: number;
    dueDate: Date;
  }[];
  userId: string;
  companyId: string;
}): Promise<{ splitPayment: any; transactionSplits: any[] }> => {
  try {
    // Create split payment record
    const splitPayment = new SplitPaymentModel({
      amount: paymentData.totalAmount,
      currency: paymentData.currency,
    });
    await splitPayment.save();

    // Create transaction splits
    const transactionSplits = [];
    for (const split of paymentData.splits) {
      const transactionSplit = new TransactionSplitModel({
        transaction: split.transactionId,
        splitType: split.splitType,
        splitAmount: split.splitAmount,
        splitPercentage: split.splitPercentage,
        dueDate: split.dueDate,
      });
      await transactionSplit.save();
      transactionSplits.push(transactionSplit);

      // Update transaction with split payment details
      await TransactionModel.findByIdAndUpdate(split.transactionId, {
        isSplitPayment: true,
        splitPayment: splitPayment._id,
        method: "split_payment",
      });
    }

    // Update split payment with transaction references
    splitPayment.transactions = transactionSplits.map(ts => ts._id);
    await splitPayment.save();

    return { splitPayment, transactionSplits };
  } catch (error) {
    throw new Error(
      `Failed to process split payment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Process advance payment
 */
const processAdvancePayment = async (paymentData: {
  amount: number;
  currency: string;
  userId: string;
  companyId: string;
  description?: string;
  paymentMethod: "cash" | "paystack" | "mobile_money" | "bank_transfer";
  paymentDetails?: any;
}): Promise<{ transaction: any; advanceBalance: number }> => {
  try {
    // Create advance payment transaction
    const transaction = new TransactionModel({
      user: paymentData.userId,
      type: "income",
      category: "advance_payment",
      amount: paymentData.amount,
      method: paymentData.paymentMethod,
      paymentDetails: paymentData.paymentDetails || {},
      description: paymentData.description || "Advance payment",
      company: paymentData.companyId,
    });

    await transaction.save();

    // Calculate user's advance balance
    const advanceTransactions = await TransactionModel.find({
      user: paymentData.userId,
      category: "advance_payment",
      isDeleted: false,
    });

    const advanceBalance = advanceTransactions.reduce((total, txn) => {
      return total + (txn.type === "income" ? txn.amount : -txn.amount);
    }, 0);

    return { transaction, advanceBalance };
  } catch (error) {
    throw new Error(
      `Failed to process advance payment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Apply advance payment to transaction
 */
const applyAdvancePayment = async (paymentData: {
  transactionId: string;
  advanceAmount: number;
  userId: string;
}): Promise<{ transaction: any; remainingAdvance: number }> => {
  try {
    // Get transaction
    const transaction = await TransactionModel.findById(paymentData.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Calculate remaining amount after advance payment
    const remainingAmount = Math.max(0, transaction.amount - paymentData.advanceAmount);

    // Update transaction
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      paymentData.transactionId,
      {
        amount: remainingAmount,
        paymentDetails: {
          ...transaction.paymentDetails,
          advanceApplied: paymentData.advanceAmount,
          originalAmount: transaction.amount,
        }
      },
      { new: true }
    );

    // Create advance payment deduction record
    const advanceDeduction = new TransactionModel({
      user: paymentData.userId,
      type: "expense",
      category: "advance_payment",
      amount: paymentData.advanceAmount,
      method: "advance_deduction",
      description: `Advance payment applied to transaction ${paymentData.transactionId}`,
      company: transaction.company,
    });
    await advanceDeduction.save();

    // Calculate remaining advance balance
    const advanceTransactions = await TransactionModel.find({
      user: paymentData.userId,
      category: "advance_payment",
      isDeleted: false,
    });

    const remainingAdvance = advanceTransactions.reduce((total, txn) => {
      return total + (txn.type === "income" ? txn.amount : -txn.amount);
    }, 0);

    return { transaction: updatedTransaction, remainingAdvance };
  } catch (error) {
    throw new Error(
      `Failed to apply advance payment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get user's advance balance
 */
const getAdvanceBalance = async (userId: string): Promise<number> => {
  try {
    const advanceTransactions = await TransactionModel.find({
      user: userId,
      category: "advance_payment",
      isDeleted: false,
    });

    return advanceTransactions.reduce((total, txn) => {
      return total + (txn.type === "income" ? txn.amount : -txn.amount);
    }, 0);
  } catch (error) {
    throw new Error(
      `Failed to get advance balance: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get split payment details
 */
const getSplitPaymentDetails = async (splitPaymentId: string): Promise<any> => {
  try {
    const splitPayment = await SplitPaymentModel.findById(splitPaymentId)
      .populate('transactions')
      .lean();

    if (!splitPayment) {
      throw new Error("Split payment not found");
    }

    // Get transaction splits
    const transactionSplits = await TransactionSplitModel.find({
      transaction: { $in: splitPayment.transactions }
    }).populate('transaction');

    return {
      ...splitPayment,
      splits: transactionSplits
    };
  } catch (error) {
    throw new Error(
      `Failed to get split payment details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Complete split payment
 */
const completeSplitPayment = async (splitPaymentId: string): Promise<any> => {
  try {
    const splitPayment = await SplitPaymentModel.findById(splitPaymentId);
    if (!splitPayment) {
      throw new Error("Split payment not found");
    }

    // Mark all related transactions as completed
    await TransactionModel.updateMany(
      { _id: { $in: splitPayment.transactions } },
      { 
        paymentStatus: "completed",
        reconciled: true,
        reconciledAt: new Date()
      }
    );

    // Mark split payment as completed
    splitPayment.isDeleted = true;
    await splitPayment.save();

    return splitPayment;
  } catch (error) {
    throw new Error(
      `Failed to complete split payment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  processCashPayment,
  processSplitPayment,
  processAdvancePayment,
  applyAdvancePayment,
  getAdvanceBalance,
  getSplitPaymentDetails,
  completeSplitPayment,
};