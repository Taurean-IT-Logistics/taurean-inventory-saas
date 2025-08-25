import { CompanyDocument } from "../models/company.model";
import { InvoiceModel } from "../models/invoice.model";

export interface CompanyInvoiceFormat {
  type: "auto" | "prefix" | "paystack";
  prefix?: string;
  nextNumber?: number;
  padding?: number;
}

export interface InvoiceNumberConfig {
  invoiceNumber: string;
  nextNumber: number;
  year: number;
  month: number;
}

/**
 * Generate the next invoice number for a company based on their format
 */
export async function generateInvoiceNumber(
  company: CompanyDocument
): Promise<string> {
  try {
    const invoiceFormat = (company as any).invoiceFormat;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // Get the last invoice for this company
    const lastInvoice = await InvoiceModel.findOne(
      { company: company._id, isDeleted: false },
      {},
      { sort: { createdAt: -1 } }
    );

    let nextNumber = 1;
    if (lastInvoice) {
      const parsed = parseInvoiceNumber(lastInvoice.invoiceNumber);
      if (parsed.year === year && parsed.month === month) {
        nextNumber = parsed.nextNumber + 1;
      }
    }

    // If company has custom invoice format, use it
    if (invoiceFormat && invoiceFormat.type) {
      const padding = invoiceFormat.padding || 4;
      const paddedNumber = nextNumber.toString().padStart(padding, "0");

      switch (invoiceFormat.type) {
        case "auto":
          return `INV-${year}-${month.toString().padStart(2, "0")}-${paddedNumber}`;
        case "prefix":
          const prefix = invoiceFormat.prefix || "INV";
          return `${prefix}-${year}-${month.toString().padStart(2, "0")}-${paddedNumber}`;
        case "paystack":
          return `PS-${year}-${month.toString().padStart(2, "0")}-${paddedNumber}`;
        default:
          return `INV-${year}-${month.toString().padStart(2, "0")}-${paddedNumber}`;
      }
    }

    // Default format
    return `INV-${year}-${month.toString().padStart(2, "0")}-${nextNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Fallback to timestamp-based number
    return `INV-${Date.now()}`;
  }
}

/**
 * Parse an existing invoice number to extract components
 */
export function parseInvoiceNumber(invoiceNumber: string): {
  prefix: string;
  year: number;
  month: number;
  nextNumber: number;
  raw: string;
} {
  try {
    const parts = invoiceNumber.split("-");
    
    if (parts.length >= 4) {
      return {
        prefix: parts[0],
        year: parseInt(parts[1]),
        month: parseInt(parts[2]),
        nextNumber: parseInt(parts[3]),
        raw: invoiceNumber,
      };
    } else if (parts.length === 3) {
      return {
        prefix: parts[0],
        year: parseInt(parts[1]),
        month: parseInt(parts[2]),
        nextNumber: 1,
        raw: invoiceNumber,
      };
    }
    
    throw new Error("Invalid invoice number format");
  } catch (error) {
    console.error("Error parsing invoice number:", error);
    return {
      prefix: "INV",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      nextNumber: 1,
      raw: invoiceNumber,
    };
  }
}

/**
 * Get the next invoice number configuration for a company
 */
export async function getNextInvoiceConfig(
  company: CompanyDocument,
  lastInvoiceNumber?: string | null
): Promise<InvoiceNumberConfig> {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  let nextNumber = 1;

  // If we have a last invoice number, try to increment it
  if (lastInvoiceNumber) {
    const parsed = parseInvoiceNumber(lastInvoiceNumber);
    if (parsed.year === year && parsed.month === month) {
      nextNumber = parsed.nextNumber + 1;
    }
  }

  const invoiceNumber = await generateInvoiceNumber(company);

  return {
    invoiceNumber,
    nextNumber,
    year,
    month,
  };
}

/**
 * Validate invoice number format
 */
export function validateInvoiceNumber(
  invoiceNumber: string,
  companyFormat: CompanyInvoiceFormat
): boolean {
  try {
    const parsed = parseInvoiceNumber(invoiceNumber);
    
    // Basic validation
    if (parsed.year < 2020 || parsed.year > 2030) return false;
    if (parsed.month < 1 || parsed.month > 12) return false;
    if (parsed.nextNumber < 1) return false;

    // Format-specific validation
    switch (companyFormat.type) {
      case "prefix":
        if (companyFormat.prefix && !invoiceNumber.startsWith(companyFormat.prefix)) {
          return false;
        }
        break;
      case "paystack":
        if (!invoiceNumber.startsWith("PS-")) {
          return false;
        }
        break;
      case "auto":
        if (!invoiceNumber.startsWith("INV-")) {
          return false;
        }
        break;
    }

    return true;
  } catch (error) {
    console.error("Error validating invoice number:", error);
    return false;
  }
}

/**
 * Get invoice number suggestions for a company
 */
export function getInvoiceNumberSuggestions(
  company: CompanyDocument
): string[] {
  const invoiceFormat = (company as any).invoiceFormat;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const padding = invoiceFormat?.padding || 4;

  const suggestions: string[] = [];

  if (invoiceFormat?.type === "prefix" && invoiceFormat.prefix) {
    suggestions.push(`${invoiceFormat.prefix}-${year}-${month.toString().padStart(2, "0")}-0001`);
  } else if (invoiceFormat?.type === "paystack") {
    suggestions.push(`PS-${year}-${month.toString().padStart(2, "0")}-0001`);
  } else {
    suggestions.push(`INV-${year}-${month.toString().padStart(2, "0")}-0001`);
  }

  return suggestions;
}