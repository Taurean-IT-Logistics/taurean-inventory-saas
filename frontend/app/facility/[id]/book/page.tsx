"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, CheckCircle, Info } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  BookingsAPI,
  FacilitiesAPI,
  getResourceUrl,
  TaxScheduleAPI,
  TransactionsAPI,
  PendingTransactionsAPI,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ErrorComponent } from "@/components/ui/error";
import { Loader } from "@/components/ui/loader";
import { Booking, Facility, TaxSchedule } from "@/types";
import { currencyFormat } from "@/lib/utils";
import {
  calculateBookingTaxesFromSchedules,
  formatTaxBreakdown,
} from "@/lib/taxCalculator";
import { useAuth } from "@/components/AuthProvider";
import { useRedirect } from "@/hooks/useRedirect";
import { DatePicker } from "@/components/ui/date-picker";

export default function BookingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { redirectToLogin } = useRedirect();

  const [step, setStep] = useState(1);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Payment Method, 2: Payment Timing
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingData, setBookingData] = useState<
    Partial<Booking> & {
      guests?: number;
      startDate?: string | Date;
      endDate?: string | Date;
      paymentMethod?: string;
      paymentTiming?: string;
      splitConfig?: {
        numberOfParts: number;
        parts: Array<{ amount: number; dueDate: Date }>;
      };
      advanceConfig?: {
        percentage: number | string;
        amount: number;
        inputMode: "percentage" | "amount";
      };
    }
  >({});
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );
  const [suggestedDates, setSuggestedDates] = useState<
    Array<{
      startDate: Date;
      endDate: Date;
      duration: number;
    }>
  >([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const createTransaction = useMutation({
    mutationFn: async (transactionData: any) => {
      return TransactionsAPI.initializePayment(transactionData);
    },
    onSuccess: (data) => {
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
    },
    onError: (error: any) => {
      console.error("Transaction creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  const { data: taxSchedulesData = [] } = useQuery({
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

  // Calculate pricing and taxes
  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate || !facilityData) {
      return {
        subtotal: 0,
        serviceFee: 0,
        tax: 0,
        total: 0,
        days: 1,
        basePrice: 0,
        serviceFeeRate: 0,
        totalTaxRate: 0,
        applicableTaxes: [],
        taxBreakdown: [],
      };
    }

    const facility = facilityData as Facility;
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const days = differenceInDays(endDate, startDate) || 1;

    const basePrice = facility.pricing.find((p) => p.isDefault)?.amount || 0;
    const subtotal = basePrice * days;

    // Use the new tax schedule calculator
    const taxResult = calculateBookingTaxesFromSchedules(
      subtotal,
      taxSchedules,
      (facility.company as any)?._id
    );

    return {
      subtotal: taxResult.subtotal,
      serviceFee: taxResult.serviceFee,
      tax: taxResult.tax,
      total: taxResult.total,
      days,
      basePrice,
      serviceFeeRate: taxResult.serviceFeeRate,
      totalTaxRate: taxResult.totalTaxRate,
      applicableTaxes: taxResult.applicableTaxes,
      taxBreakdown: taxResult.taxBreakdown,
    };
  };

  const bookingsMutation = useMutation({
    mutationFn: async (bookingData: Partial<Booking>) => {
      return BookingsAPI.create(bookingData);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Booking Created",
        description: "Your booking has been sent to facility for confirmation",
        variant: "default",
      });

      // Create transaction data from the booking
      const transactionData = {
        email: user?.email || "",
        amount: calculateTotal().total,
        category: "facility",
        description: `Booking for ${
          (facilityData as Facility)?.name || "Facility"
        } - ${calculateDurationString(variables.startDate, variables.endDate)}`,
        facility: (facilityData as Facility)?._id || "",
        currency: "GHS",
      };

      createTransaction.mutate(transactionData);
    },
    onError: (error: Error) => {
      console.error("Booking creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const {
    data: facilityData,
    isLoading: isFacilityLoading,
    isError,
    error: facilityError,
    refetch,
  } = useQuery({
    queryKey: ["facilities", params.id],
    queryFn: () => FacilitiesAPI.detail(params.id),
    enabled: !!params.id,
  });

  const {
    subtotal,
    serviceFee,
    tax,
    total,
    days,
    basePrice,
    serviceFeeRate,
    totalTaxRate,
    applicableTaxes,
    taxBreakdown,
  } = calculateTotal();

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const checkAvailability = async () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      setAvailabilityError(null);
      setSuggestedDates([]);
      return;
    }

    setIsCheckingAvailability(true);
    setAvailabilityError(null);
    setSuggestedDates([]);

    try {
      const response = await BookingsAPI.checkAvailability({
        facilityId: (facilityData as Facility)?._id || "",
        startDate: bookingData.startDate as string,
        endDate: bookingData.endDate as string,
      });

      // If we get here, the dates are available
      setAvailabilityError(null);
      setSuggestedDates([]);
      toast({
        title: "Dates Available!",
        description: "The selected dates are available for booking.",
        variant: "default",
      });
    } catch (error: any) {
      console.log("Availability check error:", error);

      if (
        error.message?.includes("conflict") ||
        error.message?.includes("overlapping")
      ) {
        setAvailabilityError(
          "These dates are not available. Please select different dates."
        );

        // Try to get suggested dates from the error response
        if (error.data?.suggestedDates) {
          setSuggestedDates(error.data.suggestedDates);
        } else {
          // Generate some basic suggested dates if none provided
          const startDate = parseDate(bookingData.startDate);
          const endDate = parseDate(bookingData.endDate);
          if (startDate && endDate) {
            const duration = differenceInDays(endDate, startDate);
            const suggestions = [];

            // Suggest dates for the next 30 days
            for (let i = 1; i <= 30; i++) {
              const newStart = new Date(startDate);
              newStart.setDate(newStart.getDate() + i);
              const newEnd = new Date(newStart);
              newEnd.setDate(newEnd.getDate() + duration);

              suggestions.push({
                startDate: newStart,
                endDate: newEnd,
                duration,
              });

              if (suggestions.length >= 5) break;
            }

            setSuggestedDates(suggestions);
          }
        }
      } else {
        setAvailabilityError("Error checking availability. Please try again.");
        setSuggestedDates([]);
      }
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Helper function to safely parse dates
  const parseDate = (date: string | Date | undefined): Date | undefined => {
    if (!date) return undefined;
    return typeof date === "string" ? parseISO(date) : date;
  };

  // Helper function to format dates
  const formatDate = (
    date: string | Date | undefined,
    formatStr: string = "MMM dd, yyyy"
  ): string => {
    if (!date) return "";
    const parsedDate = parseDate(date);
    return parsedDate ? format(parsedDate, formatStr) : "";
  };

  // Helper function to calculate duration string
  const calculateDurationString = (
    startDate: string | Date | undefined,
    endDate: string | Date | undefined
  ): string => {
    if (!startDate || !endDate) return "1 day";

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) return "1 day";

    const days = Math.max(1, differenceInDays(end, start));
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  if (isFacilityLoading) {
    return <Loader text="Loading facility" />;
  }

  if (!facilityData || isError) {
    return (
      <ErrorComponent
        message={facilityError?.message}
        title="Facility Loading Error"
        onRetry={refetch}
      />
    );
  }

  let facility = facilityData as Facility;

  const handleProceedToCheckout = async () => {
    // Check if user is authenticated
    if (!user) {
      // Store the current URL so user can be redirected back after login
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("intendedUrl", currentUrl);
      router.push("/auth/sign-in");
      return;
    }

    const finalBookingData: Partial<Booking> = {
      ...bookingData,
      facility: (facilityData as Facility)?._id || "",
      totalPrice: total,
      duration: calculateDurationString(
        bookingData.startDate,
        bookingData.endDate
      ),
      startDate: parseDate(bookingData.startDate),
      endDate: parseDate(bookingData.endDate),
      items: [], // Add empty items array as required by the model
      status: bookingData.paymentMethod === "online" ? "pending" : "pending", // Set default status
      paymentStatus: "pending", // Set default payment status
    };

    // Handle different payment methods and timing
    if (bookingData.paymentMethod === "online") {
      // Online payment - proceed with normal flow
      const transactionData = {
        email: user?.email || "",
        amount:
          bookingData.paymentTiming === "advance" && bookingData.advanceConfig
            ? bookingData.advanceConfig.amount
            : total,
        category: "facility",
        description: `Booking for ${
          (facilityData as Facility)?.name || "Facility"
        } - ${calculateDurationString(
          bookingData.startDate,
          bookingData.endDate
        )}${
          bookingData.paymentTiming === "advance" ? " (Advance Payment)" : ""
        }`,
        facility: (facilityData as Facility)?._id || "",
        currency: "GHS",
        paymentTiming: bookingData.paymentTiming,
        advanceConfig: bookingData.advanceConfig,
        splitConfig: bookingData.splitConfig,
      };

      bookingsMutation.mutate(finalBookingData);
    } else if (
      bookingData.paymentMethod === "cash" ||
      bookingData.paymentMethod === "cheque"
    ) {
      // Cash/Cheque payment - create pending transaction
      setIsProcessingPayment(true);
      try {
        // First create the booking
        const bookingResponse = await BookingsAPI.create(finalBookingData);

        if (bookingResponse) {
          // Determine the amount based on payment timing
          let paymentAmount = total;
          if (
            bookingData.paymentTiming === "advance" &&
            bookingData.advanceConfig
          ) {
            paymentAmount = bookingData.advanceConfig.amount;
          } else if (
            bookingData.paymentTiming === "split" &&
            bookingData.splitConfig
          ) {
            // For split payments, the first payment is the split amount
            paymentAmount =
              bookingData.splitConfig.parts?.[0]?.amount ||
              total / bookingData.splitConfig.numberOfParts;
          }

          // Create pending transaction
          const pendingTransactionData = {
            type: "booking",
            referenceId:
              (bookingResponse as any)._id || (bookingResponse as any).id,
            amount: paymentAmount,
            paymentMethod: bookingData.paymentMethod,
            paymentTiming: bookingData.paymentTiming,
            advanceConfig: bookingData.advanceConfig,
            splitConfig: bookingData.splitConfig,
            notes: `Payment at facility for booking ${
              (bookingResponse as any)._id || (bookingResponse as any).id
            }${
              bookingData.paymentTiming === "advance"
                ? " (Advance Payment)"
                : ""
            }${
              bookingData.paymentTiming === "split"
                ? " (Split Payment - Part 1)"
                : ""
            }`,
          };

          await PendingTransactionsAPI.create(pendingTransactionData);

          let description = `Your booking has been created. Please bring ${currencyFormat(
            paymentAmount
          )} in ${bookingData.paymentMethod} when you arrive at the facility.`;

          if (
            bookingData.paymentTiming === "advance" &&
            bookingData.advanceConfig
          ) {
            const balance = total - bookingData.advanceConfig.amount;
            description += ` Balance of ${currencyFormat(
              balance
            )} will be due later.`;
          } else if (
            bookingData.paymentTiming === "split" &&
            bookingData.splitConfig
          ) {
            description += ` This is part 1 of ${bookingData.splitConfig.numberOfParts} payments.`;
          }

          toast({
            title: "Booking Created Successfully",
            description,
            variant: "default",
          });

          // Redirect to user dashboard
          router.push("/user/dashboard");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create booking",
          variant: "destructive",
        });
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/facility/${params.id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to facility
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Complete your booking
            </h1>

            {/* Progress Steps */}
            <div className="flex items-center mb-8">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step > stepNumber ? "bg-[#1e3a5f]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Booking Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Booking Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <DatePicker
                      date={
                        bookingData.startDate
                          ? typeof bookingData.startDate === "string"
                            ? new Date(bookingData.startDate)
                            : bookingData.startDate instanceof Date
                            ? bookingData.startDate
                            : undefined
                          : undefined
                      }
                      onDateChange={(date) =>
                        handleInputChange(
                          "startDate",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      placeholder="Select start date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <DatePicker
                      date={
                        bookingData.endDate
                          ? typeof bookingData.endDate === "string"
                            ? new Date(bookingData.endDate)
                            : bookingData.endDate instanceof Date
                            ? bookingData.endDate
                            : undefined
                          : undefined
                      }
                      onDateChange={(date) =>
                        handleInputChange(
                          "endDate",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      placeholder="Select end date"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={facility.capacity.maximum}
                    value={bookingData.guests}
                    onChange={(e) =>
                      handleInputChange("guests", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">
                    Special Requests (Optional)
                  </Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Any special requirements or requests..."
                    value={bookingData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Availability Error */}
                {availabilityError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Date Conflict
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{availabilityError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Dates */}
                {suggestedDates.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Suggested Available Dates
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p className="mb-2">
                            Here are some alternative dates that are available:
                          </p>
                          <div className="space-y-2">
                            {suggestedDates
                              .slice(0, 3)
                              .map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setBookingData((prev) => ({
                                      ...prev,
                                      startDate: suggestion.startDate,
                                      endDate: suggestion.endDate,
                                    }));
                                    setAvailabilityError(null);
                                    setSuggestedDates([]);
                                  }}
                                  className="block w-full text-left p-2 bg-white rounded border border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                  {formatDate(suggestion.startDate, "MMM dd")} -{" "}
                                  {formatDate(
                                    suggestion.endDate,
                                    "MMM dd, yyyy"
                                  )}{" "}
                                  ({suggestion.duration} day
                                  {suggestion.duration !== 1 ? "s" : ""})
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={checkAvailability}
                    variant="outline"
                    className="w-full"
                    disabled={
                      !bookingData.startDate ||
                      !bookingData.endDate ||
                      (bookingData.startDate &&
                        bookingData.endDate &&
                        parseDate(bookingData.startDate)! >=
                          parseDate(bookingData.endDate)!) ||
                      isCheckingAvailability
                    }
                  >
                    {isCheckingAvailability
                      ? "Checking..."
                      : "Check Availability"}
                  </Button>

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                    disabled={
                      !bookingData.startDate ||
                      !bookingData.endDate ||
                      !bookingData.guests ||
                      (bookingData.startDate &&
                        bookingData.endDate &&
                        parseDate(bookingData.startDate)! >=
                          parseDate(bookingData.endDate)!) ||
                      !!availabilityError
                    }
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Contact Information
                </h2>

                <div>
                  <Label htmlFor="contactName">Full Name</Label>
                  <Input
                    id="contactName"
                    placeholder="Enter your full name"
                    value={user?.name}
                    onChange={(e) =>
                      handleInputChange("contactName", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email Address</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={user?.email}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+233 XX XXX XXXX"
                    value={user?.phone}
                    onChange={(e) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                    disabled={
                      !bookingData.startDate ||
                      !bookingData.endDate ||
                      !bookingData.guests
                    }
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment Method Selection */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Step 1: Payment Method Selection */}
                {paymentStep === 1 && (
                  <>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          1
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Select Payment Method
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Online Payment */}
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            bookingData.paymentMethod === "online"
                              ? "border-[#1e3a5f] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              paymentMethod: "online",
                            })
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                bookingData.paymentMethod === "online"
                                  ? "border-[#1e3a5f] bg-[#1e3a5f]"
                                  : "border-gray-300"
                              }`}
                            >
                              {bookingData.paymentMethod === "online" && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                Online Payment
                              </h3>
                              <p className="text-sm text-gray-600">
                                Pay securely with card or mobile money
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Cash Payment */}
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            bookingData.paymentMethod === "cash"
                              ? "border-[#1e3a5f] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              paymentMethod: "cash",
                            })
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                bookingData.paymentMethod === "cash"
                                  ? "border-[#1e3a5f] bg-[#1e3a5f]"
                                  : "border-gray-300"
                              }`}
                            >
                              {bookingData.paymentMethod === "cash" && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                Cash Payment
                              </h3>
                              <p className="text-sm text-gray-600">
                                Pay with cash directly at the facility
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Cheque Payment */}
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            bookingData.paymentMethod === "cheque"
                              ? "border-[#1e3a5f] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              paymentMethod: "cheque",
                            })
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                bookingData.paymentMethod === "cheque"
                                  ? "border-[#1e3a5f] bg-[#1e3a5f]"
                                  : "border-gray-300"
                              }`}
                            >
                              {bookingData.paymentMethod === "cheque" && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                Cheque Payment
                              </h3>
                              <p className="text-sm text-gray-600">
                                Pay with cheque directly at the facility
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setPaymentStep(2)}
                        className="flex-1 bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                        disabled={!bookingData.paymentMethod}
                      >
                        Continue
                      </Button>
                    </div>
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
                      <h2 className="text-lg font-semibold text-gray-900">
                        How would you like to pay?
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Full Payment */}
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            bookingData.paymentTiming === "full"
                              ? "border-[#1e3a5f] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              paymentTiming: "full",
                            })
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                bookingData.paymentTiming === "full"
                                  ? "border-[#1e3a5f] bg-[#1e3a5f]"
                                  : "border-gray-300"
                              }`}
                            >
                              {bookingData.paymentTiming === "full" && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                Pay Full Amount Now
                              </h3>
                              <p className="text-sm text-gray-600">
                                Pay the full amount{" "}
                                {bookingData.paymentMethod === "online"
                                  ? "online now"
                                  : `in ${bookingData.paymentMethod} at the facility`}
                              </p>
                            </div>
                            <div className="text-sm font-medium text-[#1e3a5f]">
                              {currencyFormat(total)}
                            </div>
                          </div>
                        </div>

                        {/* Split Payment */}
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            bookingData.paymentTiming === "split"
                              ? "border-[#1e3a5f] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              paymentTiming: "split",
                              splitConfig: {
                                numberOfParts: 2,
                                parts: [
                                  { amount: total * 0.5, dueDate: new Date() },
                                  {
                                    amount: total * 0.5,
                                    dueDate: new Date(
                                      Date.now() + 7 * 24 * 60 * 60 * 1000
                                    ),
                                  },
                                ],
                              },
                            })
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                bookingData.paymentTiming === "split"
                                  ? "border-[#1e3a5f] bg-[#1e3a5f]"
                                  : "border-gray-300"
                              }`}
                            >
                              {bookingData.paymentTiming === "split" && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                Split Payment
                              </h3>
                              <p className="text-sm text-gray-600">
                                Pay in multiple installments (max 3 parts)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Advance Payment */}
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            bookingData.paymentTiming === "advance"
                              ? "border-[#1e3a5f] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              paymentTiming: "advance",
                              advanceConfig: {
                                percentage: 30,
                                amount: total * 0.3,
                                inputMode: "percentage",
                              },
                            })
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                bookingData.paymentTiming === "advance"
                                  ? "border-[#1e3a5f] bg-[#1e3a5f]"
                                  : "border-gray-300"
                              }`}
                            >
                              {bookingData.paymentTiming === "advance" && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                Advance Payment
                              </h3>
                              <p className="text-sm text-gray-600">
                                Pay advance amount now, balance later
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Split Payment Configuration */}
                      {bookingData.paymentTiming === "split" && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Configure Split Payment
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Parts (Max 3)
                              </label>
                              <Select
                                value={String(
                                  bookingData.splitConfig?.numberOfParts || 2
                                )}
                                onValueChange={(value) => {
                                  const numberOfParts = parseInt(value);
                                  const amountPerPart = total / numberOfParts;
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

                                  setBookingData({
                                    ...bookingData,
                                    splitConfig: {
                                      numberOfParts,
                                      parts,
                                    },
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select number of parts" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">2 Parts</SelectItem>
                                  <SelectItem value="3">3 Parts</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Payment Breakdown
                              </label>
                              {bookingData.splitConfig?.parts.map(
                                (part, index) => (
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
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advance Payment Configuration */}
                      {bookingData.paymentTiming === "advance" && (
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
                                    bookingData.advanceConfig?.inputMode ||
                                    "percentage"
                                  }
                                  onValueChange={(value) => {
                                    const currentAmount =
                                      bookingData.advanceConfig?.amount ||
                                      total * 0.3;
                                    setBookingData({
                                      ...bookingData,
                                      advanceConfig: {
                                        percentage:
                                          value === "percentage"
                                            ? 30
                                            : "custom",
                                        amount: currentAmount,
                                        inputMode: value as
                                          | "percentage"
                                          | "amount",
                                      },
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
                              {bookingData.advanceConfig?.inputMode ===
                                "percentage" && (
                                <div className="space-y-2">
                                  <label className="block text-xs font-medium text-gray-600">
                                    Advance Percentage
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    <Select
                                      value={String(
                                        bookingData.advanceConfig?.percentage ||
                                          30
                                      )}
                                      onValueChange={(value) => {
                                        if (value === "custom") {
                                          setBookingData({
                                            ...bookingData,
                                            advanceConfig: {
                                              percentage: "custom",
                                              amount: total * 0.3,
                                              inputMode: "percentage",
                                            },
                                          });
                                        } else {
                                          const percentage = parseInt(value);
                                          const amount =
                                            total * (percentage / 100);

                                          setBookingData({
                                            ...bookingData,
                                            advanceConfig: {
                                              percentage,
                                              amount,
                                              inputMode: "percentage",
                                            },
                                          });
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select percentage" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="30">30%</SelectItem>
                                        <SelectItem value="35">35%</SelectItem>
                                        <SelectItem value="40">40%</SelectItem>
                                        <SelectItem value="45">45%</SelectItem>
                                        <SelectItem value="50">50%</SelectItem>
                                        <SelectItem value="custom">
                                          Custom
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {bookingData.advanceConfig?.percentage ===
                                      "custom" && (
                                      <div className="flex items-center space-x-2">
                                        <Input
                                          type="number"
                                          min="30"
                                          max="80"
                                          placeholder="30"
                                          className="w-20"
                                          value={
                                            typeof bookingData.advanceConfig
                                              ?.percentage === "number"
                                              ? bookingData.advanceConfig
                                                  .percentage
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const percentage =
                                              parseInt(e.target.value) || 30;
                                            const amount =
                                              total * (percentage / 100);

                                            setBookingData({
                                              ...bookingData,
                                              advanceConfig: {
                                                percentage,
                                                amount,
                                                inputMode: "percentage",
                                              },
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
                              {bookingData.advanceConfig?.inputMode ===
                                "amount" && (
                                <div className="space-y-2">
                                  <label className="block text-xs font-medium text-gray-600">
                                    Advance Amount
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="number"
                                      min={total * 0.3}
                                      max={total * 0.8}
                                      step="0.01"
                                      placeholder={currencyFormat(total * 0.3)}
                                      className="flex-1"
                                      value={
                                        bookingData.advanceConfig?.amount || ""
                                      }
                                      onChange={(e) => {
                                        const amount =
                                          parseFloat(e.target.value) ||
                                          total * 0.3;
                                        const percentage =
                                          (amount / total) * 100;

                                        setBookingData({
                                          ...bookingData,
                                          advanceConfig: {
                                            percentage: Math.round(percentage),
                                            amount,
                                            inputMode: "amount",
                                          },
                                        });
                                      }}
                                    />
                                    <span className="text-sm text-gray-500">
                                      (
                                      {Math.round(
                                        ((bookingData.advanceConfig?.amount ||
                                          total * 0.3) /
                                          total) *
                                          100
                                      )}
                                      %)
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Minimum {currencyFormat(total * 0.3)},
                                    Maximum {currencyFormat(total * 0.8)}
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
                                    bookingData.advanceConfig?.amount || 0
                                  )}
                                </div>
                              </div>
                              <div className="p-3 bg-white rounded border">
                                <div className="text-sm text-gray-600">
                                  Balance
                                </div>
                                <div className="font-medium">
                                  {currencyFormat(
                                    total -
                                      (bookingData.advanceConfig?.amount || 0)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Method Info */}
                      {(bookingData.paymentMethod === "cash" ||
                        bookingData.paymentMethod === "cheque") &&
                        (bookingData.paymentTiming === "split" ||
                          bookingData.paymentTiming === "advance") && (
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
                                  Your booking will be confirmed pending partial
                                  payment. You can pay a portion online now and
                                  the remainder in {bookingData.paymentMethod}{" "}
                                  at the facility.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setPaymentStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(4)}
                        className="flex-1 bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                        disabled={!bookingData.paymentTiming}
                      >
                        Continue
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 4: Booking Summary */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Review Your Booking
                  </h2>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Image
                      src={
                        getResourceUrl(facility.images[0].path) ||
                        "/placeholder.svg"
                      }
                      alt={facility.name}
                      width={60}
                      height={45}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {facility.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {facility.location.address}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Check-in:</span>
                      <p className="font-medium">
                        {formatDate(bookingData.startDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Check-out:</span>
                      <p className="font-medium">
                        {formatDate(bookingData.endDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <p className="font-medium">
                        {calculateDurationString(
                          bookingData.startDate,
                          bookingData.endDate
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Guests:</span>
                      <p className="font-medium">
                        {bookingData.guests || 0} guests
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Payment Method:</span>
                      <p className="font-medium capitalize">
                        {bookingData.paymentMethod} Payment
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Payment Timing:</span>
                      <p className="font-medium capitalize">
                        {bookingData.paymentTiming === "full"
                          ? "Full Payment"
                          : bookingData.paymentTiming === "split"
                          ? "Split Payment"
                          : bookingData.paymentTiming === "advance"
                          ? "Advance Payment"
                          : "Not Selected"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Payment Breakdown
                    </h4>

                    {/* Full Payment */}
                    {bookingData.paymentTiming === "full" && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Total Due Today:
                          </span>
                          <span className="font-medium text-lg text-[#1e3a5f]">
                            {currencyFormat(total)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {bookingData.paymentMethod === "online"
                            ? "Pay the full amount online now"
                            : `Pay the full amount in ${bookingData.paymentMethod} at the facility`}
                        </div>
                      </div>
                    )}

                    {/* Split Payment */}
                    {bookingData.paymentTiming === "split" &&
                      bookingData.splitConfig && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium">
                              {currencyFormat(total)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {bookingData.splitConfig.parts.map(
                              (part, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center"
                                >
                                  <span className="text-gray-600">
                                    Part {index + 1}:
                                  </span>
                                  <span className="font-medium">
                                    {currencyFormat(part.amount)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <div className="text-sm text-blue-800">
                              <strong>Due Today:</strong>{" "}
                              {currencyFormat(
                                bookingData.splitConfig.parts[0].amount
                              )}
                            </div>
                            <div className="text-sm text-blue-600">
                              Remaining parts due later as scheduled
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Advance Payment */}
                    {bookingData.paymentTiming === "advance" &&
                      bookingData.advanceConfig && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium">
                              {currencyFormat(total)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Advance Payment:
                            </span>
                            <span className="font-medium">
                              {currencyFormat(bookingData.advanceConfig.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Balance:</span>
                            <span className="font-medium">
                              {currencyFormat(
                                total - bookingData.advanceConfig.amount
                              )}
                            </span>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded p-3">
                            <div className="text-sm text-amber-800">
                              <strong>Due Today:</strong>{" "}
                              {currencyFormat(bookingData.advanceConfig.amount)}
                            </div>
                            <div className="text-sm text-amber-600">
                              Balance of{" "}
                              {currencyFormat(
                                total - bookingData.advanceConfig.amount
                              )}{" "}
                              due later
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {bookingData.notes && (
                    <div>
                      <span className="text-gray-600 text-sm">
                        Special Requests:
                      </span>
                      <p className="text-sm mt-1">{bookingData.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleProceedToCheckout}
                    className="flex-1 bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                    disabled={bookingsMutation.isPending || isProcessingPayment}
                  >
                    {bookingsMutation.isPending || isProcessingPayment
                      ? "Processing..."
                      : "Proceed to Checkout"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Booking Summary
            </h2>

            <div className="flex items-start space-x-4 mb-6">
              <Image
                src={
                  getResourceUrl(facility.images[0].path) || "/placeholder.svg"
                }
                alt={facility.name}
                width={80}
                height={60}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{facility.name}</h3>
                <p className="text-sm text-gray-600">
                  {facility.location.address}
                </p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">
                    {facility.rating.average}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {facility.rating.totalReviews}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Dates</span>
                <span className="text-gray-900">
                  {bookingData.startDate && bookingData.endDate
                    ? `${formatDate(
                        bookingData.startDate,
                        "MMM dd"
                      )} - ${formatDate(bookingData.endDate, "MMM dd, yyyy")}`
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests</span>
                <span className="text-gray-900">
                  {bookingData.guests || 0} guests
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {currencyFormat(basePrice)} x {days} day{days > 1 ? "s" : ""}
                </span>
                <span className="text-gray-900">
                  {currencyFormat(subtotal)}
                </span>
              </div>

              {serviceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Service fee ({serviceFeeRate}%)
                  </span>
                  <span className="text-gray-900">
                    {currencyFormat(serviceFee)}
                  </span>
                </div>
              )}

              {taxBreakdown.length > 0 && (
                <>
                  {taxBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">
                        {item.tax.name} ({item.rate}%)
                      </span>
                      <span className="text-gray-900">
                        {currencyFormat(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tax</span>
                    <span className="text-gray-900">{currencyFormat(tax)}</span>
                  </div>
                </>
              )}

              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{currencyFormat(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
