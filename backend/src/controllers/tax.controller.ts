import { Request, Response } from "express";
import { TaxService } from "../services";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Create a new tax
 */
export const createTax = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.isSuperAdminTax) {
      req.body.company = undefined;
    }

    if (!req.body.isSuperAdminTax) {
      req.body.company = req.user?.companyId;
    }

    const newTax = await TaxService.createTax(req.body);
    sendSuccess(res, "Tax created successfully", newTax);
  } catch (error) {
    sendError(res, "Failed to create tax", error);
  }
};

/**
 * Get all taxes with optional filters
 */
export const getTaxes = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      active:
        req.query.active === "true"
          ? true
          : req.query.active === "false"
          ? false
          : undefined,
      type: req.query.type as string,
      appliesTo: req.query.appliesTo as string,
    };

    const taxes = await TaxService.getAllTaxes(filters);
    sendSuccess(res, "Taxes fetched successfully", taxes);
  } catch (error) {
    sendError(res, "Failed to fetch taxes", error);
  }
};

/**
 * Get company-specific taxes
 */
export const getCompanyTaxes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(
        res,
        "Company ID not found. User must be associated with a company."
      );
      return;
    }

    const staffFilters = {
      active:
        req.query.active === "true"
          ? true
          : req.query.active === "false"
          ? false
          : undefined,
      type: req.query.type as string,
      appliesTo: req.query.appliesTo as string,
      companyId: req.user.companyId,
    };

    const superAdminFilters = {
      active:
        req.query.active === "true"
          ? true
          : req.query.active === "false"
          ? false
          : undefined,
    };
    const taxes = await TaxService.getCompanyTaxes(
      req.user.isSuperAdmin ? superAdminFilters : staffFilters
    );
    sendSuccess(res, "Company taxes fetched successfully", taxes);
  } catch (error) {
    sendError(res, "Failed to fetch company taxes", error);
  }
};

/**
 * Get a tax by ID
 */
export const getTax = async (req: Request, res: Response): Promise<void> => {
  try {
    const tax = await TaxService.getTaxById(req.params.id);
    if (!tax) {
      sendNotFound(res, "Tax not found");
      return;
    }
    sendSuccess(res, "Tax fetched successfully", tax);
  } catch (error) {
    sendError(res, "Failed to fetch tax", error);
  }
};

/**
 * Update a tax by ID
 */
export const updateTax = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedTax = await TaxService.updateTax(req.params.id, req.body);
    if (!updatedTax) {
      sendNotFound(res, "Tax not found");
      return;
    }
    sendSuccess(res, "Tax updated successfully", updatedTax);
  } catch (error) {
    sendError(res, "Failed to update tax", error);
  }
};

/**
 * Delete a tax by ID
 */
export const deleteTax = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await TaxService.deleteTax(req.params.id);
    if (!deleted) {
      sendNotFound(res, "Tax not found or already deleted");
      return;
    }
    sendSuccess(res, "Tax deleted successfully", deleted);
  } catch (error) {
    sendError(res, "Failed to delete tax", error);
  }
};
