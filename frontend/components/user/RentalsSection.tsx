"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { DatePicker } from "@/components/ui/date-picker";
import {
  Home,
  MessageSquare,
  ArrowRight,
  Calendar,
  Package,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { ErrorComponent } from "@/components/ui/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RentalAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Image from "next/image";
import { getResourceUrl } from "@/lib/api";

interface RentalsSectionProps {
  rentals: any;
  rentalsError: any;
  rentalsLoading: boolean;
}

const RentalsSection: React.FC<RentalsSectionProps> = ({
  rentals,
  rentalsError,
  rentalsLoading,
}) => {
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnFormData, setReturnFormData] = useState({
    condition: "good",
    description: "",
    returnDate: "",
  });

  const queryClient = useQueryClient();

  // Return rental mutation
  const returnRentalMutation = useMutation({
    mutationFn: async ({
      rentalId,
      returnData,
    }: {
      rentalId: string;
      returnData: any;
    }) => {
      return RentalAPI.returnRental(rentalId, returnData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rental returned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["user-rentals"] });
      setIsReturnModalOpen(false);
      setReturnFormData({
        condition: "good",
        description: "",
        returnDate: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to return rental",
        variant: "destructive",
      });
    },
  });

  const handleReturnRequest = (rental: any) => {
    setSelectedRental(rental);
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = () => {
    if (!returnFormData.condition || !returnFormData.returnDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRental) return;

    const returnData = {
      returnDate: returnFormData.returnDate,
      returnCondition: returnFormData.condition,
      returnNotes: returnFormData.description,
      lateFee: 0, // User can't set fees, admin handles this
      damageFee: 0, // User can't set fees, admin handles this
    };

    returnRentalMutation.mutate({
      rentalId: selectedRental._id,
      returnData,
    });
  };

  const activeRentals =
    (rentals as any)?.rentals?.filter(
      (rental: any) => rental.status === "active"
    ) || [];
  const returnedRentals =
    (rentals as any)?.rentals?.filter(
      (rental: any) => rental.status === "returned"
    ) || [];
  return (
    <>
      {/* Active Rentals */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Active Rentals
          </CardTitle>
          <CardDescription>
            Your currently active equipment rentals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rentalsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading your rentals...
              </p>
            </div>
          ) : rentalsError ? (
            <ErrorComponent
              title="Error loading rentals"
              message={
                (rentalsError as any)?.message || "Failed to load rentals"
              }
            />
          ) : activeRentals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active rentals</p>
              <p className="text-sm">
                You don&apos;t have any active rentals at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRentals.map((rental: any) => (
                <div
                  key={rental._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {rental.item?.images?.[0]?.path ? (
                          <Image
                            src={getResourceUrl(rental.item.images[0].path)}
                            alt={rental.item.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {rental.item?.name || "Unknown Item"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {rental.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: ₵{rental.amount?.toLocaleString() || 0}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default">Active</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {format(
                              new Date(rental.startDate),
                              "MMM dd"
                            )} -{" "}
                            {format(new Date(rental.endDate), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnRequest(rental)}
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Return Item
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Returned Rentals */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Returned Rentals
          </CardTitle>
          <CardDescription>Your completed equipment rentals</CardDescription>
        </CardHeader>
        <CardContent>
          {returnedRentals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No returned rentals</p>
              <p className="text-sm">Your returned rentals will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returnedRentals.map((rental: any) => (
                <div
                  key={rental._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {rental.item?.images?.[0]?.path ? (
                          <Image
                            src={getResourceUrl(rental.item.images[0].path)}
                            alt={rental.item.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {rental.item?.name || "Unknown Item"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {rental.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: ₵{rental.amount?.toLocaleString() || 0}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default">Returned</Badge>
                          <Badge variant="outline">
                            {rental.returnCondition || "N/A"}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Returned:{" "}
                            {rental.returnDate
                              ? format(
                                  new Date(rental.returnDate),
                                  "MMM dd, yyyy"
                                )
                              : "N/A"}
                          </div>
                        </div>
                        {rental.returnNotes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Return Notes:</strong> {rental.returnNotes}
                          </p>
                        )}
                        {(rental.lateFee > 0 || rental.damageFee > 0) && (
                          <div className="flex gap-4 mt-2">
                            {rental.lateFee > 0 && (
                              <div className="flex items-center gap-1 text-sm text-yellow-600">
                                <AlertTriangle className="h-4 w-4" />
                                Late Fee: ₵{rental.lateFee.toLocaleString()}
                              </div>
                            )}
                            {rental.damageFee > 0 && (
                              <div className="flex items-center gap-1 text-sm text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                Damage Fee: ₵{rental.damageFee.toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support
          </CardTitle>
          <CardDescription>Get help and support from our team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Support assistance available</p>
            <p className="text-sm">
              Use the chat widget in the bottom-right corner for immediate
              support
            </p>
            <div className="mt-4">
              <Button asChild className="flex items-center gap-2">
                <Link href="/support">
                  <MessageSquare className="h-4 w-4" />
                  Visit Support Page
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Modal */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Return Rental Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rental Information */}
            {selectedRental && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Rental Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Item:</strong> {selectedRental.item?.name}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₵
                    {selectedRental.amount?.toLocaleString()}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {selectedRental.startDate && selectedRental.endDate
                      ? `${Math.ceil(
                          (new Date(selectedRental.endDate).getTime() -
                            new Date(selectedRental.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )} days`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedRental.status}
                  </p>
                </div>
              </div>
            )}

            {/* Return Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="condition">Item Condition *</Label>
                <Select
                  value={returnFormData.condition}
                  onValueChange={(value) =>
                    setReturnFormData((prev) => ({ ...prev, condition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="returnDate">Return Date *</Label>
                <DatePicker
                  date={
                    returnFormData.returnDate
                      ? new Date(returnFormData.returnDate)
                      : undefined
                  }
                  onDateChange={(date: Date | undefined) =>
                    setReturnFormData((prev) => ({
                      ...prev,
                      returnDate: date ? date.toISOString().split("T")[0] : "",
                    }))
                  }
                  placeholder="Select return date"
                />
              </div>

              <div>
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                  id="description"
                  value={returnFormData.description}
                  onChange={(e) =>
                    setReturnFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Please provide any additional details about the return..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsReturnModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReturnSubmit}
                disabled={returnRentalMutation.isPending}
                className="flex-1"
              >
                {returnRentalMutation.isPending
                  ? "Returning..."
                  : "Return Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RentalsSection;
