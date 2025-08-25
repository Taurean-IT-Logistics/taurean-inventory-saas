export const SUPER_ADMIN_CONFIG = {
  COMPANY_NAME: process.env.SUPER_ADMIN_COMPANY_NAME || "Taurean IT",
  COMPANY_DESCRIPTION:
    process.env.SUPER_ADMIN_COMPANY_DESCRIPTION ||
    "Creator and operator of the Taurean Inventory SaaS platform",
  COMPANY_LOCATION: process.env.SUPER_ADMIN_COMPANY_LOCATION || "Ghana",
  COMPANY_EMAIL: process.env.SUPER_ADMIN_COMPANY_EMAIL || "admin@taureanit.com",
  COMPANY_PHONE: process.env.SUPER_ADMIN_COMPANY_PHONE || "+233000000000",
  COMPANY_CURRENCY: process.env.SUPER_ADMIN_COMPANY_CURRENCY || "GHS",
  COMPANY_FEE_PERCENT: parseInt(
    process.env.SUPER_ADMIN_COMPANY_FEE_PERCENT || "5"
  ),
  INVOICE_PREFIX: process.env.SUPER_ADMIN_INVOICE_PREFIX || "TIL",
  LICENSE_KEY_PREFIX:
    process.env.SUPER_ADMIN_LICENSE_KEY_PREFIX || "TAUREAN-IT",
} as const;

export const isSuperAdminCompany = (companyName: string): boolean => {
  return companyName === SUPER_ADMIN_CONFIG.COMPANY_NAME;
};

export const isSuperAdminUser = (user: any): boolean => {
  return user?.isSuperAdmin === true;
};
