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
  appliesTo: "facility" | "inventoryItem" | "both";
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

    // Map the appliesTo values to match backend enum
    let scheduleAppliesTo: string;
    if (schedule.appliesTo === "facilities") {
      scheduleAppliesTo = "facility";
    } else if (schedule.appliesTo === "inventoryItem") {
      scheduleAppliesTo = "inventoryItem"; // Keep as inventoryItem to match backend
    } else {
      scheduleAppliesTo = schedule.appliesTo;
    }

    if (scheduleAppliesTo !== appliesTo && schedule.appliesTo !== "all")
      return false;

    // Handle company comparison - schedule.company can be a string ID or Company object
    const scheduleCompanyId =
      typeof schedule.company === "string"
        ? schedule.company
        : (schedule.company as any)?._id || (schedule.company as any)?.id;

    // Only include schedules that belong to the specific company
    // Both super admin and regular company schedules are company-specific
    if (companyId && scheduleCompanyId !== companyId) {
      return false;
    }
    return true;
  });

  // Get the single active tax schedule for the company
  // Business rule: A company can only have one active schedule at a time
  // When a new schedule is created, all others are automatically deactivated
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
  const scheduleComponents = activeSchedule.components || [];

  // Handle both populated and unpopulated components
  const applicableTaxes = scheduleComponents.filter((component) => {
    // If component is just an ID string, we can't filter it properly
    // This should be handled by the backend population
    if (typeof component === "string") {
      return false;
    }

    const tax = component as Tax;

    // Since we only process company schedules now, include all taxes in the schedule
    // The schedule filtering above ensures only company-specific schedules are processed
    // Individual tax active status is ignored - if it's in the schedule, it's applied (integrity)
    // The schedule's appliesTo field determines what the taxes apply to, not individual taxes
    return true;
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
    appliesTo: "inventoryItem",
    companyId,
    isTaxable,
    isTaxInclusive,
    isTaxOnTax,
  });
}
