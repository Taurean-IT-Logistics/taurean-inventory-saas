"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsAPI } from "@/lib/api";
import { Loader2, DollarSign, CreditCard, Receipt } from "lucide-react";

const cashPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  denominations: z
    .array(
      z.object({
        denomination: z.number().min(1),
        quantity: z.number().min(0),
      })
    )
    .min(1, "At least one denomination is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  reference: z.string().optional(),
});

const checkPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  checkNumber: z.string().min(1, "Check number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  checkDate: z.string().min(1, "Check date is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  reference: z.string().optional(),
});

type CashPaymentForm = z.infer<typeof cashPaymentSchema>;
type CheckPaymentForm = z.infer<typeof checkPaymentSchema>;

const DENOMINATIONS = [
  { value: 200, label: "GH₵200" },
  { value: 100, label: "GH₵100" },
  { value: 50, label: "GH₵50" },
  { value: 20, label: "GH₵20" },
  { value: 10, label: "GH₵10" },
  { value: 5, label: "GH₵5" },
  { value: 2, label: "GH₵2" },
  { value: 1, label: "GH₵1" },
  { value: 0.5, label: "50p" },
  { value: 0.2, label: "20p" },
  { value: 0.1, label: "10p" },
];

const PAYMENT_CATEGORIES = [
  "booking_payment",
  "rental_payment",
  "advance_payment",
  "balance_payment",
  "split_payment",
  "refund",
  "deposit",
  "other",
];

export function AdminPaymentInput() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("cash");

  const cashForm = useForm<CashPaymentForm>({
    resolver: zodResolver(cashPaymentSchema),
    defaultValues: {
      amount: 0,
      denominations: [{ denomination: 100, quantity: 0 }],
      description: "",
      category: "booking_payment",
      reference: "",
    },
  });

  const checkForm = useForm<CheckPaymentForm>({
    resolver: zodResolver(checkPaymentSchema),
    defaultValues: {
      amount: 0,
      checkNumber: "",
      bankName: "",
      accountNumber: "",
      checkDate: "",
      description: "",
      category: "booking_payment",
      reference: "",
    },
  });

  const processCashPayment = useMutation({
    mutationFn: async (data: CashPaymentForm) => {
      return TransactionsAPI.processCashPayment(data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cash payment processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      cashForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process cash payment",
        variant: "destructive",
      });
    },
  });

  const processCheckPayment = useMutation({
    mutationFn: async (data: CheckPaymentForm) => {
      return TransactionsAPI.processCheckPayment(data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Check payment processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      checkForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process check payment",
        variant: "destructive",
      });
    },
  });

  const addDenomination = () => {
    const currentDenominations = cashForm.getValues("denominations");
    cashForm.setValue("denominations", [
      ...currentDenominations,
      { denomination: 100, quantity: 0 },
    ]);
  };

  const removeDenomination = (index: number) => {
    const currentDenominations = cashForm.getValues("denominations");
    if (currentDenominations.length > 1) {
      cashForm.setValue(
        "denominations",
        currentDenominations.filter((_, i) => i !== index)
      );
    }
  };

  const calculateTotal = (
    denominations: { denomination: number; quantity: number }[]
  ) => {
    return denominations.reduce(
      (total, denom) => total + denom.denomination * denom.quantity,
      0
    );
  };

  const onCashSubmit = (data: CashPaymentForm) => {
    const total = calculateTotal(data.denominations);
    if (Math.abs(total - data.amount) > 0.01) {
      toast({
        title: "Amount Mismatch",
        description: `Total denominations (${total}) does not match entered amount (${data.amount})`,
        variant: "destructive",
      });
      return;
    }
    processCashPayment.mutate(data);
  };

  const onCheckSubmit = (data: CheckPaymentForm) => {
    processCheckPayment.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Receipt className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Payment Input</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cash" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Cash Payment</span>
          </TabsTrigger>
          <TabsTrigger value="check" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Check Payment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cash" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Payment Entry</CardTitle>
              <CardDescription>
                Record cash payments with denomination breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...cashForm}>
                <form
                  onSubmit={cashForm.handleSubmit(onCashSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={cashForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={cashForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAYMENT_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category.replace(/_/g, " ").toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={cashForm.control}
                    name="denominations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Denominations</FormLabel>
                        <div className="space-y-3">
                          {field.value.map((denom, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              <Select
                                value={denom.denomination.toString()}
                                onValueChange={(value) => {
                                  const newDenominations = [...field.value];
                                  newDenominations[index].denomination =
                                    parseFloat(value);
                                  field.onChange(newDenominations);
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DENOMINATIONS.map((d) => (
                                    <SelectItem
                                      key={d.value}
                                      value={d.value.toString()}
                                    >
                                      {d.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Quantity"
                                value={denom.quantity}
                                onChange={(e) => {
                                  const newDenominations = [...field.value];
                                  newDenominations[index].quantity =
                                    parseInt(e.target.value) || 0;
                                  field.onChange(newDenominations);
                                }}
                                className="w-24"
                              />
                              <Badge variant="secondary">
                                GH₵
                                {(denom.denomination * denom.quantity).toFixed(
                                  2
                                )}
                              </Badge>
                              {field.value.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeDenomination(index)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addDenomination}
                            className="w-full"
                          >
                            Add Denomination
                          </Button>
                        </div>
                        <FormDescription>
                          Total: GH₵{calculateTotal(field.value).toFixed(2)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={cashForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Payment description..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={cashForm.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Payment reference..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cashForm.reset()}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={processCashPayment.isPending}
                    >
                      {processCashPayment.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Process Cash Payment
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check Payment Entry</CardTitle>
              <CardDescription>
                Record check payments with bank details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...checkForm}>
                <form
                  onSubmit={checkForm.handleSubmit(onCheckSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={checkForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={checkForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAYMENT_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category.replace(/_/g, " ").toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={checkForm.control}
                      name="checkNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Check number..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={checkForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Bank name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={checkForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Account number..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={checkForm.control}
                      name="checkDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={
                                field.value ? new Date(field.value) : undefined
                              }
                              onDateChange={(date: Date | undefined) => {
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : ""
                                );
                              }}
                              placeholder="Select check date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={checkForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Payment description..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={checkForm.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Payment reference..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => checkForm.reset()}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={processCheckPayment.isPending}
                    >
                      {processCheckPayment.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Process Check Payment
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
