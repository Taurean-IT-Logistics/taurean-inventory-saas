"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Trash2,
  Calendar,
  Banknote,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TransactionsAPI } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currencyFormat } from "@/lib/utils";

interface CashChequeTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: "cash" | "cheque" | "split" | "advance";
}

interface Denomination {
  denomination: number;
  quantity: number;
}

interface SplitPart {
  amount: number;
  dueDate: string;
}

export default function CashChequeTransactionModal({
  isOpen,
  onClose,
  transactionType,
}: CashChequeTransactionModalProps) {
  const queryClient = useQueryClient();

  // Common fields
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");

  // Cash-specific fields
  const [denominations, setDenominations] = useState<Denomination[]>([
    { denomination: 1000, quantity: 0 },
    { denomination: 500, quantity: 0 },
    { denomination: 200, quantity: 0 },
    { denomination: 100, quantity: 0 },
    { denomination: 50, quantity: 0 },
    { denomination: 20, quantity: 0 },
    { denomination: 10, quantity: 0 },
    { denomination: 5, quantity: 0 },
  ]);

  // Cheque-specific fields
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");

  // Split payment fields
  const [numberOfParts, setNumberOfParts] = useState(2);
  const [splitParts, setSplitParts] = useState<SplitPart[]>([
    { amount: 0, dueDate: "" },
    { amount: 0, dueDate: "" },
  ]);

  // Advance payment fields
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advancePercentage, setAdvancePercentage] = useState("");
  const [advanceInputMode, setAdvanceInputMode] = useState<
    "percentage" | "amount"
  >("percentage");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total from denominations
  const calculateTotalFromDenominations = () => {
    return denominations.reduce((total, denom) => {
      return total + denom.denomination * denom.quantity;
    }, 0);
  };

  // Calculate total from split parts
  const calculateTotalFromSplit = () => {
    return splitParts.reduce((total, part) => total + part.amount, 0);
  };

  // Cash payment mutation
  const cashPaymentMutation = useMutation({
    mutationFn: (data: any) => TransactionsAPI.processCashPayment(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cash transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions-company"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create cash transaction",
        variant: "destructive",
      });
    },
  });

  // Cheque payment mutation
  const chequePaymentMutation = useMutation({
    mutationFn: (data: any) => TransactionsAPI.processCheckPayment(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cheque transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions-company"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create cheque transaction",
        variant: "destructive",
      });
    },
  });

  // Split payment mutation
  const splitPaymentMutation = useMutation({
    mutationFn: (data: any) => TransactionsAPI.processSplitPayment(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Split payment transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions-company"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to create split payment transaction",
        variant: "destructive",
      });
    },
  });

  // Advance payment mutation
  const advancePaymentMutation = useMutation({
    mutationFn: (data: any) => TransactionsAPI.processAdvancePayment(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Advance payment transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions-company"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to create advance payment transaction",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("");
    setReference("");
    setDenominations([
      { denomination: 1000, quantity: 0 },
      { denomination: 500, quantity: 0 },
      { denomination: 200, quantity: 0 },
      { denomination: 100, quantity: 0 },
      { denomination: 50, quantity: 0 },
      { denomination: 20, quantity: 0 },
      { denomination: 10, quantity: 0 },
      { denomination: 5, quantity: 0 },
    ]);
    setChequeNumber("");
    setBankName("");
    setAccountNumber("");
    setChequeDate("");
    setNumberOfParts(2);
    setSplitParts([
      { amount: 0, dueDate: "" },
      { amount: 0, dueDate: "" },
    ]);
    setAdvanceAmount("");
    setAdvancePercentage("");
    setAdvanceInputMode("percentage");
  };

  const handleSubmit = async () => {
    if (!amount || !description || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (transactionType === "cash") {
        const totalFromDenominations = calculateTotalFromDenominations();
        if (totalFromDenominations !== parseFloat(amount)) {
          toast({
            title: "Error",
            description: "Denomination total doesn't match the amount",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        await cashPaymentMutation.mutateAsync({
          amount: parseFloat(amount),
          denominations,
          description,
          category,
          reference: reference || undefined,
        });
      } else if (transactionType === "cheque") {
        if (!chequeNumber || !bankName || !accountNumber || !chequeDate) {
          toast({
            title: "Error",
            description: "Please fill in all cheque details",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        await chequePaymentMutation.mutateAsync({
          amount: parseFloat(amount),
          checkNumber: chequeNumber,
          bankName,
          accountNumber,
          checkDate: chequeDate,
          description,
          category,
          reference: reference || undefined,
        });
      } else if (transactionType === "split") {
        const totalFromSplit = calculateTotalFromSplit();
        if (totalFromSplit !== parseFloat(amount)) {
          toast({
            title: "Error",
            description: "Split parts total doesn't match the amount",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        await splitPaymentMutation.mutateAsync({
          totalAmount: parseFloat(amount),
          currency: "GHS", // Default currency
          splits: splitParts.map((part) => ({
            amount: part.amount,
            dueDate: new Date(part.dueDate),
          })),
          description,
          category,
          reference: reference || undefined,
        });
      } else if (transactionType === "advance") {
        if (!advanceAmount && !advancePercentage) {
          toast({
            title: "Error",
            description: "Please specify advance amount or percentage",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        await advancePaymentMutation.mutateAsync({
          amount: parseFloat(amount),
          currency: "GHS", // Default currency
          paymentMethod: "cash", // Default payment method for advance payments
          description,
          category,
          reference: reference || undefined,
          advanceConfig: {
            percentage:
              advanceInputMode === "percentage"
                ? parseFloat(advancePercentage)
                : undefined,
            amount:
              advanceInputMode === "amount"
                ? parseFloat(advanceAmount)
                : undefined,
            inputMode: advanceInputMode,
          },
        });
      }
    } catch (error) {
      console.error("Transaction creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDenominationQuantity = (index: number, quantity: number) => {
    const newDenominations = [...denominations];
    newDenominations[index].quantity = Math.max(0, quantity);
    setDenominations(newDenominations);
  };

  const updateSplitPart = (
    index: number,
    field: keyof SplitPart,
    value: string | number
  ) => {
    const newSplitParts = [...splitParts];
    newSplitParts[index] = { ...newSplitParts[index], [field]: value };
    setSplitParts(newSplitParts);
  };

  const addSplitPart = () => {
    setSplitParts([...splitParts, { amount: 0, dueDate: "" }]);
    setNumberOfParts(numberOfParts + 1);
  };

  const removeSplitPart = (index: number) => {
    if (splitParts.length > 1) {
      const newSplitParts = splitParts.filter((_, i) => i !== index);
      setSplitParts(newSplitParts);
      setNumberOfParts(numberOfParts - 1);
    }
  };

  const getTitle = () => {
    switch (transactionType) {
      case "cash":
        return "Add Cash Transaction";
      case "cheque":
        return "Add Cheque Transaction";
      case "split":
        return "Add Split Payment Transaction";
      case "advance":
        return "Add Advance Payment Transaction";
      default:
        return "Add Transaction";
    }
  };

  const getDescription = () => {
    switch (transactionType) {
      case "cash":
        return "Record a cash payment with denomination breakdown";
      case "cheque":
        return "Record a cheque payment with bank details";
      case "split":
        return "Create a split payment with multiple due dates";
      case "advance":
        return "Create an advance payment with percentage or fixed amount";
      default:
        return "Add a new transaction";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transactionType === "cash" && (
              <Banknote className="h-5 w-5 text-green-600" />
            )}
            {transactionType === "cheque" && (
              <CreditCard className="h-5 w-5 text-orange-600" />
            )}
            {transactionType === "split" && (
              <Calendar className="h-5 w-5 text-blue-600" />
            )}
            {transactionType === "advance" && (
              <TrendingUp className="h-5 w-5 text-purple-600" />
            )}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Common Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Transaction description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Transaction reference..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Cash Denomination Breakdown */}
          {transactionType === "cash" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Cash Denomination Breakdown
                  <Badge variant="outline" className="text-green-600">
                    Total: {currencyFormat(calculateTotalFromDenominations())}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {denominations.map((denom, index) => (
                    <div
                      key={denom.denomination}
                      className="flex items-center gap-4"
                    >
                      <div className="w-20 text-sm font-medium">
                        {currencyFormat(denom.denomination)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateDenominationQuantity(
                              index,
                              denom.quantity - 1
                            )
                          }
                          disabled={denom.quantity <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={denom.quantity}
                          onChange={(e) =>
                            updateDenominationQuantity(
                              index,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 text-center"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateDenominationQuantity(
                              index,
                              denom.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600">
                        = {currencyFormat(denom.denomination * denom.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cheque Details */}
          {transactionType === "cheque" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cheque Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chequeNumber">Cheque Number *</Label>
                    <Input
                      id="chequeNumber"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      placeholder="Enter cheque number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chequeDate">Cheque Date *</Label>
                    <Input
                      id="chequeDate"
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Split Payment Configuration */}
          {transactionType === "split" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Split Payment Configuration
                  <Badge variant="outline" className="text-blue-600">
                    Total: {currencyFormat(calculateTotalFromSplit())}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {splitParts.map((part, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="text-sm font-medium w-8">
                        Part {index + 1}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`split-amount-${index}`}>Amount</Label>
                        <Input
                          id={`split-amount-${index}`}
                          type="number"
                          step="0.01"
                          value={part.amount}
                          onChange={(e) =>
                            updateSplitPart(
                              index,
                              "amount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`split-date-${index}`}>Due Date</Label>
                        <Input
                          id={`split-date-${index}`}
                          type="date"
                          value={part.dueDate}
                          onChange={(e) =>
                            updateSplitPart(index, "dueDate", e.target.value)
                          }
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSplitPart(index)}
                        disabled={splitParts.length <= 1}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addSplitPart}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Part
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advance Payment Configuration */}
          {transactionType === "advance" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Advance Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="advanceInputMode">Input Mode</Label>
                  <Select
                    value={advanceInputMode}
                    onValueChange={(value: "percentage" | "amount") =>
                      setAdvanceInputMode(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {advanceInputMode === "percentage" ? (
                  <div>
                    <Label htmlFor="advancePercentage">
                      Advance Percentage (%)
                    </Label>
                    <Input
                      id="advancePercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={advancePercentage}
                      onChange={(e) => setAdvancePercentage(e.target.value)}
                      placeholder="e.g., 30"
                    />
                    {advancePercentage && amount && (
                      <div className="mt-2 text-sm text-gray-600">
                        Advance amount:{" "}
                        {currencyFormat(
                          (parseFloat(amount) * parseFloat(advancePercentage)) /
                            100
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="advanceAmount">Advance Amount</Label>
                    <Input
                      id="advanceAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      placeholder="0.00"
                    />
                    {advanceAmount && amount && (
                      <div className="mt-2 text-sm text-gray-600">
                        Percentage:{" "}
                        {(
                          (parseFloat(advanceAmount) / parseFloat(amount)) *
                          100
                        ).toFixed(2)}
                        %
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-800">
                    <strong>Total Amount:</strong>{" "}
                    {currencyFormat(parseFloat(amount) || 0)}
                  </div>
                  <div className="text-sm text-purple-800">
                    <strong>Advance:</strong>{" "}
                    {currencyFormat(
                      advanceInputMode === "percentage"
                        ? ((parseFloat(amount) || 0) *
                            (parseFloat(advancePercentage) || 0)) /
                            100
                        : parseFloat(advanceAmount) || 0
                    )}
                  </div>
                  <div className="text-sm text-purple-800">
                    <strong>Balance:</strong>{" "}
                    {currencyFormat(
                      (parseFloat(amount) || 0) -
                        (advanceInputMode === "percentage"
                          ? ((parseFloat(amount) || 0) *
                              (parseFloat(advancePercentage) || 0)) /
                            100
                          : parseFloat(advanceAmount) || 0)
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={
              transactionType === "cash"
                ? "bg-green-600 hover:bg-green-700"
                : transactionType === "cheque"
                ? "bg-orange-600 hover:bg-orange-700"
                : transactionType === "split"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-purple-600 hover:bg-purple-700"
            }
          >
            {isSubmitting
              ? "Creating..."
              : `Create ${
                  transactionType.charAt(0).toUpperCase() +
                  transactionType.slice(1)
                } Transaction`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
