import { InvoiceModel, InvoiceDocument } from "../models/invoice.model";
import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";
import { TransactionModel } from "../models/transaction.model";
import { BookingModel } from "../models/booking.model";
import { FacilityModel } from "../models/facility.model";
import { Types } from "mongoose";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { generateInvoiceNumber } from "../utils/invoiceUtils";
import { notificationService } from "./notification.service";

export interface CreateInvoiceData {
  companyId: string;
  userId: string;
  transactionId?: string;
  bookingId?: string;
  facilityId?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency?: string;
  dueDate: Date;
  notes?: string;
  terms?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface InvoiceFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  facilityId?: string;
  search?: string;
}

class InvoiceService {
  // Create a new invoice
  async createInvoice(data: CreateInvoiceData): Promise<InvoiceDocument> {
    try {
      // Get company and user information
      const company = await CompanyModel.findById(data.companyId);
      const user = await UserModel.findById(data.userId);
      
      if (!company || !user) {
        throw new Error("Company or user not found");
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(company);

      // Prepare customer info
      const customerInfo = data.customerInfo || {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: "",
      };

      // Prepare company info
      const companyInfo = {
        name: company.name,
        address: company.location || "",
        phone: company.contactPhone || "",
        email: company.contactEmail || "",
        logo: company.logo,
        taxId: "",
      };

      // Calculate item amounts
      const items = data.items.map(item => ({
        ...item,
        amount: item.quantity * item.unitPrice,
        tax: item.taxRate ? (item.quantity * item.unitPrice * item.taxRate) / 100 : 0,
      }));

      const invoice = new InvoiceModel({
        invoiceNumber,
        company: data.companyId,
        user: data.userId,
        transaction: data.transactionId,
        booking: data.bookingId,
        facility: data.facilityId,
        items,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        discountAmount: data.discountAmount,
        totalAmount: data.totalAmount,
        currency: data.currency || "GHS",
        dueDate: data.dueDate,
        notes: data.notes,
        terms: data.terms,
        customerInfo,
        companyInfo,
      });

      const savedInvoice = await invoice.save();
      
      // Send invoice creation notification
      try {
        await notificationService.createInvoiceNotification(savedInvoice._id.toString(), "created");
      } catch (error) {
        console.error("Failed to send invoice creation notification:", error);
      }
      
      return savedInvoice;
    } catch (error) {
      throw new Error(`Error creating invoice: ${error.message}`);
    }
  }

  // Get all invoices for a company
  async getCompanyInvoices(
    companyId: string,
    filters: InvoiceFilters = {},
    page = 1,
    limit = 10
  ): Promise<{ invoices: InvoiceDocument[]; total: number; pages: number }> {
    try {
      const query: any = { company: companyId, isDeleted: false };

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.userId) query.user = filters.userId;
      if (filters.facilityId) query.facility = filters.facilityId;
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = filters.startDate;
        if (filters.endDate) query.createdAt.$lte = filters.endDate;
      }
      if (filters.search) {
        query.$or = [
          { invoiceNumber: { $regex: filters.search, $options: "i" } },
          { "customerInfo.name": { $regex: filters.search, $options: "i" } },
          { "customerInfo.email": { $regex: filters.search, $options: "i" } },
        ];
      }

      const total = await InvoiceModel.countDocuments(query);
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const invoices = await InvoiceModel.find(query)
        .populate("user", "name email phone")
        .populate("facility", "name description")
        .populate("booking", "startDate endDate")
        .populate("transaction", "ref amount status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return { invoices, total, pages };
    } catch (error) {
      throw new Error(`Error fetching company invoices: ${error.message}`);
    }
  }

  // Get user invoices
  async getUserInvoices(
    userId: string,
    filters: InvoiceFilters = {},
    page = 1,
    limit = 10
  ): Promise<{ invoices: InvoiceDocument[]; total: number; pages: number }> {
    try {
      const query: any = { user: userId, isDeleted: false };

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.facilityId) query.facility = filters.facilityId;
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = filters.startDate;
        if (filters.endDate) query.createdAt.$lte = filters.endDate;
      }

      const total = await InvoiceModel.countDocuments(query);
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const invoices = await InvoiceModel.find(query)
        .populate("company", "name logo")
        .populate("facility", "name description")
        .populate("booking", "startDate endDate")
        .populate("transaction", "ref amount status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return { invoices, total, pages };
    } catch (error) {
      throw new Error(`Error fetching user invoices: ${error.message}`);
    }
  }

  // Get invoice by ID
  async getInvoiceById(invoiceId: string): Promise<InvoiceDocument | null> {
    try {
      if (!Types.ObjectId.isValid(invoiceId)) {
        throw new Error("Invalid invoice ID");
      }

      return await InvoiceModel.findOne({ _id: invoiceId, isDeleted: false })
        .populate("user", "name email phone address")
        .populate("company", "name logo contactEmail contactPhone location")
        .populate("facility", "name description location")
        .populate("booking", "startDate endDate duration totalPrice")
        .populate("transaction", "ref amount status method");
    } catch (error) {
      throw new Error(`Error fetching invoice: ${error.message}`);
    }
  }

  // Update invoice status
  async updateInvoiceStatus(
    invoiceId: string,
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled",
    paidDate?: Date,
    paymentMethod?: string
  ): Promise<InvoiceDocument | null> {
    try {
      const updateData: any = { status };
      
      if (status === "paid" && paidDate) {
        updateData.paidDate = paidDate;
        updateData.paymentMethod = paymentMethod;
      }

      const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
        invoiceId,
        updateData,
        { new: true }
      ).populate("user company facility booking transaction");
      
      if (updatedInvoice) {
        // Send notifications based on status change
        try {
          if (status === "paid") {
            await notificationService.createInvoiceNotification(invoiceId, "paid");
          } else if (status === "overdue") {
            await notificationService.createInvoiceNotification(invoiceId, "overdue");
          }
        } catch (error) {
          console.error("Failed to send invoice status notification:", error);
        }
      }
      
      return updatedInvoice;
    } catch (error) {
      throw new Error(`Error updating invoice status: ${error.message}`);
    }
  }

  // Generate PDF invoice
  async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("INVOICE", { align: "center" })
        .moveDown();

      // Company and customer info
      doc.fontSize(12);
      
      // Company info (left side)
      doc.font("Helvetica-Bold").text(invoice.companyInfo.name);
      doc.font("Helvetica").text(invoice.companyInfo.address);
      doc.text(`Phone: ${invoice.companyInfo.phone}`);
      doc.text(`Email: ${invoice.companyInfo.email}`);
      if (invoice.companyInfo.taxId) {
        doc.text(`Tax ID: ${invoice.companyInfo.taxId}`);
      }

      // Customer info (right side)
      doc.font("Helvetica-Bold").text("Bill To:", { align: "right" });
      doc.font("Helvetica").text(invoice.customerInfo.name, { align: "right" });
      doc.text(invoice.customerInfo.email, { align: "right" });
      if (invoice.customerInfo.phone) {
        doc.text(`Phone: ${invoice.customerInfo.phone}`, { align: "right" });
      }
      if (invoice.customerInfo.address) {
        doc.text(invoice.customerInfo.address, { align: "right" });
      }

      doc.moveDown(2);

      // Invoice details
      doc.font("Helvetica-Bold").text(`Invoice #: ${invoice.invoiceNumber}`);
      doc.font("Helvetica").text(`Issue Date: ${invoice.issueDate.toLocaleDateString()}`);
      doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
      doc.text(`Status: ${invoice.status.toUpperCase()}`);

      doc.moveDown(2);

      // Items table
      const tableTop = doc.y;
      const itemCodeX = 50;
      const descriptionX = 150;
      const quantityX = 350;
      const unitPriceX = 420;
      const amountX = 500;

      // Table headers
      doc.font("Helvetica-Bold");
      doc.text("Item", itemCodeX, tableTop);
      doc.text("Description", descriptionX, tableTop);
      doc.text("Qty", quantityX, tableTop);
      doc.text("Unit Price", unitPriceX, tableTop);
      doc.text("Amount", amountX, tableTop);

      doc.moveDown();

      // Table rows
      let currentY = doc.y;
      doc.font("Helvetica");

      invoice.items.forEach((item, index) => {
        doc.text(`${index + 1}`, itemCodeX, currentY);
        doc.text(item.description, descriptionX, currentY);
        doc.text(item.quantity.toString(), quantityX, currentY);
        doc.text(`${invoice.currency} ${item.unitPrice.toFixed(2)}`, unitPriceX, currentY);
        doc.text(`${invoice.currency} ${item.amount.toFixed(2)}`, amountX, currentY);
        currentY += 20;
      });

      doc.moveDown(2);

      // Totals
      const totalsY = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Subtotal:", 400, totalsY);
      doc.text(`${invoice.currency} ${invoice.subtotal.toFixed(2)}`, 500, totalsY);

      if (invoice.taxAmount > 0) {
        doc.font("Helvetica").text("Tax:", 400, totalsY + 20);
        doc.text(`${invoice.currency} ${invoice.taxAmount.toFixed(2)}`, 500, totalsY + 20);
      }

      if (invoice.discountAmount > 0) {
        doc.font("Helvetica").text("Discount:", 400, totalsY + 40);
        doc.text(`-${invoice.currency} ${invoice.discountAmount.toFixed(2)}`, 500, totalsY + 40);
      }

      doc.font("Helvetica-Bold").text("Total:", 400, totalsY + 60);
      doc.text(`${invoice.currency} ${invoice.totalAmount.toFixed(2)}`, 500, totalsY + 60);

      // Notes and terms
      if (invoice.notes) {
        doc.moveDown(2);
        doc.font("Helvetica-Bold").text("Notes:");
        doc.font("Helvetica").text(invoice.notes);
      }

      if (invoice.terms) {
        doc.moveDown(2);
        doc.font("Helvetica-Bold").text("Terms & Conditions:");
        doc.font("Helvetica").text(invoice.terms);
      }

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
        doc.on("error", reject);
      });
    } catch (error) {
      throw new Error(`Error generating invoice PDF: ${error.message}`);
    }
  }

  // Generate receipt PDF
  async generateReceiptPDF(invoiceId: string): Promise<Buffer> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status !== "paid") {
        throw new Error("Cannot generate receipt for unpaid invoice");
      }

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("RECEIPT", { align: "center" })
        .moveDown();

      // Company and customer info
      doc.fontSize(12);
      
      // Company info (left side)
      doc.font("Helvetica-Bold").text(invoice.companyInfo.name);
      doc.font("Helvetica").text(invoice.companyInfo.address);
      doc.text(`Phone: ${invoice.companyInfo.phone}`);
      doc.text(`Email: ${invoice.companyInfo.email}`);

      // Customer info (right side)
      doc.font("Helvetica-Bold").text("Paid By:", { align: "right" });
      doc.font("Helvetica").text(invoice.customerInfo.name, { align: "right" });
      doc.text(invoice.customerInfo.email, { align: "right" });

      doc.moveDown(2);

      // Receipt details
      doc.font("Helvetica-Bold").text(`Receipt #: ${invoice.invoiceNumber}`);
      doc.font("Helvetica").text(`Invoice #: ${invoice.invoiceNumber}`);
      doc.text(`Payment Date: ${invoice.paidDate?.toLocaleDateString()}`);
      doc.text(`Payment Method: ${invoice.paymentMethod || "N/A"}`);

      doc.moveDown(2);

      // Payment summary
      doc.font("Helvetica-Bold").text("Payment Summary:");
      doc.font("Helvetica").text(`Amount Paid: ${invoice.currency} ${invoice.totalAmount.toFixed(2)}`);
      doc.text(`Payment Status: PAID`);

      // Notes
      if (invoice.notes) {
        doc.moveDown(2);
        doc.font("Helvetica-Bold").text("Notes:");
        doc.font("Helvetica").text(invoice.notes);
      }

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
        doc.on("error", reject);
      });
    } catch (error) {
      throw new Error(`Error generating receipt PDF: ${error.message}`);
    }
  }

  // Get invoice statistics
  async getInvoiceStats(companyId: string): Promise<{
    total: number;
    paid: number;
    overdue: number;
    pending: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
  }> {
    try {
      const stats = await InvoiceModel.aggregate([
        { $match: { company: new Types.ObjectId(companyId), isDeleted: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
            paid: {
              $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
            },
            paidAmount: {
              $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0] },
            },
            overdue: {
              $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] },
            },
            overdueAmount: {
              $sum: { $cond: [{ $eq: ["$status", "overdue"] }, "$totalAmount", 0] },
            },
            pending: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["draft", "sent"]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        total: 0,
        paid: 0,
        overdue: 0,
        pending: 0,
        totalAmount: 0,
        paidAmount: 0,
        overdueAmount: 0,
      };

      return result;
    } catch (error) {
      throw new Error(`Error fetching invoice statistics: ${error.message}`);
    }
  }

  // Create invoice from transaction
  async createInvoiceFromTransaction(transactionId: string): Promise<InvoiceDocument> {
    try {
      const transaction = await TransactionModel.findById(transactionId)
        .populate("user", "name email phone address")
        .populate("company", "name logo contactEmail contactPhone location taxId")
        .populate("facility", "name description")
        .populate("booking", "startDate endDate duration totalPrice");

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      const invoiceData: CreateInvoiceData = {
        companyId: transaction.company.toString(),
        userId: transaction.user.toString(),
        transactionId: transaction._id.toString(),
        facilityId: transaction.facility?.toString(),
        bookingId: transaction.booking?.toString(),
        items: [
          {
            description: transaction.description || "Payment",
            quantity: 1,
            unitPrice: transaction.amount / 100, // Convert from kobo
            taxRate: 0,
          },
        ],
        subtotal: transaction.amount / 100,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: transaction.amount / 100,
        currency: "GHS",
        dueDate,
        customerInfo: {
          name: (transaction.user as any).name,
          email: (transaction.user as any).email,
          phone: (transaction.user as any).phone || "",
          address: "",
        },
      };

      const invoice = await this.createInvoice(invoiceData);

      // Update invoice status to paid if transaction is successful
      if ((transaction as any).status === "success") {
        await this.updateInvoiceStatus(
          invoice._id.toString(),
          "paid",
          transaction.createdAt,
          transaction.method
        );
      }

      return invoice;
    } catch (error) {
      throw new Error(`Error creating invoice from transaction: ${error.message}`);
    }
  }
}

export const invoiceService = new InvoiceService();