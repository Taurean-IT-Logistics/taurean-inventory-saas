import { TaxModel, TaxDocument } from "../models";
import { Tax } from "../types";

const createTax = async (taxData: Partial<Tax>): Promise<TaxDocument> => {
  try {
    const tax = new TaxModel(taxData);
    return await tax.save();
  } catch (error) {
    throw new Error(
      `Failed to create tax: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const createCompanyTax = async (
  taxData: Partial<Tax>,
  userId: string
): Promise<TaxDocument> => {
  try {
    const tax = new TaxModel({
      ...taxData,
      createdBy: userId,
      isSuperAdminTax: false, // Always false for company taxes, regardless of what's passed
      active: true,
    });
    return await tax.save();
  } catch (error) {
    throw new Error(
      `Failed to create company tax: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get all taxes with optional filtering and pagination
 */
const getAllTaxes = async (
  filters: {
    active?: boolean;
    type?: string;
    appliesTo?: string;
    isDefault?: boolean;
    isSuperAdminTax?: boolean;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  taxes: TaxDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = {};

    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.appliesTo) {
      query.appliesTo = filters.appliesTo;
    }

    if (filters.isDefault !== undefined) {
      query.isDefault = filters.isDefault;
    }

    if (filters.isSuperAdminTax !== undefined) {
      query.isSuperAdminTax = filters.isSuperAdminTax;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [taxes, total] = await Promise.all([
      TaxModel.find(query)
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TaxModel.countDocuments(query),
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch taxes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get company-specific taxes with optional filtering and pagination
 */
const getCompanyTaxes = async (
  filters: {
    active?: boolean;
    type?: string;
    appliesTo?: string;
    companyId?: string;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  taxes: TaxDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = { company: filters.companyId };

    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.appliesTo) {
      query.appliesTo = filters.appliesTo;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [taxes, total] = await Promise.all([
      TaxModel.find(query)
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TaxModel.countDocuments(query),
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch company taxes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get tax by ID
 */
const getTaxById = async (id: string): Promise<TaxDocument | null> => {
  try {
    return await TaxModel.findById(id);
  } catch (error) {
    throw new Error(
      `Failed to fetch tax: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Create a new independent tax (replaces createNewTaxVersion)
 * This maintains transaction integrity by creating a completely new tax
 */
const createIndependentTax = async (
  taxData: Partial<Tax>,
  userId: string,
  reason?: string,
  replacedTaxId?: string
): Promise<TaxDocument> => {
  try {
    const newTax = new TaxModel({
      ...taxData,
      createdBy: userId,
      createdReason: reason,
      replacedTax: replacedTaxId,
      replacementReason: reason,
      isArchived: false,
    });

    const savedTax = await newTax.save();

    // If this tax is replacing another one, archive the old tax
    // BUT keep it accessible for existing transactions
    if (replacedTaxId) {
      await archiveTax(
        replacedTaxId,
        userId,
        `Replaced by new tax: ${savedTax._id}`
      );
    }

    return savedTax;
  } catch (error) {
    throw new Error(
      `Failed to create independent tax: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Archive a tax (mark as archived but keep accessible for transactions)
 * This maintains transaction integrity by preserving tax data
 */
const archiveTax = async (
  taxId: string,
  userId: string,
  reason?: string
): Promise<TaxDocument | null> => {
  try {
    const archivedTax = await TaxModel.findByIdAndUpdate(
      taxId,
      {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: userId,
        archivedReason: reason,
        active: false, // Deactivate for new transactions but keep data intact
      },
      { new: true }
    );

    return archivedTax;
  } catch (error) {
    throw new Error(
      `Failed to archive tax: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get tax audit trail (shows which tax replaced which)
 * This helps maintain audit integrity by showing the relationship between taxes
 */
const getTaxAuditTrail = async (
  taxId: string
): Promise<{
  currentTax: TaxDocument | null;
  replacedTax: TaxDocument | null;
  replacedByTax: TaxDocument | null;
}> => {
  try {
    const currentTax = await TaxModel.findById(taxId)
      .populate("createdBy", "firstName lastName email")
      .populate("replacedTax", "name rate createdAt");

    const replacedTax = currentTax?.replacedTax
      ? await TaxModel.findById(currentTax.replacedTax).populate(
          "createdBy",
          "firstName lastName email"
        )
      : null;

    const replacedByTax = await TaxModel.findOne({
      replacedTax: taxId,
    }).populate("createdBy", "firstName lastName email");

    return {
      currentTax,
      replacedTax,
      replacedByTax,
    };
  } catch (error) {
    throw new Error(
      `Failed to get tax audit trail: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get archived taxes
 */
const getArchivedTaxes = async (
  companyId?: string,
  pagination: { page: number; limit: number } = { page: 1, limit: 10 }
): Promise<{
  taxes: TaxDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = { isArchived: true };

    if (companyId) {
      query.company = companyId;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [taxes, total] = await Promise.all([
      TaxModel.find(query)
        .populate("archivedBy", "firstName lastName email")
        .populate("company", "name")
        .sort({ archivedAt: -1 })
        .skip(skip)
        .limit(pagination.limit),
      TaxModel.countDocuments(query),
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      currentPage: pagination.page,
    };
  } catch (error) {
    throw new Error(
      `Failed to get archived taxes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Delete tax by ID
 */
const deleteTax = async (id: string): Promise<boolean> => {
  try {
    const result = await TaxModel.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    throw new Error(
      `Failed to delete tax: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get system default taxes (VAT, NHIS, etc.)
 */
const getDefaultTaxes = async (): Promise<TaxDocument[]> => {
  try {
    return await TaxModel.find({ isDefault: true, isSuperAdminTax: true }).sort(
      { priority: 1, createdAt: -1 }
    );
  } catch (error) {
    throw new Error(
      `Failed to fetch default taxes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Create default system taxes
 */
const createDefaultTaxes = async (): Promise<TaxDocument[]> => {
  try {
    const defaultTaxes = [
      {
        name: "VAT",
        rate: 0.15,
        type: "VAT",
        isSuperAdminTax: true,
        isDefault: true,
        priority: 1,
        active: true,
        calculationMethod: "exclusive",
        appliesTo: ["facility", "inventory_item"],
        description: "Value Added Tax - 15%",
      },
      {
        name: "NHIS",
        rate: 0.025,
        type: "NHIS",
        isSuperAdminTax: true,
        isDefault: true,
        priority: 2,
        active: true,
        calculationMethod: "exclusive",
        appliesTo: ["facility", "inventory_item"],
        description: "National Health Insurance Scheme - 2.5%",
      },
      {
        name: "COVID Levy",
        rate: 0.01,
        type: "COVID",
        isSuperAdminTax: true,
        isDefault: true,
        priority: 3,
        active: true,
        calculationMethod: "exclusive",
        appliesTo: ["facility", "inventory_item"],
        description: "COVID-19 Health Levy - 1%",
      },
      {
        name: "GETFUND",
        rate: 0.025,
        type: "GETFUND",
        isSuperAdminTax: true,
        isDefault: true,
        priority: 4,
        active: true,
        calculationMethod: "exclusive",
        appliesTo: ["facility", "inventory_item"],
        description: "Ghana Education Trust Fund - 2.5%",
      },
    ];

    const createdTaxes = [];
    for (const taxData of defaultTaxes) {
      const existingTax = await TaxModel.findOne({
        name: taxData.name,
        isDefault: true,
      });

      if (!existingTax) {
        const tax = new TaxModel(taxData);
        createdTaxes.push(await tax.save());
      }
    }

    return createdTaxes;
  } catch (error) {
    throw new Error(
      `Failed to create default taxes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get combined taxes (default + company specific)
 */
const getCombinedTaxes = async (
  companyId?: string,
  filters: {
    active?: boolean;
    type?: string;
    appliesTo?: string;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  taxes: TaxDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = {
      $or: [{ isDefault: true, isSuperAdminTax: true }, { company: companyId }],
    };

    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.appliesTo) {
      query.appliesTo = filters.appliesTo;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [taxes, total] = await Promise.all([
      TaxModel.find(query)
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TaxModel.countDocuments(query),
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch combined taxes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get global taxes (Super Admin taxes)
 */
const getGlobalTaxes = async (
  filters: {
    active?: boolean;
    type?: string;
    appliesTo?: string;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  taxes: TaxDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = {
      isSuperAdminTax: true,
      company: { $exists: false },
    };

    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.appliesTo) {
      query.appliesTo = filters.appliesTo;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [taxes, total] = await Promise.all([
      TaxModel.find(query)
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TaxModel.countDocuments(query),
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch global taxes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  createTax,
  createCompanyTax,
  createIndependentTax,
  archiveTax,
  getTaxAuditTrail,
  getArchivedTaxes,
  getAllTaxes,
  getGlobalTaxes,
  getCompanyTaxes,
  getTaxById,
  deleteTax,
  getDefaultTaxes,
  createDefaultTaxes,
  getCombinedTaxes,
};
