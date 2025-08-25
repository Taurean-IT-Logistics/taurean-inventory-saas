import axios from "axios";
import crypto from "crypto";
import { IPaymentFormData } from "../types";
import { CONFIG } from "../config";
import { CompanyModel } from "../models/company.model";
import { notificationService } from "./notification.service";

const PAYSTACK_SECRET_KEY = CONFIG.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Paystack secret key is needed to initialize payments");
}
const initializePayment = async (
  form: IPaymentFormData,
  options?: { companyId?: string }
) => {
  try {
    const payload: any = { ...form };
    if (options?.companyId) {
      const company = await CompanyModel.findById(options.companyId).lean();
      if (
        company &&
        company.name !== "Taurean IT" &&
        (company as any).paystackSubaccountCode
      ) {
        payload.subaccount = (company as any).paystackSubaccountCode;
        const feePercent = (company as any).feePercent || 0;
        if (feePercent > 0) {
          // Paystack expects fee in kobo/pesewas? Here we leave default for subaccount fee; advanced split requires split API.
          payload.bearer = "subaccount";
        }
      }
    }
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.data || !response.data) {
      throw new Error("Payment initialization failed");
    }
    return response.data;
  } catch (error) {
    console.error("Error initializing payment:", error);
    throw error;
  }
};

const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.data) {
      throw new Error("Payment verification failed");
    }
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

const verifyWebHookSignature = (data: any, signature: string) => {
  const hmac = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY);
  const expectedSignature = hmac.update(JSON.stringify(data)).digest("hex");

  return expectedSignature === signature;
};

const getAllBanks = async (
  country?: string,
  currency?: string,
  type?: string
) => {
  try {
    const response = await axios.get("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      params: {
        ...(country && { country }),
        ...(currency && { currency }),
        ...(type && { type }),
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error getting all banks:",
      error.response?.data || error.message
    );
    throw error;
  }
};

interface SubAccountData {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: number;
  description: string;
}

const updateSubAccount = async (
  subaccountCode: string,
  data: SubAccountData
) => {
  try {
    const response = await axios.put(
      `https://api.paystack.co/subaccount/${subaccountCode}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subaccount:", error);
    throw error;
  }
};

const getMomoBankDetails = async (bankCode: string, accountNumber: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.data) {
      throw new Error("Failed to get momo bank details");
    }

    return response.data;
  } catch (error) {
    console.error("Error getting momo bank details:", error);
    throw error;
  }
};

const createSubaccount = async ({
  business_name,
  settlement_bank,
  account_number,
  description,
  percentage_charge = 5,
}: SubAccountData) => {
  try {
    const payload = {
      business_name,
      settlement_bank,
      account_number,
      percentage_charge,
      description: description || "Vendor Subaccount",
    };

    const response = await axios.post(
      "https://api.paystack.co/subaccount",
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Error creating subaccount:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message || "Paystack subaccount creation failed"
    );
  }
};

const getSubaccountDetails = async (subaccountCode: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/subaccount/${subaccountCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.data) {
      throw new Error("Failed to get subaccount details");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error getting subaccount details:", error);
    throw error;
  }
};

export {
  initializePayment,
  verifyPayment,
  verifyWebHookSignature,
  getAllBanks,
  updateSubAccount,
  getMomoBankDetails,
  createSubaccount,
  type SubAccountData,
  getSubaccountDetails,
};
