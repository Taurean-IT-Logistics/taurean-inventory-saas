import { TransactionModel } from "../models/transaction.model";
import { CompanyModel } from "../models/company.model";

export async function calculateCompanyBalance(companyId: string): Promise<{
  totalPaid: number;
  totalFees: number;
  netAmount: number;
}> {
  try {
    // Sum all paid transactions for the company
    const paidTransactions = await TransactionModel.aggregate([
      {
        $match: {
          company: companyId,
          isDeleted: false,
          status: "completed", // Assuming completed transactions are paid
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalPaid = paidTransactions[0]?.total || 0;

    // Get company fee percentage
    const company = await CompanyModel.findById(companyId).select("feePercent");
    const feePercent = company?.feePercent || 5;

    // Calculate platform fees
    const totalFees = (totalPaid * feePercent) / 100;
    const netAmount = totalPaid - totalFees;

    return {
      totalPaid,
      totalFees,
      netAmount,
    };
  } catch (error) {
    console.error("Error calculating company balance:", error);
    throw new Error("Failed to calculate company balance");
  }
}
