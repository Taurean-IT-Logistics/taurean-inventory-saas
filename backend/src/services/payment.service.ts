import axios from "axios";
import crypto from "crypto";
import { IPaymentFormData } from "../types";
import { CONFIG } from "../config";

const PAYSTACK_SECRET_KEY = CONFIG.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Paystack secret key is needed to initialize payments");
}
const initializePayment = async (form: IPaymentFormData) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      form,
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
