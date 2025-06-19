import { AccountDocument, AccountModel } from "../models";

// Create account service
const createAccount = async (
  accountData: Partial<AccountDocument>
): Promise<AccountDocument | null> => {
  try {
    const account = new AccountModel(accountData);
    return await account.save();
  } catch (error) {
    console.error("Error creating account:", error);
    throw new Error("Failed to create account");
  }
};

const getAccountsByUserId = async (
  userId: string,
  showDeleted: boolean = false
): Promise<AccountDocument[]> => {
  try {
    const filter = showDeleted
      ? { user: userId }
      : { user: userId, isDeleted: false };
    return await AccountModel.find(filter).populate("user");
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw new Error("Failed to fetch accounts");
  }
};

const getAccountById = async (
  accountId: string,
  showDeleted: boolean = false
): Promise<AccountDocument | null> => {
  try {
    const filter = showDeleted
      ? { _id: accountId }
      : { _id: accountId, isDeleted: false };
    return await AccountModel.findOne(filter).populate("user");
  } catch (error) {
    console.error("Error fetching account by ID:", error);
    throw new Error("Failed to fetch account");
  }
};

const updateAccount = async (
  accountId: string,
  updateData: Partial<AccountDocument>
): Promise<AccountDocument | null> => {
  try {
    return await AccountModel.findByIdAndUpdate(accountId, updateData, {
      new: true,
    }).populate("user");
  } catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Failed to update account");
  }
};

const deleteAccount = async (
  accountId: string
): Promise<AccountDocument | null> => {
  try {
    return await AccountModel.findByIdAndUpdate(
      accountId,
      { isDeleted: true },
      { new: true }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error("Failed to delete account");
  }
};

const addTransaction = async (
  accountId: string,
  transactionData: any,
  transactionId: string = ""
): Promise<void> => {
  try {
    const account = await AccountModel.findById(accountId);
    if (!account) throw new Error("Account not found");

    if (transactionId) {
      // If transactionId is provided, associate it with the account
      account.transactionHistory.push({
        transactionId: transactionId as any,
        type: transactionData.type,
        amount: transactionData.amount,
        usageAfter:
          transactionData.type === "credit"
            ? account.usage + transactionData.amount
            : account.usage - transactionData.amount,
        date: new Date(),
        description: transactionData.description,
      });
    }

    // Update account usage
    const newUsage =
      transactionData.type === "credit"
        ? account.usage + transactionData.amount
        : account.usage - transactionData.amount;

    account.usage = newUsage;
    account.transactionHistory.push({
      transactionId: (transactionId as any)._id,
      type: transactionData.type,
      amount: transactionData.amount,
      usageAfter: newUsage,
      date: new Date(),
      description: transactionData.description,
    });

    await account.save();
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw new Error("Failed to add transaction");
  }
};

const reconcileAccount = async (
  accountId: string,
  reconciliationData: any
): Promise<AccountDocument | null> => {
  try {
    const account = await AccountModel.findById(accountId);
    if (!account) throw new Error("Account not found");

    account.reconciliation.lastReconciledDate = new Date();
    account.reconciliation.lastReconciledBy = reconciliationData.userId; // Assuming userId is passed in reconciliationData
    account.reconciliation.discrepancies.push(
      ...reconciliationData.discrepancies
    );

    return await account.save();
  } catch (error) {
    console.error("Error reconciling account:", error);
    throw new Error("Failed to reconcile account");
  }
};

const resolveDiscrepancy = async (
  accountId: string,
  discrepancyId: string,
  resolvedBy: string
): Promise<AccountDocument | null> => {
  try {
    const account = await AccountModel.findById(accountId);
    if (!account) throw new Error("Account not found");

    const discrepancy = account.reconciliation.discrepancies.find(
      (d: any) => d._id.toString() === discrepancyId
    );
    if (!discrepancy) throw new Error("Discrepancy not found");

    discrepancy.resolvedBy = resolvedBy as any;
    discrepancy.resolvedAt = new Date();

    return await account.save();
  } catch (error) {
    console.error("Error resolving discrepancy:", error);
    throw new Error("Failed to resolve discrepancy");
  }
};

export {
  createAccount,
  getAccountsByUserId,
  getAccountById,
  updateAccount,
  deleteAccount,
  addTransaction,
  reconcileAccount,
  resolveDiscrepancy,
};
