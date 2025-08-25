import { Request, Response } from "express";
import { sendSuccess, sendError, sendValidationError } from "../utils";
import { NewsletterService } from "../services/newsletter.service";
import { emailService } from "../services/email.service";

// Unsubscribe from newsletter
export async function unsubscribe(req: Request, res: Response) {
  try {
    const { email, reason } = req.body;

    if (!email) {
      sendValidationError(res, "Email is required");
      return;
    }

    const result = await NewsletterService.unsubscribe(email, reason);

    if (result.success) {
      // Send confirmation email
      await emailService.sendCustomEmail(
        email,
        "Newsletter Unsubscribed",
        "You have been successfully unsubscribed from our newsletter. We're sorry to see you go! If you change your mind, you can resubscribe anytime.",
        result.companyId
      );

      sendSuccess(res, "Successfully unsubscribed from newsletter", {
        message: "You have been unsubscribed from our newsletter",
        resubscribeToken: result.resubscribeToken,
      });
    } else {
      sendError(res, "Failed to unsubscribe", result.error);
    }
  } catch (error: any) {
    sendError(res, "Failed to unsubscribe from newsletter", error.message);
  }
}

// Resubscribe to newsletter
export async function resubscribe(req: Request, res: Response) {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      sendValidationError(res, "Email and token are required");
      return;
    }

    const result = await NewsletterService.resubscribe(email, token);

    if (result.success) {
      // Send welcome back email
      await emailService.sendCustomEmail(
        email,
        "Welcome Back to Our Newsletter!",
        "Great to have you back! You have been successfully resubscribed to our newsletter. You'll start receiving our updates again.",
        result.companyId
      );

      sendSuccess(res, "Successfully resubscribed to newsletter", {
        message: "You have been resubscribed to our newsletter",
      });
    } else {
      sendError(res, "Failed to resubscribe", result.error);
    }
  } catch (error: any) {
    sendError(res, "Failed to resubscribe to newsletter", error.message);
  }
}

// Verify unsubscribe token
export async function verifyUnsubscribe(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (!token) {
      sendValidationError(res, "Token is required");
      return;
    }

    const result = await NewsletterService.verifyUnsubscribeToken(token);

    if (result.success) {
      sendSuccess(res, "Unsubscribe token verified", {
        email: result.email,
        companyName: result.companyName,
        unsubscribeDate: result.unsubscribeDate,
      });
    } else {
      sendError(res, "Invalid unsubscribe token", result.error);
    }
  } catch (error: any) {
    sendError(res, "Failed to verify unsubscribe token", error.message);
  }
}