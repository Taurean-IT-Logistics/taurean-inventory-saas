import nodemailer from "nodemailer";
import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";
import { BookingModel } from "../models/booking.model";
import { TransactionModel } from "../models/transaction.model";
import { emitEvent } from "../realtime/socket";
import { Events } from "../realtime/events";
import {
  ReactEmailRenderer,
  EmailTemplateData,
} from "../emails/ReactEmailRenderer";
import { CONFIG } from "../config";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  connectionTimeout?: number;
  greetingTimeout?: number;
  socketTimeout?: number;
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
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
  companyId?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Validate environment variables first
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ Email service not configured: Missing credentials");
        console.warn("Required environment variables:");
        console.warn("  - EMAIL_USER: Your email address");
        console.warn("  - EMAIL_PASS: Your email password or app password");
        console.warn("  - EMAIL_HOST: SMTP host (default: smtp.gmail.com)");
        console.warn("  - EMAIL_PORT: SMTP port (default: 587)");
        this.isConfigured = false;
        return;
      }

      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      };

      // Create transporter
      this.transporter = nodemailer.createTransport(config);

      // Verify connection (but don't block initialization)
      this.transporter
        .verify()
        .then(() => {
          console.log("✅ Email service is ready");
          this.isConfigured = true;
        })
        .catch((error) => {
          console.error("❌ Email service verification failed:", error.message);

          // Provide specific troubleshooting advice
          if (error.message.includes("Invalid login")) {
            console.error("\n📧 Gmail Authentication Failed:");
            console.error(
              "  1. Enable 2-Factor Authentication on your Gmail account"
            );
            console.error(
              "  2. Generate an App Password: https://myaccount.google.com/apppasswords"
            );
            console.error(
              "  3. Use the App Password (not your regular password) in EMAIL_PASS"
            );
          } else if (
            error.message.includes("ECONNECTION") ||
            error.message.includes("ETIMEDOUT")
          ) {
            console.error("\n🌐 Connection Failed:");
            console.error("  1. Check your internet connection");
            console.error(
              "  2. Verify firewall isn't blocking port",
              config.port
            );
            console.error("  3. Confirm SMTP host is correct:", config.host);
          } else if (error.message.includes("self signed certificate")) {
            console.error("\n🔒 SSL Certificate Error:");
            console.error("  Try setting: EMAIL_SECURE=false");
          }

          this.isConfigured = false;
        });
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
      this.isConfigured = false;
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn("⚠️ Email transporter not configured. Cannot send email.");
      return false;
    }

    try {
      // Prepare data for React Email rendering
      const emailData: EmailTemplateData = {
        company: options.context.company,
        user: options.context.user,
        recipient: options.context.recipient,
        data: options.context.data,
        baseUrl: CONFIG.FRONTEND_BASE_URL || "http://localhost:3000",
        resetLink: options.context.resetLink,
        booking: options.context.booking,
      };

      // Render email using React Email
      let htmlContent: string;
      try {
        htmlContent = await ReactEmailRenderer.renderEmail(
          options.template,
          emailData
        );
      } catch (renderError) {
        console.error(
          `❌ Failed to render email template '${options.template}':`,
          renderError
        );
        throw new Error(
          `Email template '${options.template}' not found or failed to render`
        );
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
            fromName = emailSettings.customFromName || company.name || fromName;
            fromEmail = emailSettings.customFromEmail || fromEmail;
          }
        } catch (error) {
          console.warn("⚠️ Failed to get company email settings:", error);
        }
      }

      // Prepare mail options
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

      // Retry mechanism with exponential backoff
      let lastError: any;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const info = await this.transporter.sendMail(mailOptions);

          console.log(`✅ Email sent successfully: ${info.messageId}`);

          // Emit success event
          this.emitEmailEvent(options, "sent", info.messageId);

          return true;
        } catch (sendError: any) {
          lastError = sendError;
          console.error(
            `❌ Email send attempt ${attempt}/${maxRetries} failed:`,
            sendError.message
          );

          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Retrying in ${delay / 1000}s...`);
            await this.sleep(delay);
          }
        }
      }

      // All retries failed
      throw lastError;
    } catch (error: any) {
      console.error("❌ Failed to send email:", error.message);

      // Emit failure event
      this.emitEmailEvent(options, "failed", undefined, error.message);

      return false;
    }
  }

  private emitEmailEvent(
    options: EmailOptions,
    status: "sent" | "failed",
    messageId?: string,
    errorMessage?: string
  ): void {
    try {
      const companyId =
        options.context?.company?._id || options.context?.company?.id;
      const userId = options.context?.user?._id || options.context?.user?.id;

      const payload = {
        status,
        messageId,
        error: errorMessage,
        to: options.to,
        subject: options.subject,
        template: options.template,
        timestamp: new Date().toISOString(),
      };

      if (companyId) {
        emitEvent(
          status === "sent" ? Events.EmailSent : Events.EmailFailed,
          payload,
          `company:${companyId}`
        );
      }

      if (userId) {
        emitEvent(
          status === "sent" ? Events.EmailSent : Events.EmailFailed,
          payload,
          `user:${userId}`
        );
      }
    } catch (error) {
      console.error("⚠️ Failed to emit email event:", error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Convenience methods for common email types
  public async sendWelcomeEmail(
    userId: string,
    companyId: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId).lean();
      const company = await CompanyModel.findById(companyId).lean();

      if (!user || !company) {
        console.warn("⚠️ User or company not found for welcome email");
        return false;
      }

      return this.sendEmail({
        to: user.email,
        subject: `Welcome to ${company.name}!`,
        template: "welcome",
        context: { company, user },
        companyId,
      });
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
      return false;
    }
  }

  public async sendBookingSubmitted(bookingId: string): Promise<boolean> {
    try {
      const booking = await BookingModel.findById(bookingId)
        .populate("user")
        .populate("facility")
        .populate("company")
        .lean();

      if (!booking) {
        console.warn("⚠️ Booking not found");
        return false;
      }

      const user = booking.user as any;
      const facility = booking.facility as any;
      const company = (booking as any).company;

      if (!user?.email) {
        console.warn("⚠️ User email not found for booking");
        return false;
      }

      return this.sendEmail({
        to: user.email,
        subject: `Booking Request Submitted - ${facility.name}`,
        template: "booking-submitted",
        context: {
          company,
          user,
          booking: {
            id: booking._id.toString(),
            facilityName: facility.name,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalAmount: parseFloat(
              (booking as any).totalAmount?.toFixed(2) || "0.00"
            ),
            currency: (booking as any).currency || "GHS",
            status: "pending",
          },
        },
        companyId: company?._id?.toString(),
      });
    } catch (error) {
      console.error("❌ Failed to send booking submitted email:", error);
      return false;
    }
  }

  public async sendBookingConfirmation(bookingId: string): Promise<boolean> {
    try {
      const booking = await BookingModel.findById(bookingId)
        .populate("user")
        .populate("facility")
        .populate("company")
        .lean();

      if (!booking) {
        console.warn("⚠️ Booking not found");
        return false;
      }

      const user = booking.user as any;
      const facility = booking.facility as any;
      const company = (booking as any).company;

      if (!user?.email) {
        console.warn("⚠️ User email not found");
        return false;
      }

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
            totalAmount: parseFloat(
              (booking as any).totalAmount?.toFixed(2) || "0.00"
            ),
            currency: (booking as any).currency || "GHS",
            status: "confirmed",
          },
        },
        companyId: company?._id?.toString(),
      });
    } catch (error) {
      console.error("❌ Failed to send booking confirmation email:", error);
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

      if (!user) {
        console.warn("⚠️ User not found for password reset");
        return false;
      }

      const company = user.company as any;
      const resetLink = `${CONFIG.FRONTEND_BASE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

      return this.sendEmail({
        to: userEmail,
        subject: `Password Reset Request - ${company?.name || "Your Account"}`,
        template: "password-reset",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          user,
          resetLink,
          data: { ipAddress },
        },
      });
    } catch (error) {
      console.error("❌ Failed to send password reset email:", error);
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

      if (!user) {
        console.warn("⚠️ User not found for account verification");
        return false;
      }

      const company = user.company as any;
      const verificationLink = `${CONFIG.FRONTEND_BASE_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

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
      console.error("❌ Failed to send account verification email:", error);
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
        companyId,
      });
    } catch (error) {
      console.error("❌ Failed to send custom email:", error);
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

      if (!booking || !(booking.user as any)?.email) {
        console.warn("⚠️ Booking or user not found for reminder");
        return false;
      }

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
        companyId: company?._id?.toString(),
      });
    } catch (error) {
      console.error("❌ Failed to send booking reminder email:", error);
      return false;
    }
  }

  public async sendPaymentSuccessEmail(
    transactionId: string
  ): Promise<boolean> {
    try {
      const transaction = await TransactionModel.findById(transactionId)
        .populate("user")
        .populate("company")
        .lean();

      if (!transaction || !(transaction.user as any)?.email) {
        console.warn("⚠️ Transaction or user not found");
        return false;
      }

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
            currency: (transaction as any).currency || "GHS",
            transactionId: transaction._id,
            date: new Date(transaction.createdAt).toLocaleDateString(),
          },
        },
        companyId: company?._id?.toString(),
      });
    } catch (error) {
      console.error("❌ Failed to send payment success email:", error);
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

      if (!user) {
        console.warn("⚠️ User not found for payment failed email");
        return false;
      }

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
      console.error("❌ Failed to send payment failed email:", error);
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
      const user = await UserModel.findById(userId).populate("company").lean();

      if (!user) {
        console.warn("⚠️ User not found for support ticket");
        return false;
      }

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
      console.error("❌ Failed to send support ticket created email:", error);
      return false;
    }
  }

  public async sendInvoiceEmail(invoice: any): Promise<boolean> {
    try {
      const user = await UserModel.findById(invoice.user).lean();
      const company = await CompanyModel.findById(invoice.company).lean();

      if (!user || !company) {
        console.warn("⚠️ User or company not found for invoice");
        return false;
      }

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
      console.error("❌ Failed to send invoice email:", error);
      return false;
    }
  }

  public async sendSubscriptionActivationEmail(
    companyId: string,
    subscriptionData: {
      plan: string;
      licenseKey: string;
      expiresAt: Date;
      amount: number;
      currency: string;
    }
  ): Promise<boolean> {
    try {
      const company = await CompanyModel.findById(companyId)
        .populate("owner")
        .lean();

      if (!company || !(company as any).owner) {
        console.warn("⚠️ Company or owner not found");
        return false;
      }

      const owner = (company as any).owner;

      return this.sendEmail({
        to: owner.email,
        subject: `Subscription Activated - ${company.name}`,
        template: "subscription-activation",
        context: {
          company,
          user: owner,
          data: {
            plan: subscriptionData.plan,
            licenseKey: subscriptionData.licenseKey,
            expiresAt: subscriptionData.expiresAt.toLocaleDateString(),
            amount: subscriptionData.amount,
            currency: subscriptionData.currency,
            features: this.getPlanFeatures(subscriptionData.plan),
          },
        },
        companyId,
      });
    } catch (error) {
      console.error("❌ Failed to send subscription activation email:", error);
      return false;
    }
  }

  private getPlanFeatures(plan: string): string[] {
    const planFeatures = {
      basic: [
        "Up to 5 facilities",
        "Basic inventory management",
        "User management",
        "Basic reporting",
        "Email support",
      ],
      premium: [
        "Up to 20 facilities",
        "Advanced inventory management",
        "Advanced user management",
        "Advanced reporting & analytics",
        "Priority support",
        "API access",
      ],
      enterprise: [
        "Unlimited facilities",
        "Enterprise inventory management",
        "Advanced user management & roles",
        "Custom reporting & analytics",
        "24/7 dedicated support",
        "Full API access",
        "Custom integrations",
        "White-label options",
      ],
    };

    return (
      planFeatures[plan as keyof typeof planFeatures] || planFeatures.basic
    );
  }

  public async sendSubscriptionExpiryEmail(
    companyId: string,
    daysRemaining: number
  ): Promise<boolean> {
    try {
      const company = await CompanyModel.findById(companyId)
        .populate("owner")
        .lean();

      if (!company || !(company as any).owner) {
        console.warn("⚠️ Company or owner not found");
        return false;
      }

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
            expiryDate: new Date(
              Date.now() + daysRemaining * 24 * 60 * 60 * 1000
            ).toLocaleDateString(),
          },
        },
        companyId,
      });
    } catch (error) {
      console.error("❌ Failed to send subscription expiry email:", error);
      return false;
    }
  }

  public async testEmailConfiguration(): Promise<boolean> {
    if (!this.transporter) {
      console.warn("⚠️ Email transporter not initialized");
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✅ Email configuration test passed");
      return true;
    } catch (error: any) {
      console.error("❌ Email configuration test failed:", error.message);
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

  /**
   * Get email service diagnostics
   */
  public getEmailDiagnostics(): {
    configured: boolean;
    isConfigured: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    hasCredentials: boolean;
    hasTransporter: boolean;
  } {
    return {
      configured: this.isConfigured,
      isConfigured: this.isConfigured,
      smtpHost: process.env.EMAIL_HOST || "smtp.gmail.com",
      smtpPort: parseInt(process.env.EMAIL_PORT || "587", 10),
      smtpUser: process.env.EMAIL_USER || "",
      smtpSecure: process.env.EMAIL_SECURE === "true",
      hasCredentials: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      hasTransporter: !!this.transporter,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export individual methods for easy import
export const {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendBookingSubmitted,
  sendPasswordResetEmail,
  sendAccountVerificationEmail,
  sendCustomEmail,
  sendBookingReminder,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendSupportTicketCreatedEmail,
  sendInvoiceEmail,
  sendSubscriptionExpiryEmail,
  sendSubscriptionActivationEmail,
  testEmailConfiguration,
  testCompanyEmailConfiguration,
  getEmailDiagnostics,
} = emailService;
