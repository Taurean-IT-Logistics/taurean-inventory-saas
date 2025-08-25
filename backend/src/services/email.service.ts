import nodemailer from "nodemailer";
import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";
import { BookingModel } from "../models/booking.model";
import { TransactionModel } from "../models/transaction.model";
import { emitEvent } from "../realtime/socket";
import { Events } from "../realtime/events";
import { ReactEmailRenderer, EmailTemplateData } from "../emails/ReactEmailRenderer";
import { CONFIG } from "../config";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailContext {
  company: any;
  user?: any;
  recipient?: any;
  data?: any;
  baseUrl?: string;
  content?: string;
  resetLink?: string;
  booking?: any;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: EmailContext;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
  companyId?: string; // For company-specific email configurations
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
      },
    };

    if (config.auth.user && config.auth.pass) {
      this.transporter = nodemailer.createTransport(config);
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn("Email transporter not configured. Email not sent.");
      return false;
    }

    try {
      // Prepare data for React Email rendering
      const emailData: EmailTemplateData = {
        company: options.context.company,
        user: options.context.user,
        recipient: options.context.recipient,
        data: options.context.data,
        baseUrl: CONFIG.FRONTEND_BASE_URL,
        resetLink: options.context.resetLink,
        booking: options.context.booking,
      };

      // Render email using React Email
      let htmlContent: string;
      
      try {
        htmlContent = await ReactEmailRenderer.renderEmail(options.template, emailData);
      } catch (error) {
        console.error(`Failed to render React Email template '${options.template}':`, error);
        throw new Error(`Email template '${options.template}' not found or failed to render`);
      }

      // Get company-specific email settings if companyId is provided
      let fromName = "Taurean IT Logistics";
      let fromEmail =
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        "noreply@taureanitlogistics.com";

      if (options.companyId) {
        try {
          const company = await CompanyModel.findById(options.companyId)
            .select("emailSettings name")
            .lean();
          if (company && (company as any).emailSettings) {
            const emailSettings = (company as any).emailSettings;
            if (emailSettings.customFromName) {
              fromName = emailSettings.customFromName;
            }
            if (emailSettings.customFromEmail) {
              fromEmail = emailSettings.customFromEmail;
            }
          }
        } catch (error) {
          console.warn("Failed to get company email settings:", error);
        }
      }

      const mailOptions = {
        from: {
          name: fromName,
          address: fromEmail,
        },
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: htmlContent,
        attachments: options.attachments || [],
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);

      // Emit real-time email delivery success event
      try {
        const companyId =
          options.context?.company?._id ||
          options.context?.company?.id ||
          undefined;
        const userId =
          options.context?.user?._id ||
          options.context?.user?.id ||
          undefined;
        const payload = {
          status: "sent",
          messageId: info.messageId,
          to: options.to,
          subject: options.subject,
          template: options.template,
          timestamp: new Date().toISOString(),
        };
        if (companyId)
          emitEvent(Events.EmailSent, payload, `company:${companyId}`);
        if (userId) emitEvent(Events.EmailSent, payload, `user:${userId}`);
      } catch (emitError) {
        console.error("Failed to emit email success event:", emitError);
      }

      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      // Emit real-time email delivery failure event
      try {
        const companyId =
          options.context?.company?._id ||
          options.context?.company?.id ||
          undefined;
        const userId =
          options.context?.user?._id ||
          options.context?.user?.id ||
          undefined;
        const payload = {
          status: "failed",
          error: (error as any)?.message || "unknown",
          to: options.to,
          subject: options.subject,
          template: options.template,
          timestamp: new Date().toISOString(),
        };
        if (companyId)
          emitEvent(Events.EmailFailed, payload, `company:${companyId}`);
        if (userId) emitEvent(Events.EmailFailed, payload, `user:${userId}`);
      } catch (emitError) {
        console.error("Failed to emit email failure event:", emitError);
      }
      return false;
    }
  }

  // Convenience methods for common email types
  public async sendWelcomeEmail(
    userId: string,
    companyId: string
  ): Promise<boolean> {
    const user = await UserModel.findById(userId).lean();
    const company = await CompanyModel.findById(companyId).lean();

    if (!user || !company) return false;

    return this.sendEmail({
      to: user.email,
      subject: `Welcome to ${company.name}!`,
      template: "welcome",
      context: { company, user },
    });
  }

  public async sendBookingConfirmation(bookingId: string): Promise<boolean> {
    try {
      const booking = await BookingModel.findById(bookingId)
        .populate("user")
        .populate("facility")
        .populate("company")
        .lean();

      if (!booking) return false;

      const user = booking.user as any;
      const facility = booking.facility as any;
      const company = (booking as any).company;

      return this.sendEmail({
        to: user.email,
        subject: `Booking Confirmed - ${facility.name}`,
        template: "booking-confirmation",
        context: {
          company,
          user,
          booking: {
            id: booking._id.toString(),
            facilityName: facility.name,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalAmount: parseFloat((booking as any).totalAmount?.toFixed(2) || "0.00"),
            currency: (booking as any).currency || "GHS",
            status: "confirmed",
          },
        },
      });
    } catch (error) {
      console.error("Failed to send booking confirmation email:", error);
      return false;
    }
  }

  public async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
    ipAddress: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findOne({ email: userEmail })
        .populate("company")
        .lean();
      if (!user) return false;

      const company = user.company as any;
      const resetLink = `${CONFIG.FRONTEND_BASE_URL}/auth/reset-password?token=${resetToken}`;

      return this.sendEmail({
        to: userEmail,
        subject: `Password Reset Request - ${company?.name || "Your Account"}`,
        template: "password-reset",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          user,
          resetLink,
        },
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return false;
    }
  }

  public async sendAccountVerificationEmail(
    userEmail: string,
    verificationToken: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findOne({ email: userEmail })
        .populate("company")
        .lean();
      if (!user) return false;

      const company = user.company as any;
      const verificationLink = `${CONFIG.FRONTEND_BASE_URL}/auth/verify-email?token=${verificationToken}`;

      return this.sendEmail({
        to: userEmail,
        subject: `Verify Your Email - ${company?.name || "Your Account"}`,
        template: "account-verification",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          user,
          data: {
            verificationLink,
            registrationDate: new Date(user.createdAt).toLocaleDateString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send account verification email:", error);
      return false;
    }
  }

  public async sendCustomEmail(
    to: string,
    subject: string,
    message: string,
    companyId?: string
  ): Promise<boolean> {
    try {
      const company = companyId 
        ? await CompanyModel.findById(companyId).lean()
        : { name: "Taurean IT Logistics" };

      return this.sendEmail({
        to,
        subject,
        template: "custom",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          data: { message },
        },
      });
    } catch (error) {
      console.error("Failed to send custom email:", error);
      return false;
    }
  }

  public async sendBookingReminder(bookingId: string): Promise<boolean> {
    try {
      const booking = await BookingModel.findById(bookingId)
        .populate("user")
        .populate("facility")
        .populate("company")
        .lean();

      if (!booking) return false;

      const user = booking.user as any;
      const facility = booking.facility as any;
      const company = (booking as any).company;

      return this.sendEmail({
        to: user.email,
        subject: `Booking Reminder - ${facility.name}`,
        template: "booking-reminder",
        context: {
          company,
          user,
          data: {
            facilityName: facility.name,
            startDate: new Date(booking.startDate).toLocaleDateString(),
            startTime: new Date(booking.startDate).toLocaleTimeString(),
            duration: Math.ceil(
              (new Date(booking.endDate).getTime() -
                new Date(booking.startDate).getTime()) /
                (1000 * 60 * 60)
            ),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send booking reminder email:", error);
      return false;
    }
  }

  public async sendPaymentSuccessEmail(transactionId: string): Promise<boolean> {
    try {
      const transaction = await TransactionModel.findById(transactionId)
        .populate("user")
        .populate("company")
        .lean();

      if (!transaction) return false;

      const user = transaction.user as any;
      const company = (transaction as any).company;

      return this.sendEmail({
        to: user.email,
        subject: `Payment Successful - ${company?.name || "Your Account"}`,
        template: "payment-success",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          user,
          data: {
            amount: transaction.amount,
            currency: "GHS", // Default to GHS since transaction doesn't store currency
            transactionId: transaction._id,
            date: new Date(transaction.createdAt).toLocaleDateString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send payment success email:", error);
      return false;
    }
  }

  public async sendPaymentFailedEmail(
    userEmail: string,
    amount: number,
    currency: string,
    reason: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findOne({ email: userEmail })
        .populate("company")
        .lean();

      if (!user) return false;

      const company = user.company as any;

      return this.sendEmail({
        to: userEmail,
        subject: `Payment Failed - ${company?.name || "Your Account"}`,
        template: "payment-failed",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          user,
          data: {
            amount,
            currency,
            reason,
            date: new Date().toLocaleDateString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send payment failed email:", error);
      return false;
    }
  }

  public async sendSupportTicketCreatedEmail(
    ticketId: string,
    subject: string,
    type: string,
    priority: string,
    userId: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId).lean();
      if (!user) return false;

      return this.sendEmail({
        to: user.email,
        subject: `New Support Ticket Created - ${subject}`,
        template: "support-ticket-created",
        context: {
          company: user.company,
          user,
          data: {
            id: ticketId,
            subject,
            type,
            priority,
            user: {
              name: user.name,
              email: user.email,
            },
            createdAt: new Date().toLocaleDateString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send support ticket created email:", error);
      return false;
    }
  }

  public async sendInvoiceEmail(invoice: any): Promise<boolean> {
    try {
      const user = await UserModel.findById(invoice.user).lean();
      const company = await CompanyModel.findById(invoice.company).lean();

      if (!user || !company) return false;

      return this.sendEmail({
        to: user.email,
        subject: `Invoice #${invoice.invoiceNumber} - ${company.name}`,
        template: "invoice",
        context: {
          company,
          user,
          data: {
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            totalAmount: invoice.totalAmount.toFixed(2),
            subtotal: invoice.subtotal.toFixed(2),
            taxAmount: invoice.taxAmount?.toFixed(2) || "0.00",
            discountAmount: invoice.discountAmount?.toFixed(2) || "0.00",
            currency: invoice.currency,
            dueDate: new Date(invoice.dueDate).toLocaleDateString(),
            status: invoice.status,
          },
        },
        companyId: company._id.toString(),
      });
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      return false;
    }
  }

  public async sendSubscriptionExpiryEmail(
    companyId: string,
    daysRemaining: number
  ): Promise<boolean> {
    try {
      const company = await CompanyModel.findById(companyId)
        .populate("owner")
        .lean();

      if (!company) return false;

      const owner = (company as any).owner;

      return this.sendEmail({
        to: owner.email,
        subject: `Subscription Expiring Soon - ${company.name}`,
        template: "subscription-expiry",
        context: {
          company,
          user: owner,
          data: {
            daysRemaining,
            expiryDate: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send subscription expiry email:", error);
      return false;
    }
  }

  public async testEmailConfiguration(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email configuration test failed:", error);
      return false;
    }
  }

  public async testCompanyEmailConfiguration(companyId: string): Promise<{
    configured: boolean;
    companySettings?: any;
    error?: string;
    hasCustomSettings?: boolean;
  }> {
    try {
      const company = await CompanyModel.findById(companyId)
        .select("emailSettings name")
        .lean();

      if (!company) {
        return { configured: false, error: "Company not found" };
      }

      const emailSettings = (company as any).emailSettings;

      // Test basic email configuration
      const basicTest = await this.testEmailConfiguration();
      if (!basicTest) {
        return {
          configured: false,
          companySettings: emailSettings,
          error: "Basic email configuration failed",
        };
      }

      // Check if company has custom email settings
      const hasCustomSettings =
        emailSettings &&
        (emailSettings.customFromName ||
          emailSettings.customFromEmail ||
          emailSettings.emailSignature);

      return {
        configured: true,
        companySettings: emailSettings,
        hasCustomSettings,
      };
    } catch (error: any) {
      return {
        configured: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export individual methods for easy import
export const {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendPasswordResetEmail,
  sendAccountVerificationEmail,
  sendCustomEmail,
  sendBookingReminder,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendSupportTicketCreatedEmail,
  sendInvoiceEmail,
  sendSubscriptionExpiryEmail,
  testEmailConfiguration,
  testCompanyEmailConfiguration,
} = emailService;