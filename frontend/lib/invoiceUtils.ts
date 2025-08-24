/**
 * Utility functions for generating and managing invoice numbers per company
 */

export interface CompanyInvoiceFormat {
  type: "auto" | "prefix" | "paystack";
  prefix?: string; // e.g., TIL-
  nextNumber?: number; // auto-increment counter
  padding?: number; // e.g., 4 -> 0001
}

export interface InvoiceNumberConfig {
  prefix: string;
  nextNumber: number;
  padding: number;
  year?: string;
  month?: string;
}

/**
 * Generate the next invoice number for a company based on their format
 */
export function generateInvoiceNumber(
  companyFormat: CompanyInvoiceFormat,
  lastInvoiceNumber?: string | null
): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  // Get the next number
  const nextNumber = companyFormat.nextNumber || 1;
  const padding = companyFormat.padding || 4;

  let invoiceNumber = "";

  switch (companyFormat.type) {
    case "auto":
      // Auto format: INV-2024-12-0001
      invoiceNumber = `INV-${year}-${month}-${nextNumber
        .toString()
        .padStart(padding, "0")}`;
      break;

    case "prefix":
      // Custom prefix format: TIL-2024-12-0001
      const prefix = companyFormat.prefix || "INV";
      invoiceNumber = `${prefix}-${year}-${month}-${nextNumber
        .toString()
        .padStart(padding, "0")}`;
      break;

    case "paystack":
      // Paystack format: PS-2024-12-0001
      invoiceNumber = `PS-${year}-${month}-${nextNumber
        .toString()
        .padStart(padding, "0")}`;
      break;

    default:
      // Fallback to auto format
      invoiceNumber = `INV-${year}-${month}-${nextNumber
        .toString()
        .padStart(padding, "0")}`;
  }

  return invoiceNumber;
}

/**
 * Parse an existing invoice number to extract components
 */
export function parseInvoiceNumber(invoiceNumber: string): {
  prefix: string;
  year?: string;
  month?: string;
  sequence: number;
  raw: string;
} {
  const result = {
    prefix: "",
    year: undefined as string | undefined,
    month: undefined as string | undefined,
    sequence: 0,
    raw: invoiceNumber,
  };

  try {
    // Try to parse format: PREFIX-YYYY-MM-SSSS
    const parts = invoiceNumber.split("-");

    if (parts.length >= 4) {
      result.prefix = parts[0];
      result.year = parts[1];
      result.month = parts[2];
      result.sequence = parseInt(parts[3], 10);
    } else if (parts.length >= 2) {
      // Fallback for simpler formats
      result.prefix = parts[0];
      result.sequence = parseInt(parts[1], 10);
    }
  } catch (error) {
    console.error("Error parsing invoice number:", error);
  }

  return result;
}

/**
 * Get the next invoice number configuration for a company
 */
export function getNextInvoiceConfig(
  companyFormat: CompanyInvoiceFormat,
  lastInvoiceNumber?: string | null
): InvoiceNumberConfig {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");

  let nextNumber = companyFormat.nextNumber || 1;

  // If we have a last invoice number, try to increment it
  if (lastInvoiceNumber) {
    const parsed = parseInvoiceNumber(lastInvoiceNumber);
    if (parsed.sequence > 0) {
      // Check if year/month changed
      if (parsed.year !== currentYear || parsed.month !== currentMonth) {
        nextNumber = 1; // Reset sequence for new year/month
      } else {
        nextNumber = parsed.sequence + 1;
      }
    }
  }

  return {
    prefix: companyFormat.prefix || "INV",
    nextNumber,
    padding: companyFormat.padding || 4,
    year: currentYear,
    month: currentMonth,
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

    // Check if sequence is valid
    if (parsed.sequence <= 0) {
      return false;
    }

    // Check if year is valid (if present)
    if (parsed.year) {
      const year = parseInt(parsed.year, 10);
      if (year < 2000 || year > 2100) {
        return false;
      }
    }

    // Check if month is valid (if present)
    if (parsed.month) {
      const month = parseInt(parsed.month, 10);
      if (month < 1 || month > 12) {
        return false;
      }
    }

    // Check if prefix matches company format
    if (companyFormat.type === "prefix" && companyFormat.prefix) {
      if (parsed.prefix !== companyFormat.prefix) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get invoice number suggestions for a company
 */
export function getInvoiceNumberSuggestions(
  companyName: string,
  companyFormat: CompanyInvoiceFormat
): string[] {
  const suggestions: string[] = [];

  // Generate suggestions based on company name
  const companyPrefix = companyName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 3);

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const padding = companyFormat.padding || 4;

  // Suggestion 1: Based on company format type
  switch (companyFormat.type) {
    case "auto":
      suggestions.push(`INV-${year}-${month}-${"1".padStart(padding, "0")}`);
      break;
    case "prefix":
      const prefix = companyFormat.prefix || companyPrefix;
      suggestions.push(
        `${prefix}-${year}-${month}-${"1".padStart(padding, "0")}`
      );
      break;
    case "paystack":
      suggestions.push(`PS-${year}-${month}-${"1".padStart(padding, "0")}`);
      break;
  }

  // Suggestion 2: Company initials format
  suggestions.push(
    `${companyPrefix}-${year}-${month}-${"1".padStart(padding, "0")}`
  );

  // Suggestion 3: Simple sequential
  suggestions.push(
    `${companyFormat.prefix || "INV"}-${"1".padStart(padding, "0")}`
  );

  return suggestions;
}

/**
 * Update company invoice format with next number
 */
export function updateCompanyInvoiceFormat(
  companyFormat: CompanyInvoiceFormat,
  lastInvoiceNumber?: string | null
): CompanyInvoiceFormat {
  const config = getNextInvoiceConfig(companyFormat, lastInvoiceNumber);

  return {
    ...companyFormat,
    nextNumber: config.nextNumber,
  };
}
