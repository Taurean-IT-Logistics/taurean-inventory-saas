/**
 * Payment Configuration Helper Functions
 * Provides default configurations and validation for split and advance payments
 */

export interface SplitPaymentConfig {
  numberOfParts: number;
  intervalDays: number;
}

export interface AdvancePaymentConfig {
  inputMode: "percentage" | "fixed";
  percentage?: number;
  fixedAmount?: number;
  dueDate?: Date;
}

/**
 * Generate default split payment configuration
 */
export function generateDefaultSplitConfig(
  totalAmount: number
): SplitPaymentConfig {
  return {
    numberOfParts: 2, // Default to 2 payments
    intervalDays: 7, // Default to weekly intervals
  };
}

/**
 * Generate default advance payment configuration
 */
export function generateDefaultAdvanceConfig(
  totalAmount: number
): AdvancePaymentConfig {
  return {
    inputMode: "percentage",
    percentage: 50, // Default to 50% advance
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  };
}

/**
 * Validate split payment configuration
 */
export function validateSplitConfig(
  config: SplitPaymentConfig,
  totalAmount: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.numberOfParts || config.numberOfParts < 2) {
    errors.push("Split payment must have at least 2 parts");
  }

  if (config.numberOfParts > 12) {
    errors.push("Split payment cannot have more than 12 parts");
  }

  if (!config.intervalDays || config.intervalDays <= 0) {
    errors.push("Split payment interval must be greater than 0 days");
  }

  if (config.intervalDays > 365) {
    errors.push("Split payment interval cannot exceed 365 days");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate advance payment configuration
 */
export function validateAdvanceConfig(
  config: AdvancePaymentConfig,
  totalAmount: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (
    !config.inputMode ||
    !["percentage", "fixed"].includes(config.inputMode)
  ) {
    errors.push("Advance payment inputMode must be 'percentage' or 'fixed'");
  }

  if (config.inputMode === "percentage") {
    if (
      !config.percentage ||
      config.percentage <= 0 ||
      config.percentage >= 100
    ) {
      errors.push("Advance payment percentage must be between 0 and 100");
    }
  } else if (config.inputMode === "fixed") {
    if (
      !config.fixedAmount ||
      config.fixedAmount <= 0 ||
      config.fixedAmount >= totalAmount
    ) {
      errors.push(
        "Advance payment fixed amount must be greater than 0 and less than total amount"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate split payment amounts
 */
export function calculateSplitAmounts(
  totalAmount: number,
  config: SplitPaymentConfig
): number[] {
  const amounts: number[] = [];
  const amountPerPart = totalAmount / config.numberOfParts;

  for (let i = 0; i < config.numberOfParts; i++) {
    // Last payment gets any remainder due to rounding
    const amount =
      i === config.numberOfParts - 1
        ? totalAmount - amountPerPart * (config.numberOfParts - 1)
        : amountPerPart;
    amounts.push(amount); // Keep exact amount for audit purposes
  }

  return amounts;
}

/**
 * Calculate advance payment amount
 */
export function calculateAdvanceAmount(
  totalAmount: number,
  config: AdvancePaymentConfig
): number {
  if (config.inputMode === "percentage" && config.percentage) {
    return (totalAmount * config.percentage) / 100; // Keep exact calculation for audit purposes
  } else if (config.inputMode === "fixed" && config.fixedAmount) {
    return config.fixedAmount;
  }
  return 0;
}

/**
 * Generate payment schedule dates for split payments
 */
export function generateSplitPaymentDates(
  config: SplitPaymentConfig,
  startDate: Date = new Date()
): Date[] {
  const dates: Date[] = [];

  for (let i = 0; i < config.numberOfParts; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + i * config.intervalDays);
    dates.push(dueDate);
  }

  return dates;
}

/**
 * Generate payment schedule dates for advance payments
 */
export function generateAdvancePaymentDates(
  config: AdvancePaymentConfig,
  startDate: Date = new Date()
): Date[] {
  const dates: Date[] = [];

  // Advance payment date
  if (config.dueDate) {
    dates.push(new Date(config.dueDate));
  } else {
    const advanceDate = new Date(startDate);
    advanceDate.setDate(advanceDate.getDate() + 7); // Default to 7 days
    dates.push(advanceDate);
  }

  // Balance payment date (30 days after advance)
  const balanceDate = new Date(dates[0]);
  balanceDate.setDate(balanceDate.getDate() + 30);
  dates.push(balanceDate);

  return dates;
}
