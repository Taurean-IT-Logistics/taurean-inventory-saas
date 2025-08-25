import { BookingModel } from "../models/booking.model";
import { InvoiceModel } from "../models/invoice.model";
import { UserModel } from "../models/user.model";
import { FacilityModel } from "../models/facility.model";
import { TransactionModel } from "../models/transaction.model";

export class ReportsService {
  // Get report number
  static async getReportNumber(type: string, companyId: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `RPT-${type.toUpperCase()}-${timestamp}-${randomSuffix}`;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get report data
  static async getReportData(type: string, companyId: string, dateRange: string) {
    try {
      switch (type) {
        case "overview":
          return await this.getOverviewReportData(companyId, dateRange);
        case "bookings":
          return await this.getBookingsReportData(companyId, dateRange);
        case "revenue":
          return await this.getInvoicesReportData(companyId, dateRange);
        case "users":
          return await this.getUsersReportData(companyId);
        case "facilities":
          return await this.getFacilitiesReportData(companyId);
        default:
          throw new Error("Invalid report type");
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get overview report data
  static async getOverviewReportData(companyId: string, dateRange: string) {
    try {
      const days = parseInt(dateRange) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const [bookings, invoices, users, facilities] = await Promise.all([
        BookingModel.countDocuments({ companyId, createdAt: { $gte: startDate, $lte: endDate } }),
        InvoiceModel.countDocuments({ companyId, createdAt: { $gte: startDate, $lte: endDate } }),
        UserModel.countDocuments({ companyId }),
        FacilityModel.countDocuments({ companyId }),
      ]);

      const totalRevenue = await InvoiceModel.aggregate([
        { $match: { companyId, status: "paid", createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);

      return {
        totalBookings: bookings,
        totalInvoices: invoices,
        totalUsers: users,
        totalFacilities: facilities,
        totalRevenue: totalRevenue[0]?.total || 0,
        period: { startDate, endDate },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get bookings report data
  static async getBookingsReportData(companyId: string, dateRange: string) {
    try {
      const days = parseInt(dateRange) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const bookings = await BookingModel.find({ companyId, createdAt: { $gte: startDate, $lte: endDate } })
        .populate("facilityId", "name")
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

      return {
        bookings,
        totalBookings,
        totalRevenue,
        period: { startDate, endDate },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get invoices report data
  static async getInvoicesReportData(companyId: string, dateRange: string) {
    try {
      const days = parseInt(dateRange) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const invoices = await InvoiceModel.find({ companyId, createdAt: { $gte: startDate, $lte: endDate } })
        .populate("customerInfo")
        .sort({ createdAt: -1 });

      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(invoice => invoice.status === "paid").length;
      const overdueInvoices = invoices.filter(invoice => invoice.status === "overdue").length;
      const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const paidAmount = invoices
        .filter(invoice => invoice.status === "paid")
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

      return {
        invoices,
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        totalAmount,
        paidAmount,
        period: { startDate, endDate },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get users report data
  static async getUsersReportData(companyId: string) {
    try {
      const users = await UserModel.find({ companyId })
        .select("name email role status createdAt")
        .sort({ createdAt: -1 });

      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === "active").length;
      const adminUsers = users.filter(user => user.role === "admin").length;

      return {
        users,
        totalUsers,
        activeUsers,
        adminUsers,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get facilities report data
  static async getFacilitiesReportData(companyId: string) {
    try {
      const facilities = await FacilityModel.find({ companyId })
        .select("name description status capacity createdAt")
        .sort({ createdAt: -1 });

      const totalFacilities = facilities.length;
      const activeFacilities = facilities.filter(facility => facility.isActive).length;
      const totalCapacity = facilities.reduce((sum, facility) => sum + (facility.capacity?.maximum || 0), 0);

      return {
        facilities,
        totalFacilities,
        activeFacilities,
        totalCapacity,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get transactions report data
  static async getTransactionsReportData(companyId: string, dateRange: string) {
    try {
      const days = parseInt(dateRange) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const transactions = await TransactionModel.find({ companyId, createdAt: { $gte: startDate, $lte: endDate } })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const successfulTransactions = transactions.length; // All transactions are considered successful

      return {
        transactions,
        totalTransactions,
        totalAmount,
        successfulTransactions,
        period: { startDate, endDate },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}