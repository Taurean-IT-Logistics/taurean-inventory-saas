import nodemailer from "nodemailer";
import handlebars from "handlebars";
import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";
import { emitEvent } from "../realtime/socket";
import { Events } from "../realtime/events";

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
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    this.initializeTransporter();
    this.registerTemplates();
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

  private registerTemplates() {
    // Register all email templates
    this.templates.set("base", this.getBaseTemplate());
    this.templates.set("welcome", this.getWelcomeTemplate());
    this.templates.set("invoice", this.getInvoiceTemplate());
    this.templates.set("receipt", this.getReceiptTemplate());
    this.templates.set(
      "booking-confirmation",
      this.getBookingConfirmationTemplate()
    );
    this.templates.set("booking-reminder", this.getBookingReminderTemplate());
    this.templates.set("payment-success", this.getPaymentSuccessTemplate());
    this.templates.set("payment-failed", this.getPaymentFailedTemplate());
    this.templates.set("company-approved", this.getCompanyApprovedTemplate());
    this.templates.set(
      "subscription-expiry",
      this.getSubscriptionExpiryTemplate()
    );
    this.templates.set("password-reset", this.getPasswordResetTemplate());
    this.templates.set(
      "account-verification",
      this.getAccountVerificationTemplate()
    );
  }

  private getBaseTemplate(): handlebars.TemplateDelegate {
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{subject}}</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #1a1a1a;
                  background-color: #f8fafc;
              }
              
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              }
              
              .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 40px 30px;
                  text-align: center;
                  color: white;
              }
              
              .company-logo {
                  max-width: 150px;
                  max-height: 60px;
                  margin-bottom: 20px;
                  border-radius: 8px;
              }
              
              .company-name {
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 8px;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              .header-subtitle {
                  font-size: 16px;
                  opacity: 0.9;
                  font-weight: 400;
              }
              
              .content {
                  padding: 40px 30px;
              }
              
              .greeting {
                  font-size: 24px;
                  font-weight: 600;
                  color: #1a1a1a;
                  margin-bottom: 20px;
              }
              
              .message {
                  font-size: 16px;
                  line-height: 1.7;
                  color: #4a5568;
                  margin-bottom: 30px;
              }
              
              .cta-section {
                  text-align: center;
                  margin: 40px 0;
              }
              
              .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  text-decoration: none;
                  padding: 16px 32px;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 16px;
                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                  transition: all 0.3s ease;
              }
              
              .cta-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
              }
              
              .info-card {
                  background: #f7fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  padding: 24px;
                  margin: 24px 0;
              }
              
              .info-card-title {
                  font-size: 18px;
                  font-weight: 600;
                  color: #2d3748;
                  margin-bottom: 12px;
              }
              
              .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 16px;
              }
              
              .info-item {
                  display: flex;
                  flex-direction: column;
              }
              
              .info-label {
                  font-size: 12px;
                  font-weight: 600;
                  color: #718096;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 4px;
              }
              
              .info-value {
                  font-size: 15px;
                  font-weight: 600;
                  color: #2d3748;
              }
              
              .footer {
                  background: #2d3748;
                  color: #a0aec0;
                  padding: 30px;
                  text-align: center;
                  font-size: 14px;
              }
              
              .footer-content {
                  max-width: 500px;
                  margin: 0 auto;
              }
              
              .footer-links {
                  margin: 20px 0;
              }
              
              .footer-link {
                  color: #667eea;
                  text-decoration: none;
                  margin: 0 15px;
                  font-weight: 500;
              }
              
              .footer-link:hover {
                  color: #764ba2;
              }
              
              .social-links {
                  margin-top: 20px;
              }
              
              .social-link {
                  display: inline-block;
                  margin: 0 8px;
                  color: #a0aec0;
                  text-decoration: none;
              }
              
              .divider {
                  height: 1px;
                  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                  margin: 30px 0;
              }
              
              .highlight {
                  background: linear-gradient(135deg, #667eea15, #764ba215);
                  border-left: 4px solid #667eea;
                  padding: 16px 20px;
                  border-radius: 0 8px 8px 0;
                  margin: 20px 0;
              }
              
              .status-badge {
                  display: inline-block;
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              
              .status-success {
                  background: #c6f6d5;
                  color: #22543d;
              }
              
              .status-warning {
                  background: #fef5e7;
                  color: #c05621;
              }
              
              .status-error {
                  background: #fed7d7;
                  color: #c53030;
              }
              
              @media only screen and (max-width: 600px) {
                  .email-container {
                      margin: 0;
                      box-shadow: none;
                  }
                  
                  .header {
                      padding: 30px 20px;
                  }
                  
                  .content {
                      padding: 30px 20px;
                  }
                  
                  .footer {
                      padding: 20px;
                  }
                  
                  .info-grid {
                      grid-template-columns: 1fr;
                  }
                  
                  .company-name {
                      font-size: 24px;
                  }
                  
                  .greeting {
                      font-size: 20px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  {{#if company.logo}}
                  <img src="{{company.logo.path}}" alt="{{company.name}}" class="company-logo">
                  {{else}}
                  <div class="company-name">{{company.name}}</div>
                  {{/if}}
                  <div class="header-subtitle">{{headerSubtitle}}</div>
              </div>
              
              <div class="content">
                  {{{content}}}
              </div>
              
              <div class="footer">
                  <div class="footer-content">
                      <div>
                          <strong>{{company.name}}</strong><br>
                          {{#if company.address}}{{company.address}}<br>{{/if}}
                          {{#if company.phone}}{{company.phone}} • {{/if}}{{#if company.email}}{{company.email}}{{/if}}
                      </div>
                      
                      <div class="footer-links">
                          <a href="{{baseUrl}}" class="footer-link">Dashboard</a>
                          <a href="{{baseUrl}}/support" class="footer-link">Support</a>
                          <a href="{{baseUrl}}/privacy" class="footer-link">Privacy</a>
                      </div>
                      
                      <div class="divider"></div>
                      
                      <p style="font-size: 12px; color: #718096;">
                          You received this email because you have an account with {{company.name}}.
                          <br>If you no longer wish to receive these emails, you can 
                          <a href="{{baseUrl}}/unsubscribe" style="color: #667eea;">unsubscribe here</a>.
                      </p>
                      
                      <p style="font-size: 12px; color: #718096; margin-top: 15px;">
                          © {{currentYear}} {{company.name}}. All rights reserved.
                      </p>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    return handlebars.compile(template);
  }

  private getWelcomeTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Welcome to {{company.name}}, {{user.name}}!</div>
      
      <div class="message">
          We're thrilled to have you join our facility management platform. Your account has been successfully created and is ready to use.
      </div>
      
      <div class="info-card">
          <div class="info-card-title">Your Account Details</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Name</div>
                  <div class="info-value">{{user.name}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">{{user.email}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Role</div>
                  <div class="info-value">{{user.role}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Account Status</div>
                  <div class="info-value"><span class="status-badge status-success">Active</span></div>
              </div>
          </div>
      </div>
      
      <div class="highlight">
          <strong>Next Steps:</strong><br>
          • Explore available facilities and services<br>
          • Complete your profile for a personalized experience<br>
          • Book your first facility or service<br>
          • Contact our support team if you need assistance
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/user/dashboard" class="cta-button">Access Your Dashboard</a>
      </div>
      
      <div class="message">
          If you have any questions or need assistance, our support team is here to help 24/7.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getInvoiceTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Invoice {{data.invoiceNumber}} from {{company.name}}</div>
      
      <div class="message">
          {{#if user.name}}Dear {{user.name}},{{else}}Dear Valued Customer,{{/if}}<br><br>
          We've generated a new invoice for your recent booking. Please find the details below and complete payment at your earliest convenience.
      </div>
      
      <div class="info-card">
          <div class="info-card-title">Invoice Summary</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Invoice Number</div>
                  <div class="info-value">#{{data.invoiceNumber}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Issue Date</div>
                  <div class="info-value">{{data.issueDate}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Due Date</div>
                  <div class="info-value">{{data.dueDate}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Amount Due</div>
                  <div class="info-value" style="font-size: 18px; color: #667eea; font-weight: 700;">{{data.currency}} {{data.total}}</div>
              </div>
          </div>
      </div>
      
      {{#if data.lines}}
      <div class="info-card">
          <div class="info-card-title">Invoice Items</div>
          <table style="width: 100%; border-collapse: collapse;">
              <thead>
                  <tr style="background: #f7fafc; border-bottom: 2px solid #e2e8f0;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #4a5568;">Description</th>
                      <th style="padding: 12px; text-align: center; font-weight: 600; color: #4a5568;">Qty</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600; color: #4a5568;">Amount</th>
                  </tr>
              </thead>
              <tbody>
                  {{#each data.lines}}
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 12px;">
                          <div style="font-weight: 600; color: #2d3748;">{{description}}</div>
                          {{#if sku}}<div style="font-size: 12px; color: #718096;">SKU: {{sku}}</div>{{/if}}
                      </td>
                      <td style="padding: 12px; text-align: center;">{{quantity}}</td>
                      <td style="padding: 12px; text-align: right; font-weight: 600;">{{../data.currency}} {{amount}}</td>
                  </tr>
                  {{/each}}
              </tbody>
          </table>
      </div>
      {{/if}}
      
      <div class="cta-section">
          <a href="{{baseUrl}}/payment?invoice={{data.id}}" class="cta-button">Pay Invoice Now</a>
      </div>
      
      <div class="highlight">
          <strong>Payment Methods Accepted:</strong><br>
          Credit/Debit Cards • Mobile Money • Bank Transfer
      </div>
      
      <div class="message">
          Questions about this invoice? Reply to this email or contact our billing department.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getReceiptTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Payment Receipt - {{data.receiptId}}</div>
      
      <div class="message">
          {{#if user.name}}Dear {{user.name}},{{else}}Dear Valued Customer,{{/if}}<br><br>
          Thank you for your payment! We've successfully processed your transaction. Here are the details:
      </div>
      
      <div class="info-card" style="background: #f0fff4; border-color: #9ae6b4;">
          <div class="info-card-title" style="color: #22543d;">Payment Confirmation</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Receipt ID</div>
                  <div class="info-value">{{data.receiptId}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Invoice Number</div>
                  <div class="info-value">#{{data.invoiceNumber}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Payment Date</div>
                  <div class="info-value">{{data.paymentDate}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Amount Paid</div>
                  <div class="info-value" style="font-size: 18px; color: #22543d; font-weight: 700;">{{data.currency}} {{data.amount}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Payment Method</div>
                  <div class="info-value">{{data.paymentMethod}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Reference</div>
                  <div class="info-value">{{data.reference}}</div>
              </div>
          </div>
      </div>
      
      <div class="highlight" style="background: #f0fff4; border-color: #68d391;">
          <strong>✓ Payment Status:</strong> <span class="status-badge status-success">Completed</span><br>
          Your payment has been successfully processed and your booking is confirmed.
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/user/dashboard" class="cta-button" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);">View My Dashboard</a>
      </div>
      
      <div class="message">
          Please keep this receipt for your records. If you need to download a PDF copy, you can do so from your dashboard.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getBookingConfirmationTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Booking Confirmed - {{data.bookingNumber}}</div>
      
      <div class="message">
          {{#if user.name}}Dear {{user.name}},{{else}}Dear Valued Customer,{{/if}}<br><br>
          Excellent news! Your facility booking has been confirmed. We look forward to hosting you.
      </div>
      
      <div class="info-card">
          <div class="info-card-title">Booking Details</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Booking Number</div>
                  <div class="info-value">{{data.bookingNumber}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Facility</div>
                  <div class="info-value">{{data.facilityName}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Start Date</div>
                  <div class="info-value">{{data.startDate}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">End Date</div>
                  <div class="info-value">{{data.endDate}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Duration</div>
                  <div class="info-value">{{data.duration}} hours</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Total Amount</div>
                  <div class="info-value" style="font-size: 18px; color: #667eea; font-weight: 700;">{{data.currency}} {{data.totalAmount}}</div>
              </div>
          </div>
      </div>
      
      <div class="highlight">
          <strong>Important Information:</strong><br>
          • Please arrive 15 minutes before your scheduled time<br>
          • Bring a valid ID for verification<br>
          • Contact us immediately if you need to modify your booking<br>
          • Cancellations must be made at least 24 hours in advance
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/user/dashboard" class="cta-button">Manage Booking</a>
      </div>
      
      <div class="message">
          We're excited to serve you! If you have any questions about your booking, please don't hesitate to contact us.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getBookingReminderTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Booking Reminder - Tomorrow at {{data.startTime}}</div>
      
      <div class="message">
          {{#if user.name}}Hello {{user.name}},{{else}}Hello,{{/if}}<br><br>
          This is a friendly reminder about your upcoming facility booking tomorrow.
      </div>
      
      <div class="info-card" style="background: #fffbeb; border-color: #f6e05e;">
          <div class="info-card-title" style="color: #92400e;">Tomorrow's Booking</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Facility</div>
                  <div class="info-value">{{data.facilityName}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Date & Time</div>
                  <div class="info-value">{{data.startDate}} at {{data.startTime}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Duration</div>
                  <div class="info-value">{{data.duration}} hours</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Booking Number</div>
                  <div class="info-value">{{data.bookingNumber}}</div>
              </div>
          </div>
      </div>
      
      <div class="highlight" style="background: #fffbeb; border-color: #f6e05e;">
          <strong>Preparation Checklist:</strong><br>
          ✓ Arrive 15 minutes early for check-in<br>
          ✓ Bring valid identification<br>
          ✓ Review facility guidelines<br>
          ✓ Contact us if any changes are needed
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/user/dashboard" class="cta-button">View Booking Details</a>
      </div>
      
      <div class="message">
          Looking forward to serving you tomorrow! Have a great day.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getPaymentSuccessTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Payment Received - Thank You!</div>
      
      <div class="message">
          {{#if user.name}}Dear {{user.name}},{{else}}Dear Valued Customer,{{/if}}<br><br>
          We've successfully received your payment. Your transaction has been processed and your booking is now confirmed.
      </div>
      
      <div class="info-card" style="background: #f0fff4; border-color: #9ae6b4;">
          <div class="info-card-title" style="color: #22543d;">Payment Summary</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Transaction Reference</div>
                  <div class="info-value">{{data.reference}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Amount Paid</div>
                  <div class="info-value" style="font-size: 18px; color: #22543d; font-weight: 700;">{{data.currency}} {{data.amount}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Payment Method</div>
                  <div class="info-value">{{data.paymentMethod}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Payment Date</div>
                  <div class="info-value">{{data.paymentDate}}</div>
              </div>
          </div>
      </div>
      
      <div class="highlight" style="background: #f0fff4; border-color: #68d391;">
          <strong>✓ Transaction Complete:</strong><br>
          Your payment has been successfully processed and your account has been updated accordingly.
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/user/dashboard" class="cta-button" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);">Download Receipt</a>
      </div>
      
      <div class="message">
          Your receipt has been automatically generated and is available in your dashboard. Thank you for choosing {{company.name}}.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getPaymentFailedTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Payment Issue - Action Required</div>
      
      <div class="message">
          {{#if user.name}}Dear {{user.name}},{{else}}Dear Valued Customer,{{/if}}<br><br>
          We encountered an issue processing your recent payment. Don't worry - no charges have been made to your account.
      </div>
      
      <div class="info-card" style="background: #fef5e7; border-color: #f6e05e;">
          <div class="info-card-title" style="color: #92400e;">Transaction Details</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Transaction Reference</div>
                  <div class="info-value">{{data.reference}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Amount</div>
                  <div class="info-value">{{data.currency}} {{data.amount}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value"><span class="status-badge status-error">Failed</span></div>
              </div>
              <div class="info-item">
                  <div class="info-label">Attempt Date</div>
                  <div class="info-value">{{data.attemptDate}}</div>
              </div>
          </div>
      </div>
      
      <div class="highlight" style="background: #fef5e7; border-color: #f6e05e;">
          <strong>Common Reasons for Payment Failure:</strong><br>
          • Insufficient funds in your account<br>
          • Incorrect card details or expired card<br>
          • Network connectivity issues<br>
          • Bank security restrictions
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/payment/retry?ref={{data.reference}}" class="cta-button">Retry Payment</a>
      </div>
      
      <div class="message">
          If you continue to experience issues, please contact our support team. We're here to help resolve any payment concerns.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getCompanyApprovedTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Welcome to the Platform, {{data.companyName}}!</div>
      
      <div class="message">
          Congratulations! Your company onboarding application has been approved. You now have full access to our facility management platform.
      </div>
      
      <div class="info-card">
          <div class="info-card-title">Company Account Details</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Company Name</div>
                  <div class="info-value">{{data.companyName}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Account Status</div>
                  <div class="info-value"><span class="status-badge status-success">Active</span></div>
              </div>
              <div class="info-item">
                  <div class="info-label">Subscription Plan</div>
                  <div class="info-value">{{data.subscriptionPlan}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">License Key</div>
                  <div class="info-value" style="font-family: monospace;">{{data.licenseKey}}</div>
              </div>
          </div>
      </div>
      
      <div class="highlight">
          <strong>What's Next:</strong><br>
          • Set up your facilities and inventory<br>
          • Invite team members to your company<br>
          • Configure your billing and tax settings<br>
          • Start accepting bookings from customers
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/admin" class="cta-button">Access Admin Dashboard</a>
      </div>
      
      <div class="message">
          Welcome to the {{company.name}} family! We're excited to support your business growth.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getSubscriptionExpiryTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Subscription Expiring Soon</div>
      
      <div class="message">
          Dear {{user.name}},<br><br>
          Your {{company.name}} subscription will expire in {{data.daysRemaining}} days. To ensure uninterrupted service, please renew your subscription.
      </div>
      
      <div class="info-card" style="background: #fffbeb; border-color: #f6e05e;">
          <div class="info-card-title" style="color: #92400e;">Subscription Details</div>
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-label">Current Plan</div>
                  <div class="info-value">{{data.currentPlan}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Expiry Date</div>
                  <div class="info-value">{{data.expiryDate}}</div>
              </div>
              <div class="info-item">
                  <div class="info-label">Days Remaining</div>
                  <div class="info-value"><span class="status-badge status-warning">{{data.daysRemaining}} days</span></div>
              </div>
              <div class="info-item">
                  <div class="info-label">Renewal Price</div>
                  <div class="info-value">{{data.currency}} {{data.renewalPrice}}</div>
              </div>
          </div>
      </div>
      
      <div class="highlight" style="background: #fffbeb; border-color: #f6e05e;">
          <strong>What happens if you don't renew:</strong><br>
          • Access to your dashboard will be suspended<br>
          • New bookings will be disabled<br>
          • Customer access will be restricted<br>
          • Data will be preserved for 30 days
      </div>
      
      <div class="cta-section">
          <a href="{{baseUrl}}/admin/billing/renew" class="cta-button">Renew Subscription</a>
      </div>
      
      <div class="message">
          Questions about your subscription? Our billing team is available to help you choose the best plan for your needs.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getPasswordResetTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Password Reset Request</div>
      
      <div class="message">
          {{#if user.name}}Hello {{user.name}},{{else}}Hello,{{/if}}<br><br>
          We received a request to reset the password for your {{company.name}} account. If you made this request, click the button below to create a new password.
      </div>
      
      <div class="info-card" style="background: #fef5e7; border-color: #f6e05e;">
          <div class="info-card-title" style="color: #92400e;">Security Information</div>
          <div style="font-size: 14px; color: #744210;">
              <strong>Account:</strong> {{user.email}}<br>
              <strong>Request Time:</strong> {{data.requestTime}}<br>
              <strong>IP Address:</strong> {{data.ipAddress}}<br>
              <strong>Expires:</strong> {{data.expiryTime}}
          </div>
      </div>
      
      <div class="cta-section">
          <a href="{{data.resetLink}}" class="cta-button">Reset Password</a>
      </div>
      
      <div class="highlight" style="background: #fef2f2; border-color: #fca5a5;">
          <strong>Security Notice:</strong><br>
          If you didn't request this password reset, please ignore this email. Your account remains secure.
          The reset link will expire in 1 hour for your security.
      </div>
      
      <div class="message">
          For your security, this link will expire in 1 hour. If you need assistance, please contact our support team.
      </div>
    `;

    return handlebars.compile(content);
  }

  private getAccountVerificationTemplate(): handlebars.TemplateDelegate {
    const content = `
      <div class="greeting">Verify Your Email Address</div>
      
      <div class="message">
          {{#if user.name}}Hello {{user.name}},{{else}}Hello,{{/if}}<br><br>
          Thank you for registering with {{company.name}}! To complete your account setup, please verify your email address.
      </div>
      
      <div class="info-card">
          <div class="info-card-title">Account Verification</div>
          <div style="font-size: 14px; color: #4a5568;">
              <strong>Email:</strong> {{user.email}}<br>
              <strong>Account Type:</strong> {{user.role}}<br>
              <strong>Registration Date:</strong> {{data.registrationDate}}
          </div>
      </div>
      
      <div class="cta-section">
          <a href="{{data.verificationLink}}" class="cta-button">Verify Email Address</a>
      </div>
      
      <div class="highlight">
          <strong>Why verify your email?</strong><br>
          • Secure your account access<br>
          • Receive important notifications<br>
          • Enable password recovery<br>
          • Access all platform features
      </div>
      
      <div class="message">
          This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
      </div>
    `;

    return handlebars.compile(content);
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn("Email transporter not configured. Email not sent.");
      return false;
    }

    try {
      const template = this.templates.get(options.template);
      if (!template) {
        throw new Error(`Email template '${options.template}' not found`);
      }

      // Add current year and base URL to context
      const enhancedContext = {
        ...options.context,
        currentYear: new Date().getFullYear(),
        baseUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      };

      let htmlContent: string;

      if (options.template === "base") {
        htmlContent = template(enhancedContext);
      } else {
        // Render the specific template content
        const contentTemplate = this.templates.get(options.template);
        const content = contentTemplate!(enhancedContext);

        // Wrap in base template
        const baseTemplate = this.templates.get("base")!;
        htmlContent = baseTemplate({
          ...enhancedContext,
          content,
          headerSubtitle: this.getHeaderSubtitle(options.template),
          subject: options.subject,
        });
      }

      const mailOptions = {
        from: {
          name: "Taurean IT Logistics",
          address:
            process.env.EMAIL_FROM ||
            process.env.EMAIL_USER ||
            "noreply@taureanitlogistics.com",
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
        const companyId = (enhancedContext as any)?.company?._id || (enhancedContext as any)?.company?.id || undefined;
        const userId = (enhancedContext as any)?.user?._id || (enhancedContext as any)?.user?.id || undefined;
        const payload = {
          status: "sent",
          messageId: info.messageId,
          to: options.to,
          subject: options.subject,
          template: options.template,
          timestamp: new Date().toISOString(),
        };
        if (companyId) emitEvent(Events.EmailSent, payload, `company:${companyId}`);
        if (userId) emitEvent(Events.EmailSent, payload, `user:${userId}`);
      } catch {}

      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      // Emit real-time email delivery failure event
      try {
        const companyId = (options.context as any)?.company?._id || (options.context as any)?.company?.id || undefined;
        const userId = (options.context as any)?.user?._id || (options.context as any)?.user?.id || undefined;
        const payload = {
          status: "failed",
          error: (error as any)?.message || "unknown",
          to: options.to,
          subject: options.subject,
          template: options.template,
          timestamp: new Date().toISOString(),
        };
        if (companyId) emitEvent(Events.EmailFailed, payload, `company:${companyId}`);
        if (userId) emitEvent(Events.EmailFailed, payload, `user:${userId}`);
      } catch {}
      return false;
    }
  }

  private getHeaderSubtitle(template: string): string {
    const subtitles: Record<string, string> = {
      welcome: "Welcome to Our Platform",
      invoice: "Invoice & Billing",
      receipt: "Payment Confirmation",
      "booking-confirmation": "Booking Confirmed",
      "booking-reminder": "Upcoming Booking",
      "payment-success": "Payment Successful",
      "payment-failed": "Payment Issue",
      "company-approved": "Company Onboarding",
      "subscription-expiry": "Subscription Notice",
      "password-reset": "Account Security",
      "account-verification": "Email Verification",
    };

    return subtitles[template] || "Notification";
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

  public async sendInvoiceEmail(
    invoiceId: string,
    attachPDF: boolean = true
  ): Promise<boolean> {
    try {
      const InvoiceModel = (await import("../models/invoice.model"))
        .InvoiceModel;
      const invoice = await InvoiceModel.findById(invoiceId)
        .populate("company")
        .populate("customer")
        .lean();

      if (!invoice) return false;

      const company = invoice.company as any;
      const customer = invoice.customer as any;

      const attachments = [];

      if (attachPDF) {
        try {
          const { generateInvoicePDF } = await import("./pdf.service");
          const pdfBuffer = await generateInvoicePDF(invoiceId);
          attachments.push({
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          });
        } catch (error) {
          console.warn("Failed to attach PDF to email:", error);
        }
      }

      return this.sendEmail({
        to: customer?.email || company.contactEmail,
        subject: `Invoice ${invoice.invoiceNumber} from ${company.name}`,
        template: "invoice",
        context: {
          company,
          user: customer,
          data: {
            id: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            issueDate: new Date(invoice.createdAt).toLocaleDateString(),
            dueDate: (invoice as any).dueDate
              ? new Date((invoice as any).dueDate).toLocaleDateString()
              : "Upon Receipt",
            currency: invoice.currency,
            total: invoice.total.toFixed(2),
            lines: invoice.lines,
          },
        },
        attachments,
      });
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      return false;
    }
  }

  public async sendReceiptEmail(
    receiptId: string,
    attachPDF: boolean = true
  ): Promise<boolean> {
    try {
      const ReceiptModel = (await import("../models/receipt.model"))
        .ReceiptModel;
      const receipt = await ReceiptModel.findById(receiptId)
        .populate({
          path: "invoice",
          populate: {
            path: "company customer",
          },
        })
        .lean();

      if (!receipt) return false;

      const invoice = receipt.invoice as any;
      const company = invoice.company;
      const customer = invoice.customer;

      const attachments = [];

      if (attachPDF) {
        try {
          const { generateReceiptPDF } = await import("./pdf.service");
          const pdfBuffer = await generateReceiptPDF(receiptId);
          attachments.push({
            filename: `receipt-${receipt._id}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          });
        } catch (error) {
          console.warn("Failed to attach PDF to email:", error);
        }
      }

      return this.sendEmail({
        to: customer?.email || company.contactEmail,
        subject: `Payment Receipt from ${company.name}`,
        template: "receipt",
        context: {
          company,
          user: customer,
          data: {
            receiptId: receipt._id.toString().slice(-8).toUpperCase(),
            invoiceNumber: invoice.invoiceNumber,
            paymentDate: new Date(receipt.timestamp).toLocaleDateString(),
            currency: invoice.currency,
            amount: receipt.amount.toFixed(2),
            paymentMethod:
              invoice.payment?.method?.replace("_", " ").toUpperCase() || "N/A",
            reference: receipt.reference || invoice.payment?.reference || "",
          },
        },
        attachments,
      });
    } catch (error) {
      console.error("Failed to send receipt email:", error);
      return false;
    }
  }

  public async sendBookingConfirmation(bookingId: string): Promise<boolean> {
    try {
      const BookingModel = (await import("../models/booking.model"))
        .BookingModel;
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
          data: {
            bookingNumber:
              (booking as any).bookingNumber ||
              booking._id.toString().slice(-8),
            facilityName: facility.name,
            startDate: new Date(booking.startDate).toLocaleDateString(),
            endDate: new Date(booking.endDate).toLocaleDateString(),
            duration: Math.ceil(
              (new Date(booking.endDate).getTime() -
                new Date(booking.startDate).getTime()) /
                (1000 * 60 * 60)
            ),
            totalAmount: (booking as any).totalAmount?.toFixed(2) || "0.00",
            currency: (booking as any).currency || "GHS",
          },
        },
      });
    } catch (error) {
      console.error("Failed to send booking confirmation email:", error);
      return false;
    }
  }

  public async sendBookingReminder(bookingId: string): Promise<boolean> {
    try {
      const BookingModel = (await import("../models/booking.model"))
        .BookingModel;
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
        subject: `Booking Reminder - Tomorrow at ${new Date(
          booking.startDate
        ).toLocaleTimeString()}`,
        template: "booking-reminder",
        context: {
          company,
          user,
          data: {
            bookingNumber:
              (booking as any).bookingNumber ||
              booking._id.toString().slice(-8),
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

  public async sendPaymentSuccessEmail(
    transactionId: string
  ): Promise<boolean> {
    try {
      const TransactionModel = (await import("../models/transaction.model"))
        .TransactionModel;
      const transaction = await TransactionModel.findById(transactionId)
        .populate("user")
        .populate("company")
        .lean();

      if (!transaction) return false;

      const user = transaction.user as any;
      const company = transaction.company as any;

      return this.sendEmail({
        to: user.email,
        subject: `Payment Received - ${company.name}`,
        template: "payment-success",
        context: {
          company,
          user,
          data: {
            reference:
              transaction.ref ||
              (transaction as any).paymentDetails?.paystackReference ||
              "",
            amount: transaction.amount?.toFixed(2) || "0.00",
            currency: (transaction as any).currency || "GHS",
            paymentMethod:
              (transaction as any).method?.replace("_", " ").toUpperCase() ||
              "N/A",
            paymentDate: new Date(transaction.createdAt).toLocaleDateString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send payment success email:", error);
      return false;
    }
  }

  public async sendPaymentFailedEmail(
    transactionData: any,
    userEmail: string,
    companyId: string
  ): Promise<boolean> {
    try {
      const company = await CompanyModel.findById(companyId).lean();
      if (!company) return false;

      const user = await UserModel.findOne({ email: userEmail }).lean();

      return this.sendEmail({
        to: userEmail,
        subject: `Payment Issue - ${company.name}`,
        template: "payment-failed",
        context: {
          company,
          user,
          data: {
            reference: transactionData.reference,
            amount: transactionData.amount?.toFixed(2) || "0.00",
            currency: transactionData.currency || "GHS",
            attemptDate: new Date().toLocaleDateString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send payment failed email:", error);
      return false;
    }
  }

  public async sendCompanyApprovedEmail(companyId: string): Promise<boolean> {
    try {
      const company = await CompanyModel.findById(companyId)
        .populate("owner")
        .lean();
      if (!company) return false;

      const owner = company.owner as any;

      return this.sendEmail({
        to: owner.email,
        subject: `Company Approved - Welcome to ${
          process.env.PLATFORM_NAME || "Our Platform"
        }!`,
        template: "company-approved",
        context: {
          company,
          user: owner,
          data: {
            companyName: company.name,
            subscriptionPlan: (company as any).subscription?.plan || "Standard",
            licenseKey:
              (company as any).licenseKey || "Generated upon activation",
          },
        },
      });
    } catch (error) {
      console.error("Failed to send company approved email:", error);
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

      const owner = company.owner as any;
      const subscription = (company as any).subscription;

      return this.sendEmail({
        to: owner.email,
        subject: `Subscription Expiring in ${daysRemaining} Days - ${company.name}`,
        template: "subscription-expiry",
        context: {
          company,
          user: owner,
          data: {
            daysRemaining,
            currentPlan: subscription?.plan || "Standard",
            expiryDate: subscription?.expiresAt
              ? new Date(subscription.expiresAt).toLocaleDateString()
              : "Unknown",
            renewalPrice: subscription?.price?.toFixed(2) || "0.00",
            currency: company.currency || "GHS",
          },
        },
      });
    } catch (error) {
      console.error("Failed to send subscription expiry email:", error);
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
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

      return this.sendEmail({
        to: userEmail,
        subject: `Password Reset Request - ${company?.name || "Your Account"}`,
        template: "password-reset",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          user,
          data: {
            resetLink,
            requestTime: new Date().toLocaleString(),
            expiryTime: new Date(Date.now() + 3600000).toLocaleString(), // 1 hour
            ipAddress,
          },
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
      const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

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
    to: string | string[],
    subject: string,
    content: string,
    companyId?: string
  ): Promise<boolean> {
    try {
      const company = companyId
        ? await CompanyModel.findById(companyId).lean()
        : { name: "Taurean IT Logistics" };

      return this.sendEmail({
        to,
        subject,
        template: "base",
        context: {
          company: company || { name: "Taurean IT Logistics" },
          content,
        },
      });
    } catch (error) {
      console.error("Failed to send custom email:", error);
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
}

// Export singleton instance
export const emailService = new EmailService();

// Export individual methods for easy import
export const {
  sendWelcomeEmail,
  sendInvoiceEmail,
  sendReceiptEmail,
  sendBookingConfirmation,
  sendBookingReminder,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendCompanyApprovedEmail,
  sendSubscriptionExpiryEmail,
  sendPasswordResetEmail,
  sendAccountVerificationEmail,
  sendCustomEmail,
  testEmailConfiguration,
} = emailService;
