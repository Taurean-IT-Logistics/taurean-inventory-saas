import axios from "axios";
import crypto from "crypto";
import { IPaymentFormData } from "../types";
import { CONFIG } from "../config";
import { CompanyModel } from "../models/company.model";

const PAYSTACK_SECRET_KEY = CONFIG.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Paystack secret key is needed to initialize payments");
}
const initializePayment = async (form: IPaymentFormData, options?: { companyId?: string }) => {
  try {
    const payload: any = { ...form };
    if (options?.companyId) {
      const company = await CompanyModel.findById(options.companyId).lean();
      if (company && (company as any).paystackSubaccountCode) {
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

export { initializePayment, verifyPayment, verifyWebHookSignature };
