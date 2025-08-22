import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { sendSuccess, sendError, sendValidationError } from "../utils";
import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";

export async function testEmailConfiguration(req: Request, res: Response) {
  try {
    const isConfigured = await emailService.testEmailConfiguration();
    
    if (isConfigured) {
      sendSuccess(res, "Email configuration is working", { configured: true });
    } else {
      sendError(res, "Email configuration test failed", null, 500);
    }
  } catch (error: any) {
    sendError(res, "Failed to test email configuration", error.message);
  }
}

export async function sendTestEmail(req: Request, res: Response) {
  try {
    const { to, subject, message } = req.body;
    const user = req.user as any;
    
    if (!to || !subject || !message) {
      sendValidationError(res, "To, subject, and message are required");
      return;
    }

    const success = await emailService.sendCustomEmail(
      to,
      subject,
      message,
      user.companyId
    );

    if (success) {
      sendSuccess(res, "Test email sent successfully", { sent: true });
    } else {
      sendError(res, "Failed to send test email", null, 500);
    }
  } catch (error: any) {
    sendError(res, "Failed to send test email", error.message);
  }
}

export async function sendWelcomeEmail(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const user = req.user as any;
    
    const success = await emailService.sendWelcomeEmail(userId, user.companyId);

    if (success) {
      sendSuccess(res, "Welcome email sent successfully", { sent: true });
    } else {
      sendError(res, "Failed to send welcome email", null, 500);
    }
  } catch (error: any) {
    sendError(res, "Failed to send welcome email", error.message);
  }
}

export async function sendInvoiceEmail(req: Request, res: Response) {
  try {
    const { invoiceId } = req.params;
    const { attachPDF = true } = req.body;
    
    const success = await emailService.sendInvoiceEmail(invoiceId, attachPDF);

    if (success) {
      sendSuccess(res, "Invoice email sent successfully", { sent: true });
    } else {
      sendError(res, "Failed to send invoice email", null, 500);
    }
  } catch (error: any) {
    sendError(res, "Failed to send invoice email", error.message);
  }
}

export async function sendReceiptEmail(req: Request, res: Response) {
  try {
    const { receiptId } = req.params;
    const { attachPDF = true } = req.body;
    
    const success = await emailService.sendReceiptEmail(receiptId, attachPDF);

    if (success) {
      sendSuccess(res, "Receipt email sent successfully", { sent: true });
    } else {
      sendError(res, "Failed to send receipt email", null, 500);
    }
  } catch (error: any) {
    sendError(res, "Failed to send receipt email", error.message);
  }
}

export async function sendBookingConfirmation(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    
    const success = await emailService.sendBookingConfirmation(bookingId);

    if (success) {
      sendSuccess(res, "Booking confirmation email sent successfully", { sent: true });
    } else {
      sendError(res, "Failed to send booking confirmation email", null, 500);
    }
  } catch (error: any) {
    sendError(res, "Failed to send booking confirmation email", error.message);
  }
}

export async function sendBookingReminder(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    
    const success = await emailService.sendBookingReminder(bookingId);

    if (success) {
      sendSuccess(res, "Booking reminder email sent successfully", { sent: true });
    } else {
      sendError(res, "Failed to send booking reminder email", null, 500);
    }
  } catch (error: any) {
    sendError(res, "Failed to send booking reminder email", error.message);
  }
}

export async function sendBulkEmail(req: Request, res: Response) {
  try {
    const { recipients, subject, message, userRole } = req.body;
    const user = req.user as any;
    
    if (!subject || !message) {
      sendValidationError(res, "Subject and message are required");
      return;
    }

    let emailList: string[] = [];

    if (recipients && Array.isArray(recipients)) {
      emailList = recipients;
    } else if (userRole) {
      // Send to all users with specific role in company
      const users = await UserModel.find({
        company: user.companyId,
        role: userRole,
        isDeleted: false,
      }).select('email').lean();
      
      emailList = users.map(u => u.email);
    } else {
      sendValidationError(res, "Either recipients array or userRole is required");
      return;
    }

    if (emailList.length === 0) {
      sendValidationError(res, "No valid recipients found");
      return;
    }

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < emailList.length; i += batchSize) {
      batches.push(emailList.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;

    for (const batch of batches) {
      const promises = batch.map(email => 
        emailService.sendCustomEmail(email, subject, message, user.companyId)
      );
      
      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      // Small delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    sendSuccess(res, "Bulk email sending completed", {
      total: emailList.length,
      success: successCount,
      failed: failureCount,
    });
  } catch (error: any) {
    sendError(res, "Failed to send bulk email", error.message);
  }
}

export async function updateEmailSettings(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const { emailSettings } = req.body;
    const user = req.user as any;

    // Check if user has permission to update company settings
    if (user.companyId !== companyId && !user.isSuperAdmin) {
      sendError(res, "Unauthorized to update company settings", null, 403);
      return;
    }

    const company = await CompanyModel.findByIdAndUpdate(
      companyId,
      { 
        $set: { 
          emailSettings: {
            ...emailSettings,
            updatedAt: new Date(),
            updatedBy: user.id,
          }
        }
      },
      { new: true }
    );

    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    sendSuccess(res, "Email settings updated successfully", { 
      emailSettings: (company as any).emailSettings 
    });
  } catch (error: any) {
    sendError(res, "Failed to update email settings", error.message);
  }
}

export async function getEmailSettings(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const user = req.user as any;

    // Check if user has permission to view company settings
    if (user.companyId !== companyId && !user.isSuperAdmin) {
      sendError(res, "Unauthorized to view company settings", null, 403);
      return;
    }

    const company = await CompanyModel.findById(companyId).select('emailSettings').lean();

    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    sendSuccess(res, "Email settings retrieved successfully", { 
      emailSettings: (company as any).emailSettings || {
        sendInvoiceEmails: true,
        sendReceiptEmails: true,
        sendBookingConfirmations: true,
        sendBookingReminders: true,
        sendPaymentNotifications: true,
        sendWelcomeEmails: true,
      }
    });
  } catch (error: any) {
    sendError(res, "Failed to get email settings", error.message);
  }
}