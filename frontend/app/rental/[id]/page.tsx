"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Info, Clock, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  InventoryAPI,
  TaxScheduleAPI,
  TransactionsAPI,
  PendingTransactionsAPI,
  getResourceUrl,
} from "@/lib/api";
import { InventoryItem, TaxSchedule } from "@/types";
import { currencyFormat } from "@/lib/utils";
import { calculateRentalTaxesFromSchedules } from "@/lib/taxCalculator";
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
} from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import Image from "next/image";
import { DatePicker } from "@/components/ui/date-picker";
import { useRouter } from "next/navigation";

interface PaymentResponse {
  payment: {
    authorization_url: string;
  };
}

const RentDetailPage = ({ params }: { params: { id: string } }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentTiming, setPaymentTiming] = useState<string>("");
  const [paymentStep, setPaymentStep] = useState(1); // 1: Payment Method, 2: Payment Timing
  const [splitConfig, setSplitConfig] = useState<{
    numberOfParts: number;
    parts: Array<{ amount: number; dueDate: Date }>;
  }>({
    numberOfParts: 2,
    parts: [],
  });
  const [advanceConfig, setAdvanceConfig] = useState<{
    percentage: number | string;
    amount: number;
    inputMode: "percentage" | "amount";
  }>({
    percentage: 30,
    amount: 0,
    inputMode: "percentage",
  });

  // Fetch item data
  const {
    data: item,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["inventoryItem", params.id],
    queryFn: () => InventoryAPI.getItem(params.id),
    enabled: !!params.id,
  });

  // Fetch tax schedules
  const { data: taxSchedulesData = { schedules: [] } } = useQuery({
    queryKey: ["tax-schedules"],
    queryFn: () => TaxScheduleAPI.getTaxSchedules(),
    enabled: !!user,
  });

  // Extract tax schedules array from various API response formats
  const extractTaxSchedulesArray = (data: any): TaxSchedule[] => {
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data.taxSchedules)) {
        return data.taxSchedules;
      } else if (Array.isArray(data.schedules)) {
        return data.schedules;
      } else if (Array.isArray(data.items)) {
        return data.items;
      }
    }
    return [];
  };

  const taxSchedules = extractTaxSchedulesArray(taxSchedulesData);

  // Payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (transactionData: any) => {
      return TransactionsAPI.initializePayment(transactionData);
    },
    onSuccess: (data: any) => {
      const authUrl = (data as any)?.payment?.authorization_url;
      if (typeof authUrl === "string") {
        toast({
          title: "Payment Authorization URL",
          description: "Redirecting to payment authorization URL",
          variant: "default",
        });
        setTimeout(() => {
          window.location.href = authUrl;
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "Failed to get payment authorization URL.",
          variant: "destructive",
        });
      }

      setTransactionRef((data as any).transaction.ref);
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        variant: "destructive",
        description:
          error.message || "Something went wrong during transaction.",
      });
    },
  });

  useEffect(() => {
    if (startDate && endDate) {
      const diff = differenceInCalendarDays(
        new Date(endDate),
        new Date(startDate)
      );
      setRentalDays(diff > 0 ? diff : 1);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (transactionRef) {
      localStorage.setItem("paymentReference", transactionRef);
    }
  }, [transactionRef]);

  const daysFromNow = (date: Date) => {
    const diff = differenceInCalendarDays(date, new Date());
    return diff === 0 ? "today" : `${diff} day${diff > 1 ? "s" : ""}`;
  };

  if (isLoading) return <Loader text="Fetching Rental Item..." />;

  if (!item) {
    return (
      <ErrorComponent
        title="Item not found"
        message="The requested rental item could not be found."
        onRetry={refetch}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { variant: "default" as const, text: "Available" },
      rented: { variant: "secondary" as const, text: "Rented" },
      unavailable: { variant: "destructive" as const, text: "Unavailable" },
      maintenance: { variant: "outline" as const, text: "Maintenance" },
      retired: { variant: "secondary" as const, text: "Retired" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.unavailable;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const isAvailable =
    (item as InventoryItem).status === "in_stock" &&
    (item as InventoryItem).quantity > 0;
  const normalized = (str: string) =>
    str.trim().replace(/\s/g, "").toLowerCase();

  const price =
    (item as InventoryItem).pricing.find(
      (p: any) => p.isDefault || p.unit === "day"
    )?.amount || 0;

  const subtotal = price * quantity * rentalDays;

  // Use the new tax schedule calculator
  const taxResult = calculateRentalTaxesFromSchedules(
    subtotal,
    taxSchedules,
    (item as any).company,
    (item as InventoryItem).isTaxable
  );

  const totalPrice = taxResult.total;

  const handleTransaction = async () => {
    if (!user) return;

    const total = taxResult.total;
    let amount = total;
    let paymentData: any = {};

    // Handle different payment timings
    if (paymentTiming === "split" && splitConfig) {
      amount =
        splitConfig.parts?.[0]?.amount || total / splitConfig.numberOfParts;
      paymentData = {
        splitConfig: {
          numberOfParts: splitConfig.numberOfParts,
          parts: splitConfig.parts,
        },
      };
    } else if (paymentTiming === "advance" && advanceConfig) {
      amount = advanceConfig.amount;
      paymentData = {
        advanceConfig: {
          percentage: advanceConfig.percentage,
          amount: advanceConfig.amount,
          inputMode: advanceConfig.inputMode,
        },
      };
    }

    if (paymentMethod === "online") {
      // Online payment - proceed with normal flow
      const transactionData = {
        email: user.email,
        amount: amount,
        quantity: quantity,
        inventoryItem: (item as InventoryItem)._id || "",
        category: "inventory_item",
        description: `Rental for ${(item as InventoryItem).name} (${
          (item as InventoryItem)._id
        }) from ${startDate} to ${endDate}${
          paymentTiming === "advance" ? " (Advance Payment)" : ""
        }${paymentTiming === "split" ? " (Split Payment - Part 1)" : ""}`,
        paymentMethod: paymentMethod,
        paymentTiming: paymentTiming,
        ...paymentData,
      };

      createPaymentMutation.mutate(transactionData);
    } else if (paymentMethod === "cash" || paymentMethod === "cheque") {
      // Cash/Cheque payment - create pending transaction
      try {
        // Create pending transaction
        const pendingTransactionData = {
          type: "rental",
          referenceId: (item as InventoryItem)._id || "",
          amount: amount,
          paymentMethod: paymentMethod,
          paymentTiming: paymentTiming,
          advanceConfig: paymentData.advanceConfig,
          splitConfig: paymentData.splitConfig,
          notes: `Payment at facility for rental ${
            (item as InventoryItem)._id || ""
          }${paymentTiming === "advance" ? " (Advance Payment)" : ""}${
            paymentTiming === "split" ? " (Split Payment - Part 1)" : ""
          }`,
        };

        await PendingTransactionsAPI.create(pendingTransactionData);

        let description = `Your rental has been created. Please bring ${currencyFormat(
          amount
        )} in ${paymentMethod} when you arrive at the facility.`;

        if (paymentTiming === "advance" && advanceConfig) {
          const balance = total - advanceConfig.amount;
          description += ` Balance of ${currencyFormat(
            balance
          )} will be due later.`;
        } else if (paymentTiming === "split" && splitConfig) {
          description += ` This is part 1 of ${splitConfig.numberOfParts} payments.`;
        }

        toast({
          title: "Rental Created Successfully",
          description,
          variant: "default",
        });

        // Redirect to user dashboard
        router.push("/user/dashboard");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create rental",
          variant: "destructive",
        });
      }
    }
  };

  const images = (item as InventoryItem).images?.map(
    (img: any) => img.path
  ) || ["/placeholder.svg"];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-10 py-6 mt-20">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <Card className="mb-4">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={getResourceUrl(images[selectedImage])}
                    alt={(item as InventoryItem).name}
                    className="w-full h-96 object-cover rounded-t-lg"
                    width={800}
                    height={400}
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge((item as InventoryItem).status)}
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-3">
                    {images.map((image: any, index: number) => (
                      <Image
                        key={index}
                        src={getResourceUrl(image)}
                        alt={`${(item as InventoryItem).name} ${index + 1}`}
                        className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                          selectedImage === index
                            ? "border-blue-500"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedImage(index)}
                        width={160}
                        height={80}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Item Details */}
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {(item as InventoryItem).name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {(item as InventoryItem).category}
                    </Badge>
                    <span className="text-blue-600 text-sm">
                      SKU: {(item as InventoryItem).sku || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-blue-600 mb-2">
                  {currencyFormat(price)}/day
                </h2>
                <p className="text-gray-600">
                  {(item as InventoryItem).description ||
                    "No description available for this item."}
                </p>
              </div>

              {/* Booking Form */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Book Your Rental
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <DatePicker
                        date={startDate ? new Date(startDate) : undefined}
                        onDateChange={(date) =>
                          setStartDate(
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        placeholder="Select start date"
                        disabled={!isAvailable}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <DatePicker
                        date={endDate ? new Date(endDate) : undefined}
                        onDateChange={(date) =>
                          setEndDate(
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        placeholder="Select end date"
                        disabled={!isAvailable}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = Math.max(
                            1,
                            Math.min(
                              Number(e.target.value),
                              (item as InventoryItem).quantity || 1
                            )
                          );
                          setQuantity(val);
                        }}
                        disabled={!isAvailable}
                        min={1}
                        max={(item as InventoryItem).quantity || 1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rentalDays">Rental Days</Label>
                      <Input
                        id="rentalDays"
                        type="number"
                        value={rentalDays}
                        readOnly
                        disabled={!isAvailable}
                      />
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Clock className="w-4 h-4" />
                        <span>
                          Period: Ends on{" "}
                          {format(new Date(endDate), "MMMM d, yyyy")},{" "}
                          {daysFromNow(new Date(endDate))} from now.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span>
                        Subtotal ({rentalDays} day{rentalDays > 1 ? "s" : ""} ×{" "}
                        {quantity} × {currencyFormat(price)}):
                      </span>
                      <span className="text-xl font-semibold text-blue-600">
                        {currencyFormat(taxResult.subtotal)}
                      </span>
                    </div>

                    {taxResult.serviceFee > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Service Fee ({taxResult.serviceFeeRate}%):</span>
                        <span className="text-xl font-semibold text-blue-600">
                          {currencyFormat(taxResult.serviceFee)}
                        </span>
                      </div>
                    )}

                    {taxResult.taxBreakdown.length > 0 && (
                      <>
                        {taxResult.taxBreakdown.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span>
                              {item.tax.name} ({item.rate}%):
                            </span>
                            <span className="text-xl font-semibold text-blue-600">
                              {currencyFormat(item.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center">
                          <span>Total Tax:</span>
                          <span className="text-xl font-semibold text-blue-600">
                            {currencyFormat(taxResult.tax)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-semibold">Total Cost:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {currencyFormat(taxResult.total)}
                      </span>
                    </div>
                  </div>

                  {user ? (
                    <div className="space-y-4">
                      {/* Step 1: Payment Method Selection */}
                      {paymentStep === 1 && (
                        <>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                1
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Select Payment Method
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {/* Online Payment */}
                            <div
                              className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                paymentMethod === "online"
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setPaymentMethod("online")}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    paymentMethod === "online"
                                      ? "border-blue-600 bg-blue-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {paymentMethod === "online" && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    Online Payment
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Pay securely with card or mobile money
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Cash Payment */}
                            <div
                              className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                paymentMethod === "cash"
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setPaymentMethod("cash")}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    paymentMethod === "cash"
                                      ? "border-blue-600 bg-blue-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {paymentMethod === "cash" && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    Cash Payment
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Pay with cash directly at the facility
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Cheque Payment */}
                            <div
                              className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                paymentMethod === "cheque"
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setPaymentMethod("cheque")}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    paymentMethod === "cheque"
                                      ? "border-blue-600 bg-blue-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {paymentMethod === "cheque" && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    Cheque Payment
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Pay with cheque directly at the facility
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => setPaymentStep(2)}
                            disabled={!paymentMethod}
                          >
                            Continue
                          </Button>
                        </>
                      )}

                      {/* Step 2: Payment Timing Selection */}
                      {paymentStep === 2 && (
                        <>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                2
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                              How would you like to pay?
                            </h3>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-3">
                              {/* Full Payment */}
                              <div
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                  paymentTiming === "full"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => setPaymentTiming("full")}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      paymentTiming === "full"
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {paymentTiming === "full" && (
                                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      Pay Full Amount Now
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {paymentMethod === "online"
                                        ? "Pay the full amount online now"
                                        : `Pay the full amount in ${paymentMethod} at the facility`}
                                    </p>
                                  </div>
                                  <div className="text-sm font-medium text-blue-600">
                                    {currencyFormat(taxResult.total)}
                                  </div>
                                </div>
                              </div>

                              {/* Split Payment */}
                              <div
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                  paymentTiming === "split"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => {
                                  setPaymentTiming("split");
                                  setSplitConfig({
                                    numberOfParts: 2,
                                    parts: [
                                      {
                                        amount: taxResult.total * 0.5,
                                        dueDate: new Date(),
                                      },
                                      {
                                        amount: taxResult.total * 0.5,
                                        dueDate: new Date(
                                          Date.now() + 7 * 24 * 60 * 60 * 1000
                                        ),
                                      },
                                    ],
                                  });
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      paymentTiming === "split"
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {paymentTiming === "split" && (
                                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      Split Payment
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Pay in multiple installments (max 3 parts)
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Advance Payment */}
                              <div
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                  paymentTiming === "advance"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => {
                                  setPaymentTiming("advance");
                                  setAdvanceConfig({
                                    percentage: 30,
                                    amount: taxResult.total * 0.3,
                                    inputMode: "percentage",
                                  });
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      paymentTiming === "advance"
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {paymentTiming === "advance" && (
                                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      Advance Payment
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Pay advance amount now, balance later
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Split Payment Configuration */}
                            {paymentTiming === "split" && (
                              <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Configure Split Payment
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Number of Parts
                                    </label>
                                    <Select
                                      value={String(splitConfig.numberOfParts)}
                                      onValueChange={(value) => {
                                        const numberOfParts = parseInt(value);
                                        const amountPerPart =
                                          taxResult.total / numberOfParts;
                                        const parts = Array.from(
                                          { length: numberOfParts },
                                          (_, index) => ({
                                            amount: amountPerPart,
                                            dueDate: new Date(
                                              Date.now() +
                                                index * 7 * 24 * 60 * 60 * 1000
                                            ),
                                          })
                                        );

                                        setSplitConfig({
                                          numberOfParts,
                                          parts,
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select number of parts" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="2">
                                          2 Parts
                                        </SelectItem>
                                        <SelectItem value="3">
                                          3 Parts
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Payment Breakdown
                                    </label>
                                    {splitConfig.parts.map((part, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-white rounded border"
                                      >
                                        <span className="text-sm">
                                          Part {index + 1}
                                        </span>
                                        <span className="font-medium">
                                          {currencyFormat(part.amount)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Advance Payment Configuration */}
                            {paymentTiming === "advance" && (
                              <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Configure Advance Payment
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Advance Configuration
                                    </label>

                                    {/* Input Mode Selection */}
                                    <div className="mb-3">
                                      <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Input Mode
                                      </label>
                                      <Select
                                        value={
                                          advanceConfig.inputMode ||
                                          "percentage"
                                        }
                                        onValueChange={(value) => {
                                          const currentAmount =
                                            advanceConfig.amount ||
                                            taxResult.total * 0.3;
                                          setAdvanceConfig({
                                            percentage:
                                              value === "percentage"
                                                ? 30
                                                : "custom",
                                            amount: currentAmount,
                                            inputMode: value as
                                              | "percentage"
                                              | "amount",
                                          });
                                        }}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select input mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="percentage">
                                            Percentage
                                          </SelectItem>
                                          <SelectItem value="amount">
                                            Amount
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Percentage Input */}
                                    {advanceConfig.inputMode ===
                                      "percentage" && (
                                      <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-600">
                                          Advance Percentage
                                        </label>
                                        <div className="flex items-center space-x-2">
                                          <Select
                                            value={String(
                                              advanceConfig.percentage || 30
                                            )}
                                            onValueChange={(value) => {
                                              if (value === "custom") {
                                                setAdvanceConfig({
                                                  percentage: "custom",
                                                  amount: taxResult.total * 0.3,
                                                  inputMode: "percentage",
                                                });
                                              } else {
                                                const percentage =
                                                  parseInt(value);
                                                const amount =
                                                  taxResult.total *
                                                  (percentage / 100);

                                                setAdvanceConfig({
                                                  percentage,
                                                  amount,
                                                  inputMode: "percentage",
                                                });
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="flex-1">
                                              <SelectValue placeholder="Select percentage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="30">
                                                30%
                                              </SelectItem>
                                              <SelectItem value="35">
                                                35%
                                              </SelectItem>
                                              <SelectItem value="40">
                                                40%
                                              </SelectItem>
                                              <SelectItem value="45">
                                                45%
                                              </SelectItem>
                                              <SelectItem value="50">
                                                50%
                                              </SelectItem>
                                              <SelectItem value="custom">
                                                Custom
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                          {advanceConfig.percentage ===
                                            "custom" && (
                                            <div className="flex items-center space-x-2">
                                              <Input
                                                type="number"
                                                min="30"
                                                max="80"
                                                placeholder="30"
                                                className="w-20"
                                                value={
                                                  typeof advanceConfig.percentage ===
                                                  "number"
                                                    ? advanceConfig.percentage
                                                    : ""
                                                }
                                                onChange={(e) => {
                                                  const percentage =
                                                    parseInt(e.target.value) ||
                                                    30;
                                                  const amount =
                                                    taxResult.total *
                                                    (percentage / 100);

                                                  setAdvanceConfig({
                                                    percentage,
                                                    amount,
                                                    inputMode: "percentage",
                                                  });
                                                }}
                                              />
                                              <span className="text-sm text-gray-500">
                                                %
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          Minimum 30%, Maximum 80%
                                        </p>
                                      </div>
                                    )}

                                    {/* Amount Input */}
                                    {advanceConfig.inputMode === "amount" && (
                                      <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-600">
                                          Advance Amount
                                        </label>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            type="number"
                                            min={taxResult.total * 0.3}
                                            max={taxResult.total * 0.8}
                                            step="0.01"
                                            placeholder={currencyFormat(
                                              taxResult.total * 0.3
                                            )}
                                            className="flex-1"
                                            value={advanceConfig.amount || ""}
                                            onChange={(e) => {
                                              const amount =
                                                parseFloat(e.target.value) ||
                                                taxResult.total * 0.3;
                                              const percentage =
                                                (amount / taxResult.total) *
                                                100;

                                              setAdvanceConfig({
                                                percentage:
                                                  Math.round(percentage),
                                                amount,
                                                inputMode: "amount",
                                              });
                                            }}
                                          />
                                          <span className="text-sm text-gray-500">
                                            (
                                            {Math.round(
                                              ((advanceConfig.amount ||
                                                taxResult.total * 0.3) /
                                                taxResult.total) *
                                                100
                                            )}
                                            %)
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          Minimum{" "}
                                          {currencyFormat(
                                            taxResult.total * 0.3
                                          )}
                                          , Maximum{" "}
                                          {currencyFormat(
                                            taxResult.total * 0.8
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white rounded border">
                                      <div className="text-sm text-gray-600">
                                        Advance Amount
                                      </div>
                                      <div className="font-medium">
                                        {currencyFormat(
                                          advanceConfig.amount || 0
                                        )}
                                      </div>
                                    </div>
                                    <div className="p-3 bg-white rounded border">
                                      <div className="text-sm text-gray-600">
                                        Balance
                                      </div>
                                      <div className="font-medium">
                                        {currencyFormat(
                                          taxResult.total -
                                            (advanceConfig.amount || 0)
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Payment Method Info */}
                            {(paymentMethod === "cash" ||
                              paymentMethod === "cheque") &&
                              (paymentTiming === "split" ||
                                paymentTiming === "advance") && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 text-amber-600 mt-0.5">
                                      <Info className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-amber-800">
                                        Partial Payment Required
                                      </h4>
                                      <p className="text-sm text-amber-700 mt-1">
                                        Your rental will be confirmed pending
                                        partial payment. You can pay a portion
                                        online now and the remainder in{" "}
                                        {paymentMethod} at the facility.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => setPaymentStep(1)}
                              className="flex-1"
                            >
                              Back
                            </Button>
                            <Button
                              className="flex-1 flex items-center gap-2"
                              size="lg"
                              disabled={
                                !isAvailable ||
                                !startDate ||
                                !endDate ||
                                !paymentMethod ||
                                !paymentTiming ||
                                createPaymentMutation.isPending
                              }
                              onClick={handleTransaction}
                            >
                              <CreditCard className="w-4 h-4" />
                              {createPaymentMutation.isPending
                                ? "Processing..."
                                : "Proceed to Checkout"}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/auth/sign-in"
                      className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg justify-center text-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Login to Rent
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Item Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Item Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">
                        Available Quantity
                      </div>
                      <div className="font-medium">
                        {(item as InventoryItem).quantity}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Category</div>
                      <div className="font-medium">
                        {(item as InventoryItem).category}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div>
                        {getStatusBadge((item as InventoryItem).status)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">SKU</div>
                      <div className="font-medium text-blue-600">
                        {(item as InventoryItem).sku || "N/A"}
                      </div>
                    </div>
                    {(item as InventoryItem).purchaseInfo.purchaseDate && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          Purchase Date
                        </div>
                        <div className="font-medium">
                          {formatDistanceToNow(
                            new Date(
                              (item as InventoryItem).purchaseInfo
                                .purchaseDate ?? ""
                            ),
                            {
                              addSuffix: true,
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentDetailPage;
