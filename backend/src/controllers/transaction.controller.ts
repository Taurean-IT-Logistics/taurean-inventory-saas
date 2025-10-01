import { Request, Response } from "express";
import {
  PaymentService,
  TransactionService,
  UserService,
  BookingService,
  FacilityService,
} from "../services";
import PaymentVerificationService from "../services/paymentVerification.service";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";
import {
  validateSplitConfig,
  validateAdvanceConfig,
  generateDefaultSplitConfig,
  generateDefaultAdvanceConfig,
} from "../utils/paymentConfigHelpers";
import {
  BookingDocument,
  CompanyModel,
  InventoryItemModel,
  TransactionDocument,
  UserModel,
  TransactionModel,
  CashModel,
  ChequeModel,
} from "../models";
import { Transaction, Cash, Cheque } from "../types";
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

    // Validate payment timing configurations
    if (paymentData.paymentTiming === "split") {
      if (!paymentData.splitConfig) {
        // Generate default split config if none provided
        paymentData.splitConfig = generateDefaultSplitConfig(amount);
        console.log(
          "📋 Generated default split config:",
          paymentData.splitConfig
        );
      }

      // Validate split configuration using helper function
      const splitValidation = validateSplitConfig(
        paymentData.splitConfig,
        amount
      );
      if (!splitValidation.isValid) {
        sendValidationError(
          res,
          `Split payment validation failed: ${splitValidation.errors.join(", ")}`
        );
        return;
      }
    }

    if (paymentData.paymentTiming === "advance") {
      if (!paymentData.advanceConfig) {
        // Generate default advance config if none provided
        paymentData.advanceConfig = generateDefaultAdvanceConfig(amount);
        console.log(
          "📋 Generated default advance config:",
          paymentData.advanceConfig
        );
      }

      // Validate advance configuration using helper function
      const advanceValidation = validateAdvanceConfig(
        paymentData.advanceConfig,
        amount
      );
      if (!advanceValidation.isValid) {
        sendValidationError(
          res,
          `Advance payment validation failed: ${advanceValidation.errors.join(", ")}`
        );
        return;
      }
    }

    const formattedPaymentData = {
      email,
      amount: amount * 100, // Convert to kobo without rounding
      metadata: {
        full_name: userDoc.name,
      },
      currency: currency || "GHS",
    };

    if (paymentData.discount) {
      if (paymentData.discount.type === "percentage") {
        formattedPaymentData.amount -=
          (formattedPaymentData.amount * paymentData.discount.value) / 100;
      } else {
        formattedPaymentData.amount -= paymentData.discount.value * 100;
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

    // Debug logging
    console.log("Payment Data received:", paymentData);
    console.log("Company ID for transaction:", companyId);

    // Create transaction document
    const transactionData: Partial<Transaction> = {
      user: userDoc.id,
      facility,
      type: "income",
      category: category,
      amount,
      method: paymentData.paymentTiming === "split" ? "split" : "paystack",
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

    const transaction =
      await TransactionService.createTransaction(transactionData);

    // Create rental document if this is a rental transaction
    if (category === "inventory_item" && paymentData.inventoryItem) {
      try {
        const { createRental } = await import("../services/rental.service");

        const rentalData = {
          item: paymentData.inventoryItem,
          quantity: paymentData.quantity || 1,
          startDate: paymentData.startDate || new Date(),
          endDate:
            paymentData.endDate ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
          amount: amount,
          transaction: transaction._id.toString(),
          user: userDoc.id,
          company: companyId,
          notes: description || `Rental for ${paymentData.inventoryItem}`,
          status: "active" as const,
          paymentStatus: "pending",
        };

        const rental = await createRental(rentalData);

        // Update transaction with rental reference
        await TransactionService.updateTransaction(transaction._id.toString(), {
          rental: rental._id,
        } as Partial<Transaction>);

        console.log(`✅ Rental document created: ${rental._id}`);
      } catch (rentalError: any) {
        console.error(`❌ Failed to create rental document:`, rentalError);
        // Don't fail the transaction creation if rental creation fails
      }
    }

    // If this is a split payment, create a payment schedule
    if (paymentData.paymentTiming === "split" && paymentData.splitConfig) {
      try {
        const { PaymentScheduleService } = await import(
          "../services/paymentSchedule.service"
        );

        const scheduleData = {
          transactionId: transaction._id.toString(),
          userId: userDoc.id,
          companyId: companyId!,
          totalAmount: amount,
          currency: currency || "GHS",
          paymentType: "split" as const,
          paymentMethod: paymentData.paymentMethod || "paystack",
          splitConfig: paymentData.splitConfig,
          bookingId: paymentData.booking,
          rentalId: paymentData.rental,
          description: description || `Split payment for ${email}`,
        };

        const paymentSchedule =
          await PaymentScheduleService.createPaymentSchedule(scheduleData);

        console.log(
          `✅ Payment schedule created for split payment: ${paymentSchedule._id}`
        );
        console.log(
          `📊 Split config: ${paymentData.splitConfig.numberOfParts} parts, ${paymentData.splitConfig.intervalDays} days interval`
        );
      } catch (scheduleError: any) {
        console.error(
          "❌ CRITICAL: Failed to create payment schedule for split payment:",
          scheduleError
        );
        console.error("📋 Transaction ID:", transaction._id);
        console.error("📋 Split Config:", paymentData.splitConfig);

        // This is a critical error - the payment cannot be verified without a schedule
        // We should fail the request to prevent financial issues
        await TransactionService.deleteTransaction(transaction._id.toString());

        sendError(
          res,
          `Failed to create payment schedule for split payment: ${scheduleError.message}. ` +
            `Transaction has been cancelled to prevent verification issues.`,
          scheduleError,
          500
        );
        return;
      }
    }

    // If this is an advance payment, create a payment schedule
    if (paymentData.paymentTiming === "advance" && paymentData.advanceConfig) {
      try {
        const { PaymentScheduleService } = await import(
          "../services/paymentSchedule.service"
        );

        const scheduleData = {
          transactionId: transaction._id.toString(),
          userId: userDoc.id,
          companyId: companyId!,
          totalAmount: amount,
          currency: currency || "GHS",
          paymentType: "advance" as const,
          paymentMethod: paymentData.paymentMethod || "paystack",
          advanceConfig: paymentData.advanceConfig,
          bookingId: paymentData.booking,
          rentalId: paymentData.rental,
          description: description || `Advance payment for ${email}`,
        };

        const paymentSchedule =
          await PaymentScheduleService.createPaymentSchedule(scheduleData);

        console.log(
          `✅ Payment schedule created for advance payment: ${paymentSchedule._id}`
        );
        console.log(
          `📊 Advance config: ${paymentData.advanceConfig.inputMode}, ${
            paymentData.advanceConfig.inputMode === "percentage"
              ? `${paymentData.advanceConfig.percentage}%`
              : `${paymentData.advanceConfig.fixedAmount} fixed`
          }`
        );
      } catch (scheduleError: any) {
        console.error(
          "❌ CRITICAL: Failed to create payment schedule for advance payment:",
          scheduleError
        );
        console.error("📋 Transaction ID:", transaction._id);
        console.error("📋 Advance Config:", paymentData.advanceConfig);

        // This is a critical error - the payment cannot be verified without a schedule
        // We should fail the request to prevent financial issues
        await TransactionService.deleteTransaction(transaction._id.toString());

        sendError(
          res,
          `Failed to create payment schedule for advance payment: ${scheduleError.message}. ` +
            `Transaction has been cancelled to prevent verification issues.`,
          scheduleError,
          500
        );
        return;
      }
    }

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

    console.log("🔍 Looking for transaction with reference:", reference);

    // Find transaction by reference first to determine payment method
    const transaction =
      await TransactionService.getTransactionByReference(reference);

    if (!transaction) {
      console.error("❌ Transaction not found for reference:", reference);
      sendNotFound(res, "Transaction not found");
      return;
    }

    console.log("✅ Transaction found:", transaction._id);

    // Determine payment method from transaction or reference pattern
    let method = transaction.method;

    console.log("Transaction method from DB:", method);
    console.log("Reference:", reference);
    console.log("PaymentDetails:", transaction.paymentDetails);
    console.log("AccessCode:", (transaction as any).accessCode);

    // If method is undefined, null, "n/a", or empty, determine from transaction data
    if (!method || method === "n/a" || method.trim() === "") {
      // Check payment timing first to determine if it's a split payment
      const paymentTiming = (transaction as any).paymentTiming;

      if (paymentTiming === "split") {
        method = "split";
      } else {
        // Check if this is a Paystack transaction by looking for Paystack-specific fields
        const hasPaystackReference =
          transaction.paymentDetails?.paystackReference;
        const hasAccessCode = (transaction as any).accessCode;
        const refMatchesPaystackReference =
          transaction.paymentDetails?.paystackReference === reference;

        if (
          hasPaystackReference ||
          hasAccessCode ||
          refMatchesPaystackReference
        ) {
          method = "paystack";
        } else {
          method = "paystack"; // Default to paystack for online payments
        }
      }
    }

    // Verify payment using the appropriate method
    const verificationResult = await PaymentVerificationService.verifyPayment(
      reference,
      method
    );

    console.log("Verification Result", verificationResult);

    if (!verificationResult.success && verificationResult.status === "failed") {
      sendError(
        res,
        "Payment verification failed",
        "Payment was not successful"
      );
      return;
    }

    console.log("Transaction passed verification");

    // Update transaction using the verification service
    const updatedTransaction =
      await PaymentVerificationService.updateTransactionFromVerification(
        transaction._id!.toString(),
        verificationResult
      );

    console.log("Transaction updated", updatedTransaction);

    // Handle post-verification actions
    await PaymentVerificationService.handlePostVerificationActions(
      updatedTransaction,
      verificationResult
    );

    console.log("Post verification actions completed");

    // Format the response
    const formattedResponse = {
      reference: verificationResult.reference,
      amount: verificationResult.amount,
      status: verificationResult.status,
      paid_at: verificationResult.paidAt,
      created_at: new Date(),
      channel: verificationResult.channel,
      currency: verificationResult.currency,
      customer: verificationResult.customer,
      transaction: updatedTransaction,
    };

    console.log("📤 Sending verification response:", formattedResponse);

    console.log("Sending verification response");

    sendSuccess(res, "Payment verified successfully", formattedResponse);
    console.log("✅ Verification response sent successfully");
  } catch (error) {
    console.error("Payment verification error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
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
    const transaction =
      await TransactionService.getTransactionByReference(reference);

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

    const transactions =
      await TransactionService.getAllUserTransactions(userId);

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

    const subaccountDetails =
      await PaymentService.getSubaccountDetails(subaccountCode);

    sendSuccess(
      res,
      "Subaccount details retrieved successfully",
      subaccountDetails
    );
  } catch (error) {
    sendError(res, "Failed to retrieve subaccount details", error);
  }
};

// Enhanced Payment Controllers

const processCashPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, denominations, description, category, reference } =
      req.body;
    const userId = req.user?.id!;
    const companyId = req.user?.companyId!;

    if (!amount || !denominations) {
      sendValidationError(
        res,
        "Missing required fields: amount and denominations are required"
      );
      return;
    }

    if (!category) {
      sendValidationError(res, "Category is required");
      return;
    }

    // Create cash record
    const cash = new CashModel({
      amount,
      denominations,
    });
    await cash.save();

    // Create transaction record
    const transaction = new TransactionModel({
      user: userId,
      company: companyId,
      type: "income",
      category,
      amount,
      method: "cash",
      isCash: true,
      cash: cash._id,
      description: description || "Cash payment",
      ref: reference,
      paymentDetails: {
        cashDetails: {
          amount,
          denominations,
          processedAt: new Date(),
        },
      },
      reconciled: false,
      attachments: [],
      tags: ["cash", "admin-input"],
      isDeleted: false,
    });

    const savedTransaction = await transaction.save();

    // Populate the transaction with cash details
    await savedTransaction.populate("cash");

    sendSuccess(res, "Cash payment processed successfully", savedTransaction);
  } catch (error) {
    sendError(res, "Failed to process cash payment", error);
  }
};

const processSplitPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { totalAmount, currency, splits } = req.body;
    const userId = req.user?.id!;
    const companyId = req.user?.companyId!;

    if (!totalAmount || !currency || !splits || !Array.isArray(splits)) {
      sendValidationError(
        res,
        "Missing required fields: totalAmount, currency, and splits array are required"
      );
      return;
    }

    const result = await PaymentService.processSplitPayment({
      totalAmount,
      currency,
      splits,
      userId,
      companyId,
    });

    sendSuccess(res, "Split payment processed successfully", result);
  } catch (error) {
    sendError(res, "Failed to process split payment", error);
  }
};

const getSplitPaymentDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { splitPaymentId } = req.params;

    if (!splitPaymentId) {
      sendValidationError(res, "Split payment ID is required");
      return;
    }

    const result = await PaymentService.getSplitPaymentDetails(splitPaymentId);

    sendSuccess(res, "Split payment details retrieved successfully", result);
  } catch (error) {
    sendError(res, "Failed to get split payment details", error);
  }
};

const completeSplitPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { splitPaymentId } = req.params;

    if (!splitPaymentId) {
      sendValidationError(res, "Split payment ID is required");
      return;
    }

    const result = await PaymentService.completeSplitPayment(splitPaymentId);

    sendSuccess(res, "Split payment completed successfully", result);
  } catch (error) {
    sendError(res, "Failed to complete split payment", error);
  }
};

const processAdvancePaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, currency, description, paymentMethod, paymentDetails } =
      req.body;
    const userId = req.user?.id!;
    const companyId = req.user?.companyId!;

    if (!amount || !currency || !paymentMethod) {
      sendValidationError(
        res,
        "Missing required fields: amount, currency, and paymentMethod are required"
      );
      return;
    }

    const result = await PaymentService.processAdvancePayment({
      amount,
      currency,
      userId,
      companyId,
      description,
      paymentMethod,
      paymentDetails,
    });

    sendSuccess(res, "Advance payment processed successfully", result);
  } catch (error) {
    sendError(res, "Failed to process advance payment", error);
  }
};

const applyAdvancePaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { transactionId, advanceAmount } = req.body;
    const userId = req.user?.id!;

    if (!transactionId || !advanceAmount) {
      sendValidationError(
        res,
        "Missing required fields: transactionId and advanceAmount are required"
      );
      return;
    }

    const result = await PaymentService.applyAdvancePayment({
      transactionId,
      advanceAmount,
      userId,
    });

    sendSuccess(res, "Advance payment applied successfully", result);
  } catch (error) {
    sendError(res, "Failed to apply advance payment", error);
  }
};

const getAdvanceBalanceController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id!;

    const balance = await PaymentService.getAdvanceBalance(userId);

    sendSuccess(res, "Advance balance retrieved successfully", { balance });
  } catch (error) {
    sendError(res, "Failed to get advance balance", error);
  }
};

// Create a pending transaction
const createPendingTransactionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      facility,
      category,
      referenceId,
      amount,
      currency,
      method,
      paymentDetails,
      notes,
      paymentTiming,
      advanceConfig,
      splitConfig,
    } = req.body;

    const userId = req.user?.id!;
    const companyId = req.user?.companyId!;

    if (!category || !referenceId || !amount || !method) {
      sendValidationError(
        res,
        "Missing required fields: category, referenceId, amount, and method are required"
      );
      return;
    }

    // Generate unique transaction reference
    const transactionRef = `${category.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const pendingTransaction =
      await TransactionService.createPendingTransaction({
        user: userId,
        company: companyId,
        facility,
        category,
        referenceId,
        amount,
        currency,
        method,
        paymentDetails,
        notes,
        paymentTiming,
        advanceConfig,
        splitConfig,
        ref: transactionRef, // Unique transaction reference
        type: "income", // Pending transactions are typically income
      });

    // Create rental document if this is a rental transaction
    if (category === "inventory_item" && referenceId) {
      try {
        const { createRental } = await import("../services/rental.service");

        const rentalData = {
          item: referenceId, // For rentals, referenceId is the inventory item ID
          quantity: 1, // Default quantity
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
          amount: amount,
          transaction: pendingTransaction._id.toString(),
          user: userId,
          company: companyId,
          notes: notes || `Pending rental for ${referenceId}`,
          status: "active" as const,
          paymentStatus: "pending",
        };

        const rental = await createRental(rentalData);

        // Update transaction with rental reference
        await TransactionService.updateTransaction(
          pendingTransaction._id.toString(),
          {
            rental: rental._id,
          } as Partial<Transaction>
        );

        console.log(
          `✅ Rental document created for pending transaction: ${rental._id}`
        );
      } catch (rentalError: any) {
        console.error(
          `❌ Failed to create rental document for pending transaction:`,
          rentalError
        );
        // Don't fail the transaction creation if rental creation fails
      }
    }

    // If this is a split or advance payment, create a payment schedule
    if (
      (paymentTiming === "split" && splitConfig) ||
      (paymentTiming === "advance" && advanceConfig)
    ) {
      try {
        const { PaymentScheduleService } = await import(
          "../services/paymentSchedule.service"
        );

        const scheduleData = {
          transactionId: pendingTransaction._id.toString(),
          userId: userId,
          companyId: companyId,
          totalAmount: amount,
          currency: currency || "GHS",
          paymentType: paymentTiming as "split" | "advance",
          paymentMethod: method,
          splitConfig: splitConfig,
          advanceConfig: advanceConfig,
          rentalId: category === "inventory_item" ? referenceId : undefined,
          bookingId: category === "booking" ? referenceId : undefined,
          description: notes || `Pending ${paymentTiming} payment`,
        };

        const paymentSchedule =
          await PaymentScheduleService.createPaymentSchedule(scheduleData);

        console.log(
          `✅ Payment schedule created for pending ${paymentTiming} payment: ${paymentSchedule._id}`
        );
      } catch (scheduleError: any) {
        console.error(
          `❌ Failed to create payment schedule for pending ${paymentTiming} payment:`,
          scheduleError
        );
        // Don't fail the transaction creation if schedule creation fails
      }
    }

    sendSuccess(
      res,
      "Pending transaction created successfully",
      pendingTransaction
    );
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
};

// Get pending transactions for a company
const getPendingTransactionsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user?.companyId!;
    const { status, type, facility, page, limit } = req.query;

    const result = await TransactionService.getPendingTransactions(companyId, {
      status: status as string,
      type: type as string,
      facility: facility as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    sendSuccess(res, "Pending transactions retrieved successfully", result);
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
};

// Process pending transaction (approve/reject)
const processPendingTransactionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { transactionId, action, notes, rejectionReason } = req.body;
    const processedBy = req.user?.id!;

    if (!transactionId || !action) {
      sendValidationError(
        res,
        "Missing required fields: transactionId and action are required"
      );
      return;
    }

    if (!["confirmed", "rejected"].includes(action)) {
      sendValidationError(
        res,
        "Invalid action. Must be 'confirmed' or 'rejected'"
      );
      return;
    }

    const result = await TransactionService.processPendingTransaction(
      transactionId,
      action,
      processedBy,
      notes,
      rejectionReason
    );

    sendSuccess(res, "Transaction processed successfully", result);
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
};

// Get user's pending transactions
const getUserPendingTransactionsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const { status, type, page, limit } = req.query;

    const result = await TransactionService.getUserPendingTransactions(userId, {
      status: status as string,
      type: type as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    sendSuccess(
      res,
      "User pending transactions retrieved successfully",
      result
    );
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
};

// Process check payment
const processCheckPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      amount,
      checkNumber,
      bankName,
      accountNumber,
      checkDate,
      description,
      category,
      reference,
    } = req.body;

    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      sendError(res, "User authentication required");
      return;
    }

    if (!amount || amount <= 0) {
      sendValidationError(res, "Amount must be greater than 0");
      return;
    }

    if (!checkNumber || !bankName || !accountNumber || !checkDate) {
      sendValidationError(
        res,
        "Check number, bank name, account number, and check date are required"
      );
      return;
    }

    if (!category) {
      sendValidationError(res, "Category is required");
      return;
    }

    // Validate check date
    const checkDateObj = new Date(checkDate);
    if (isNaN(checkDateObj.getTime())) {
      sendValidationError(res, "Invalid check date");
      return;
    }

    // Create cheque record
    const cheque = new ChequeModel({
      amount,
      checkNumber,
      bankName,
      accountNumber,
      checkDate: checkDateObj,
      status: "pending",
      processedAt: new Date(),
    });
    await cheque.save();

    // Create transaction record
    const transaction = new TransactionModel({
      user: userId,
      company: companyId,
      type: "income",
      category,
      amount,
      method: "cheque",
      isCheque: true,
      cheque: cheque._id,
      description: description || "Check payment",
      ref: reference,
      paymentDetails: {
        chequeNumber: checkNumber,
        bankDetails: {
          bankName,
          accountNumber,
        },
        chequeDate: checkDateObj,
      },
      reconciled: false,
      attachments: [],
      tags: ["cheque", "admin-input"],
      isDeleted: false,
    });

    const savedTransaction = await transaction.save();

    // Populate the transaction with cheque details
    await savedTransaction.populate("cheque");

    sendSuccess(res, "Check payment processed successfully", savedTransaction);
  } catch (error: any) {
    sendError(res, error.message, error);
  }
};

// Get pending payment schedules for a user
const getPendingPaymentsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "User not authenticated", null, 401);
    }

    const { PaymentScheduleService } = await import(
      "../services/paymentSchedule.service"
    );
    const pendingPayments =
      await PaymentScheduleService.getPendingPayments(userId);

    sendSuccess(
      res,
      "Pending payments retrieved successfully",
      pendingPayments
    );
  } catch (error: any) {
    console.error("Error getting pending payments:", error);
    sendError(res, "Failed to get pending payments", error, 500);
  }
};

// Authorize a scheduled payment (for online payments)
const authorizeScheduledPaymentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId, paymentIndex } = req.params;
    const { userEmail, paymentMethod } = req.body;

    if (!userEmail || !paymentMethod) {
      return sendError(
        res,
        "User email and payment method are required",
        null,
        400
      );
    }

    const { PaymentScheduleService } = await import(
      "../services/paymentSchedule.service"
    );
    const result = await PaymentScheduleService.authorizeScheduledPayment(
      scheduleId,
      parseInt(paymentIndex),
      userEmail,
      paymentMethod
    );

    sendSuccess(res, "Payment authorization successful", result);
  } catch (error: any) {
    console.error("Error authorizing scheduled payment:", error);
    sendError(res, "Failed to authorize scheduled payment", error, 500);
  }
};

// Mark a scheduled payment as completed (for cash/cheque payments)
const markPaymentCompletedController = async (req: Request, res: Response) => {
  try {
    const { scheduleId, paymentIndex } = req.params;
    const { paymentMethod, notes } = req.body;

    if (!paymentMethod) {
      return sendError(res, "Payment method is required", null, 400);
    }

    const { PaymentScheduleService } = await import(
      "../services/paymentSchedule.service"
    );
    const updatedSchedule = await PaymentScheduleService.markPaymentCompleted(
      scheduleId,
      parseInt(paymentIndex),
      notes
    );

    sendSuccess(
      res,
      "Payment marked as completed successfully",
      updatedSchedule
    );
  } catch (error: any) {
    console.error("Error marking payment as completed:", error);
    sendError(res, "Failed to mark payment as completed", error, 500);
  }
};

export {
  // Payment operations
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
  // Enhanced payment operations
  processCashPaymentController,
  processSplitPaymentController,
  getSplitPaymentDetailsController,
  completeSplitPaymentController,
  processAdvancePaymentController,
  applyAdvancePaymentController,
  getAdvanceBalanceController,
  // Pending transaction operations
  createPendingTransactionController,
  getPendingTransactionsController,
  processPendingTransactionController,
  getUserPendingTransactionsController,
  // Cash and Check payment processing
  processCheckPaymentController,
  // Payment schedule controllers
  getPendingPaymentsController,
  authorizeScheduledPaymentController,
  markPaymentCompletedController,
};
