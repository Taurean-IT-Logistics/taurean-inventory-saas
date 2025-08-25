"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionsAPI, InvoicesAPI } from "@/lib/api";
import InvoiceGenerator, { InvoiceData } from "@/components/invoices/InvoiceGenerator";
import ReceiptGenerator, { ReceiptData } from "@/components/invoices/ReceiptGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt,
  ArrowLeft,
  Home,
  Download,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRef } from "react";

interface PaymentResult {
  reference: string;
  amount: number;
  status: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: any;
    risk_action: string;
    international_format_phone: string | null;
  };
  transaction: {
    _id: string;
    amount: number;
    description: string;
    method: string;
    ref: string;
    type: string;
    facility: any;
    user: {
      _id: string;
      name: string;
      email: string;
      username: string;
      phone: string;
      role: string;
      isSuperAdmin: boolean;
      status: string;
      isDeleted: boolean;
      createdAt: string;
      updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
    reconciled: boolean;
    reconciledAt: string;
  };
}

const PaymentCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const invoiceGeneratorRef = useRef<any>(null);
  const receiptGeneratorRef = useRef<any>(null);

  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");
  const paymentRef = reference || trxref;

  // Use TanStack Query for payment verification
  const {
    data: paymentData,
    isLoading: isVerifying,
    error,
    isSuccess,
  } = useQuery<PaymentResult>({
    queryKey: ["payment-verification", paymentRef],
    queryFn: async (): Promise<PaymentResult> => {
      if (!paymentRef) {
        throw new Error("Payment reference not found");
      }
      const response = await TransactionsAPI.verifyByReference(paymentRef);
      return response as PaymentResult;
    },
    enabled: !!paymentRef,
    retry: 1,
    retryDelay: 1000,
  });

  // Set loading state based on query state
  useEffect(() => {
    if (paymentRef && !isVerifying) {
      setIsLoading(false);
    }
  }, [paymentRef, isVerifying]);

  // Handle successful payment verification
  useEffect(() => {
    if (isSuccess && paymentData) {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
        variant: "default",
      });
    }
  }, [isSuccess, paymentData]);

  // Handle payment verification errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Unable to verify payment status.",
        variant: "destructive",
      });
    }
  }, [error]);

  // Download functions
  const handleDownloadInvoice = async () => {
    if (!paymentData?.transaction?._id) return;

    try {
      // Get invoice number from backend
      const invoiceNumberData = await InvoicesAPI.getInvoiceNumber();
      const invoiceNumber = (invoiceNumberData as any)?.invoiceNumber || `INV-${Date.now()}`;

      // Prepare invoice data
      const invoiceData: InvoiceData = {
        invoiceNumber,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        company: {
          name: "Your Company",
          address: "Company Address",
          phone: "+233 XX XXX XXXX",
          email: "info@company.com",
        },
        customer: {
          name: `${paymentData.customer.first_name || ""} ${paymentData.customer.last_name || ""}`.trim() || "Customer",
          email: paymentData.customer.email,
          phone: paymentData.customer.phone || "",
        },
        items: [
          {
            description: paymentData.transaction.description || "Payment for services",
            quantity: 1,
            unitPrice: paymentData.amount,
            amount: paymentData.amount,
            taxRate: 0,
          },
        ],
        subtotal: paymentData.amount,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: paymentData.amount,
        currency: paymentData.currency,
        status: "paid",
      };

      setSelectedInvoice(invoiceData);
      
      // Trigger PDF generation
      setTimeout(() => {
        invoiceGeneratorRef.current?.download();
      }, 100);

      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReceipt = async () => {
    if (!paymentData?.transaction?._id) return;

    try {
      // Get receipt number from backend
      const receiptNumberData = await InvoicesAPI.getReceiptNumber(paymentData.transaction._id);
      const receiptNumber = (receiptNumberData as any)?.receiptNumber || `RCP-${Date.now()}`;

      // Prepare receipt data
      const receiptData: ReceiptData = {
        receiptNumber,
        invoiceNumber: `INV-${paymentData.transaction._id}`,
        paymentDate: new Date(paymentData.paid_at || new Date()),
        paymentMethod: paymentData.channel || "Online Payment",
        company: {
          name: "Your Company",
          address: "Company Address",
          phone: "+233 XX XXX XXXX",
          email: "info@company.com",
        },
        customer: {
          name: `${paymentData.customer.first_name || ""} ${paymentData.customer.last_name || ""}`.trim() || "Customer",
          email: paymentData.customer.email,
          phone: paymentData.customer.phone || "",
        },
        items: [
          {
            description: paymentData.transaction.description || "Payment for services",
            quantity: 1,
            unitPrice: paymentData.amount,
            amount: paymentData.amount,
          },
        ],
        subtotal: paymentData.amount,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: paymentData.amount,
        currency: paymentData.currency,
        transactionId: paymentData.transaction._id,
      };

      setSelectedReceipt(receiptData);
      
      // Trigger PDF generation
      setTimeout(() => {
        receiptGeneratorRef.current?.download();
      }, 100);

      toast({
        title: "Success",
        description: "Receipt generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate receipt",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader className="mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isVerifying
                    ? "Verifying Payment..."
                    : "Processing Payment..."}
                </h2>
                <p className="text-gray-600 mt-2">
                  Please wait while we confirm your payment with our secure
                  payment processor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center mt-20 justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {paymentData?.status === "success" ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {paymentData?.status === "success"
              ? "Payment Successful!"
              : "Payment Failed"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              {paymentData?.status === "success"
                ? "Your payment has been processed successfully!"
                : "Payment verification result."}
            </p>
          </div>

          {paymentData?.status === "success" && paymentData && (
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">
                      Transaction Reference
                    </p>
                    <p className="font-mono text-sm font-medium text-green-900">
                      {paymentData.reference}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Amount Paid</p>
                    <p className="font-semibold text-green-900">
                      {paymentData.currency} {paymentData.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Customer</p>
                    <p className="font-medium text-green-900">
                      {paymentData.customer.first_name &&
                      paymentData.customer.last_name
                        ? `${paymentData.customer.first_name} ${paymentData.customer.last_name}`
                        : paymentData.transaction.user.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Email</p>
                    <p className="font-medium text-green-900">
                      {paymentData.customer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Payment Method</p>
                    <p className="font-medium text-green-900 capitalize">
                      {paymentData.channel.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Payment Date</p>
                    <p className="font-medium text-green-900">
                      {new Date(paymentData.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {paymentData.amount === 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Tip:</strong> Log in to your account to view
                      complete payment details, transaction history, and
                      download receipts.
                    </p>
                  </div>
                )}
              </div>

              {/* Download Options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Download Documents
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDownloadInvoice}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>

                  <Button
                    onClick={handleDownloadReceipt}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push("/user/dashboard")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  View My Transactions
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>

              {/* Success Message */}
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Payment processed successfully
                </div>
              </div>
            </div>
          )}

          {paymentData?.status !== "success" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-semibold text-red-900">
                      What happened?
                    </h3>
                    <p className="text-red-700 mt-1">
                      Your payment could not be processed. This could be due to:
                    </p>
                    <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                      <li>Insufficient funds in your account</li>
                      <li>Network connectivity issues</li>
                      <li>Payment was cancelled or declined</li>
                      <li>Session timeout</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Don&apos;t worry! No charges have been made to your account.
                </p>
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="mr-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="border-t pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Need to view more details or have questions about your payment?
              </p>
            </div>
          </div>

          {/* Support Information */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@company.com"
                className="text-blue-600 hover:underline"
              >
                support@company.com
              </a>
            </p>
            {reference && (
              <p className="mt-1">
                Reference this transaction:{" "}
                <span className="font-mono">{reference}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Generator (hidden) */}
      {selectedInvoice && (
        <InvoiceGenerator
          ref={invoiceGeneratorRef}
          data={selectedInvoice}
          onGenerate={(pdfBlob) => {
            // Handle PDF generation if needed
            console.log('Invoice PDF generated:', pdfBlob);
          }}
        />
      )}

      {/* Receipt Generator (hidden) */}
      {selectedReceipt && (
        <ReceiptGenerator
          ref={receiptGeneratorRef}
          data={selectedReceipt}
          onGenerate={(pdfBlob) => {
            // Handle PDF generation if needed
            console.log('Receipt PDF generated:', pdfBlob);
          }}
        />
      )}
    </div>
  );
};

export default PaymentCallbackPage;
