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
 * Get all taxes with optional filtering
 */
const getAllTaxes = async (
  filters: {
    active?: boolean;
    type?: string;
    appliesTo?: string;
  } = {}
): Promise<TaxDocument[]> => {
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

    return await TaxModel.find(query).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(
      `Failed to fetch taxes: ${
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

export { createTax, updateTax, getAllTaxes, getTaxById, deleteTax };
