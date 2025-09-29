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
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Cash Denominations
                          </Label>
                          <div className="text-sm text-gray-900">
                            {JSON.stringify(
                              (transaction.paymentDetails as any).denominations
                            )}
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
            {(transaction.method === "split" ||
              transaction.method === "advance") && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {transaction.method === "split" ? (
                      <SplitIcon className="w-5 h-5" />
                    ) : (
                      <TrendingUpIcon className="w-5 h-5" />
                    )}
                    {transaction.method === "split"
                      ? "Split Payment"
                      : "Advance Payment"}{" "}
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      This transaction is part of a {transaction.method} payment
                      plan.
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

                    {/* Show split configuration if available */}
                    {(transaction as any).splitConfig && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Split Configuration
                        </h4>
                        <div className="text-sm text-gray-600">
                          <div>
                            Parts: {(transaction as any).splitConfig.parts}
                          </div>
                          <div>
                            Percentages:{" "}
                            {(transaction as any).splitConfig.percentages?.join(
                              ", "
                            )}
                          </div>
                          <div>
                            Amounts:{" "}
                            {(transaction as any).splitConfig.amounts
                              ?.map((amt: number) => currencyFormat(amt))
                              .join(", ")}
                          </div>
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
                          <SelectItem value="split">Split Payment</SelectItem>
                          <SelectItem value="advance">
                            Advance Payment
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount || ""}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                      />
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
                    <div className="space-y-2">
                      <Label htmlFor="denominations">Cash Denominations</Label>
                      <Textarea
                        id="denominations"
                        name="denominations"
                        value={JSON.stringify(
                          (formData.paymentDetails as any)?.denominations || {}
                        )}
                        onChange={(e) => {
                          try {
                            const denominations = JSON.parse(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              paymentDetails: {
                                ...prev.paymentDetails,
                                denominations,
                              },
                            }));
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        rows={2}
                        placeholder='{"100": 5, "50": 10, "20": 20}'
                      />
                    </div>
                  )}

                  {formData.method === "cheque" && (
                    <div className="space-y-2">
                      <Label htmlFor="chequeNumber">Cheque Number</Label>
                      <Input
                        id="chequeNumber"
                        name="chequeNumber"
                        value={formData.paymentDetails?.chequeNumber || ""}
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

                  {formData.method === "bank" && (
                    <div className="space-y-2">
                      <Label htmlFor="bankDetails">Bank Details</Label>
                      <Textarea
                        id="bankDetails"
                        name="bankDetails"
                        value={JSON.stringify(
                          formData.paymentDetails?.bankDetails || {}
                        )}
                        onChange={(e) => {
                          try {
                            const bankDetails = JSON.parse(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              paymentDetails: {
                                ...prev.paymentDetails,
                                bankDetails,
                              },
                            }));
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        rows={2}
                        placeholder='{"bankName": "Ghana Commercial Bank", "accountNumber": "..."}'
                      />
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
