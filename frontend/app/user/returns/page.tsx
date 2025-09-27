"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryReturnsAPI, BookingsAPI, RentalAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Package,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  User,
  Building2,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useAuth } from "@/components/AuthProvider";
import { getResourceUrl } from "@/lib/api";
import Image from "next/image";

export default function UserReturnsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnFormData, setReturnFormData] = useState({
    reason: "",
    condition: "good",
    description: "",
    returnDate: "",
  });

  const queryClient = useQueryClient();

  // Queries
  const {
    data: returnsData,
    isLoading: returnsLoading,
    isError: returnsError,
    refetch: refetchReturns,
  } = useQuery({
    queryKey: ["user-returns"],
    queryFn: () => InventoryReturnsAPI.listUser(),
    enabled: !!user?._id,
  });

  const {
    data: activeRentalsData,
    isLoading: activeRentalsLoading,
    isError: activeRentalsError,
    refetch: refetchActiveRentals,
  } = useQuery({
    queryKey: ["user-active-rentals"],
    queryFn: () => RentalAPI.getRentals({ status: "active" }),
    enabled: !!user?._id,
  });

  const { data: rentalStatsData, isLoading: rentalStatsLoading } = useQuery({
    queryKey: ["user-rental-stats"],
    queryFn: () => RentalAPI.getRentalStats(),
    enabled: !!user?._id,
  }) as { data: any; isLoading: boolean };

  // Mutations
  const createReturnMutation = useMutation({
    mutationFn: async (returnData: any) => {
      return InventoryReturnsAPI.create(returnData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return request submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["user-returns"] });
      queryClient.invalidateQueries({ queryKey: ["user-active-rentals"] });
      setIsReturnModalOpen(false);
      setReturnFormData({
        reason: "",
        condition: "good",
        description: "",
        returnDate: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit return request",
        variant: "destructive",
      });
    },
  });

  const handleReturnRequest = (item: any) => {
    setSelectedReturn(item);
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = () => {
    if (!returnFormData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the return",
        variant: "destructive",
      });
      return;
    }

    if (!selectedReturn) return;

    createReturnMutation.mutate({
      itemId: selectedReturn._id,
      ...returnFormData,
      itemName: selectedReturn.name,
    });
  };

  const filteredReturns =
    (returnsData as any[])?.filter(
      (returnItem: any) =>
        returnItem.item?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        returnItem.status.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredActiveRentals =
    (activeRentalsData as any[])?.filter(
      (rental: any) =>
        rental.item?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.status.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (returnsLoading || activeRentalsLoading)
    return <Loader text="Loading returns..." />;
  if (returnsError || activeRentalsError)
    return (
      <ErrorComponent
        message="Failed to load returns"
        onRetry={() => {
          refetchReturns();
          refetchActiveRentals();
        }}
      />
    );

  return (
    <div className="space-y-6 px-20 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Rental Management
          </h1>
          <p className="text-gray-600">
            Manage your rentals, returns, and rental history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Rental Statistics */}
      {rentalStatsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Rentals</p>
                  <p className="text-2xl font-bold">
                    {rentalStatsData.activeRentals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {rentalStatsData.completedRentals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold">
                    {rentalStatsData.overdueRentals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Returns</p>
                  <p className="text-2xl font-bold">
                    {rentalStatsData.totalReturns || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search returns and rentals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Rentals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Active Rentals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActiveRentals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active rentals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActiveRentals.map((rental: any) => (
                <Card
                  key={rental._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {rental.item?.images?.[0] ? (
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
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {rental.item?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          SKU: {rental.item?.sku || "N/A"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{rental.status}</Badge>
                          <Badge variant="outline">
                            {rental.quantity} item
                            {rental.quantity > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          <p>
                            Rented:{" "}
                            {format(new Date(rental.startDate), "MMM dd, yyyy")}
                          </p>
                          <p>
                            Due:{" "}
                            {format(new Date(rental.endDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleReturnRequest(rental.item)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Request Return
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Return History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReturns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No return history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns.map((returnItem: any) => (
                <Card
                  key={returnItem._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {returnItem.item?.images?.[0] ? (
                          <Image
                            src={getResourceUrl(returnItem.item.images[0].path)}
                            alt={returnItem.item.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {returnItem.item?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          SKU: {returnItem.item?.sku || "N/A"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              returnItem.status === "approved"
                                ? "default"
                                : returnItem.status === "pending"
                                ? "secondary"
                                : returnItem.status === "rejected"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {returnItem.status}
                          </Badge>
                          <Badge variant="outline">
                            {returnItem.condition}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          <p>
                            Return Requested:{" "}
                            {format(
                              new Date(returnItem.createdAt),
                              "MMM dd, yyyy"
                            )}
                          </p>
                          {returnItem.returnDate && (
                            <p>
                              Preferred Return:{" "}
                              {format(
                                new Date(returnItem.returnDate),
                                "MMM dd, yyyy"
                              )}
                            </p>
                          )}
                        </div>
                        {returnItem.reason && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>Reason:</strong> {returnItem.reason}
                            </p>
                          </div>
                        )}
                        {returnItem.description && (
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              <strong>Details:</strong> {returnItem.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Request Modal */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Request Return
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Item Information */}
            {selectedReturn && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Item Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {selectedReturn.name}
                  </p>
                  <p>
                    <strong>SKU:</strong> {selectedReturn.sku}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedReturn.status}
                  </p>
                </div>
              </div>
            )}

            {/* Return Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Return *</Label>
                <Select
                  value={returnFormData.reason}
                  onValueChange={(value) =>
                    setReturnFormData((prev) => ({ ...prev, reason: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Item is damaged</SelectItem>
                    <SelectItem value="defective">Item is defective</SelectItem>
                    <SelectItem value="wrong_item">
                      Wrong item received
                    </SelectItem>
                    <SelectItem value="not_needed">No longer needed</SelectItem>
                    <SelectItem value="quality_issue">Quality issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Item Condition</Label>
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
                <Label htmlFor="returnDate">Preferred Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={returnFormData.returnDate}
                  onChange={(e) =>
                    setReturnFormData((prev) => ({
                      ...prev,
                      returnDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
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

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <p>
                      Please ensure the item is in the same condition as when
                      received. Returns may be subject to inspection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsReturnModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReturnSubmit}
              disabled={createReturnMutation.isPending}
              className="flex-1"
            >
              {createReturnMutation.isPending
                ? "Submitting..."
                : "Submit Return Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
