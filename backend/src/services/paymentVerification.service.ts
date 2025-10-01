import { TransactionModel } from "../models/transaction.model";
import { PaymentScheduleModel } from "../models/paymentSchedule.model";
import { BookingModel } from "../models/booking.model";
import { RentalModel } from "../models/rental.model";
import { emitEvent } from "../utils/eventEmitter";
import { Events } from "../utils/events";
import { verifyPayment } from "./payment.service";
import PaymentScheduleService from "./paymentSchedule.service";
import ReferenceGenerator from "../utils/referenceGenerator";
import notificationService from "./notification.service";

export interface PaymentVerificationResult {
  success: boolean;
  amount: number;
  method: string;
  reference: string;
  status: "success" | "failed" | "pending";
  paidAt?: Date;
  channel?: string;
  currency?: string;
  customer?: any;
  metadata?: any;
}

export class PaymentVerificationService {
  /**
   * Generate reference for non-Paystack payments
   */
  static generatePaymentReference(
    paymentMethod: string,
    userId?: string,
    companyId?: string
  ): string {
    switch (paymentMethod.toLowerCase()) {
      case "cash":
        return ReferenceGenerator.generateCashReference(userId, companyId);
      case "cheque":
        return ReferenceGenerator.generateChequeReference(userId, companyId);
      case "split":
        return ReferenceGenerator.generateSplitReference(userId, companyId);
      case "advance":
        return ReferenceGenerator.generateAdvanceReference(userId, companyId);
      case "booking":
        return ReferenceGenerator.generateBookingReference(userId, companyId);
      case "rental":
        return ReferenceGenerator.generateRentalReference(userId, companyId);
      case "subscription":
        return ReferenceGenerator.generateSubscriptionReference(
          userId,
          companyId
        );
      default:
        return ReferenceGenerator.generateGeneralReference(userId, companyId);
    }
  }

  /**
   * Verify payment based on payment method
   */
  static async verifyPayment(
    reference: string,
    paymentMethod: string
  ): Promise<PaymentVerificationResult> {
    console.log(
      `🔍 Starting payment verification for reference: ${reference}, method: ${paymentMethod}`
    );

    try {
      switch (paymentMethod.toLowerCase()) {
        case "paystack":
          console.log("📱 Verifying Paystack payment...");
          return await this.verifyPaystackPayment(reference);
        case "cash":
          console.log("💵 Verifying cash payment...");
          return await this.verifyCashPayment(reference);
        case "cheque":
          console.log("📄 Verifying cheque payment...");
          return await this.verifyChequePayment(reference);
        case "split":
          console.log("✂️ Verifying split payment...");
          return await this.verifySplitPayment(reference);
        case "advance":
          console.log("⏰ Verifying advance payment...");
          return await this.verifyAdvancePayment(reference);
        default:
          console.error(`❌ Unsupported payment method: ${paymentMethod}`);
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error: any) {
      console.error(
        `❌ Payment verification failed for ${reference}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Verify Paystack payment
   */
  private static async verifyPaystackPayment(
    reference: string
  ): Promise<PaymentVerificationResult> {
    try {
      const verificationResponse = await verifyPayment(reference);

      if (!verificationResponse.data) {
        throw new Error("Payment not found");
      }

      return {
        success: verificationResponse.data.status === "success",
        amount: verificationResponse.data.amount / 100,
        method: "paystack",
        reference: verificationResponse.data.reference,
        status: verificationResponse.data.status,
        paidAt: verificationResponse.data.paid_at
          ? new Date(verificationResponse.data.paid_at)
          : undefined,
        channel: verificationResponse.data.channel,
        currency: verificationResponse.data.currency,
        customer: verificationResponse.data.customer,
        metadata: verificationResponse.data.metadata,
      };
    } catch (error: any) {
      throw new Error(`Paystack payment verification failed: ${error.message}`);
    }
  }

  /**
   * Verify cash payment (manual verification by staff)
   */
  private static async verifyCashPayment(
    reference: string
  ): Promise<PaymentVerificationResult> {
    try {
      // For cash payments, we need to check if staff has marked it as received
      const transaction = await TransactionModel.findOne({
        ref: reference,
        method: "cash",
        isDeleted: false,
      }).populate("user", "email name");

      if (!transaction) {
        throw new Error("Cash payment transaction not found");
      }

      // Cash payments are considered successful if they exist and are reconciled
      const isSuccessful = transaction.reconciled;

      return {
        success: isSuccessful,
        amount: transaction.amount,
        method: "cash",
        reference: transaction.ref,
        status: isSuccessful ? "success" : "pending",
        paidAt: transaction.reconciledAt || transaction.updatedAt,
        channel: "cash",
        currency: "NGN",
        customer: {
          email: (transaction.user as any)?.email,
          name: (transaction.user as any)?.name,
        },
        metadata: {
          verifiedBy: transaction.approvedBy,
          verifiedAt: transaction.reconciledAt,
        },
      };
    } catch (error: any) {
      throw new Error(`Cash payment verification failed: ${error.message}`);
    }
  }

  /**
   * Verify cheque payment (manual verification by staff)
   */
  private static async verifyChequePayment(
    reference: string
  ): Promise<PaymentVerificationResult> {
    try {
      // For cheque payments, we need to check if staff has marked it as received
      const transaction = await TransactionModel.findOne({
        ref: reference,
        method: "cheque",
        isDeleted: false,
      }).populate("user", "email name");

      if (!transaction) {
        throw new Error("Cheque payment transaction not found");
      }

      // Cheque payments are considered successful if they exist and are reconciled
      const isSuccessful = transaction.reconciled;

      return {
        success: isSuccessful,
        amount: transaction.amount,
        method: "cheque",
        reference: transaction.ref,
        status: isSuccessful ? "success" : "pending",
        paidAt: transaction.reconciledAt || transaction.updatedAt,
        channel: "cheque",
        currency: "NGN",
        customer: {
          email: (transaction.user as any)?.email,
          name: (transaction.user as any)?.name,
        },
        metadata: {
          verifiedBy: transaction.approvedBy,
          verifiedAt: transaction.reconciledAt,
          chequeNumber: transaction.paymentDetails?.chequeNumber,
        },
      };
    } catch (error: any) {
      throw new Error(`Cheque payment verification failed: ${error.message}`);
    }
  }

  /**
   * Verify split payment (check payment schedule)
   */
  private static async verifySplitPayment(
    reference: string
  ): Promise<PaymentVerificationResult> {
    try {
      console.log(
        `🔍 Looking up transaction for split payment reference: ${reference}`
      );

      // First find the transaction by reference to get the actual transaction ID
      const transaction = await TransactionModel.findOne({
        ref: reference,
        isDeleted: false,
      });

      if (!transaction) {
        console.error(
          `❌ Transaction not found for split payment reference: ${reference}`
        );
        throw new Error("Transaction not found");
      }

      console.log(
        `✅ Transaction found: ${transaction._id}, method: ${transaction.method}`
      );

      // For split payments, we need to check the payment schedule using the transaction ID
      console.log(
        `🔍 Looking up payment schedule for transaction: ${transaction._id}`
      );
      const schedule = await PaymentScheduleModel.findOne({
        transactionId: transaction._id.toString(),
        paymentType: "split",
        isDeleted: false,
      });

      if (!schedule) {
        // If no payment schedule exists, this is a critical error for split payments
        // Split payments require proper scheduling to track partial payments
        // We cannot verify this as a regular payment as it would cause financial loss
        console.error(
          `❌ CRITICAL: No payment schedule found for split payment ${reference}`
        );
        console.error(`📋 Transaction ID: ${transaction._id}`);
        console.error(`📋 Transaction method: ${transaction.method}`);
        console.error(`📋 Transaction amount: ${transaction.amount}`);

        throw new Error(
          `Split payment ${reference} cannot be verified without a payment schedule. ` +
            `Please ensure the payment schedule was created when the split payment was initiated. ` +
            `Contact support if this payment was created correctly.`
        );
      }

      console.log(`✅ Payment schedule found: ${schedule._id}`);
      console.log(
        `📊 Schedule details: ${schedule.scheduledPayments.length} payments, total: ${schedule.totalAmount}`
      );

      // Check if any payments in the schedule are completed
      const completedPayments = schedule.scheduledPayments.filter(
        (payment: any) => payment.status === "paid"
      );

      const totalPaid = completedPayments.reduce(
        (sum: number, payment: any) => sum + payment.amount,
        0
      );

      const isFullyPaid = totalPaid >= schedule.totalAmount;

      console.log(
        `📊 Payment status: ${completedPayments.length}/${schedule.scheduledPayments.length} completed`
      );
      console.log(
        `💰 Total paid: ${totalPaid}/${schedule.totalAmount} (${isFullyPaid ? "FULLY PAID" : "PARTIAL"})`
      );

      const result: PaymentVerificationResult = {
        success: isFullyPaid,
        amount: totalPaid,
        method: "split",
        reference: reference,
        status: isFullyPaid ? "success" : "pending",
        paidAt:
          completedPayments.length > 0
            ? completedPayments[completedPayments.length - 1].paidAt
            : undefined,
        channel: "split",
        currency: "NGN",
        customer: {
          email: (schedule.userId as any)?.email,
          name: (schedule.userId as any)?.name,
        },
        metadata: {
          totalAmount: schedule.totalAmount,
          remainingAmount: schedule.remainingAmount,
          completedPayments: completedPayments.length,
          totalScheduledPayments: schedule.scheduledPayments.length,
          verificationMethod: "schedule_based",
        },
      };

      console.log(
        `✅ Split payment verification completed: ${result.success ? "SUCCESS" : "PENDING"}`
      );
      return result;
    } catch (error: any) {
      console.error(
        `❌ Split payment verification failed for ${reference}:`,
        error.message
      );
      throw new Error(`Split payment verification failed: ${error.message}`);
    }
  }

  /**
   * Verify advance payment (check payment schedule)
   */
  private static async verifyAdvancePayment(
    reference: string
  ): Promise<PaymentVerificationResult> {
    try {
      // First find the transaction by reference to get the actual transaction ID
      const transaction = await TransactionModel.findOne({
        ref: reference,
        isDeleted: false,
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // For advance payments, we need to check the payment schedule using the transaction ID
      const schedule = await PaymentScheduleModel.findOne({
        transactionId: transaction._id.toString(),
        paymentType: "advance",
        isDeleted: false,
      });

      if (!schedule) {
        // If no payment schedule exists, this is a critical error for advance payments
        // Advance payments require proper scheduling to track remaining balance
        // We cannot verify this as a regular payment as it would cause financial loss
        throw new Error(
          `Advance payment ${reference} cannot be verified without a payment schedule. ` +
            `Please ensure the payment schedule was created when the advance payment was initiated. ` +
            `Contact support if this payment was created correctly.`
        );
      }

      // Check if advance payment is completed
      const advancePayment = schedule.scheduledPayments.find(
        (payment: any) => payment.status === "paid"
      );

      const isAdvancePaid = !!advancePayment;

      return {
        success: isAdvancePaid,
        amount: advancePayment?.amount || 0,
        method: "advance",
        reference: reference,
        status: isAdvancePaid ? "success" : "pending",
        paidAt: advancePayment?.paidAt,
        channel: "advance",
        currency: "GHS",
        customer: {
          email: (schedule.userId as any)?.email,
          name: (schedule.userId as any)?.name,
        },
        metadata: {
          totalAmount: schedule.totalAmount,
          remainingAmount: schedule.remainingAmount,
          advanceAmount: advancePayment?.amount || 0,
          balanceAmount: schedule.remainingAmount,
          verificationMethod: "schedule_based",
        },
      };
    } catch (error: any) {
      throw new Error(`Advance payment verification failed: ${error.message}`);
    }
  }

  /**
   * Update transaction based on verification result
   */
  static async updateTransactionFromVerification(
    transactionId: string,
    verificationResult: PaymentVerificationResult
  ): Promise<any> {
    try {
      const updateData: any = {
        reconciled: verificationResult.success,
        reconciledAt: verificationResult.success ? new Date() : undefined,
        status: verificationResult.status,
        method: verificationResult.method,
        amount: verificationResult.amount,
        description: verificationResult.success
          ? `Payment successful: ${verificationResult.reference}`
          : `Payment ${verificationResult.status}: ${verificationResult.reference}`,
      };

      // Add payment-specific details
      if (verificationResult.method === "paystack") {
        updateData.paymentDetails = {
          paystackReference: verificationResult.reference,
          channel: verificationResult.channel,
        };
      } else if (verificationResult.method === "cheque") {
        updateData.paymentDetails = {
          chequeNumber: verificationResult.metadata?.chequeNumber,
        };
      }

      const updatedTransaction = await TransactionModel.findByIdAndUpdate(
        transactionId,
        updateData,
        { new: true }
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

      if (!updatedTransaction) {
        throw new Error("Transaction not found");
      }

      // Emit event for real-time updates
      emitEvent(Events.TransactionUpdated, {
        transactionId: updatedTransaction._id,
        status: verificationResult.status,
        amount: verificationResult.amount,
        method: verificationResult.method,
      });

      return updatedTransaction;
    } catch (error: any) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  /**
   * Handle post-verification actions (update booking/rental status)
   */
  static async handlePostVerificationActions(
    transaction: any,
    verificationResult: PaymentVerificationResult
  ): Promise<void> {
    try {
      if (!verificationResult.success) {
        return; // Only handle successful payments
      }

      // Handle subscription transactions (now using specific subscription categories)
      if (
        (transaction.category === "subscription" ||
          transaction.category === "subscription_renewal" ||
          transaction.category === "subscription_upgrade") &&
        transaction.metadata?.type &&
        (transaction.metadata.type === "subscription" ||
          transaction.metadata.type === "subscription_renewal" ||
          transaction.metadata.type === "subscription_upgrade")
      ) {
        // Extract metadata for subscription handling
        const { companyId, planId } = transaction.metadata;

        if (!companyId || !planId) {
          console.error(
            `Missing subscription metadata - companyId: ${companyId}, planId: ${planId}`
          );
          return;
        }

        try {
          // Import subscription service
          const { SubscriptionService } = await import(
            "../services/subscription.service"
          );

          // Handle different subscription types
          switch (transaction.metadata.type) {
            case "subscription":
              // Initial subscription activation
              await SubscriptionService.activateSubscription(
                companyId,
                planId,
                transaction.ref ||
                  transaction.paymentDetails?.paystackReference ||
                  `verified-${Date.now()}`
              );
              break;

            case "subscription_renewal":
              // Subscription renewal
              await SubscriptionService.renewSubscription(
                companyId,
                planId,
                transaction.ref ||
                  transaction.paymentDetails?.paystackReference ||
                  `renewed-${Date.now()}`
              );
              break;

            case "subscription_upgrade":
              // Subscription upgrade
              await SubscriptionService.upgradeSubscription(
                companyId,
                planId,
                transaction.ref ||
                  transaction.paymentDetails?.paystackReference ||
                  `upgraded-${Date.now()}`
              );
              break;

            default:
              console.warn(
                `Unknown subscription type: ${transaction.metadata.type}`
              );
          }

          // Send subscription notification email and in-app notification
          // Handle email notifications separately to prevent interruption
          const sendSubscriptionEmail = async () => {
            try {
              const { emailService } = await import(
                "../services/email.service"
              );
              const company = await (
                await import("../models/company.model")
              ).CompanyModel.findById(companyId);

              if (company && company.subscription) {
                await emailService.sendSubscriptionActivationEmail(companyId, {
                  plan: company.subscription.plan,
                  licenseKey: company.subscription.licenseKey,
                  expiresAt: company.subscription.expiresAt,
                  amount: transaction.amount,
                  currency: transaction.currency || "GHS",
                });
              }
            } catch (emailError) {
              console.warn(
                `Failed to send subscription notification email:`,
                emailError
              );
            }
          };

          // Handle in-app notifications separately
          const sendSubscriptionNotification = async () => {
            try {
              await notificationService.createPaymentStatusNotification(
                transaction.user._id.toString(),
                {
                  type: "subscription",
                  amount: transaction.amount,
                  totalAmount: transaction.amount,
                  remainingAmount: 0,
                  paymentMethod: transaction.method,
                  transactionId: transaction._id.toString(),
                  status: "completed",
                  subscriptionType: transaction.metadata.type,
                  plan: transaction.metadata.planName,
                }
              );
            } catch (notificationError) {
              console.warn(
                `Failed to send subscription notification:`,
                notificationError
              );
            }
          };

          // Execute both operations independently
          await Promise.allSettled([
            sendSubscriptionEmail(),
            sendSubscriptionNotification(),
          ]);
        } catch (subscriptionError) {
          console.error(
            `Failed to handle subscription ${transaction.metadata.type}:`,
            subscriptionError
          );
          // Don't throw the error to avoid breaking the payment verification flow
        }

        return;
      }

      // Update booking status if applicable
      if (transaction.category === "booking" && transaction.booking) {
        const booking = await BookingModel.findById(transaction.booking);
        if (booking) {
          await BookingModel.findByIdAndUpdate(transaction.booking, {
            paymentStatus: "completed",
            status: "confirmed",
            updatedAt: new Date(),
          });

          // Send payment notification and email separately to prevent interruption
          const sendBookingNotification = async () => {
            try {
              await notificationService.createPaymentStatusNotification(
                booking.user._id.toString(),
                {
                  type: transaction.paymentTiming || "full",
                  amount: verificationResult.amount,
                  totalAmount: booking.totalPrice,
                  remainingAmount:
                    booking.totalPrice - verificationResult.amount,
                  paymentMethod: verificationResult.method,
                  bookingId: booking._id.toString(),
                  transactionId: transaction._id.toString(),
                  status: "completed",
                }
              );
            } catch (notificationError) {
              console.warn(
                "Failed to send payment notification:",
                notificationError
              );
            }
          };

          const sendBookingEmail = async () => {
            try {
              const { emailService } = await import("./email.service");
              const user = await import("../models/user.model").then((m) =>
                m.UserModel.findById(booking.user)
              );
              const company = await import("../models/company.model").then(
                (m) => m.CompanyModel.findById(booking.company)
              );

              if (user && company) {
                const emailSubject = `Payment Confirmation - ${transaction.paymentTiming === "advance" ? "Advance" : transaction.paymentTiming === "split" ? "Split" : "Full"} Payment`;
                const emailContent = `
                  <h2>Payment Confirmation</h2>
                  <p>Dear ${user.name || "Customer"},</p>
                  <p>Your ${transaction.paymentTiming || "full"} payment has been successfully processed.</p>
                  <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>Payment Details:</h3>
                    <ul>
                      <li><strong>Amount Paid:</strong> ${verificationResult.amount}</li>
                      <li><strong>Payment Method:</strong> ${verificationResult.method}</li>
                      <li><strong>Transaction Reference:</strong> ${verificationResult.reference}</li>
                      ${
                        transaction.paymentTiming === "advance" ||
                        transaction.paymentTiming === "split"
                          ? `<li><strong>Remaining Balance:</strong> ${booking.totalPrice - verificationResult.amount}</li>`
                          : ""
                      }
                    </ul>
                  </div>
                  <p>Thank you for your business!</p>
                  <p>Best regards,<br>${company.name}</p>
                `;

                await emailService.sendEmail({
                  to: user.email,
                  subject: emailSubject,
                  template: "payment-confirmation",
                  context: {
                    company,
                    user,
                    recipient: user,
                  },
                  companyId: booking.company.toString(),
                });
              }
            } catch (emailError) {
              console.warn(
                "Failed to send payment confirmation email:",
                emailError
              );
            }
          };

          const sendBookingConfirmationEmail = async () => {
            try {
              const { emailService } = await import("./email.service");
              await emailService.sendBookingConfirmation(
                transaction.booking.toString()
              );
            } catch (emailError) {
              console.warn(
                "Failed to send booking confirmation email:",
                emailError
              );
            }
          };

          // Execute all operations independently
          await Promise.allSettled([
            sendBookingNotification(),
            sendBookingEmail(),
            sendBookingConfirmationEmail(),
          ]);

          emitEvent(Events.BookingConfirmed, {
            bookingId: transaction.booking,
            transactionId: transaction._id,
          });
        }
      }

      // Update rental status if applicable
      if (transaction.category === "rental" && transaction.rental) {
        const rental = await RentalModel.findById(transaction.rental);
        if (rental) {
          await RentalModel.findByIdAndUpdate(transaction.rental, {
            paymentStatus: "completed",
            status: "confirmed",
            updatedAt: new Date(),
          });

          // Send payment notification and email separately to prevent interruption
          const sendRentalNotification = async () => {
            try {
              await notificationService.createPaymentStatusNotification(
                rental.user.toString(),
                {
                  type: transaction.paymentTiming || "full",
                  amount: verificationResult.amount,
                  totalAmount: rental.totalPrice || rental.amount,
                  remainingAmount:
                    (rental.totalPrice || rental.amount) -
                    verificationResult.amount,
                  paymentMethod: verificationResult.method,
                  rentalId: rental._id.toString(),
                  transactionId: transaction._id.toString(),
                  status: "completed",
                }
              );
            } catch (notificationError) {
              console.warn(
                "Failed to send payment notification:",
                notificationError
              );
            }
          };

          const sendRentalEmail = async () => {
            try {
              const { emailService } = await import("./email.service");
              const user = await import("../models/user.model").then((m) =>
                m.UserModel.findById(rental.user)
              );
              const company = await import("../models/company.model").then(
                (m) => m.CompanyModel.findById(rental.company)
              );

              if (user && company) {
                const emailSubject = `Payment Confirmation - ${transaction.paymentTiming === "advance" ? "Advance" : transaction.paymentTiming === "split" ? "Split" : "Full"} Payment`;
                const emailContent = `
                  <h2>Payment Confirmation</h2>
                  <p>Dear ${user.name || "Customer"},</p>
                  <p>Your ${transaction.paymentTiming || "full"} payment has been successfully processed.</p>
                  <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>Payment Details:</h3>
                    <ul>
                      <li><strong>Amount Paid:</strong> ${verificationResult.amount}</li>
                      <li><strong>Payment Method:</strong> ${verificationResult.method}</li>
                      <li><strong>Transaction Reference:</strong> ${verificationResult.reference}</li>
                      ${
                        transaction.paymentTiming === "advance" ||
                        transaction.paymentTiming === "split"
                          ? `<li><strong>Remaining Balance:</strong> ${(rental.totalPrice || rental.amount) - verificationResult.amount}</li>`
                          : ""
                      }
                    </ul>
                  </div>
                  <p>Thank you for your business!</p>
                  <p>Best regards,<br>${company.name}</p>
                `;

                await emailService.sendEmail({
                  to: user.email,
                  subject: emailSubject,
                  template: "payment-confirmation",
                  context: {
                    company,
                    user,
                    recipient: user,
                  },
                  companyId: rental.company.toString(),
                });
              }
            } catch (emailError) {
              console.warn(
                "Failed to send payment confirmation email:",
                emailError
              );
            }
          };

          // Execute all operations independently
          await Promise.allSettled([
            sendRentalNotification(),
            sendRentalEmail(),
          ]);

          emitEvent(Events.RentalConfirmed, {
            rentalId: transaction.rental,
            transactionId: transaction._id,
          });
        }
      }

      // Update payment schedule if applicable
      if (
        verificationResult.method === "split" ||
        verificationResult.method === "advance"
      ) {
        const schedule = await PaymentScheduleModel.findOne({
          transactionId: transaction._id.toString(),
          isDeleted: false,
        });

        if (schedule) {
          // Find the payment that was just completed
          const completedPayment = schedule.scheduledPayments.find(
            (payment: any) => payment.status === "pending" && !payment.paidAt
          );

          if (completedPayment && completedPayment.paymentReference) {
            await PaymentScheduleService.processPayment(
              schedule._id.toString(),
              completedPayment.paymentReference,
              transaction._id.toString()
            );
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to handle post-verification actions:", error);
      // Don't throw error as this is not critical
    }
  }
}

export default PaymentVerificationService;
