import { Router } from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import companyRoutes from "./company.route";
import facilityRoutes from "./facility.route";
import inventoryItemRoutes from "./inventoryItem.route";
import bookingRoutes from "./booking.route";
import transactionRoutes from "./transaction.route";

import cartRoutes from "./cart.route";
import resourceRoutes from "./resource.route";
import taxRoutes from "./tax.route";
import taxScheduleRoutes from "./taxSchedule.route";
import cashflowRoutes from "./cashflow.route";
import payoutRoutes from "./payout.route";
import deletionRoutes from "./deletion.route";
import notificationRoutes from "./notification.route";
import companyJoinRequestRoutes from "./companyJoinRequest.route";
import superAdminRoutes from "./superAdmin.route";
import companyRoleRoutes from "./companyRole.route";
import subscriptionRoutes from "./subscription.route";
import supportRoutes from "./support.route";
import emailRoutes from "./email.route";
import reviewRoutes from "./review.routes";
import healthRoutes from "./health.route";
import invoiceRoutes from "./invoice.route";
import reportsRoutes from "./reports.route";

const router = Router();

// Health check route
router.get("/health", async (req, res) => {
  try {
    // Test database connection
    const mongoose = require("mongoose");
    const dbState = mongoose.connection.readyState;

    const status = {
      server: "running",
      database: dbState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      dbState,
    };

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      server: "running",
      database: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/facilities", facilityRoutes);
router.use("/inventory-items", inventoryItemRoutes);
router.use("/bookings", bookingRoutes);
router.use("/transaction", transactionRoutes);

router.use("/cart", cartRoutes);
router.use("/resources", resourceRoutes);
router.use("/taxes", taxRoutes);
router.use("/tax-schedules", taxScheduleRoutes);
router.use("/cashflow", cashflowRoutes);
router.use("/payouts", payoutRoutes);
router.use("/deletion-requests", deletionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/company-join-requests", companyJoinRequestRoutes);
router.use("/super-admin", superAdminRoutes);
router.use("/company-roles", companyRoleRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/support", supportRoutes);
router.use("/email", emailRoutes);
router.use("/reviews", reviewRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/reports", reportsRoutes);

export default router;
