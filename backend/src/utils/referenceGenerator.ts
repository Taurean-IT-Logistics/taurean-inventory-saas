import crypto from "crypto";

export class ReferenceGenerator {
  private static readonly PREFIXES = {
    CASH: "CASH",
    CHEQUE: "CHQ",
    SPLIT: "SPL",
    ADVANCE: "ADV",
    BOOKING: "BK",
    RENTAL: "RT",
    SUBSCRIPTION: "SUB",
    GENERAL: "TXN",
  };

  /**
   * Generate a unique reference for different payment types
   */
  static generateReference(
    type: "cash" | "cheque" | "split" | "advance" | "booking" | "rental" | "subscription" | "general",
    userId?: string,
    companyId?: string
  ): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomString = crypto.randomBytes(4).toString("hex").toUpperCase();
    
    // Get prefix based on type
    const prefix = this.PREFIXES[type.toUpperCase() as keyof typeof this.PREFIXES] || this.PREFIXES.GENERAL;
    
    // Create a short hash from user/company IDs if provided
    let contextHash = "";
    if (userId && companyId) {
      const contextString = `${userId}-${companyId}`;
      contextHash = crypto.createHash("md5").update(contextString).digest("hex").substring(0, 4).toUpperCase();
    } else if (userId) {
      contextHash = crypto.createHash("md5").update(userId).digest("hex").substring(0, 4).toUpperCase();
    }
    
    // Format: PREFIX-TIMESTAMP-RANDOM-CONTEXT
    return `${prefix}-${timestamp}-${randomString}${contextHash ? `-${contextHash}` : ""}`;
  }

  /**
   * Generate a reference for cash payments
   */
  static generateCashReference(userId?: string, companyId?: string): string {
    return this.generateReference("cash", userId, companyId);
  }

  /**
   * Generate a reference for cheque payments
   */
  static generateChequeReference(userId?: string, companyId?: string): string {
    return this.generateReference("cheque", userId, companyId);
  }

  /**
   * Generate a reference for split payments
   */
  static generateSplitReference(userId?: string, companyId?: string): string {
    return this.generateReference("split", userId, companyId);
  }

  /**
   * Generate a reference for advance payments
   */
  static generateAdvanceReference(userId?: string, companyId?: string): string {
    return this.generateReference("advance", userId, companyId);
  }

  /**
   * Generate a reference for booking payments
   */
  static generateBookingReference(userId?: string, companyId?: string): string {
    return this.generateReference("booking", userId, companyId);
  }

  /**
   * Generate a reference for rental payments
   */
  static generateRentalReference(userId?: string, companyId?: string): string {
    return this.generateReference("rental", userId, companyId);
  }

  /**
   * Generate a reference for subscription payments
   */
  static generateSubscriptionReference(userId?: string, companyId?: string): string {
    return this.generateReference("subscription", userId, companyId);
  }

  /**
   * Generate a reference for general transactions
   */
  static generateGeneralReference(userId?: string, companyId?: string): string {
    return this.generateReference("general", userId, companyId);
  }

  /**
   * Validate reference format
   */
  static isValidReference(reference: string): boolean {
    if (!reference || typeof reference !== "string") {
      return false;
    }

    // Check if it matches the expected format: PREFIX-TIMESTAMP-RANDOM-CONTEXT
    const pattern = /^[A-Z]{2,4}-[A-Z0-9]+-[A-F0-9]{8}(-[A-F0-9]{4})?$/;
    return pattern.test(reference);
  }

  /**
   * Extract reference type from reference string
   */
  static getReferenceType(reference: string): string | null {
    if (!this.isValidReference(reference)) {
      return null;
    }

    const prefix = reference.split("-")[0];
    const typeMap: { [key: string]: string } = {
      CASH: "cash",
      CHQ: "cheque",
      SPL: "split",
      ADV: "advance",
      BK: "booking",
      RT: "rental",
      SUB: "subscription",
      TXN: "general",
    };

    return typeMap[prefix] || null;
  }

  /**
   * Generate a human-readable reference for display
   */
  static formatReferenceForDisplay(reference: string): string {
    if (!this.isValidReference(reference)) {
      return reference;
    }

    const parts = reference.split("-");
    const prefix = parts[0];
    const timestamp = parts[1];
    const random = parts[2];
    const context = parts[3];

    // Convert timestamp back to readable date
    const date = new Date(parseInt(timestamp, 36));
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

    return `${prefix}-${formattedDate}-${random}${context ? `-${context}` : ""}`;
  }

  /**
   * Generate a batch of references for bulk operations
   */
  static generateBatchReferences(
    type: "cash" | "cheque" | "split" | "advance" | "booking" | "rental" | "subscription" | "general",
    count: number,
    userId?: string,
    companyId?: string
  ): string[] {
    const references: string[] = [];
    const usedReferences = new Set<string>();

    for (let i = 0; i < count; i++) {
      let reference: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        reference = this.generateReference(type, userId, companyId);
        attempts++;
      } while (usedReferences.has(reference) && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error(`Failed to generate unique reference after ${maxAttempts} attempts`);
      }

      references.push(reference);
      usedReferences.add(reference);
    }

    return references;
  }
}

export default ReferenceGenerator;
