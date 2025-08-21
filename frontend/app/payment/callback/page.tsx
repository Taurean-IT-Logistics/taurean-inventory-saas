"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionsAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Receipt,
  ArrowLeft,
  Home,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

interface PaymentResult {
  success: boolean;
  message: string;
  data?: {
    transaction: any;
    invoice?: any;
    receipt?: any;
    reference: string;
    amount: number;
    currency: string;
    customer: {
      name: string;
      email: string;
    };
  };
}

const PaymentCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");
  const status = searchParams.get("status");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !trxref) {
        setPaymentResult({
          success: false,
          message: "Payment reference not found. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      const paymentRef = reference || trxref;

      try {
        setIsVerifying(true);

        // Verify payment with backend
        const response = (await TransactionsAPI.verifyByReference(
          paymentRef!
        )) as any;

        if (response.success) {
          setPaymentResult({
            success: true,
            message: "Payment verified successfully!",
            data: response.data,
          });

          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully.",
            variant: "default",
          });
        } else {
          throw new Error(
            (response as any).message || "Payment verification failed"
          );
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);

        setPaymentResult({
          success: false,
          message:
            error.message ||
            "Payment verification failed. Please contact support.",
        });

        toast({
          title: "Payment Verification Failed",
          description: error.message || "Unable to verify payment status.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [reference, trxref]);

  const handleDownloadReceipt = async () => {
    if (!paymentResult?.data?.receipt) return;

    try {
      const response = await fetch(
        `/api/v1/invoices/receipts/${paymentResult.data.receipt._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download receipt");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `receipt-${paymentResult.data.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!paymentResult?.data?.invoice) return;

    try {
      const response = await fetch(
        `/api/v1/invoices/${paymentResult.data.invoice._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `invoice-${paymentResult.data.invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {paymentResult?.success ? (
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
            {paymentResult?.success ? "Payment Successful!" : "Payment Failed"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 text-lg">{paymentResult?.message}</p>
          </div>

          {paymentResult?.success && paymentResult.data && (
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
                      {paymentResult.data.reference}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Amount Paid</p>
                    <p className="font-semibold text-green-900">
                      {paymentResult.data.currency}{" "}
                      {paymentResult.data.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Customer</p>
                    <p className="font-medium text-green-900">
                      {paymentResult.data.customer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Email</p>
                    <p className="font-medium text-green-900">
                      {paymentResult.data.customer.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {paymentResult.data.receipt && (
                  <Button
                    onClick={handleDownloadReceipt}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                )}

                {paymentResult.data.invoice && (
                  <Button
                    onClick={handleDownloadInvoice}
                    variant="outline"
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
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

          {!paymentResult?.success && (
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/user/dashboard">
                  <Receipt className="w-4 h-4 mr-2" />
                  View My Transactions
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
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
    </div>
  );
};

export default PaymentCallbackPage;
