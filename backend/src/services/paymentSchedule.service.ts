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
  scheduledPayments: Array<{
    amount: number;
    dueDate: Date;
    paymentMethod: "paystack" | "cash" | "cheque";
    notes?: string;
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
      // Check for existing active schedule to prevent duplicates
      const existingSchedule = await PaymentScheduleModel.findOne({
        $or: [{ bookingId: data.bookingId }, { rentalId: data.rentalId }],
        isDeleted: false,
        status: { $in: ["active", "overdue"] },
      });

      if (existingSchedule) {
        throw new Error(
          "Payment schedule already exists for this booking/rental"
        );
      }

      // Calculate remaining amount
      const paidAmount = 0;
      const remainingAmount = data.totalAmount;

      const schedule = new PaymentScheduleModel({
        ...data,
        paidAmount,
        remainingAmount,
        scheduledPayments: data.scheduledPayments.map((payment) => ({
          ...payment,
          status: "pending",
        })),
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
   * Update payment status when a payment is made
   */
  static async updatePaymentStatus(
    data: UpdatePaymentData
  ): Promise<PaymentScheduleDocument> {
    try {
      const schedule = await PaymentScheduleModel.findById(data.scheduleId);
      if (!schedule) {
        throw new Error("Payment schedule not found");
      }

      const payment = schedule.scheduledPayments[data.paymentIndex];
      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status === "paid") {
        throw new Error("Payment already processed");
      }

      // Update payment status
      payment.status = "paid";
      payment.paidAt = new Date();
      if (data.transactionId) {
        payment.transactionId = data.transactionId;
      }
      if (data.notes) {
        payment.notes = data.notes;
      }

      // Update overall schedule status
      await (schedule as any).updatePaymentStatus();

      // Emit event for real-time updates
      emitEvent(Events.PaymentScheduleUpdated, {
        scheduleId: schedule._id,
        userId: schedule.userId,
        companyId: schedule.companyId,
        paymentIndex: data.paymentIndex,
        status: payment.status,
      });

      return schedule;
    } catch (error: any) {
      throw new Error(`Failed to update payment status: ${error.message}`);
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
