import {
  PaymentScheduleModel,
  PaymentScheduleDocument,
} from "../models/paymentSchedule.model";
import { TransactionModel } from "../models/transaction.model";
import { BookingModel } from "../models/booking.model";
import { RentalModel } from "../models/rental.model";
import { emitEvent } from "../utils/eventEmitter";
import { Events } from "../utils/events";

export interface CreatePaymentScheduleData {
  userId: string;
  companyId: string;
  bookingId?: string;
  rentalId?: string;
  transactionId?: string;
  totalAmount: number;
  paymentType: "advance" | "split" | "full";
  paymentMethod?: "paystack" | "cash" | "cheque";
  advanceConfig?: {
    percentage?: number;
    fixedAmount?: number;
    inputMode: "percentage" | "amount";
    dueDate?: Date;
  };
  splitConfig?: {
    numberOfParts: number;
    intervalDays?: number;
    customSchedule?: boolean;
  };
  scheduledPayments?: Array<{
    amount: number;
    dueDate: Date;
    paymentMethod: "paystack" | "cash" | "cheque";
    notes?: string;
    isAdvance?: boolean;
    paymentReference?: string;
  }>;
}

export interface UpdatePaymentData {
  scheduleId: string;
  paymentIndex: number;
  transactionId?: string;
  notes?: string;
}

export class PaymentScheduleService {
  /**
   * Create a new payment schedule
   */
  static async createPaymentSchedule(
    data: CreatePaymentScheduleData
  ): Promise<PaymentScheduleDocument> {
    try {
      let scheduledPayments: any[] = [];
      let advanceAmount = 0;
      let balanceAmount = data.totalAmount;

      // Use the user's selected payment method, default to paystack if not specified
      const userPaymentMethod = data.paymentMethod || "paystack";

      // Generate scheduled payments based on payment type
      if (data.paymentType === "advance" && data.advanceConfig) {
        // Calculate advance amount
        if (data.advanceConfig.inputMode === "percentage") {
          advanceAmount =
            (data.totalAmount * (data.advanceConfig.percentage || 0)) / 100;
        } else {
          advanceAmount = data.advanceConfig.fixedAmount || 0;
        }

        balanceAmount = data.totalAmount - advanceAmount;

        // Create advance payment
        scheduledPayments.push({
          amount: advanceAmount,
          dueDate: data.advanceConfig.dueDate || new Date(),
          paymentMethod: userPaymentMethod,
          status: "pending",
          notes: "Advance payment",
          isAdvance: true,
          paymentReference: `ADV-${Date.now()}`,
        });

        // Create balance payment
        if (balanceAmount > 0) {
          scheduledPayments.push({
            amount: balanceAmount,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            paymentMethod: data.paymentMethod || "paystack",
            status: "pending",
            notes: "Balance payment",
            isAdvance: false,
            paymentReference: `BAL-${Date.now()}`,
          });
        }
      } else if (data.paymentType === "split" && data.splitConfig) {
        const numberOfParts = data.splitConfig.numberOfParts;
        const intervalDays = data.splitConfig.intervalDays || 7;
        const amountPerPart = data.totalAmount / numberOfParts;

        for (let i = 0; i < numberOfParts; i++) {
          scheduledPayments.push({
            amount:
              i === numberOfParts - 1
                ? data.totalAmount - amountPerPart * (numberOfParts - 1) // Last payment gets remainder
                : amountPerPart,
            dueDate: new Date(
              Date.now() + i * intervalDays * 24 * 60 * 60 * 1000
            ),
            paymentMethod: data.paymentMethod || "paystack",
            status: "pending",
            notes: `Split payment part ${i + 1} of ${numberOfParts}`,
            isAdvance: false,
            paymentReference: `SPLIT-${i + 1}-${Date.now()}`,
          });
        }
      } else if (data.scheduledPayments) {
        // Use provided scheduled payments
        scheduledPayments = data.scheduledPayments.map((payment, index) => ({
          ...payment,
          status: "pending",
          paymentReference:
            payment.paymentReference || `PAY-${index + 1}-${Date.now()}`,
        }));
      } else {
        // Full payment
        scheduledPayments.push({
          amount: data.totalAmount,
          dueDate: new Date(),
          paymentMethod: data.paymentMethod || "paystack",
          status: "pending",
          notes: "Full payment",
          isAdvance: false,
          paymentReference: `FULL-${Date.now()}`,
        });
      }

      // Calculate remaining amount
      const paidAmount = 0;
      const remainingAmount = data.totalAmount;

      const schedule = new PaymentScheduleModel({
        ...data,
        paidAmount,
        remainingAmount,
        advanceAmount,
        balanceAmount,
        scheduledPayments,
      });

      const savedSchedule = await schedule.save();

      // Emit event for real-time updates
      emitEvent(Events.PaymentScheduleCreated, {
        scheduleId: savedSchedule._id,
        userId: data.userId,
        companyId: data.companyId,
        bookingId: data.bookingId,
        rentalId: data.rentalId,
      });

      return savedSchedule;
    } catch (error: any) {
      throw new Error(`Failed to create payment schedule: ${error.message}`);
    }
  }

  /**
   * Get payment schedules for a user
   */
  static async getUserPaymentSchedules(
    userId: string,
    companyId: string,
    filters: {
      status?: string;
      paymentType?: string;
      isActive?: boolean;
    } = {},
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 10 }
  ) {
    try {
      const query: any = {
        userId,
        companyId,
        isDeleted: false,
        ...filters,
      };

      const skip = (pagination.page - 1) * pagination.limit;

      const schedules = await PaymentScheduleModel.find(query)
        .populate("bookingId", "facility startDate endDate status")
        .populate("rentalId", "item startDate endDate status")
        .populate("transactionId", "ref amount status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit);

      const total = await PaymentScheduleModel.countDocuments(query);

      return {
        schedules,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      };
    } catch (error: any) {
      throw new Error(`Failed to get user payment schedules: ${error.message}`);
    }
  }

  /**
   * Get payment schedules for a company (admin view)
   */
  static async getCompanyPaymentSchedules(
    companyId: string,
    filters: {
      status?: string;
      paymentType?: string;
      isActive?: boolean;
    } = {},
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 10 }
  ) {
    try {
      const query: any = {
        companyId,
        isDeleted: false,
        ...filters,
      };

      const skip = (pagination.page - 1) * pagination.limit;

      const schedules = await PaymentScheduleModel.find(query)
        .populate("userId", "name email phone")
        .populate("bookingId", "facility startDate endDate status")
        .populate("rentalId", "item startDate endDate status")
        .populate("transactionId", "ref amount status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit);

      const total = await PaymentScheduleModel.countDocuments(query);

      return {
        schedules,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get company payment schedules: ${error.message}`
      );
    }
  }

  /**
   * Update payment schedule configuration
   */
  static async updatePaymentSchedule(
    scheduleId: string,
    updateData: {
      splitConfig?: {
        numberOfParts: number;
        intervalDays: number;
      };
      advanceConfig?: {
        percentage?: number;
        fixedAmount?: number;
        inputMode: "percentage" | "amount";
      };
    }
  ): Promise<PaymentScheduleDocument> {
    try {
      const schedule = await PaymentScheduleModel.findById(scheduleId);
      if (!schedule) {
        throw new Error("Payment schedule not found");
      }

      if (schedule.status === "completed") {
        throw new Error("Cannot update completed payment schedule");
      }

      // Update split configuration
      if (updateData.splitConfig && schedule.paymentType === "split") {
        schedule.splitConfig = {
          ...schedule.splitConfig,
          ...updateData.splitConfig,
        };

        // Regenerate scheduled payments for split payments
        // Use remaining amount for split calculation, not total amount
        const amountPerPart =
          schedule.remainingAmount / updateData.splitConfig.numberOfParts;
        const newScheduledPayments = [];

        for (let i = 0; i < updateData.splitConfig.numberOfParts; i++) {
          const dueDate = new Date();
          dueDate.setDate(
            dueDate.getDate() + i * updateData.splitConfig.intervalDays
          );

          // Last payment gets any remainder to avoid rounding issues
          const paymentAmount =
            i === updateData.splitConfig.numberOfParts - 1
              ? schedule.remainingAmount -
                amountPerPart * (updateData.splitConfig.numberOfParts - 1)
              : amountPerPart;

          newScheduledPayments.push({
            amount: paymentAmount,
            dueDate,
            paymentMethod:
              schedule.scheduledPayments[0]?.paymentMethod || "paystack",
            status: "pending",
            notes: `Split payment part ${i + 1} of ${updateData.splitConfig.numberOfParts}`,
            paymentReference: `SPLIT-${scheduleId}-${i + 1}-${Date.now()}`,
          });
        }

        schedule.scheduledPayments = newScheduledPayments;
        schedule.remainingAmount = schedule.totalAmount - schedule.paidAmount;
        schedule.nextPaymentDate = newScheduledPayments[0]?.dueDate;
      }

      // Update advance configuration
      if (updateData.advanceConfig && schedule.paymentType === "advance") {
        schedule.advanceConfig = {
          ...schedule.advanceConfig,
          ...updateData.advanceConfig,
        };

        // Recalculate advance amount
        let advanceAmount = 0;
        if (updateData.advanceConfig.inputMode === "percentage") {
          advanceAmount =
            (schedule.totalAmount *
              (updateData.advanceConfig.percentage || 0)) /
            100;
        } else {
          advanceAmount = updateData.advanceConfig.fixedAmount || 0;
        }

        const balanceAmount = schedule.totalAmount - advanceAmount;

        // Regenerate scheduled payments for advance payments
        const newScheduledPayments = [];

        // Advance payment
        newScheduledPayments.push({
          amount: advanceAmount,
          dueDate: new Date(),
          paymentMethod:
            schedule.scheduledPayments[0]?.paymentMethod || "paystack",
          status: "pending",
          notes: "Advance payment",
          isAdvance: true,
          paymentReference: `ADV-${scheduleId}-${Date.now()}`,
        });

        // Balance payment
        if (balanceAmount > 0) {
          newScheduledPayments.push({
            amount: balanceAmount,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            paymentMethod:
              schedule.scheduledPayments[0]?.paymentMethod || "paystack",
            status: "pending",
            notes: "Balance payment",
            paymentReference: `BAL-${scheduleId}-${Date.now()}`,
          });
        }

        schedule.scheduledPayments = newScheduledPayments;
        schedule.advanceAmount = advanceAmount;
        schedule.balanceAmount = balanceAmount;
        schedule.remainingAmount = schedule.totalAmount - schedule.paidAmount;
        schedule.nextPaymentDate = newScheduledPayments[0]?.dueDate;
      }

      schedule.updatedAt = new Date();
      const updatedSchedule = await schedule.save();

      // Emit event for real-time updates
      emitEvent(Events.PaymentScheduleUpdated, {
        scheduleId: updatedSchedule._id,
        schedule: updatedSchedule,
      });

      return updatedSchedule;
    } catch (error: any) {
      throw new Error(`Failed to update payment schedule: ${error.message}`);
    }
  }

  /**
   * Get pending payments for a user
   */
  static async getPendingPayments(
    userId: string
  ): Promise<PaymentScheduleDocument[]> {
    try {
      const schedules = await PaymentScheduleModel.find({
        userId,
        isDeleted: false,
        status: { $in: ["active", "partial", "overdue"] },
        "scheduledPayments.status": "pending",
      })
        .populate("bookingId", "facility startDate endDate status")
        .populate("rentalId", "item startDate endDate status")
        .populate("transactionId", "ref amount status")
        .sort({ nextPaymentDate: 1 });

      return schedules;
    } catch (error: any) {
      throw new Error(`Failed to get pending payments: ${error.message}`);
    }
  }

  /**
   * Authorize payment for a specific scheduled payment (ONLINE PAYMENTS ONLY)
   */
  static async authorizeScheduledPayment(
    scheduleId: string,
    paymentIndex: number,
    userEmail: string,
    paymentMethod: string
  ): Promise<{
    authorizationUrl?: string;
    paymentReference: string;
    requiresOnlinePayment: boolean;
  }> {
    try {
      const schedule = await PaymentScheduleModel.findById(scheduleId);
      if (!schedule) {
        throw new Error("Payment schedule not found");
      }

      const scheduledPayment = schedule.scheduledPayments[paymentIndex];
      if (!scheduledPayment) {
        throw new Error("Scheduled payment not found");
      }

      if (scheduledPayment.status === "paid") {
        throw new Error("Payment already completed");
      }

      // Generate new payment reference
      const paymentReference = `SPLIT-${scheduleId}-${paymentIndex + 1}-${Date.now()}`;

      // Update the scheduled payment with new reference
      schedule.scheduledPayments[paymentIndex].paymentReference =
        paymentReference;
      await schedule.save();

      // Check if this is an online payment method
      const onlinePaymentMethods = ["paystack", "mobile_money", "bank"];
      const requiresOnlinePayment = onlinePaymentMethods.includes(
        paymentMethod.toLowerCase()
      );

      if (!requiresOnlinePayment) {
        // For cash/cheque payments, just return the reference - no authorization URL needed
        return {
          paymentReference: paymentReference,
          requiresOnlinePayment: false,
        };
      }

      // Initialize payment with Paystack for online payments
      const { initializePayment } = await import("./payment.service");

      const paymentData = {
        email: userEmail,
        amount: scheduledPayment.amount * 100, // Convert to kobo without rounding
        currency: "GHS", // Default currency
        metadata: {
          full_name: `Scheduled Payment ${paymentIndex + 1}`,
          scheduleId: scheduleId,
          paymentIndex: paymentIndex,
          paymentType: schedule.paymentType,
          transactionId: schedule.transactionId,
        },
      };

      const paymentResponse = await initializePayment(paymentData, {
        companyId: schedule.companyId,
      });

      return {
        authorizationUrl: paymentResponse.data.authorization_url,
        paymentReference: paymentReference,
        requiresOnlinePayment: true,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to authorize scheduled payment: ${error.message}`
      );
    }
  }

  /**
   * Mark a cash/cheque payment as completed
   */
  static async markPaymentCompleted(
    scheduleId: string,
    paymentIndex: number,
    notes?: string
  ): Promise<PaymentScheduleDocument> {
    try {
      const schedule = await PaymentScheduleModel.findById(scheduleId);
      if (!schedule) {
        throw new Error("Payment schedule not found");
      }

      const scheduledPayment = schedule.scheduledPayments[paymentIndex];
      if (!scheduledPayment) {
        throw new Error("Scheduled payment not found");
      }

      if (scheduledPayment.status === "paid") {
        throw new Error("Payment already completed");
      }

      // Mark the payment as paid
      schedule.scheduledPayments[paymentIndex].status = "paid";
      schedule.scheduledPayments[paymentIndex].paidAt = new Date();
      schedule.scheduledPayments[paymentIndex].notes = notes;

      // Update schedule totals
      schedule.paidAmount += scheduledPayment.amount;
      schedule.remainingAmount = schedule.totalAmount - schedule.paidAmount;

      // Check if all payments are completed
      const allPaid = schedule.scheduledPayments.every(
        (payment) => payment.status === "paid"
      );
      if (allPaid) {
        schedule.status = "completed";
      } else {
        // Update next payment date
        const nextPendingPayment = schedule.scheduledPayments.find(
          (payment) => payment.status === "pending"
        );
        if (nextPendingPayment) {
          schedule.nextPaymentDate = nextPendingPayment.dueDate;
        }
      }

      await schedule.save();
      return schedule;
    } catch (error: any) {
      throw new Error(`Failed to mark payment as completed: ${error.message}`);
    }
  }

  /**
   * Process a single payment from the schedule
   */
  static async processPayment(
    scheduleId: string,
    paymentReference: string,
    transactionId: string,
    notes?: string
  ): Promise<PaymentScheduleDocument> {
    try {
      const schedule = await PaymentScheduleModel.findById(scheduleId);
      if (!schedule) {
        throw new Error("Payment schedule not found");
      }

      const payment = schedule.scheduledPayments.find(
        (p: any) => p.paymentReference === paymentReference
      );

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status === "paid") {
        throw new Error("Payment already processed");
      }

      // Update payment status
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.transactionId = transactionId;
      if (notes) {
        payment.notes = notes;
      }

      // Update overall schedule status
      await (schedule as any).updatePaymentStatus();

      // Update tracking fields
      schedule.lastPaymentDate = new Date();
      const nextPendingPayment = schedule.scheduledPayments.find(
        (p: any) => p.status === "pending"
      );
      schedule.nextPaymentDate = nextPendingPayment?.dueDate;

      const updatedSchedule = await schedule.save();

      // Emit event for real-time updates
      emitEvent(Events.PaymentScheduleUpdated, {
        scheduleId: schedule._id,
        userId: schedule.userId,
        companyId: schedule.companyId,
        paymentReference,
        status: payment.status,
        amount: payment.amount,
      });

      return updatedSchedule;
    } catch (error: any) {
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  /**
   * Get payment schedules with pending advance payments
   */
  static async getPendingAdvancePayments(
    companyId?: string,
    userId?: string
  ): Promise<PaymentScheduleDocument[]> {
    try {
      const query: any = {
        isDeleted: false,
        isActive: true,
        paymentType: "advance",
        "scheduledPayments.isAdvance": true,
        "scheduledPayments.status": "pending",
      };

      if (companyId) query.companyId = companyId;
      if (userId) query.userId = userId;

      return await PaymentScheduleModel.find(query)
        .populate("userId", "name email phone")
        .populate("bookingId", "facility startDate endDate status")
        .populate("rentalId", "item startDate endDate status")
        .sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(
        `Failed to get pending advance payments: ${error.message}`
      );
    }
  }

  /**
   * Get payment schedules with pending split payments
   */
  static async getPendingSplitPayments(
    companyId?: string,
    userId?: string
  ): Promise<PaymentScheduleDocument[]> {
    try {
      const query: any = {
        isDeleted: false,
        isActive: true,
        paymentType: "split",
        "scheduledPayments.status": "pending",
      };

      if (companyId) query.companyId = companyId;
      if (userId) query.userId = userId;

      return await PaymentScheduleModel.find(query)
        .populate("userId", "name email phone")
        .populate("bookingId", "facility startDate endDate status")
        .populate("rentalId", "item startDate endDate status")
        .sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(`Failed to get pending split payments: ${error.message}`);
    }
  }

  /**
   * Get overdue payments for cron job processing
   */
  static async getOverduePayments(): Promise<PaymentScheduleDocument[]> {
    try {
      const now = new Date();

      const schedules = await PaymentScheduleModel.find({
        isDeleted: false,
        isActive: true,
        status: { $in: ["active", "overdue"] },
        "scheduledPayments.status": "pending",
        "scheduledPayments.dueDate": { $lt: now },
      })
        .populate("userId", "name email phone")
        .populate("companyId", "name email contactPhone");

      return schedules;
    } catch (error: any) {
      throw new Error(`Failed to get overdue payments: ${error.message}`);
    }
  }

  /**
   * Get upcoming payments for notifications
   */
  static async getUpcomingPayments(
    daysAhead: number = 3
  ): Promise<PaymentScheduleDocument[]> {
    try {
      const now = new Date();
      const futureDate = new Date(
        now.getTime() + daysAhead * 24 * 60 * 60 * 1000
      );

      const schedules = await PaymentScheduleModel.find({
        isDeleted: false,
        isActive: true,
        status: { $in: ["active", "overdue"] },
        "scheduledPayments.status": "pending",
        "scheduledPayments.dueDate": {
          $gte: now,
          $lte: futureDate,
        },
      })
        .populate("userId", "name email phone")
        .populate("companyId", "name email contactPhone");

      return schedules;
    } catch (error: any) {
      throw new Error(`Failed to get upcoming payments: ${error.message}`);
    }
  }

  /**
   * Cancel a payment schedule
   */
  static async cancelPaymentSchedule(
    scheduleId: string,
    reason?: string
  ): Promise<PaymentScheduleDocument> {
    try {
      const schedule = await PaymentScheduleModel.findById(scheduleId);
      if (!schedule) {
        throw new Error("Payment schedule not found");
      }

      if (schedule.status === "completed") {
        throw new Error("Cannot cancel completed payment schedule");
      }

      // Cancel all pending payments
      schedule.scheduledPayments.forEach((payment: any) => {
        if (payment.status === "pending") {
          payment.status = "cancelled";
          if (reason) {
            payment.notes = reason;
          }
        }
      });

      schedule.status = "cancelled";
      schedule.isActive = false;

      const updatedSchedule = await schedule.save();

      // Emit event for real-time updates
      emitEvent(Events.PaymentScheduleCancelled, {
        scheduleId: schedule._id,
        userId: schedule.userId,
        companyId: schedule.companyId,
        reason,
      });

      return updatedSchedule;
    } catch (error: any) {
      throw new Error(`Failed to cancel payment schedule: ${error.message}`);
    }
  }

  /**
   * Get payment schedule by ID
   */
  static async getPaymentScheduleById(
    scheduleId: string
  ): Promise<PaymentScheduleDocument | null> {
    try {
      return await PaymentScheduleModel.findOne({
        _id: scheduleId,
        isDeleted: false,
      })
        .populate("userId", "name email phone")
        .populate("bookingId", "facility startDate endDate status")
        .populate("rentalId", "item startDate endDate status")
        .populate("transactionId", "ref amount status");
    } catch (error: any) {
      throw new Error(`Failed to get payment schedule: ${error.message}`);
    }
  }
}

export default PaymentScheduleService;
