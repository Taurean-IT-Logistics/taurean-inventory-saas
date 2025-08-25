import { Router } from "express";
import * as EmailController from "../controllers/email.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import {
  RequireActiveCompany,
  RequirePermissions,
} from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware);

// Test email configuration - available to all company admins with email permission
router.get(
  "/test-config",
  RequireActiveCompany(),
  RequirePermissions(["manageEmails"]),
  EmailController.testEmailConfiguration
);

// Test company email configuration - company admin only
router.get(
  "/test-company-config/:companyId",
  RequireActiveCompany(),
  RequirePermissions(["manageEmails"]),
  EmailController.testCompanyEmailConfiguration
);

// Send test email - available to all company admins with email permission
router.post(
  "/test",
  RequireActiveCompany(),
  RequirePermissions(["manageEmails"]),
  EmailController.sendTestEmail
);

// Send welcome email to specific user - admin/staff
router.post(
  "/welcome/:userId",
  RequireActiveCompany(),
  RequirePermissions(["manageUsers"]),
  EmailController.sendWelcomeEmail
);

// Send booking confirmation - admin/staff with booking permissions
router.post(
  "/booking-confirmation/:bookingId",
  RequireActiveCompany(),
  RequirePermissions(["manageBookings"]),
  EmailController.sendBookingConfirmation
);

// Send booking reminder - admin/staff with booking permissions
router.post(
  "/booking-reminder/:bookingId",
  RequireActiveCompany(),
  RequirePermissions(["manageBookings"]),
  EmailController.sendBookingReminder
);

// Send bulk email - available to company admins with email permission
router.post(
  "/bulk",
  RequireActiveCompany(),
  RequirePermissions(["manageEmails"]),
  EmailController.sendBulkEmail
);

// Email settings management
router.get(
  "/settings/:companyId",
  RequireActiveCompany(),
  RequirePermissions(["manageEmails"]),
  EmailController.getEmailSettings
);

router.put(
  "/settings/:companyId",
  RequireActiveCompany(),
  RequirePermissions(["manageEmails"]),
  EmailController.updateEmailSettings
);

export default router;
