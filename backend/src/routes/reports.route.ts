import express from "express";
import { ReportsController } from "../controllers/reports.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Get report number
router.get("/:type/next-number", AuthMiddleware, ReportsController.getReportNumber);

// Get report data
router.get("/:type/data", AuthMiddleware, ReportsController.getReportData);

// Get bookings report data
router.get("/bookings/data", AuthMiddleware, ReportsController.getBookingsReportData);

// Get invoices report data
router.get("/invoices/data", AuthMiddleware, ReportsController.getInvoicesReportData);

// Get users report data
router.get("/users/data", AuthMiddleware, ReportsController.getUsersReportData);

// Get facilities report data
router.get("/facilities/data", AuthMiddleware, ReportsController.getFacilitiesReportData);

// Get transactions report data
router.get("/transactions/data", AuthMiddleware, ReportsController.getTransactionsReportData);

export default router;