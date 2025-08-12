import { Request, Response } from "express";
import { TransactionModel } from "../models";
import { sendSuccess, sendError } from "../utils";

export async function summary(req: Request, res: Response) {
  try {
    const start = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = req.query.end ? new Date(req.query.end as string) : new Date();
    const transactions = await TransactionModel.find({ createdAt: { $gte: start, $lte: end }, isDeleted: false });
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if ((t as any).type === "income") income += (t as any).amount || 0;
      if ((t as any).type === "expense") expense += (t as any).amount || 0;
    }
    const cashInHand = 0; // placeholder, would come from petty cash ledger
    const bankBalance = 0; // placeholder, would come from bank integration or reconciliations
    return sendSuccess(res, "Cash flow summary", { income, expense, net: income - expense, cashInHand, bankBalance });
  } catch (e: any) {
    return sendError(res, "Failed to fetch cash flow", e.message);
  }
}

export async function anomalies(req: Request, res: Response) {
  try {
    const transactions = await TransactionModel.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(1000);
    const alerts: any[] = [];
    for (const t of transactions) {
      if ((t as any).amount <= 0) alerts.push({ type: "invalid_amount", id: (t as any)._id });
      // add more anomaly detection as needed
    }
    return sendSuccess(res, "Cash flow anomalies", { alerts });
  } catch (e: any) {
    return sendError(res, "Failed to fetch anomalies", e.message);
  }
}