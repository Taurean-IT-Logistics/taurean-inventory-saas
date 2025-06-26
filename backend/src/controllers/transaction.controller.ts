import { Request, Response } from "express";
import {
  PaymentService,
  TransactionService,
  UserService,
  BookingService,
  FacilityService,
} from "../services";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";
import { BookingDocument, TransactionDocument } from "../models";
import { Transaction } from "../types";
import { isValidObjectId } from "mongoose";

// Initialize payment and create transaction document
const initializePaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      email,
      amount,
      facility,
      description,
      category,
      currency,
      ...paymentData
    } = req.body;

    // Validate required fields
    if (!email || !amount || !category) {
      sendValidationError(
        res,
        "Missing required fields: email, amount, and category are required"
      );
      return;
    }

    if (facility && !isValidObjectId(facility)) {
      sendValidationError(res, "Invalid facility ID");
      return;
    }

    if (paymentData.booking && !isValidObjectId(paymentData.booking)) {
      sendValidationError(res, "Invalid booking ID");
      return;
    }

    const userDoc = await UserService.getUserByIdentifier(req.user?.id!);

    if (!userDoc) {
      sendNotFound(res, "User not found");
      return;
    }

    // Validate amount is positive
    if (amount <= 0) {
      sendValidationError(res, "Amount must be greater than 0");
      return;
    }

    const formattedPaymentData = {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      metadata: {
        full_name: userDoc.name,
      },
      currency: currency || "GHS",
    };

    if (paymentData.discount) {
      if (paymentData.discount.type === "percentage") {
        formattedPaymentData.amount -= Math.round(
          (formattedPaymentData.amount * paymentData.discount.value) / 100
        );
      } else {
        formattedPaymentData.amount -= Math.round(
          paymentData.discount.value * 100
        );
      }
    }

    // Initialize payment with Paystack
    const paymentResponse = await PaymentService.initializePayment(
      formattedPaymentData
    );

    // Create transaction document
    const transactionData: Partial<Transaction> = {
      user: userDoc.id,
      facility,
      type: "income",
      category: category,
      amount,
      method: "n/a",
      paymentDetails: {
        paystackReference: paymentResponse.data.reference,
      },
      ref: paymentResponse.data.reference,
      accessCode: paymentResponse.data.access_code,
      description: description || `Payment for ${email}`,
      reconciled: false,
      ...paymentData,
    };

    const transaction = await TransactionService.createTransaction(
      transactionData
    );

    const response = {
      payment: paymentResponse.data,
      transaction: transaction,
    };

    sendSuccess(
      res,
      "Payment initialized and transaction created successfully",
      response,
      201
    );
  } catch (error) {
    sendError(res, "Failed to initialize payment", error);
  }
};

// Verify payment and update transaction document
const verifyPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reference } = req.params;

    if (!reference) {
      sendValidationError(res, "Payment reference is required");
      return;
    }

    // Verify payment with Paystack
    const verificationResponse = await PaymentService.verifyPayment(reference);

    if (!verificationResponse.data) {
      sendNotFound(res, "Payment not found");
      return;
    }

    // Find transaction by reference
    const transaction = await TransactionService.getTransactionByReference(
      reference
    );

    if (!transaction) {
      sendNotFound(res, "Transaction not found");
      return;
    }

    const updatedDoc: Partial<Transaction> = {
      booking: transaction.booking,
      user: transaction.user,
      account: transaction.account,
      type: transaction.type,
      category: transaction.category,
      amount: verificationResponse.data.amount / 100,
      method: verificationResponse.data.channel,
      paymentDetails: {
        paystackReference: verificationResponse.data.reference,
        chequeNumber: transaction.paymentDetails?.chequeNumber,
        bankDetails: transaction.paymentDetails?.bankDetails,
        mobileMoneyDetails: transaction.paymentDetails?.mobileMoneyDetails,
      },
      ref: verificationResponse.data.reference,
      accessCode: transaction.accessCode,
      receiptUrl: transaction.receiptUrl,
      approvedBy: transaction.approvedBy,
      reconciled: verificationResponse.data.status === "success",
      reconciledAt:
        verificationResponse.data.status === "success" ? new Date() : undefined,
      facility: transaction.facility,
      description:
        verificationResponse.data.status === "success"
          ? `Payment successful: ${verificationResponse.data.reference}`
          : `Payment failed: ${verificationResponse.data.reference}`,
      attachments: transaction.attachments,
      tags: transaction.tags,
      isDeleted: transaction.isDeleted,
      createdAt: transaction.createdAt,
      updatedAt: new Date(),
    };

    const doc = await TransactionService.updateTransaction(
      transaction._id!.toString(),
      updatedDoc
    );

    if (!doc) {
      throw new Error("Error updating transaction");
    }

    // Category-specific logic after transaction update
    if (updatedDoc.category) {
      if (updatedDoc.category === "booking" && updatedDoc.booking) {
        if (doc.reconciled) {
          await BookingService.updateBooking(
            (updatedDoc.booking as BookingDocument)._id!.toString(),
            {
              paymentStatus: "completed",
              updatedAt: new Date(),
            }
          );
        }
      } else if (updatedDoc.category === "account" && updatedDoc.account) {
        // Optionally, update account balance or reconciliation status
        // e.g., AccountService.reconcileAccount(updatedDoc.account as any)
      }
    }

    // Format the response
    const formattedResponse = {
      reference: verificationResponse.data.reference,
      amount: verificationResponse.data.amount / 100, // Convert from kobo to naira
      status: verificationResponse.data.status,
      paid_at: verificationResponse.data.paid_at,
      created_at: verificationResponse.data.created_at,
      channel: verificationResponse.data.channel,
      currency: verificationResponse.data.currency,
      customer: verificationResponse.data.customer,
      transaction: doc,
    };

    sendSuccess(res, "Payment verified successfully", formattedResponse);
  } catch (error) {
    sendError(res, "Failed to verify payment", error);
  }
};

// Handle Paystack webhook and update transaction document
const handlePaystackWebhookController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;
    const body = req.body;

    if (!signature) {
      sendValidationError(res, "Missing Paystack signature");
      return;
    }

    // Verify webhook signature
    const isValidSignature = PaymentService.verifyWebHookSignature(
      body,
      signature
    );

    if (!isValidSignature) {
      sendValidationError(res, "Invalid webhook signature");
      return;
    }

    // Process webhook based on event type
    const event = body.event;
    const data = body.data;
    const reference = data.reference;

    // Find transaction by Paystack reference
    const transaction = await TransactionService.getTransactionByReference(
      reference
    );

    let newData;

    switch (event) {
      case "charge.success":
        console.log("Payment successful:", data);
        if (transaction) {
          // Update document with same logic as verifyPaymentController
          const updatedDoc: Partial<Transaction> = {
            booking: transaction.booking,
            user: transaction.user,
            account: transaction.account,
            type: transaction.type,
            category: transaction.category,
            amount: data.amount / 100,
            method: data.channel,
            paymentDetails: {
              paystackReference: data.reference,
              chequeNumber: transaction.paymentDetails?.chequeNumber,
              bankDetails: transaction.paymentDetails?.bankDetails,
              mobileMoneyDetails:
                transaction.paymentDetails?.mobileMoneyDetails,
            },
            ref: data.reference,
            accessCode: transaction.accessCode,
            receiptUrl: transaction.receiptUrl,
            approvedBy: transaction.approvedBy,
            reconciled: data.status === "success",
            reconciledAt: data.status === "success" ? new Date() : undefined,
            facility: transaction.facility,
            description:
              data.status === "success"
                ? `Payment successful: ${data.reference}`
                : `Payment failed: ${data.reference}`,
            attachments: transaction.attachments,
            tags: transaction.tags,
            isDeleted: transaction.isDeleted,
            createdAt: transaction.createdAt,
            updatedAt: new Date(),
          };

          newData = await TransactionService.updateTransaction(
            transaction._id!.toString(),
            updatedDoc
          );

          // Category-specific logic after transaction update
          if (updatedDoc.category) {
            if (updatedDoc.category === "booking" && updatedDoc.booking) {
              if (newData && newData.reconciled) {
                await BookingService.updateBooking(
                  (updatedDoc.booking as BookingDocument)._id!.toString(),
                  {
                    paymentStatus: "completed",
                    updatedAt: new Date(),
                  }
                );
              }
            } else if (
              updatedDoc.category === "account" &&
              updatedDoc.account
            ) {
              // Optionally, update account balance or reconciliation status
              // e.g., AccountService.reconcileAccount(updatedDoc.account as any)
            }
          }
        }
        break;

      case "charge.failed":
        console.log("Payment failed:", data);
        if (transaction) {
          const updatedDoc: Partial<Transaction> = {
            ...transaction,
            reconciled: false,
            description: `${transaction.description} - Payment Failed`,
            updatedAt: new Date(),
          };
          newData = await TransactionService.updateTransaction(
            transaction._id!.toString(),
            updatedDoc
          );
        }
        break;

      case "transfer.success":
        console.log("Transfer successful:", data);
        if (transaction && transaction.type === "expense") {
          const updatedDoc: Partial<Transaction> = {
            ...transaction,
            reconciled: true,
            reconciledAt: new Date(),
            updatedAt: new Date(),
          };
          newData = await TransactionService.updateTransaction(
            transaction._id!.toString(),
            updatedDoc
          );
        }
        break;

      case "transfer.failed":
        console.log("Transfer failed:", data);
        if (transaction && transaction.type === "expense") {
          const updatedDoc: Partial<Transaction> = {
            ...transaction,
            reconciled: false,
            description: `${transaction.description} - Transfer Failed`,
            updatedAt: new Date(),
          };
          newData = await TransactionService.updateTransaction(
            transaction._id!.toString(),
            updatedDoc
          );
        }
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    // Always respond with 200 OK to acknowledge receipt
    sendSuccess(res, "Webhook received and processed", newData);
  } catch (error) {
    sendError(res, "Failed to process webhook", error);
  }
};

// Get payment details by reference
const getPaymentDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reference } = req.params;

    if (!reference) {
      sendValidationError(res, "Payment reference is required");
      return;
    }

    const paymentDetails = await PaymentService.verifyPayment(reference);

    if (!paymentDetails.data) {
      sendNotFound(res, "Payment details not found");
      return;
    }

    // Find associated transaction
    const transactions = await TransactionService.getAllTransactions();
    const transaction = transactions.find(
      (t) => t.paymentDetails?.paystackReference === reference
    );

    // Format the response to include relevant payment information
    const formattedResponse = {
      reference: paymentDetails.data.reference,
      amount: paymentDetails.data.amount / 100, // Convert from kobo to naira
      status: paymentDetails.data.status,
      paid_at: paymentDetails.data.paid_at,
      created_at: paymentDetails.data.created_at,
      channel: paymentDetails.data.channel,
      currency: paymentDetails.data.currency,
      customer: paymentDetails.data.customer,
      authorization: paymentDetails.data.authorization,
      transaction: transaction,
    };

    sendSuccess(
      res,
      "Payment details retrieved successfully",
      formattedResponse
    );
  } catch (error) {
    sendError(res, "Failed to retrieve payment details", error);
  }
};

// Create transaction from successful payment (manual fallback)
const createTransactionFromPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reference, user, facility, category, description, ...remData } =
      req.body;

    if (!reference || !user || !category) {
      sendValidationError(
        res,
        "Payment reference, user, and category are required"
      );
      return;
    }

    // Verify payment first
    const paymentDetails = await PaymentService.verifyPayment(reference);

    if (!paymentDetails.data || paymentDetails.data.status !== "success") {
      sendValidationError(res, "Payment not found or not successful");
      return;
    }

    // Check if transaction already exists
    const transactions = await TransactionService.getAllTransactions();
    const existingTransaction = transactions.find(
      (t) => t.paymentDetails?.paystackReference === reference
    );

    if (existingTransaction) {
      sendValidationError(res, "Transaction already exists for this payment");
      return;
    }

    // Create transaction document
    const transactionData = {
      user,
      facility,
      type: "income" as const,
      category: category,
      amount: paymentDetails.data.amount / 100, // Convert from kobo
      method: "card" as const,
      paymentDetails: {
        paystackReference: reference,
      },
      ref: reference,
      description:
        description || `Payment from ${paymentDetails.data.customer.email}`,
      reconciled: true,
      reconciledAt: new Date(paymentDetails.data.paid_at),
      ...remData,
    };

    const transaction = await TransactionService.createTransaction(
      transactionData as TransactionDocument
    );

    sendSuccess(
      res,
      "Transaction created from payment successfully",
      transaction,
      201
    );
  } catch (error) {
    sendError(res, "Failed to create transaction from payment", error);
  }
};

export {
  initializePaymentController,
  verifyPaymentController,
  handlePaystackWebhookController,
  getPaymentDetailsController,
  createTransactionFromPaymentController,
};
