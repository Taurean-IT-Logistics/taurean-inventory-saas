import { TransactionModel } from "../models/transaction.model";
import { PaymentScheduleModel } from "../models/paymentSchedule.model";
import { BookingModel } from "../models/booking.model";
import { RentalModel } from "../models/rental.model";
import { emitEvent } from "../utils/eventEmitter";
import { Events } from "../utils/events";
import { verifyPayment } from "./payment.service";
import PaymentScheduleService from "./paymentSchedule.service";
import ReferenceGenerator from "../utils/referenceGenerator";
import NotificationService from "./notification.service";

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
    switch (paymentMethod.toLowerCase()) {
      case "paystack":
        return await this.verifyPaystackPayment(reference);
      case "cash":
        return await this.verifyCashPayment(reference);
      case "cheque":
        return await this.verifyChequePayment(reference);
      case "split":
        return await this.verifySplitPayment(reference);
      case "advance":
        return await this.verifyAdvancePayment(reference);
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
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
      // First find the transaction by reference to get the actual transaction ID
      const transaction = await TransactionModel.findOne({
        ref: reference,
        isDeleted: false,
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // For split payments, we need to check the payment schedule using the transaction ID
      const schedule = await PaymentScheduleModel.findOne({
        transactionId: transaction._id.toString(),
        paymentType: "split",
        isDeleted: false,
      });

      if (!schedule) {
        throw new Error("Split payment schedule not found");
      }

      // Check if any payments in the schedule are completed
      const completedPayments = schedule.scheduledPayments.filter(
        (payment: any) => payment.status === "paid"
      );

      const totalPaid = completedPayments.reduce(
        (sum: number, payment: any) => sum + payment.amount,
        0
      );

      const isFullyPaid = totalPaid >= schedule.totalAmount;

      return {
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
        },
      };
    } catch (error: any) {
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
        throw new Error("Advance payment schedule not found");
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

      // Update booking status if applicable
      if (transaction.category === "booking" && transaction.booking) {
        const booking = await BookingModel.findById(transaction.booking);
        if (booking) {
          await BookingModel.findByIdAndUpdate(transaction.booking, {
            paymentStatus: "completed",
            status: "confirmed",
            updatedAt: new Date(),
          });

          // Send payment notification
          try {
            const notificationService = NotificationService;
            await notificationService.createPaymentStatusNotification(
              booking.user.toString(),
              {
                type: transaction.paymentTiming || "full",
                amount: verificationResult.amount,
                totalAmount: booking.totalPrice,
                remainingAmount: booking.totalPrice - verificationResult.amount,
                paymentMethod: verificationResult.method,
                bookingId: booking._id.toString(),
                transactionId: transaction._id.toString(),
                status: "completed",
              }
            );

            // Send email notification
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
          } catch (notificationError) {
            console.warn(
              "Failed to send payment notification:",
              notificationError
            );
          }

          emitEvent(Events.BookingConfirmed, {
            bookingId: transaction.booking,
            transactionId: transaction._id,
          });

          // Send booking confirmation email
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

          // Send payment notification
          try {
            const notificationService = NotificationService;
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

            // Send email notification
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
          } catch (notificationError) {
            console.warn(
              "Failed to send payment notification:",
              notificationError
            );
          }

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
          const paymentIndex = schedule.scheduledPayments.findIndex(
            (payment: any) => payment.status === "paid" && payment.paidAt
          );

          if (paymentIndex !== -1) {
            await PaymentScheduleService.updatePaymentStatus({
              scheduleId: schedule._id.toString(),
              paymentIndex,
              transactionId: transaction._id.toString(),
            });
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
