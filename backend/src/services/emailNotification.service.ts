import nodemailer from "nodemailer";
import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { NotificationLogModel } from "../models/notificationLog.model";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailNotificationService {
  private transporter: nodemailer.Transporter;
  private static instance: EmailNotificationService;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  /**
   * Send email notification
   */
  public async sendEmailNotification(
    userId: string,
    companyId: string,
    notificationType: string,
    category: string,
    data: any,
    logId: string
  ): Promise<boolean> {
    try {
      // Get user and company details
      const user = await UserModel.findById(userId).select(
        "email firstName lastName"
      );
      const company =
        await CompanyModel.findById(companyId).select("name email");

      if (!user || !user.email) {
        throw new Error("User not found or no email address");
      }

      if (!company) {
        throw new Error("Company not found");
      }

      // Generate email template
      const template = this.generateEmailTemplate(
        notificationType,
        category,
        data,
        company.name
      );

      // Send email
      const mailOptions = {
        from: `"${company.name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Update notification log
      await NotificationLogModel.findByIdAndUpdate(logId, {
        emailSent: true,
        emailStatus: "sent",
        deliveryStatus: "sent",
        $inc: { retryCount: 1 },
      });

      console.log(
        `Email sent successfully to ${user.email}: ${result.messageId}`
      );
      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);

      // Update notification log with error
      await NotificationLogModel.findByIdAndUpdate(logId, {
        emailStatus: "failed",
        errorMessage: error.message,
        $inc: { retryCount: 1 },
        nextRetryAt: this.calculateNextRetryTime(1), // Will be updated by retry logic
      });

      return false;
    }
  }

  /**
   * Generate email template based on notification type
   */
  private generateEmailTemplate(
    notificationType: string,
    category: string,
    data: any,
    companyName: string
  ): EmailTemplate {
    const templates = {
      // Rental notifications
      rental_due_tomorrow: {
        subject: `[${companyName}] Rental Due Tomorrow - ${data.itemName}`,
        html: this.generateRentalDueTomorrowHTML(data, companyName),
        text: this.generateRentalDueTomorrowText(data, companyName),
      },
      rental_due_soon: {
        subject: `[${companyName}] Rental Due Soon - ${data.itemName}`,
        html: this.generateRentalDueSoonHTML(data, companyName),
        text: this.generateRentalDueSoonText(data, companyName),
      },
      rental_overdue: {
        subject: `[${companyName}] URGENT: Rental Overdue - ${data.itemName}`,
        html: this.generateRentalOverdueHTML(data, companyName),
        text: this.generateRentalOverdueText(data, companyName),
      },

      // Booking notifications
      booking_due_tomorrow: {
        subject: `[${companyName}] Booking Ends Tomorrow - ${data.facilityName}`,
        html: this.generateBookingDueTomorrowHTML(data, companyName),
        text: this.generateBookingDueTomorrowText(data, companyName),
      },
      booking_overdue: {
        subject: `[${companyName}] URGENT: Booking Overdue - ${data.facilityName}`,
        html: this.generateBookingOverdueHTML(data, companyName),
        text: this.generateBookingOverdueText(data, companyName),
      },

      // Maintenance notifications
      maintenance_due: {
        subject: `[${companyName}] Maintenance Due - ${data.itemName}`,
        html: this.generateMaintenanceDueHTML(data, companyName),
        text: this.generateMaintenanceDueText(data, companyName),
      },
    };

    return (
      templates[notificationType] || {
        subject: `[${companyName}] Notification`,
        html: `<p>You have a new notification from ${companyName}.</p>`,
        text: `You have a new notification from ${companyName}.`,
      }
    );
  }

  /**
   * Generate HTML templates
   */
  private generateRentalDueTomorrowHTML(
    data: any,
    companyName: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rental Due Tomorrow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rental Due Tomorrow</h1>
            <p>From: ${companyName}</p>
          </div>
          <div class="content">
            <div class="warning">
              <h2>⚠️ Important Reminder</h2>
              <p>Your rental for <strong>${data.itemName}</strong> is due tomorrow.</p>
            </div>
            <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p>Please prepare the item for return to avoid any late fees.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/user/returns" class="button">
                View Rental Details
              </a>
            </p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateRentalDueSoonHTML(data: any, companyName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rental Due Soon</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rental Due Soon</h1>
            <p>From: ${companyName}</p>
          </div>
          <div class="content">
            <div class="info">
              <h2>📅 Friendly Reminder</h2>
              <p>Your rental for <strong>${data.itemName}</strong> is due in 3 days.</p>
            </div>
            <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p>Please plan for the return to ensure a smooth process.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/user/returns" class="button">
                View Rental Details
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateRentalOverdueHTML(data: any, companyName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rental Overdue</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .urgent { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>URGENT: Rental Overdue</h1>
            <p>From: ${companyName}</p>
          </div>
          <div class="content">
            <div class="urgent">
              <h2>🚨 Immediate Action Required</h2>
              <p>Your rental for <strong>${data.itemName}</strong> is overdue by <strong>${data.daysOverdue} day(s)</strong>.</p>
            </div>
            <p><strong>Original Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p><strong>Days Overdue:</strong> ${data.daysOverdue}</p>
            <p>Please return the item immediately to avoid additional late fees.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/user/returns" class="button">
                Return Item Now
              </a>
            </p>
            <p>Contact our support team immediately if you have any issues.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateBookingDueTomorrowHTML(
    data: any,
    companyName: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Ends Tomorrow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Ends Tomorrow</h1>
            <p>From: ${companyName}</p>
          </div>
          <div class="content">
            <div class="warning">
              <h2>⚠️ Check-out Reminder</h2>
              <p>Your booking for <strong>${data.facilityName}</strong> ends tomorrow.</p>
            </div>
            <p><strong>End Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p>Please ensure you check out on time to avoid any additional charges.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/user/dashboard" class="button">
                View Booking Details
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateBookingOverdueHTML(data: any, companyName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Overdue</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .urgent { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>URGENT: Booking Overdue</h1>
            <p>From: ${companyName}</p>
          </div>
          <div class="content">
            <div class="urgent">
              <h2>🚨 Immediate Action Required</h2>
              <p>Your booking for <strong>${data.facilityName}</strong> is overdue by <strong>${data.daysOverdue} day(s)</strong>.</p>
            </div>
            <p><strong>Original End Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p><strong>Days Overdue:</strong> ${data.daysOverdue}</p>
            <p>Please check out immediately to avoid additional charges.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/user/dashboard" class="button">
                Check Out Now
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateMaintenanceDueHTML(data: any, companyName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Maintenance Due</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { background: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maintenance Due</h1>
            <p>From: ${companyName}</p>
          </div>
          <div class="content">
            <div class="info">
              <h2>🔧 Maintenance Required</h2>
              <p>Item <strong>${data.itemName}</strong> is due for maintenance today.</p>
            </div>
            <p><strong>Maintenance Date:</strong> ${new Date(data.maintenanceDate).toLocaleDateString()}</p>
            <p>Please schedule maintenance to ensure the item remains in good condition.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/admin/inventory" class="button">
                Schedule Maintenance
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate text versions of emails
   */
  private generateRentalDueTomorrowText(
    data: any,
    companyName: string
  ): string {
    return `
Rental Due Tomorrow - ${companyName}

Your rental for "${data.itemName}" is due tomorrow (${new Date(data.dueDate).toLocaleDateString()}).

Please prepare the item for return to avoid any late fees.

View your rental details: ${process.env.FRONTEND_URL}/user/returns

If you have any questions, please contact our support team.
    `.trim();
  }

  private generateRentalDueSoonText(data: any, companyName: string): string {
    return `
Rental Due Soon - ${companyName}

Your rental for "${data.itemName}" is due in 3 days (${new Date(data.dueDate).toLocaleDateString()}).

Please plan for the return to ensure a smooth process.

View your rental details: ${process.env.FRONTEND_URL}/user/returns
    `.trim();
  }

  private generateRentalOverdueText(data: any, companyName: string): string {
    return `
URGENT: Rental Overdue - ${companyName}

Your rental for "${data.itemName}" is overdue by ${data.daysOverdue} day(s).

Original Due Date: ${new Date(data.dueDate).toLocaleDateString()}
Days Overdue: ${data.daysOverdue}

Please return the item immediately to avoid additional late fees.

Return item now: ${process.env.FRONTEND_URL}/user/returns

Contact our support team immediately if you have any issues.
    `.trim();
  }

  private generateBookingDueTomorrowText(
    data: any,
    companyName: string
  ): string {
    return `
Booking Ends Tomorrow - ${companyName}

Your booking for "${data.facilityName}" ends tomorrow (${new Date(data.dueDate).toLocaleDateString()}).

Please ensure you check out on time to avoid any additional charges.

View booking details: ${process.env.FRONTEND_URL}/user/dashboard
    `.trim();
  }

  private generateBookingOverdueText(data: any, companyName: string): string {
    return `
URGENT: Booking Overdue - ${companyName}

Your booking for "${data.facilityName}" is overdue by ${data.daysOverdue} day(s).

Original End Date: ${new Date(data.dueDate).toLocaleDateString()}
Days Overdue: ${data.daysOverdue}

Please check out immediately to avoid additional charges.

Check out now: ${process.env.FRONTEND_URL}/user/dashboard
    `.trim();
  }

  private generateMaintenanceDueText(data: any, companyName: string): string {
    return `
Maintenance Due - ${companyName}

Item "${data.itemName}" is due for maintenance today (${new Date(data.maintenanceDate).toLocaleDateString()}).

Please schedule maintenance to ensure the item remains in good condition.

Schedule maintenance: ${process.env.FRONTEND_URL}/admin/inventory
    `.trim();
  }

  /**
   * Calculate next retry time (exponential backoff)
   */
  private calculateNextRetryTime(retryCount: number): Date {
    const baseDelay = 15; // 15 minutes
    const maxDelay = 24 * 60; // 24 hours
    const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);

    const nextRetry = new Date();
    nextRetry.setMinutes(nextRetry.getMinutes() + delay);

    return nextRetry;
  }
}

export default EmailNotificationService;
