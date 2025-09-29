import { Tax, TaxSchedule } from "@/types";

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

export interface TaxScheduleCalculationOptions {
  subtotal: number;
  taxSchedules: TaxSchedule[];
  appliesTo: "facility" | "inventory_item" | "both";
  companyId?: string;
  isTaxable?: boolean;
  isTaxInclusive?: boolean;
  isTaxOnTax?: boolean;
}

/**
 * Calculate taxes from tax schedules
 */
export function calculateTaxesFromSchedules(
  options: TaxScheduleCalculationOptions
): TaxCalculationResult {
  const {
    subtotal,
    taxSchedules,
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

  // Filter applicable tax schedules based on appliesTo and company
  const applicableSchedules = taxSchedules.filter((schedule) => {
    if (!schedule.isActive) return false;

    // Map the appliesTo values
    let scheduleAppliesTo: string;
    if (schedule.appliesTo === "facilities") {
      scheduleAppliesTo = "facility";
    } else if (schedule.appliesTo === "inventory") {
      scheduleAppliesTo = "inventory_item";
    } else {
      scheduleAppliesTo = schedule.appliesTo;
    }

    if (scheduleAppliesTo !== appliesTo && schedule.appliesTo !== "all")
      return false;
    if (companyId && schedule.company !== companyId) return false;
    return true;
  });

  // Get the single active tax schedule for the company
  // Since a company can only have one active schedule at a time
  const activeSchedule = applicableSchedules.find(
    (schedule) => schedule.isActive
  );

  if (!activeSchedule) {
    // No active schedule found, return zero taxes
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

  // Get tax calculation settings from the active schedule
  const scheduleSettings = {
    taxInclusive: activeSchedule.taxInclusive || false,
    taxExclusive: activeSchedule.taxExclusive || false,
    taxOnTax: activeSchedule.taxOnTax || false,
  };

  // Get taxes from the active schedule
  const applicableTaxes = (activeSchedule.components || []).filter((tax) => {
    if (!tax.active) return false;
    if (tax.appliesTo !== appliesTo && tax.appliesTo !== "both") return false;
    // Exclude system-wide taxes - super admin charges automatically
    if (tax.isSuperAdminTax) return false;
    // Only include company-specific taxes
    if (companyId && (tax.company as any) === companyId) return true;
    return false;
  });

  // Calculate taxes (both percentage and fixed amount)
  const taxBreakdown = applicableTaxes.map((tax) => {
    let amount: number;
    let rate: number;

    if (tax.taxType === "fixed_amount") {
      // Fixed amount tax
      amount = tax.fixedAmount || 0;
      rate = 0; // Fixed amount doesn't have a percentage rate
    } else {
      // Percentage tax
      rate = tax.rate || 0;
      amount = subtotal * (rate / 100);
    }

    return { tax, amount, rate };
  });

  const totalTaxRate = applicableTaxes.reduce(
    (sum, tax) => sum + (tax.taxType === "fixed_amount" ? 0 : tax.rate || 0),
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
    total = subtotal + tax;
  }

  return {
    subtotal,
    serviceFee: 0,
    tax,
    total,
    serviceFeeRate: 0,
    totalTaxRate,
    applicableTaxes: applicableTaxes,
    taxBreakdown,
  };
}

/**
 * Calculate taxes from tax schedules for facility bookings
 */
export function calculateBookingTaxesFromSchedules(
  subtotal: number,
  taxSchedules: TaxSchedule[],
  companyId?: string,
  isTaxable: boolean = true,
  isTaxInclusive: boolean = false,
  isTaxOnTax: boolean = false
): TaxCalculationResult {
  return calculateTaxesFromSchedules({
    subtotal,
    taxSchedules,
    appliesTo: "facility",
    companyId,
    isTaxable,
    isTaxInclusive,
    isTaxOnTax,
  });
}

/**
 * Calculate taxes from tax schedules for rental items
 */
export function calculateRentalTaxesFromSchedules(
  subtotal: number,
  taxSchedules: TaxSchedule[],
  companyId?: string,
  isTaxable: boolean = true,
  isTaxInclusive: boolean = false,
  isTaxOnTax: boolean = false
): TaxCalculationResult {
  return calculateTaxesFromSchedules({
    subtotal,
    taxSchedules,
    appliesTo: "inventory_item",
    companyId,
    isTaxable,
    isTaxInclusive,
    isTaxOnTax,
  });
}
