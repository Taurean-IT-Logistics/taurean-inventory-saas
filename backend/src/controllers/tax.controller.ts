import { Request, Response } from "express";
import { TaxService } from "../services";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Create a global tax (Super Admin only)
 */
export const createGlobalTax = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taxData = {
      ...req.body,
      isSuperAdminTax: true,
      company: undefined, // Global taxes don't belong to a company
    };

    const newTax = await TaxService.createTax(taxData);
    sendSuccess(res, "Global tax created successfully", newTax);
  } catch (error) {
    sendError(res, "Failed to create global tax", error);
  }
};

/**
 * Create a company tax
 */
export const createCompanyTax = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taxData = req.body;
    const newTax = await TaxService.createCompanyTax(
      taxData,
      req.user?.id || ""
    );
    sendSuccess(res, "Company tax created successfully", newTax);
  } catch (error) {
    sendError(res, "Failed to create company tax", error);
  }
};

/**
 * Copy a super admin tax to company taxes
 */
export const copySuperAdminTax = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taxId } = req.params;

    if (!req.user?.companyId) {
      sendError(
        res,
        "Company ID not found. User must be associated with a company."
      );
      return;
    }

    // Get the super admin tax
    const superAdminTax = await TaxService.getTaxById(taxId);

    if (!superAdminTax) {
      sendNotFound(res, "Tax not found");
      return;
    }

    if (!superAdminTax.isSuperAdminTax) {
      sendError(res, "Only super admin taxes can be copied");
      return;
    }

    // Create a copy for the company
    const taxData = {
      name: superAdminTax.name,
      description: superAdminTax.description,
      rate: superAdminTax.rate,
      type: superAdminTax.type,
      appliesTo: superAdminTax.appliesTo,
      active: superAdminTax.active,
      isSuperAdminTax: false,
      company: req.user.companyId as any, // Cast to any to satisfy TypeScript
      copiedFrom: superAdminTax._id?.toString(), // Track the original tax
    };

    const newTax = await TaxService.createTax(taxData);
    sendSuccess(res, "Tax copied successfully", newTax);
  } catch (error) {
    sendError(res, "Failed to copy tax", error);
  }
};

/**
 * Get global taxes (Super Admin only)
 */
export const getGlobalTaxes = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      isSuperAdminTax: true,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await TaxService.getGlobalTaxes(filters, pagination);
    sendSuccess(res, "Global taxes fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch global taxes", error);
  }
};

/**
 * Get all taxes with optional filters and pagination
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
      isDefault: req.query.isDefault === "true" ? true : undefined,
      isSuperAdminTax: req.query.isSuperAdminTax === "true" ? true : undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await TaxService.getAllTaxes(filters, pagination);
    sendSuccess(res, "Taxes fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch taxes", error);
  }
};

/**
 * Get company-specific taxes with pagination
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

    const filters = {
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

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await TaxService.getCompanyTaxes(filters, pagination);
    sendSuccess(res, "Company taxes fetched successfully", result);
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
 * Create a new independent tax (replaces updateTax)
 * This maintains transaction integrity by creating a completely new tax
 */
export const createIndependentTax = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, ...taxData } = req.body;
    const userId = req.user?.id!;

    // If updating an existing tax, create a new independent tax
    if (id && id !== "new") {
      const newTax = await TaxService.createIndependentTax(
        taxData,
        userId,
        reason,
        id // This tax replaces the one with this ID
      );

      sendSuccess(
        res,
        "New independent tax created successfully. Previous tax has been archived but remains accessible for existing transactions.",
        newTax
      );
    } else {
      // Creating a brand new tax
      const newTax = await TaxService.createIndependentTax(
        taxData,
        userId,
        reason
      );

      sendSuccess(res, "New tax created successfully", newTax);
    }
  } catch (error) {
    sendError(res, "Failed to create independent tax", error);
  }
};

/**
 * Archive a tax
 */
export const archiveTax = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id!;

    const archivedTax = await TaxService.archiveTax(id, userId, reason);

    if (!archivedTax) {
      sendNotFound(res, "Tax not found");
      return;
    }

    sendSuccess(res, "Tax archived successfully", archivedTax);
  } catch (error) {
    sendError(res, "Failed to archive tax", error);
  }
};

/**
 * Get tax audit trail (shows which tax replaced which)
 */
export const getTaxAuditTrail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const auditTrail = await TaxService.getTaxAuditTrail(id);

    sendSuccess(res, "Tax audit trail retrieved successfully", auditTrail);
  } catch (error) {
    sendError(res, "Failed to get tax audit trail", error);
  }
};

/**
 * Get archived taxes
 */
export const getArchivedTaxes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const { page = 1, limit = 10 } = req.query;

    const result = await TaxService.getArchivedTaxes(companyId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    sendSuccess(res, "Archived taxes retrieved successfully", result);
  } catch (error) {
    sendError(res, "Failed to get archived taxes", error);
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

/**
 * Get default system taxes
 */
export const getDefaultTaxes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taxes = await TaxService.getDefaultTaxes();
    sendSuccess(res, "Default taxes fetched successfully", taxes);
  } catch (error) {
    sendError(res, "Failed to fetch default taxes", error);
  }
};

/**
 * Create default system taxes
 */
export const createDefaultTaxes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taxes = await TaxService.createDefaultTaxes();
    sendSuccess(res, "Default taxes created successfully", taxes);
  } catch (error) {
    sendError(res, "Failed to create default taxes", error);
  }
};

/**
 * Get combined taxes (global + company specific)
 */
export const getCombinedTaxes = async (
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

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    // Get both global and company taxes
    const [globalTaxes, companyTaxes] = await Promise.all([
      TaxService.getGlobalTaxes(filters, pagination),
      TaxService.getCompanyTaxes(
        { ...filters, companyId: req.user.companyId },
        pagination
      ),
    ]);

    // Combine the results
    const combinedTaxes = [
      ...(globalTaxes.taxes || []),
      ...(companyTaxes.taxes || []),
    ];

    const result = {
      taxes: combinedTaxes,
      total: combinedTaxes.length,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(combinedTaxes.length / pagination.limit),
    };

    sendSuccess(res, "Combined taxes fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch combined taxes", error);
  }
};

export const TaxController = {
  createGlobalTax,
  createCompanyTax,
  copySuperAdminTax,
  getGlobalTaxes,
  getCompanyTaxes,
  getCombinedTaxes,
  getTaxes,
  getTax,
  createIndependentTax,
  archiveTax,
  getTaxAuditTrail,
  getArchivedTaxes,
  deleteTax,
  getDefaultTaxes,
  createDefaultTaxes,
};
