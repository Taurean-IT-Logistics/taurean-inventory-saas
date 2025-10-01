"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import {
  CalendarIcon,
  CreditCardIcon,
  BanknoteIcon,
  FileTextIcon,
  SplitIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { Transaction } from "@/types";
import { currencyFormat } from "@/lib/utils";
import { format } from "date-fns";

interface EditTransactionModalProps {
  transaction: Transaction | null;
  show: boolean;
  onHide: () => void;
  onSave: (transaction: Transaction) => void;
  isLoading?: boolean;
}

const EditTransactionModal = ({
  transaction,
  show,
  onHide,
  onSave,
  isLoading = false,
}: EditTransactionModalProps) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({});

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && transaction) {
      // Validate cash denominations if it's a cash transaction
      if (
        formData.method === "cash" &&
        (formData.paymentDetails as any)?.denominations
      ) {
        const denominationTotal = (
          (formData.paymentDetails as any)?.denominations || []
        ).reduce(
          (sum: number, denom: any) =>
            sum + denom.denomination * denom.quantity,
          0
        );

        if (Math.abs(denominationTotal - (formData.amount || 0)) >= 0.01) {
          // Show error message (you could use a toast here)
          alert(
            "Cash denominations must sum up to the transaction amount. Please adjust the denominations or transaction amount."
          );
          return;
        }
      }

      onSave({ ...transaction, ...formData } as Transaction);
      onHide();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      reconciled: checked,
    }));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "paystack":
      case "card":
        return <CreditCardIcon className="w-4 h-4" />;
      case "cash":
        return <BanknoteIcon className="w-4 h-4" />;
      case "cheque":
        return <FileTextIcon className="w-4 h-4" />;
      case "split":
        return <SplitIcon className="w-4 h-4" />;
      case "advance":
        return <TrendingUpIcon className="w-4 h-4" />;
      default:
        return <CreditCardIcon className="w-4 h-4" />;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      paystack: { className: "bg-blue-100 text-blue-800", text: "Paystack" },
      card: { className: "bg-blue-100 text-blue-800", text: "Card" },
      mobile_money: {
        className: "bg-cyan-100 text-cyan-800",
        text: "Mobile Money",
      },
      bank: { className: "bg-gray-100 text-gray-800", text: "Bank Transfer" },
      cash: { className: "bg-green-100 text-green-800", text: "Cash" },
      cheque: { className: "bg-orange-100 text-orange-800", text: "Cheque" },
      split: {
        className: "bg-indigo-100 text-indigo-800",
        text: "Split Payment",
      },
      advance: {
        className: "bg-pink-100 text-pink-800",
        text: "Advance Payment",
      },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || {
      className: "bg-gray-100 text-gray-800",
      text: method,
    };
    return (
      <Badge variant="secondary" className={config.className}>
        {getPaymentMethodIcon(method)}
        <span className="ml-1">{config.text}</span>
      </Badge>
    );
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = {
      income: { className: "bg-green-100 text-green-800", text: "Income" },
      expense: { className: "bg-red-100 text-red-800", text: "Expense" },
      booking: { className: "bg-blue-100 text-blue-800", text: "Booking" },
      rental: { className: "bg-purple-100 text-purple-800", text: "Rental" },
      inventory_item: {
        className: "bg-yellow-100 text-yellow-800",
        text: "Inventory",
      },
      facility: {
        className: "bg-indigo-100 text-indigo-800",
        text: "Facility",
      },
      activation: {
        className: "bg-pink-100 text-pink-800",
        text: "Activation",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      className: "bg-gray-100 text-gray-800",
      text: type,
    };
    return (
      <Badge variant="secondary" className={config.className}>
        {config.text}
      </Badge>
    );
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        {transaction && (
          <div className="space-y-6">
            {/* Transaction Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Reference
                    </Label>
                    <div className="text-sm font-mono text-gray-900">
                      {transaction.ref}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Amount
                    </Label>
                    <div className="text-lg font-bold text-gray-900">
                      {currencyFormat(transaction.amount)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Type
                    </Label>
                    <div className="mt-1">
                      {getTransactionTypeBadge(transaction.type)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Method
                    </Label>
                    <div className="mt-1">
                      {getPaymentMethodBadge(transaction.method)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Status
                    </Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          transaction.reconciled ? "default" : "secondary"
                        }
                        className={
                          transaction.reconciled
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {transaction.reconciled ? "Reconciled" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Created
                    </Label>
                    <div className="text-sm text-gray-900">
                      {format(
                        new Date(transaction.createdAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      User
                    </Label>
                    <div className="text-sm text-gray-900">
                      {transaction.user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.user?.email}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Category
                    </Label>
                    <div className="text-sm text-gray-900">
                      {transaction.category}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            {transaction.paymentDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Paystack/Online Payment Details */}
                    {transaction.paymentDetails.paystackReference && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Paystack Reference
                        </Label>
                        <div className="text-sm font-mono text-gray-900">
                          {transaction.paymentDetails.paystackReference}
                        </div>
                      </div>
                    )}

                    {/* Cash Payment Details */}
                    {transaction.method === "cash" &&
                      (transaction.paymentDetails as any).denominations && (
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Cash Denominations
                          </Label>
                          <div className="mt-2 space-y-2">
                            {(
                              (transaction.paymentDetails as any)
                                .denominations || []
                            ).map((denom: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-medium">
                                    {currencyFormat(denom.denomination)}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    × {denom.quantity} pieces
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-blue-600">
                                  {currencyFormat(
                                    denom.denomination * denom.quantity
                                  )}
                                </span>
                              </div>
                            ))}
                            <div className="mt-3 p-2 bg-blue-50 rounded border">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  Total:
                                </span>
                                <span className="text-sm font-bold text-blue-600">
                                  {currencyFormat(
                                    (
                                      (transaction.paymentDetails as any)
                                        .denominations || []
                                    ).reduce(
                                      (sum: number, denom: any) =>
                                        sum +
                                        denom.denomination * denom.quantity,
                                      0
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Cheque Payment Details */}
                    {transaction.paymentDetails.chequeNumber && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Cheque Number
                        </Label>
                        <div className="text-sm text-gray-900">
                          {transaction.paymentDetails.chequeNumber}
                        </div>
                      </div>
                    )}

                    {transaction.paymentDetails.bankDetails && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Bank Details
                        </Label>
                        <div className="text-sm text-gray-900">
                          {JSON.stringify(
                            transaction.paymentDetails.bankDetails
                          )}
                        </div>
                      </div>
                    )}

                    {(transaction.paymentDetails as any).channel && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Channel
                        </Label>
                        <div className="text-sm text-gray-900">
                          {(transaction.paymentDetails as any).channel}
                        </div>
                      </div>
                    )}

                    {/* Mobile Money Details */}
                    {transaction.paymentDetails.mobileMoneyDetails && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Mobile Money Details
                        </Label>
                        <div className="text-sm text-gray-900 space-y-1">
                          {transaction.paymentDetails.mobileMoneyDetails
                            .provider &&
                            transaction.paymentDetails.mobileMoneyDetails
                              .provider !== "n/a" && (
                              <div>
                                <span className="font-medium">Provider:</span>{" "}
                                {
                                  transaction.paymentDetails.mobileMoneyDetails
                                    .provider
                                }
                              </div>
                            )}
                          {transaction.paymentDetails.mobileMoneyDetails
                            .phoneNumber && (
                            <div>
                              <span className="font-medium">Phone:</span>{" "}
                              {
                                transaction.paymentDetails.mobileMoneyDetails
                                  .phoneNumber
                              }
                            </div>
                          )}
                          {transaction.paymentDetails.mobileMoneyDetails
                            .transactionId && (
                            <div>
                              <span className="font-medium">
                                Transaction ID:
                              </span>{" "}
                              {
                                transaction.paymentDetails.mobileMoneyDetails
                                  .transactionId
                              }
                            </div>
                          )}
                          {(!transaction.paymentDetails.mobileMoneyDetails
                            .provider ||
                            transaction.paymentDetails.mobileMoneyDetails
                              .provider === "n/a") &&
                            !transaction.paymentDetails.mobileMoneyDetails
                              .phoneNumber &&
                            !transaction.paymentDetails.mobileMoneyDetails
                              .transactionId && (
                              <div className="text-gray-500 italic">
                                No mobile money details available
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Split/Advance Payment Details */}
            {((transaction as any).paymentTiming === "split" ||
              (transaction as any).paymentTiming === "advance") && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {(transaction as any).paymentTiming === "split" ? (
                      <SplitIcon className="w-5 h-5" />
                    ) : (
                      <TrendingUpIcon className="w-5 h-5" />
                    )}
                    {(transaction as any).paymentTiming === "split"
                      ? "Split Payment"
                      : "Advance Payment"}{" "}
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      This transaction is part of a{" "}
                      {(transaction as any).paymentTiming} payment plan using{" "}
                      {transaction.method} payment method.
                    </div>

                    {/* Show payment schedule if available */}
                    {(transaction as any).paymentSchedule && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Payment Schedule
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Total Amount:</span>
                            <span className="font-medium">
                              {currencyFormat(
                                (transaction as any).paymentSchedule.totalAmount
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Paid Amount:</span>
                            <span className="font-medium text-green-600">
                              {currencyFormat(
                                (transaction as any).paymentSchedule.paidAmount
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Remaining Amount:</span>
                            <span className="font-medium text-orange-600">
                              {currencyFormat(
                                (transaction as any).paymentSchedule
                                  .remainingAmount
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <Badge
                              variant={
                                (transaction as any).paymentSchedule.status ===
                                "completed"
                                  ? "default"
                                  : (transaction as any).paymentSchedule
                                      .status === "overdue"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {(transaction as any).paymentSchedule.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show payment timing information */}
                    {(transaction as any).paymentTiming && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Payment Timing Configuration
                        </h4>
                        <div className="text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Timing:</span>{" "}
                            <Badge variant="outline" className="ml-1">
                              {(transaction as any).paymentTiming}
                            </Badge>
                          </div>
                          {(transaction as any).splitConfig && (
                            <>
                              <div>
                                Number of Parts:{" "}
                                {(transaction as any).splitConfig
                                  .numberOfParts || "N/A"}
                              </div>
                              <div>
                                Interval Days:{" "}
                                {(transaction as any).splitConfig
                                  .intervalDays || "N/A"}
                              </div>
                            </>
                          )}
                          {(transaction as any).advanceConfig && (
                            <>
                              <div>
                                Input Mode:{" "}
                                {(transaction as any).advanceConfig.inputMode ||
                                  "N/A"}
                              </div>
                              {(transaction as any).advanceConfig.inputMode ===
                                "percentage" && (
                                <div>
                                  Percentage:{" "}
                                  {(transaction as any).advanceConfig
                                    .percentage || "N/A"}
                                  %
                                </div>
                              )}
                              {(transaction as any).advanceConfig.inputMode ===
                                "fixed" && (
                                <div>
                                  Fixed Amount:{" "}
                                  {(transaction as any).advanceConfig
                                    .fixedAmount || "N/A"}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show scheduled payments if available */}
                    {(transaction as any).paymentSchedule
                      ?.scheduledPayments && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Scheduled Payments
                        </h4>
                        <div className="space-y-2">
                          {(
                            transaction as any
                          ).paymentSchedule.scheduledPayments.map(
                            (payment: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-sm"
                              >
                                <span>Payment {index + 1}:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {currencyFormat(payment.amount)}
                                  </span>
                                  <Badge
                                    variant={
                                      payment.status === "paid"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      payment.status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }
                                  >
                                    {payment.status}
                                  </Badge>
                                  <span className="text-gray-500">
                                    Due:{" "}
                                    {new Date(
                                      payment.dueDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show advance configuration if available */}
                    {(transaction as any).advanceConfig && (
                      <div className="bg-pink-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Advance Configuration
                        </h4>
                        <div className="text-sm text-gray-600">
                          <div>
                            Percentage:{" "}
                            {(transaction as any).advanceConfig.percentage}%
                          </div>
                          <div>
                            Amount:{" "}
                            {currencyFormat(
                              (transaction as any).advanceConfig.amount
                            )}
                          </div>
                          <div>
                            Input Mode:{" "}
                            {(transaction as any).advanceConfig.inputMode}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Entities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {transaction.facility && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Facility
                      </Label>
                      <div className="text-sm text-gray-900">
                        {(transaction.facility as any)?.name ||
                          "Facility ID: " + transaction.facility}
                      </div>
                    </div>
                  )}
                  {transaction.booking && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Booking
                      </Label>
                      <div className="text-sm text-gray-900">
                        Booking ID: {String(transaction.booking)}
                      </div>
                    </div>
                  )}
                  {(transaction as any).rental && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Rental
                      </Label>
                      <div className="text-sm text-gray-900">
                        Rental ID: {(transaction as any).rental}
                      </div>
                    </div>
                  )}
                  {transaction.inventoryItem && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Inventory Item
                      </Label>
                      <div className="text-sm text-gray-900">
                        Item ID: {String(transaction.inventoryItem)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Editable Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edit Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Transaction Type</Label>
                      <Select
                        value={formData.type || ""}
                        onValueChange={(value) =>
                          handleSelectChange("type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category || ""}
                        onValueChange={(value) =>
                          handleSelectChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="rental">Rental</SelectItem>
                          <SelectItem value="inventory_item">
                            Inventory Item
                          </SelectItem>
                          <SelectItem value="facility">Facility</SelectItem>
                          <SelectItem value="activation">Activation</SelectItem>
                          <SelectItem value="refund">Refund</SelectItem>
                          <SelectItem value="deposit">Deposit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <Select
                        value={formData.method || ""}
                        onValueChange={(value) =>
                          handleSelectChange("method", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paystack">Paystack</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="mobile_money">
                            Mobile Money
                          </SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentTiming">Payment Timing</Label>
                      <Select
                        value={(formData as any).paymentTiming || "full"}
                        onValueChange={(value: "full" | "advance" | "split") =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentTiming: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Payment</SelectItem>
                          <SelectItem value="advance">
                            Advance Payment
                          </SelectItem>
                          <SelectItem value="split">Split Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      {(transaction as any)?.paymentTiming === "split" ||
                      (transaction as any)?.paymentTiming === "advance" ? (
                        <div className="space-y-2">
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount || ""}
                            disabled={
                              transaction?.method === "paystack" ||
                              transaction?.method === "mobile_money" ||
                              transaction?.method === "bank" ||
                              transaction?.method === "bank_transfer"
                            }
                            className={
                              transaction?.method === "paystack" ||
                              transaction?.method === "mobile_money" ||
                              transaction?.method === "bank" ||
                              transaction?.method === "bank_transfer"
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }
                            placeholder={
                              transaction?.method === "paystack" ||
                              transaction?.method === "mobile_money" ||
                              transaction?.method === "bank" ||
                              transaction?.method === "bank_transfer"
                                ? "Amount cannot be changed for online payments"
                                : "Enter amount"
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                amount: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                          {(transaction?.method === "paystack" ||
                            transaction?.method === "mobile_money" ||
                            transaction?.method === "bank" ||
                            transaction?.method === "bank_transfer") && (
                            <div className="text-xs text-gray-500">
                              ⚠️ Amount cannot be changed for online payments
                              (third-party consistency)
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount || ""}
                          onChange={handleInputChange}
                          placeholder="Enter amount"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter transaction description"
                    />
                  </div>

                  {/* Payment Method Specific Fields */}
                  {formData.method === "cash" && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Cash Denominations
                      </Label>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-3">
                          Edit cash denomination breakdown. Each denomination
                          should be the bill/coin value (e.g., 100 for ₵100
                          bill):
                        </div>
                        <div className="space-y-3">
                          {(
                            (formData.paymentDetails as any)?.denominations ||
                            []
                          ).map((denom: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-white rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium min-w-[80px]">
                                  Denomination:
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={denom.denomination}
                                  onChange={(e) => {
                                    const newDenominations = [
                                      ...((formData.paymentDetails as any)
                                        ?.denominations || []),
                                    ];
                                    newDenominations[index] = {
                                      ...denom,
                                      denomination:
                                        parseFloat(e.target.value) || 0,
                                    };
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentDetails: {
                                        ...prev.paymentDetails,
                                        denominations: newDenominations,
                                      },
                                    }));
                                  }}
                                  placeholder="e.g., 100"
                                  className="w-24"
                                />
                                <span className="text-sm text-gray-500">₵</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium min-w-[60px]">
                                  Count:
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={denom.quantity}
                                  onChange={(e) => {
                                    const newDenominations = [
                                      ...((formData.paymentDetails as any)
                                        ?.denominations || []),
                                    ];
                                    newDenominations[index] = {
                                      ...denom,
                                      quantity: parseInt(e.target.value) || 0,
                                    };
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentDetails: {
                                        ...prev.paymentDetails,
                                        denominations: newDenominations,
                                      },
                                    }));
                                  }}
                                  placeholder="0"
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-500">
                                  pieces
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium min-w-[50px]">
                                  Subtotal:
                                </Label>
                                <span className="text-sm font-bold text-blue-600 min-w-[80px]">
                                  {currencyFormat(
                                    denom.denomination * denom.quantity
                                  )}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newDenominations = (
                                    (formData.paymentDetails as any)
                                      ?.denominations || []
                                  ).filter((_: any, i: number) => i !== index);
                                  setFormData((prev) => ({
                                    ...prev,
                                    paymentDetails: {
                                      ...prev.paymentDetails,
                                      denominations: newDenominations,
                                    },
                                  }));
                                }}
                                className="text-red-600 hover:text-red-800 ml-auto"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newDenominations = [
                                ...((formData.paymentDetails as any)
                                  ?.denominations || []),
                                { denomination: 0, quantity: 0 },
                              ];
                              setFormData((prev) => ({
                                ...prev,
                                paymentDetails: {
                                  ...prev.paymentDetails,
                                  denominations: newDenominations,
                                },
                              }));
                            }}
                            className="w-full"
                          >
                            + Add Denomination
                          </Button>
                        </div>

                        {/* Validation and Summary */}
                        <div className="mt-4 p-3 bg-white rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Denomination Total:
                            </span>
                            <span className="text-sm font-bold">
                              {currencyFormat(
                                (
                                  (formData.paymentDetails as any)
                                    ?.denominations || []
                                ).reduce(
                                  (sum: number, denom: any) =>
                                    sum + denom.denomination * denom.quantity,
                                  0
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Transaction Amount:
                            </span>
                            <span className="text-sm font-bold">
                              {currencyFormat(formData.amount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Difference:
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                Math.abs(
                                  (
                                    (formData.paymentDetails as any)
                                      ?.denominations || []
                                  ).reduce(
                                    (sum: number, denom: any) =>
                                      sum + denom.denomination * denom.quantity,
                                    0
                                  ) - (formData.amount || 0)
                                ) < 0.01
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {currencyFormat(
                                (
                                  (formData.paymentDetails as any)
                                    ?.denominations || []
                                ).reduce(
                                  (sum: number, denom: any) =>
                                    sum + denom.denomination * denom.quantity,
                                  0
                                ) - (formData.amount || 0)
                              )}
                            </span>
                          </div>
                          {Math.abs(
                            (
                              (formData.paymentDetails as any)?.denominations ||
                              []
                            ).reduce(
                              (sum: number, denom: any) =>
                                sum + denom.denomination * denom.quantity,
                              0
                            ) - (formData.amount || 0)
                          ) >= 0.01 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                              ⚠️ Denominations must sum up to the transaction
                              amount. Please adjust the denominations or
                              transaction amount.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.method === "cheque" && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Cheque Details
                      </Label>
                      <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="chequeNumber" className="text-sm">
                              Cheque Number
                            </Label>
                            <Input
                              id="chequeNumber"
                              value={
                                formData.paymentDetails?.chequeNumber || ""
                              }
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentDetails: {
                                    ...prev.paymentDetails,
                                    chequeNumber: e.target.value,
                                  },
                                }));
                              }}
                              placeholder="Enter cheque number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bankName" className="text-sm">
                              Bank Name
                            </Label>
                            <Input
                              id="bankName"
                              value={
                                formData.paymentDetails?.bankDetails
                                  ?.bankName || ""
                              }
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentDetails: {
                                    ...prev.paymentDetails,
                                    bankDetails: {
                                      bankName: e.target.value || "",
                                      accountNumber:
                                        prev.paymentDetails?.bankDetails
                                          ?.accountNumber || "",
                                      sortCode:
                                        prev.paymentDetails?.bankDetails
                                          ?.sortCode || "",
                                    },
                                  },
                                }));
                              }}
                              placeholder="Enter bank name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="accountNumber" className="text-sm">
                              Account Number
                            </Label>
                            <Input
                              id="accountNumber"
                              value={
                                formData.paymentDetails?.bankDetails
                                  ?.accountNumber || ""
                              }
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentDetails: {
                                    ...prev.paymentDetails,
                                    bankDetails: {
                                      bankName:
                                        prev.paymentDetails?.bankDetails
                                          ?.bankName || "",
                                      accountNumber: e.target.value || "",
                                      sortCode:
                                        prev.paymentDetails?.bankDetails
                                          ?.sortCode || "",
                                    },
                                  },
                                }));
                              }}
                              placeholder="Enter account number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="chequeDate" className="text-sm">
                              Cheque Date
                            </Label>
                            <DatePicker
                              date={formData.paymentDetails?.chequeDate}
                              onDateChange={(date: Date | undefined) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentDetails: {
                                    ...prev.paymentDetails,
                                    chequeDate: date,
                                  },
                                }));
                              }}
                              placeholder="Select cheque date"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.method === "mobile_money" && (
                    <div className="space-y-3">
                      <Label>Mobile Money Details</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="mobileProvider" className="text-xs">
                            Provider
                          </Label>
                          <Input
                            id="mobileProvider"
                            value={
                              formData.paymentDetails?.mobileMoneyDetails
                                ?.provider || ""
                            }
                            onChange={(e) => {
                              setFormData(
                                (prev) =>
                                  ({
                                    ...prev,
                                    paymentDetails: {
                                      ...prev.paymentDetails,
                                      mobileMoneyDetails: {
                                        ...prev.paymentDetails
                                          ?.mobileMoneyDetails,
                                        provider: e.target.value,
                                      },
                                    },
                                  } as any)
                              );
                            }}
                            placeholder="MTN, Vodafone, AirtelTigo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mobilePhone" className="text-xs">
                            Phone Number
                          </Label>
                          <Input
                            id="mobilePhone"
                            value={
                              formData.paymentDetails?.mobileMoneyDetails
                                ?.phoneNumber || ""
                            }
                            onChange={(e) => {
                              setFormData(
                                (prev) =>
                                  ({
                                    ...prev,
                                    paymentDetails: {
                                      ...prev.paymentDetails,
                                      mobileMoneyDetails: {
                                        ...prev.paymentDetails
                                          ?.mobileMoneyDetails,
                                        phoneNumber: e.target.value,
                                      },
                                    },
                                  } as any)
                              );
                            }}
                            placeholder="+233 XX XXX XXXX"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label
                            htmlFor="mobileTransactionId"
                            className="text-xs"
                          >
                            Transaction ID
                          </Label>
                          <Input
                            id="mobileTransactionId"
                            value={
                              formData.paymentDetails?.mobileMoneyDetails
                                ?.transactionId || ""
                            }
                            onChange={(e) => {
                              setFormData(
                                (prev) =>
                                  ({
                                    ...prev,
                                    paymentDetails: {
                                      ...prev.paymentDetails,
                                      mobileMoneyDetails: {
                                        ...prev.paymentDetails
                                          ?.mobileMoneyDetails,
                                        transactionId: e.target.value,
                                      },
                                    },
                                  } as any)
                              );
                            }}
                            placeholder="Mobile money transaction reference"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Split Payment Configuration */}
                  {(formData as any).paymentTiming === "split" && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Split Payment Configuration
                      </Label>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <Label
                              htmlFor="splitNumberOfParts"
                              className="text-sm font-medium"
                            >
                              Number of Parts
                            </Label>
                            {(transaction?.method === "paystack" ||
                              transaction?.method === "mobile_money" ||
                              transaction?.method === "bank" ||
                              transaction?.method === "bank_transfer") && (
                              <div className="text-xs text-gray-500 mb-2">
                                ⚠️ Number of parts cannot be changed for online
                                payments (third-party consistency)
                              </div>
                            )}
                            <Select
                              value={String(
                                (transaction as any)?.splitConfig
                                  ?.numberOfParts || 2
                              )}
                              disabled={
                                transaction?.method === "paystack" ||
                                transaction?.method === "mobile_money" ||
                                transaction?.method === "bank" ||
                                transaction?.method === "bank_transfer"
                              }
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  splitConfig: {
                                    numberOfParts: parseInt(value),
                                    intervalDays:
                                      prev.splitConfig?.intervalDays || 7,
                                  },
                                }));
                              }}
                            >
                              <SelectTrigger
                                className={
                                  transaction?.method === "paystack" ||
                                  transaction?.method === "mobile_money" ||
                                  transaction?.method === "bank" ||
                                  transaction?.method === "bank_transfer"
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                                }
                              >
                                <SelectValue placeholder="Select number of parts" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value={String(
                                    (transaction as any)?.splitConfig
                                      ?.numberOfParts || 2
                                  )}
                                >
                                  {(transaction as any)?.splitConfig
                                    ?.numberOfParts || 2}{" "}
                                  Parts (Locked)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label
                              htmlFor="splitIntervalDays"
                              className="text-sm font-medium"
                            >
                              Interval Between Payments (Days)
                            </Label>
                            <Select
                              value={String(
                                (formData as any)?.splitConfig?.intervalDays ||
                                  7
                              )}
                              disabled={
                                transaction?.method === "paystack" ||
                                transaction?.method === "mobile_money" ||
                                transaction?.method === "bank" ||
                                transaction?.method === "bank_transfer"
                              }
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  splitConfig: {
                                    ...(prev as any).splitConfig,
                                    numberOfParts:
                                      (prev as any).splitConfig
                                        ?.numberOfParts || 2,
                                    intervalDays: parseInt(value),
                                  },
                                }));
                              }}
                            >
                              <SelectTrigger
                                className={
                                  transaction?.method === "paystack" ||
                                  transaction?.method === "mobile_money" ||
                                  transaction?.method === "bank" ||
                                  transaction?.method === "bank_transfer"
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                                }
                              >
                                <SelectValue placeholder="Select interval" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="14">14 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="60">60 Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm">
                              <div className="font-medium mb-1">
                                Payment Breakdown:
                              </div>
                              <div>
                                Total Amount:{" "}
                                {currencyFormat(
                                  (transaction as any)?.paymentSchedule
                                    ?.totalAmount ||
                                    ((transaction as any)?.splitConfig
                                      ?.numberOfParts || 1) *
                                      (transaction?.amount || 0) ||
                                    transaction?.amount ||
                                    0
                                )}
                              </div>
                              <div>
                                Remaining Amount:{" "}
                                {currencyFormat(
                                  (transaction as any)?.paymentSchedule
                                    ?.remainingAmount ||
                                    transaction?.amount ||
                                    0
                                )}
                              </div>
                              <div>
                                Per Part:{" "}
                                {currencyFormat(
                                  ((transaction as any)?.paymentSchedule
                                    ?.totalAmount ||
                                    ((transaction as any)?.splitConfig
                                      ?.numberOfParts || 1) *
                                      (transaction?.amount || 0) ||
                                    transaction?.amount ||
                                    0) /
                                    ((transaction as any)?.splitConfig
                                      ?.numberOfParts || 2)
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                                <div className="font-medium">
                                  Original Split:
                                </div>
                                <div>
                                  {currencyFormat(
                                    (transaction as any)?.paymentSchedule
                                      ?.totalAmount ||
                                      ((transaction as any)?.splitConfig
                                        ?.numberOfParts || 1) *
                                        (transaction?.amount || 0) ||
                                      transaction?.amount ||
                                      0
                                  )}{" "}
                                  ÷{" "}
                                  {(transaction as any)?.splitConfig
                                    ?.numberOfParts || 2}{" "}
                                  ={" "}
                                  {currencyFormat(
                                    ((transaction as any)?.paymentSchedule
                                      ?.totalAmount ||
                                      ((transaction as any)?.splitConfig
                                        ?.numberOfParts || 1) *
                                        (transaction?.amount || 0) ||
                                      transaction?.amount ||
                                      0) /
                                      ((transaction as any)?.splitConfig
                                        ?.numberOfParts || 2)
                                  )}{" "}
                                  per part
                                </div>
                                <div className="font-medium mt-1">
                                  Remaining Split:
                                </div>
                                <div>
                                  {currencyFormat(
                                    (transaction as any)?.paymentSchedule
                                      ?.remainingAmount ||
                                      ((transaction as any)?.paymentSchedule
                                        ?.totalAmount ||
                                        ((transaction as any)?.splitConfig
                                          ?.numberOfParts || 1) *
                                          (transaction?.amount || 0) ||
                                        transaction?.amount ||
                                        0) - (transaction?.amount || 0) ||
                                      0
                                  )}{" "}
                                  ÷{" "}
                                  {((transaction as any)?.splitConfig
                                    ?.numberOfParts || 2) - 1}{" "}
                                  ={" "}
                                  {currencyFormat(
                                    ((transaction as any)?.paymentSchedule
                                      ?.remainingAmount ||
                                      ((transaction as any)?.paymentSchedule
                                        ?.totalAmount ||
                                        ((transaction as any)?.splitConfig
                                          ?.numberOfParts || 1) *
                                          (transaction?.amount || 0) ||
                                        transaction?.amount ||
                                        0) - (transaction?.amount || 0) ||
                                      0) /
                                      (((transaction as any)?.splitConfig
                                        ?.numberOfParts || 2) -
                                        1)
                                  )}{" "}
                                  per part
                                </div>
                              </div>
                              <div>
                                Interval:{" "}
                                {(formData as any)?.splitConfig?.intervalDays ||
                                  7}{" "}
                                days
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newParts = [
                                ...((formData as any)?.splitConfig?.parts ||
                                  []),
                                { amount: 0, dueDate: new Date() },
                              ];
                              setFormData((prev) => ({
                                ...prev,
                                splitConfig: {
                                  ...(prev as any).splitConfig,
                                  parts: newParts,
                                },
                              }));
                            }}
                            className="w-full"
                          >
                            Save Changes
                          </Button>
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          Total:{" "}
                          {currencyFormat(
                            (
                              (formData as any)?.splitConfig?.parts || []
                            ).reduce(
                              (sum: number, part: any) =>
                                sum + (part.amount || 0),
                              0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advance Payment Configuration */}
                  {(formData as any).paymentTiming === "advance" && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Advance Payment Details
                      </Label>
                      <div className="bg-pink-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-3">
                          Edit advance payment configuration:
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Input Mode</Label>
                              <Select
                                value={
                                  (formData as any)?.advanceConfig?.inputMode ||
                                  "percentage"
                                }
                                onValueChange={(value) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    advanceConfig: {
                                      ...(prev as any).advanceConfig,
                                      inputMode: value,
                                    },
                                  }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    Percentage
                                  </SelectItem>
                                  <SelectItem value="amount">
                                    Fixed Amount
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {(formData as any)?.advanceConfig?.inputMode ===
                            "percentage" ? (
                              <div>
                                <Label className="text-sm">
                                  Advance Percentage (%)
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  value={
                                    (formData as any)?.advanceConfig
                                      ?.percentage || ""
                                  }
                                  disabled={
                                    transaction?.method === "paystack" ||
                                    transaction?.method === "mobile_money" ||
                                    transaction?.method === "bank" ||
                                    transaction?.method === "bank_transfer"
                                  }
                                  className={
                                    transaction?.method === "paystack" ||
                                    transaction?.method === "mobile_money" ||
                                    transaction?.method === "bank" ||
                                    transaction?.method === "bank_transfer"
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }
                                  onChange={(e) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      advanceConfig: {
                                        ...(prev as any).advanceConfig,
                                        percentage:
                                          parseFloat(e.target.value) || 0,
                                      },
                                    }));
                                  }}
                                  placeholder={
                                    transaction?.method === "paystack" ||
                                    transaction?.method === "mobile_money" ||
                                    transaction?.method === "bank" ||
                                    transaction?.method === "bank_transfer"
                                      ? "Cannot change for online payments"
                                      : "e.g., 30"
                                  }
                                />
                              </div>
                            ) : (
                              <div>
                                <Label className="text-sm">
                                  Advance Amount
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={
                                    (formData as any)?.advanceConfig?.amount ||
                                    ""
                                  }
                                  disabled={
                                    transaction?.method === "paystack" ||
                                    transaction?.method === "mobile_money" ||
                                    transaction?.method === "bank" ||
                                    transaction?.method === "bank_transfer"
                                  }
                                  className={
                                    transaction?.method === "paystack" ||
                                    transaction?.method === "mobile_money" ||
                                    transaction?.method === "bank" ||
                                    transaction?.method === "bank_transfer"
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }
                                  onChange={(e) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      advanceConfig: {
                                        ...(prev as any).advanceConfig,
                                        amount: parseFloat(e.target.value) || 0,
                                      },
                                    }));
                                  }}
                                  placeholder={
                                    transaction?.method === "paystack" ||
                                    transaction?.method === "mobile_money" ||
                                    transaction?.method === "bank" ||
                                    transaction?.method === "bank_transfer"
                                      ? "Cannot change for online payments"
                                      : "0.00"
                                  }
                                />
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <strong>Total Amount:</strong>{" "}
                                {currencyFormat(
                                  (transaction as any)?.paymentSchedule
                                    ?.totalAmount ||
                                    ((transaction as any)?.advanceConfig
                                      ?.inputMode === "percentage" &&
                                      (transaction as any)?.advanceConfig
                                        ?.percentage)
                                    ? ((transaction?.amount || 0) /
                                        ((transaction as any)?.advanceConfig
                                          ?.percentage || 1)) *
                                        100
                                    : ((transaction as any)?.splitConfig
                                        ?.numberOfParts || 1) *
                                        (transaction?.amount || 0) ||
                                        transaction?.amount ||
                                        0
                                )}
                              </div>
                              <div>
                                <strong>Remaining Amount:</strong>{" "}
                                {currencyFormat(
                                  (transaction as any)?.paymentSchedule
                                    ?.remainingAmount ||
                                    ((transaction as any)?.paymentSchedule
                                      ?.totalAmount ||
                                    ((transaction as any)?.advanceConfig
                                      ?.inputMode === "percentage" &&
                                      (transaction as any)?.advanceConfig
                                        ?.percentage)
                                      ? ((transaction?.amount || 0) /
                                          ((transaction as any)?.advanceConfig
                                            ?.percentage || 1)) *
                                        100
                                      : ((transaction as any)?.splitConfig
                                          ?.numberOfParts || 1) *
                                          (transaction?.amount || 0) ||
                                        transaction?.amount ||
                                        0) - (transaction?.amount || 0) ||
                                    0
                                )}
                              </div>
                              <div>
                                <strong>Advance:</strong>{" "}
                                {currencyFormat(
                                  (formData as any)?.advanceConfig
                                    ?.inputMode === "percentage"
                                    ? (((transaction as any)?.paymentSchedule
                                        ?.totalAmount ||
                                      ((transaction as any)?.advanceConfig
                                        ?.inputMode === "percentage" &&
                                        (transaction as any)?.advanceConfig
                                          ?.percentage)
                                        ? ((transaction?.amount || 0) /
                                            ((transaction as any)?.advanceConfig
                                              ?.percentage || 1)) *
                                          100
                                        : ((transaction as any)?.splitConfig
                                            ?.numberOfParts || 1) *
                                            (transaction?.amount || 0) ||
                                          transaction?.amount ||
                                          0) *
                                        ((formData as any)?.advanceConfig
                                          ?.percentage || 0)) /
                                        100
                                    : (formData as any)?.advanceConfig
                                        ?.amount || 0
                                )}
                              </div>
                              <div>
                                <strong>Balance:</strong>{" "}
                                {currencyFormat(
                                  ((transaction as any)?.paymentSchedule
                                    ?.totalAmount ||
                                  ((transaction as any)?.advanceConfig
                                    ?.inputMode === "percentage" &&
                                    (transaction as any)?.advanceConfig
                                      ?.percentage)
                                    ? ((transaction?.amount || 0) /
                                        ((transaction as any)?.advanceConfig
                                          ?.percentage || 1)) *
                                      100
                                    : ((transaction as any)?.splitConfig
                                        ?.numberOfParts || 1) *
                                        (transaction?.amount || 0) ||
                                      transaction?.amount ||
                                      0) -
                                    ((formData as any)?.advanceConfig
                                      ?.inputMode === "percentage"
                                      ? (((transaction as any)?.paymentSchedule
                                          ?.totalAmount ||
                                        ((transaction as any)?.advanceConfig
                                          ?.inputMode === "percentage" &&
                                          (transaction as any)?.advanceConfig
                                            ?.percentage)
                                          ? ((transaction?.amount || 0) /
                                              ((transaction as any)
                                                ?.advanceConfig?.percentage ||
                                                1)) *
                                            100
                                          : ((transaction as any)?.splitConfig
                                              ?.numberOfParts || 1) *
                                              (transaction?.amount || 0) ||
                                            transaction?.amount ||
                                            0) *
                                          ((formData as any)?.advanceConfig
                                            ?.percentage || 0)) /
                                        100
                                      : (formData as any)?.advanceConfig
                                          ?.amount || 0)
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reconciled"
                      checked={formData.reconciled || false}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="reconciled">Mark as Reconciled</Label>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onHide}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionModal;
