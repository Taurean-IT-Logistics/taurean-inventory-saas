import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.util";
import { ReportsService } from "../services/reports.service";

export class ReportsController {
  // Get report number
  static async getReportNumber(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const reportNumber = await ReportsService.getReportNumber(type, companyId);
      sendSuccess(res, "Report number generated", { reportNumber });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get report data
  static async getReportData(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const { dateRange } = req.query;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const reportData = await ReportsService.getReportData(type, companyId, dateRange as string);
      sendSuccess(res, "Report data retrieved", reportData);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get bookings report data
  static async getBookingsReportData(req: Request, res: Response) {
    try {
      const { dateRange } = req.query;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const reportData = await ReportsService.getBookingsReportData(companyId, dateRange as string);
      sendSuccess(res, "Bookings report data retrieved", reportData);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get invoices report data
  static async getInvoicesReportData(req: Request, res: Response) {
    try {
      const { dateRange } = req.query;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const reportData = await ReportsService.getInvoicesReportData(companyId, dateRange as string);
      sendSuccess(res, "Invoices report data retrieved", reportData);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get users report data
  static async getUsersReportData(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const reportData = await ReportsService.getUsersReportData(companyId);
      sendSuccess(res, "Users report data retrieved", reportData);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get facilities report data
  static async getFacilitiesReportData(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const reportData = await ReportsService.getFacilitiesReportData(companyId);
      sendSuccess(res, "Facilities report data retrieved", reportData);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get transactions report data
  static async getTransactionsReportData(req: Request, res: Response) {
    try {
      const { dateRange } = req.query;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const reportData = await ReportsService.getTransactionsReportData(companyId, dateRange as string);
      sendSuccess(res, "Transactions report data retrieved", reportData);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }
}