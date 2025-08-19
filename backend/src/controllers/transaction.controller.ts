import { Request, Response } from "express";
import {
  PaymentService,
  TransactionService,
  UserService,
  BookingService,
  FacilityService,
} from "../services";
import * as ExportService from "../services/export.service";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";
import {
  BookingDocument,
  CompanyModel,
  InventoryItemModel,
  TransactionDocument,
} from "../models";
import { Transaction } from "../types";
import { isValidObjectId } from "mongoose";
import fs from "fs";

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

    if (paymentData.inventoryItem) {
      const item = await InventoryItemModel.findByIdAndUpdate(
        paymentData.inventoryItem,
        {
          $inc: { quantity: -Math.abs(paymentData.quantity) },
        },
        { new: true }
      );

      if (item?.quantity == 0) {
        await InventoryItemModel.findByIdAndUpdate(paymentData.inventoryItem, {
          status: "unavailable",
        });
      }

      transactionData.inventoryItem = paymentData.inventoryItem;
    }

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
      } else if (updatedDoc.category === "activation" && transaction.company) {
        await CompanyModel.findByIdAndUpdate(
          transaction.company,
          { isActive: true },
          { new: true }
        );
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
              updatedDoc.category === "activation" &&
              transaction.company
            ) {
              await CompanyModel.findByIdAndUpdate(
                transaction.company,
                { isActive: true },
                { new: true }
              );
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

const getAllTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Company-scoped transactions for the authenticated user
    const companyId = (req.user?.companyId ||
      (req.user as any)?.company) as any;
    if (!companyId) {
      sendValidationError(res, "User is not associated with a company");
      return;
    }
    const transactions = await TransactionService.getCompanyTransactions(
      companyId.toString()
    );

    if (!transactions) {
      throw new Error("No transactions found");
    }

    sendSuccess(res, "Payment details retrieved successfully", transactions);
  } catch (error) {
    sendError(res, "Failed to retrieve payment details", error);
  }
};

const getUserTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new Error("User not authenticated");
    }

    const userId = req.user.id;

    const transactions = await TransactionService.getAllUserTransactions(
      userId
    );

    if (!transactions) {
      throw new Error("No transactions found");
    }

    sendSuccess(res, "Payment details retrieved successfully", transactions);
  } catch (error) {
    sendError(res, "Failed to retrieve payment details", error);
  }
};

const updateTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ...data } = req.body;
    const transactionId = req.params.id;

    const doc = await TransactionService.updateTransaction(
      transactionId,
      data,
      true
    );

    if (!doc) {
      sendNotFound(res, "Transaction not found");
      return;
    }

    sendSuccess(res, "Transaction updatted successfully", doc, 200);
  } catch (error) {
    sendError(res, "Failed to update transaction details", error);
  }
};

const listBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { country, currency, type } = req.query;
    let countryCode = (country as string) || "Ghana";
    const banks = await PaymentService.getAllBanks(
      countryCode as string,
      currency as string,
      type as string
    );

    if (!banks) {
      throw new Error("No banks found");
    }

    sendSuccess(res, "Banks retrieved successfully", banks);
  } catch (error) {
    sendError(res, "Failed to retrieve banks", error);
  }
};

const getBankMomoDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bankCode, accountNumber } = req.params;

    const momoDetails = await PaymentService.getMomoBankDetails(
      bankCode,
      accountNumber
    );

    sendSuccess(res, "Momo bank details retrieved successfully", momoDetails);
  } catch (error) {
    sendError(res, "Failed to retrieve momo bank details", error);
  }
};

const updateSubAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subaccountCode } = req.params;
    const data = req.body;

    const updatedSubAccount = await PaymentService.updateSubAccount(
      subaccountCode,
      data
    );

    sendSuccess(res, "Subaccount updated successfully", updatedSubAccount);
  } catch (error) {
    sendError(res, "Failed to update subaccount", error);
  }
};

const getSubAccountDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subaccountCode } = req.params;

    const subaccountDetails = await PaymentService.getSubaccountDetails(
      subaccountCode
    );

    sendSuccess(
      res,
      "Subaccount details retrieved successfully",
      subaccountDetails
    );
  } catch (error) {
    sendError(res, "Failed to retrieve subaccount details", error);
  }
};

const exportTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format = 'csv', startDate, endDate, type = 'all' } = req.query;
    const user = req.user as any;
    const companyId = user.companyId;

    if (!companyId) {
      sendValidationError(res, "User is not associated with a company");
      return;
    }

    const options = {
      format: format as 'csv' | 'excel',
      companyId: companyId.toString(),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as 'income' | 'expense' | 'all'
    };

    const filePath = await ExportService.exportTransactions(options);
    const fileName = `transactions-export.${format}`;

    // Set appropriate headers
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up the file after streaming
    fileStream.on('end', async () => {
      await ExportService.cleanupTempFile(filePath);
    });

    fileStream.on('error', async (error) => {
      console.error('Error streaming file:', error);
      await ExportService.cleanupTempFile(filePath);
      if (!res.headersSent) {
        sendError(res, "Failed to export transactions", error);
      }
    });

  } catch (error) {
    sendError(res, "Failed to export transactions", error);
  }
};

const exportUserTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    const user = req.user as any;
    const userId = user.id;

    if (!userId) {
      sendValidationError(res, "User not authenticated");
      return;
    }

    const options = {
      format: format as 'csv' | 'excel',
      userId: userId.toString(),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: 'all' as const
    };

    const filePath = await ExportService.exportTransactions(options);
    const fileName = `my-transactions-export.${format}`;

    // Set appropriate headers
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up the file after streaming
    fileStream.on('end', async () => {
      await ExportService.cleanupTempFile(filePath);
    });

    fileStream.on('error', async (error) => {
      console.error('Error streaming file:', error);
      await ExportService.cleanupTempFile(filePath);
      if (!res.headersSent) {
        sendError(res, "Failed to export transactions", error);
      }
    });

  } catch (error) {
    sendError(res, "Failed to export user transactions", error);
  }
};

const exportBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    const user = req.user as any;
    const companyId = user.companyId;

    if (!companyId) {
      sendValidationError(res, "User is not associated with a company");
      return;
    }

    const options = {
      format: format as 'csv' | 'excel',
      companyId: companyId.toString(),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };

    const filePath = await ExportService.exportBookings(options);
    const fileName = `bookings-export.${format}`;

    // Set appropriate headers
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up the file after streaming
    fileStream.on('end', async () => {
      await ExportService.cleanupTempFile(filePath);
    });

    fileStream.on('error', async (error) => {
      console.error('Error streaming file:', error);
      await ExportService.cleanupTempFile(filePath);
      if (!res.headersSent) {
        sendError(res, "Failed to export bookings", error);
      }
    });

  } catch (error) {
    sendError(res, "Failed to export bookings", error);
  }
};

const exportInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    const user = req.user as any;
    const companyId = user.companyId;

    if (!companyId) {
      sendValidationError(res, "User is not associated with a company");
      return;
    }

    const options = {
      format: format as 'csv' | 'excel',
      companyId: companyId.toString(),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };

    const filePath = await ExportService.exportInvoices(options);
    const fileName = `invoices-export.${format}`;

    // Set appropriate headers
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up the file after streaming
    fileStream.on('end', async () => {
      await ExportService.cleanupTempFile(filePath);
    });

    fileStream.on('error', async (error) => {
      console.error('Error streaming file:', error);
      await ExportService.cleanupTempFile(filePath);
      if (!res.headersSent) {
        sendError(res, "Failed to export invoices", error);
      }
    });

  } catch (error) {
    sendError(res, "Failed to export invoices", error);
  }
};

export {
  initializePaymentController,
  verifyPaymentController,
  handlePaystackWebhookController,
  getPaymentDetailsController,
  createTransactionFromPaymentController,
  getAllTransactions,
  updateTransaction,
  getUserTransactions,
  getBankMomoDetails,
  updateSubAccount,
  listBanks,
  getSubAccountDetails,
  exportTransactions,
  exportUserTransactions,
  exportBookings,
  exportInvoices,
};
