import { Tax } from "@/types";

export interface TaxCalculationResult {
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  serviceFeeRate: number;
  totalTaxRate: number;
  applicableTaxes: Tax[];
  taxBreakdown: Array<{
    tax: Tax;
    amount: number;
    rate: number;
  }>;
}

export interface TaxCalculationOptions {
  subtotal: number;
  taxes: Tax[];
  appliesTo: "facility" | "inventory_item" | "both";
  companyId?: string;
  isTaxable?: boolean;
  isTaxInclusive?: boolean;
  isTaxOnTax?: boolean;
}

/**
 * Calculate taxes based on the tax schedule and configuration
 */
export function calculateTaxes(
  options: TaxCalculationOptions
): TaxCalculationResult {
  const {
    subtotal,
    taxes,
    appliesTo,
    companyId,
    isTaxable = true,
    isTaxInclusive = false,
    isTaxOnTax = false,
  } = options;

  if (!isTaxable || subtotal <= 0) {
    return {
      subtotal,
      serviceFee: 0,
      tax: 0,
      total: subtotal,
      serviceFeeRate: 0,
      totalTaxRate: 0,
      applicableTaxes: [],
      taxBreakdown: [],
    };
  }

  // Filter applicable taxes based on appliesTo and company
  const applicableTaxes = taxes.filter((tax) => {
    if (!tax.active) return false;
    if (tax.appliesTo !== appliesTo && tax.appliesTo !== "both") return false;
    if (tax.isSuperAdminTax) return true;
    if (companyId && (tax.company as any) === companyId) return true;
    return false;
  });

  // Separate service fees from regular taxes
  const serviceFeeTaxes = applicableTaxes.filter((tax) =>
    normalizeString(tax.name).includes("servicefee")
  );
  const regularTaxes = applicableTaxes.filter(
    (tax) => !normalizeString(tax.name).includes("servicefee")
  );

  // Calculate service fee
  const serviceFeeRate = serviceFeeTaxes.reduce(
    (sum, tax) => sum + (tax.rate || 0),
    0
  );
  const serviceFee = Math.round(subtotal * (serviceFeeRate / 100));

  // Calculate tax base (subtotal + service fee if tax on tax is enabled)
  const taxBase = isTaxOnTax ? subtotal + serviceFee : subtotal;

  // Calculate regular taxes
  const taxBreakdown = regularTaxes.map((tax) => {
    const rate = tax.rate || 0;
    const amount = Math.round(taxBase * (rate / 100));
    return { tax, amount, rate };
  });

  const totalTaxRate = regularTaxes.reduce(
    (sum, tax) => sum + (tax.rate || 0),
    0
  );
  const tax = taxBreakdown.reduce((sum, item) => sum + item.amount, 0);

  // Calculate total based on tax inclusive setting
  let total: number;
  if (isTaxInclusive) {
    // If tax inclusive, the subtotal already includes taxes
    total = subtotal;
  } else {
    // If tax exclusive, add taxes to subtotal
    total = subtotal + serviceFee + tax;
  }

  return {
    subtotal,
    serviceFee,
    tax,
    total,
    serviceFeeRate,
    totalTaxRate,
    applicableTaxes: regularTaxes,
    taxBreakdown,
  };
}

/**
 * Calculate taxes for rental items
 */
export function calculateRentalTaxes(
  subtotal: number,
  taxes: Tax[],
  companyId?: string,
  isTaxable: boolean = true,
  isTaxInclusive: boolean = false,
  isTaxOnTax: boolean = false
): TaxCalculationResult {
  return calculateTaxes({
    subtotal,
    taxes,
    appliesTo: "inventory_item",
    companyId,
    isTaxable,
    isTaxInclusive,
    isTaxOnTax,
  });
}

/**
 * Calculate taxes for facility bookings
 */
export function calculateBookingTaxes(
  subtotal: number,
  taxes: Tax[],
  companyId?: string,
  isTaxable: boolean = true,
  isTaxInclusive: boolean = false,
  isTaxOnTax: boolean = false
): TaxCalculationResult {
  return calculateTaxes({
    subtotal,
    taxes,
    appliesTo: "facility",
    companyId,
    isTaxable,
    isTaxInclusive,
    isTaxOnTax,
  });
}

/**
 * Calculate taxes for general transactions
 */
export function calculateTransactionTaxes(
  subtotal: number,
  taxes: Tax[],
  companyId?: string,
  isTaxable: boolean = true,
  isTaxInclusive: boolean = false,
  isTaxOnTax: boolean = false
): TaxCalculationResult {
  return calculateTaxes({
    subtotal,
    taxes,
    appliesTo: "both",
    companyId,
    isTaxable,
    isTaxInclusive,
    isTaxOnTax,
  });
}

/**
 * Get tax configuration for a company
 */
export function getTaxConfiguration(
  taxes: Tax[],
  companyId?: string
): {
  isTaxInclusive: boolean;
  isTaxOnTax: boolean;
  defaultTaxes: Tax[];
} {
  // This would typically come from company settings
  // For now, we'll use default values
  const companyTaxes = taxes.filter(
    (tax) =>
      tax.active &&
      (tax.isSuperAdminTax || (companyId && (tax.company as any) === companyId))
  );

  return {
    isTaxInclusive: false, // This should come from company settings
    isTaxOnTax: false, // This should come from company settings
    defaultTaxes: companyTaxes,
  };
}

/**
 * Format tax breakdown for display
 */
export function formatTaxBreakdown(
  result: TaxCalculationResult,
  currency: string = "₵"
): Array<{
  name: string;
  rate: string;
  amount: string;
  type: "service" | "tax";
}> {
  const breakdown: Array<{
    name: string;
    rate: string;
    amount: string;
    type: "service" | "tax";
  }> = [];

  if (result.serviceFee > 0) {
    breakdown.push({
      name: "Service Fee",
      rate: `${result.serviceFeeRate.toFixed(2)}%`,
      amount: `${currency}${result.serviceFee.toLocaleString()}`,
      type: "service",
    });
  }

  result.taxBreakdown.forEach((item) => {
    breakdown.push({
      name: item.tax.name,
      rate: `${item.rate.toFixed(2)}%`,
      amount: `${currency}${item.amount.toLocaleString()}`,
      type: "tax",
    });
  });

  return breakdown;
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str.trim().replace(/\s/g, "").toLowerCase();
}

/**
 * Get VAT tax specifically (prioritized)
 */
export function getVATTax(taxes: Tax[], companyId?: string): Tax | null {
  return (
    taxes.find(
      (tax) =>
        tax.active &&
        normalizeString(tax.name) === "vat" &&
        (tax.appliesTo === "both" || tax.appliesTo === "inventory_item") &&
        (tax.isSuperAdminTax ||
          (companyId && (tax.company as any) === companyId))
    ) || null
  );
}

/**
 * Get all applicable taxes sorted by priority (VAT first)
 */
export function getApplicableTaxes(
  taxes: Tax[],
  appliesTo: "facility" | "inventory_item" | "both",
  companyId?: string
): Tax[] {
  const applicable = taxes.filter((tax) => {
    if (!tax.active) return false;
    if (tax.appliesTo !== appliesTo && tax.appliesTo !== "both") return false;
    if (tax.isSuperAdminTax) return true;
    if (companyId && (tax.company as any) === companyId) return true;
    return false;
  });

  // Sort with VAT first
  return applicable.sort((a, b) => {
    const aIsVAT = normalizeString(a.name) === "vat";
    const bIsVAT = normalizeString(b.name) === "vat";

    if (aIsVAT && !bIsVAT) return -1;
    if (!aIsVAT && bIsVAT) return 1;

    return a.name.localeCompare(b.name);
  });
}
