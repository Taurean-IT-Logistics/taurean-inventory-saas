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
): Promise<{ taxes: TaxDocument[]; total: number; totalPages: number; currentPage: number }> => {
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
      TaxModel.countDocuments(query)
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
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
): Promise<{ taxes: TaxDocument[]; total: number; totalPages: number; currentPage: number }> => {
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
      TaxModel.countDocuments(query)
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
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
 * Update tax by ID
 */
const updateTax = async (
  id: string,
  updateData: Partial<Tax>
): Promise<TaxDocument | null> => {
  try {
    if (updateData.isSuperAdminTax) {
      updateData.company = undefined;
    }

    return await TaxModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to update tax: ${
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
    return await TaxModel.find({ isDefault: true, isSuperAdminTax: true })
      .sort({ priority: 1, createdAt: -1 });
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
        description: "Value Added Tax - 15%"
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
        description: "National Health Insurance Scheme - 2.5%"
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
        description: "COVID-19 Health Levy - 1%"
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
        description: "Ghana Education Trust Fund - 2.5%"
      }
    ];

    const createdTaxes = [];
    for (const taxData of defaultTaxes) {
      const existingTax = await TaxModel.findOne({ 
        name: taxData.name, 
        isDefault: true 
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
): Promise<{ taxes: TaxDocument[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const query: any = {
      $or: [
        { isDefault: true, isSuperAdminTax: true },
        { company: companyId }
      ]
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
      TaxModel.countDocuments(query)
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
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
): Promise<{ taxes: TaxDocument[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const query: any = {
      isSuperAdminTax: true,
      company: { $exists: false }
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
      TaxModel.countDocuments(query)
    ]);

    return {
      taxes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
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
  updateTax,
  getAllTaxes,
  getGlobalTaxes,
  getCompanyTaxes,
  getTaxById,
  deleteTax,
  getDefaultTaxes,
  createDefaultTaxes,
  getCombinedTaxes,
};
