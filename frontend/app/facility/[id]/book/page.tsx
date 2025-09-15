"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, CheckCircle } from "lucide-react";
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
  TaxesAPI,
  TransactionsAPI,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ErrorComponent } from "@/components/ui/error";
import { Loader } from "@/components/ui/loader";
import { Booking, Facility, Tax } from "@/types";
import { currencyFormat } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useRedirect } from "@/hooks/useRedirect";
import { DatePicker } from "@/components/ui/date-picker";

export default function BookingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { redirectToLogin } = useRedirect();

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<
    Partial<Booking> & {
      guests?: number;
      startDate?: string | Date;
      endDate?: string | Date;
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

  const { data: taxes = [] } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => TaxesAPI.list(),
    enabled: !!user,
  }) as { data: Tax[] };

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
      };
    }

    const facility = facilityData as Facility;
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const days = differenceInDays(endDate, startDate) || 1;

    const basePrice = facility.pricing.find((p) => p.isDefault)?.amount || 0;
    const subtotal = basePrice * days;

    // Calculate service fee from taxes
    const serviceFeeRate =
      taxes.find(
        (t: Tax) =>
          t.name.toLowerCase().includes("service") &&
          t.active &&
          (t.appliesTo === "facility" || t.appliesTo === "both") &&
          (t.isSuperAdminTax || t.company === (facility.company as any)?._id)
      )?.rate || 0;

    const serviceFee = Math.round(subtotal * (serviceFeeRate / 100));

    // Calculate applicable taxes
    const applicableTaxes = taxes.filter(
      (t: Tax) =>
        !t.name.toLowerCase().includes("service") &&
        t.active &&
        (t.appliesTo === "facility" || t.appliesTo === "both") &&
        (t.isSuperAdminTax || t.company === (facility.company as any)?._id)
    );

    const totalTaxRate = applicableTaxes.reduce(
      (sum, tax) => sum + (tax.rate || 0),
      0
    );
    const tax = Math.round((subtotal + serviceFee) * (totalTaxRate / 100));

    const total = subtotal + serviceFee + tax;

    return {
      subtotal,
      serviceFee,
      tax,
      total,
      days,
      basePrice,
      serviceFeeRate,
      totalTaxRate,
      applicableTaxes,
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

  const handleProceedToCheckout = () => {
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
      status: "pending", // Set default status
      paymentStatus: "pending", // Set default payment status
    };

    // Format data for transaction API
    const transactionData = {
      email: user?.email || "",
      amount: total,
      category: "facility",
      description: `Booking for ${
        (facilityData as Facility)?.name || "Facility"
      } - ${calculateDurationString(
        bookingData.startDate,
        bookingData.endDate
      )}`,
      facility: (facilityData as Facility)?._id || "",
      currency: "GHS",
    };

    bookingsMutation.mutate(finalBookingData);
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
              {[1, 2, 3].map((stepNumber) => (
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
                  {stepNumber < 3 && (
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

            {/* Step 3: Booking Summary */}
            {step === 3 && (
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
                      <span className="text-gray-600">Total:</span>
                      <p className="font-medium text-lg text-[#1e3a5f]">
                        {currencyFormat(total)}
                      </p>
                    </div>
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
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleProceedToCheckout}
                    className="flex-1 bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                    disabled={bookingsMutation.isPending}
                  >
                    {bookingsMutation.isPending
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

              {applicableTaxes.length > 0 && (
                <>
                  {applicableTaxes.map((tax: Tax, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">
                        {tax.name} ({tax.rate}%)
                      </span>
                      <span className="text-gray-900">
                        {currencyFormat(
                          Math.round((subtotal + serviceFee) * (tax.rate / 100))
                        )}
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
