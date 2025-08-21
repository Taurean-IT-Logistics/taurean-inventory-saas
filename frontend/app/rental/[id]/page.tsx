"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Info, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  InventoryAPI,
  TaxesAPI,
  TransactionsAPI,
  getResourceUrl,
} from "@/lib/api";
import { InventoryItem, Tax } from "@/types";
import { currencyFormat } from "@/lib/utils";
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

interface PaymentResponse {
  payment: {
    authorization_url: string;
  };
}

const RentDetailPage = ({ params }: { params: { id: string } }) => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Fetch taxes
  const { data: taxes = [] } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => TaxesAPI.list(),
    enabled: !!user,
  });

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

  const serviceFeeRate = (item as InventoryItem).isTaxable
    ? (taxes as Tax[]).find((t: any) =>
        normalized(t.name).includes("servicefee")
      )?.rate || 0
    : 0;

  const taxRate = (item as InventoryItem).isTaxable
    ? (taxes as Tax[]).find(
        (t: any) => !normalized(t.name).includes("servicefee")
      )?.rate || 0
    : 0;

  const price =
    (item as InventoryItem).pricing.find(
      (p: any) => p.isDefault || p.unit === "day"
    )?.amount || 0;

  const subtotal = price * quantity * rentalDays;
  const serviceFee = Math.round(subtotal * (serviceFeeRate / 100));
  const tax = Math.round((subtotal + serviceFee) * (taxRate / 100));
  const totalPrice = subtotal + serviceFee + tax;

  const handleTransaction = async () => {
    if (!user) return;

    const transactionData = {
      email: user.email,
      amount: totalPrice,
      quantity: quantity,
      inventoryItem: (item as InventoryItem)._id || "",
      category: "inventory_item",
      description: `Rental for ${(item as InventoryItem).name} (${
        (item as InventoryItem)._id
      }) from ${startDate} to ${endDate}`,
    };

    createPaymentMutation.mutate(transactionData);
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
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={!isAvailable}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
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
                      <span>Subtotal:</span>
                      <span className="text-xl font-semibold text-blue-600">
                        {currencyFormat(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Service Fee:</span>
                      <span className="text-xl font-semibold text-blue-600">
                        {currencyFormat(serviceFee)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tax:</span>
                      <span className="text-xl font-semibold text-blue-600">
                        {currencyFormat(tax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-semibold">Total Cost:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {currencyFormat(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {user ? (
                    <Button
                      className="w-full flex items-center gap-2"
                      size="lg"
                      disabled={
                        !isAvailable ||
                        !startDate ||
                        !endDate ||
                        createPaymentMutation.isPending
                      }
                      onClick={handleTransaction}
                    >
                      <CreditCard className="w-4 h-4" />
                      {createPaymentMutation.isPending
                        ? "Processing..."
                        : "Proceed to Checkout"}
                    </Button>
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
