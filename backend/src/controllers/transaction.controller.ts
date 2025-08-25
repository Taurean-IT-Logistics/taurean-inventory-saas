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
import {
  BookingDocument,
  CompanyModel,
  InventoryItemModel,
  TransactionDocument,
  UserModel,
  TransactionModel,
} from "../models";
import { Transaction } from "../types";
import { isValidObjectId } from "mongoose";
import fs from "fs";
import { emailService } from "../services/email.service";
import { notificationService } from "../services/notification.service";

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

    if (
      paymentData.inventoryItem &&
      !isValidObjectId(paymentData.inventoryItem)
    ) {
      sendValidationError(res, "Invalid inventory item ID");
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

    // Get company from facility for rentals/bookings, not from user
    let companyId: string | undefined;
    if (facility) {
      const facilityDoc = await FacilityService.getFacilityById(facility);
      if (facilityDoc?.company) {
        companyId = facilityDoc.company.toString();
      }
    } else if (paymentData.booking) {
      // If no facility but there's a booking, get company from booking
      const bookingDoc = await BookingService.getBookingById(
        paymentData.booking
      );
      if (bookingDoc?.company) {
        companyId = bookingDoc.company.toString();
      } else if (bookingDoc?.facility) {
        // Fallback: get company from facility in booking
        const facilityDoc = await FacilityService.getFacilityById(
          bookingDoc.facility.toString()
        );
        if (facilityDoc?.company) {
          companyId = facilityDoc.company.toString();
        }
      }
    } else if (paymentData.inventoryItem) {
      // If no facility/booking but there's an inventory item, get company from item
      const inventoryItemDoc = await InventoryItemModel.findById(
        paymentData.inventoryItem
      );
      if (inventoryItemDoc?.company) {
        companyId = inventoryItemDoc.company.toString();
      } else if (inventoryItemDoc?.associatedFacility) {
        // Fallback: get company from associated facility
        const facilityDoc = await FacilityService.getFacilityById(
          inventoryItemDoc.associatedFacility.toString()
        );
        if (facilityDoc?.company) {
          companyId = facilityDoc.company.toString();
        }
      }
    }

    // Initialize payment with Paystack
    const paymentResponse = await PaymentService.initializePayment(
      formattedPaymentData,
      { companyId }
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
      company: companyId, // Use company from facility/booking, not from user
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

    // Send email notification based on payment status
    try {
      if (verificationResponse.data.status === "success" && transaction.user) {
        await emailService.sendPaymentSuccessEmail(doc._id!.toString());

        // Update user loyalty profile for successful payments
        try {
          await UserService.updateUserLoyaltyProfile(
            transaction.user.toString(),
            verificationResponse.data.amount / 100, // Convert from kobo to naira
            transaction.facility?.toString()
          );
          console.log(`Updated loyalty profile for user ${transaction.user}`);
        } catch (loyaltyError) {
          console.warn("Failed to update user loyalty profile:", loyaltyError);
        }
        
        // Send payment success notification
        try {
          await notificationService.createPaymentNotification(doc._id!.toString(), "successful");
        } catch (notificationError) {
          console.warn("Failed to send payment success notification:", notificationError);
        }
      } else if (
        verificationResponse.data.status === "failed" &&
        transaction.user
      ) {
        const userDoc = await UserService.getUserByIdentifier(
          transaction.user.toString()
        );
        if (userDoc) {
          await emailService.sendPaymentFailedEmail(
            userDoc.email,
            verificationResponse.data.amount / 100,
            verificationResponse.data.currency,
            "Payment verification failed"
          );
        }
        
        // Send payment failed notification
        try {
          await notificationService.createPaymentNotification(doc._id!.toString(), "failed");
        } catch (notificationError) {
          console.warn("Failed to send payment failed notification:", notificationError);
        }
      }
    } catch (emailError) {
      console.warn("Failed to send payment notification email:", emailError);
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

                // Update user loyalty profile for successful booking payments
                try {
                  await UserService.updateUserLoyaltyProfile(
                    transaction.user.toString(),
                    data.amount / 100,
                    transaction.facility?.toString()
                  );
                  console.log(
                    `Updated loyalty profile for user ${transaction.user} via webhook`
                  );
                } catch (loyaltyError) {
                  console.warn(
                    "Failed to update user loyalty profile via webhook:",
                    loyaltyError
                  );
                }
              }
            } else if (
              updatedDoc.category === "facility" &&
              newData &&
              newData.reconciled
            ) {
              // Update user loyalty profile for successful facility payments
              try {
                await UserService.updateUserLoyaltyProfile(
                  transaction.user.toString(),
                  data.amount / 100, // Convert from kobo to naira
                  transaction.facility?.toString()
                );
                console.log(
                  `Updated loyalty profile for user ${transaction.user} for facility payment via webhook`
                );
              } catch (loyaltyError) {
                console.warn(
                  "Failed to update user loyalty profile for facility payment via webhook:",
                  loyaltyError
                );
              }
            } else if (
              updatedDoc.category === "inventory_item" &&
              newData &&
              newData.reconciled
            ) {
              // Update user loyalty profile for successful inventory item payments
              try {
                await UserService.updateUserLoyaltyProfile(
                  transaction.user.toString(),
                  data.amount / 100,
                  transaction.facility?.toString()
                );
                console.log(
                  `Updated loyalty profile for user ${transaction.user} for inventory item payment via webhook`
                );
              } catch (loyaltyError) {
                console.warn(
                  "Failed to update user loyalty profile for inventory item payment via webhook:",
                  loyaltyError
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
    console.log("getAllTransactions called by user:", req.user?.id);

    if (!req.user?.id) {
      console.log("User not authenticated");
      sendValidationError(res, "User not authenticated");
      return;
    }

    // Get companyId from req.user (set by RequireCompanyContext middleware)
    const companyId = (req.user as any)?.companyId;
    console.log("User company ID:", companyId);

    if (!companyId) {
      console.log("User not associated with a company");
      sendValidationError(res, "User is not associated with a company");
      return;
    }

    // Debug: Check if there are any transactions at all
    const allTransactions = await TransactionModel.find({})
      .select("company user")
      .lean();
    console.log("Total transactions in DB:", allTransactions.length);
    console.log("Sample transactions:", allTransactions.slice(0, 3));

    // Debug: Check transactions without company field
    const transactionsWithoutCompany = await TransactionModel.find({
      company: { $exists: false },
    })
      .select("_id user")
      .lean();
    console.log(
      "Transactions without company field:",
      transactionsWithoutCompany.length
    );

    // Try to fix transactions without company field first
    if (transactionsWithoutCompany.length > 0) {
      try {
        const { fixTransactionCompanyFields } = await import(
          "../services/transaction.service"
        );
        const result = await fixTransactionCompanyFields();
        console.log("Fixed transactions:", result);
      } catch (fixError) {
        console.warn("Failed to fix transaction company fields:", fixError);
      }
    }

    const transactions = await TransactionService.getCompanyTransactions(
      companyId.toString()
    );

    console.log("Found transactions for company:", transactions?.length || 0);

    // Return empty array if no transactions found (this is normal)
    sendSuccess(res, "Transactions retrieved successfully", transactions || []);
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    sendError(res, "Failed to retrieve transactions", error);
  }
};

const getUserTransactions = async (req: Request, res: Response) => {
  try {
    console.log("getUserTransactions called by user:", req.user?.id);

    if (!req.user?.id) {
      console.log("User not authenticated");
      throw new Error("User not authenticated");
    }

    const userId = req.user.id;
    console.log("Fetching transactions for user ID:", userId);

    const transactions = await TransactionService.getAllUserTransactions(
      userId
    );

    console.log("Found user transactions:", transactions?.length || 0);

    // Return empty array if no transactions found (this is normal)
    sendSuccess(
      res,
      "User transactions retrieved successfully",
      transactions || []
    );
  } catch (error) {
    console.error("Error in getUserTransactions:", error);
    sendError(res, "Failed to retrieve user transactions", error);
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
};
