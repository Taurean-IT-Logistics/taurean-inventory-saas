"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Package2,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  RefreshCw,
  Download,
  AlertCircle,
  User,
  Package,
  CreditCard,
  FileText,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RentalAPI } from "@/lib/api";
import { DatePicker } from "@/components/ui/date-picker";

interface Rental {
  _id: string;
  item: {
    _id: string;
    name: string;
    description?: string;
    images?: { path: string }[];
  };
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  quantity: number;
  startDate: string;
  endDate: string;
  amount: number;
  status: "active" | "returned" | "overdue" | "cancelled";
  returnDate?: string;
  returnCondition?: "good" | "fair" | "damaged";
  returnNotes?: string;
  lateFee?: number;
  damageFee?: number;
  transaction?: {
    _id: string;
    amount: number;
    method: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RentalStatistics {
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  returnedRentals: number;
  totalRevenue: number;
  pendingFees: number;
  pendingReturns: number;
  processedToday: number;
}

export default function RentalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [returnData, setReturnData] = useState({
    returnDate: undefined as Date | undefined,
    returnCondition: "good" as "good" | "fair" | "damaged",
    returnNotes: "",
    lateFee: 0,
    damageFee: 0,
  });

  const queryClient = useQueryClient();

  // Fetch rentals
  const { data: rentalsData, isLoading: isLoadingRentals } = useQuery({
    queryKey: ["rentals", page, searchTerm, statusFilter],
    queryFn: async () => {
      const params = {
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      };

      return await RentalAPI.getRentals(params);
    },
  });

  // Fetch rental statistics
  const { data: statistics } = useQuery({
    queryKey: ["rental-statistics"],
    queryFn: async () => {
      return (await RentalAPI.getRentalStats()) as RentalStatistics;
    },
  });

  // Return rental mutation
  const returnRentalMutation = useMutation({
    mutationFn: async ({
      rentalId,
      returnData,
    }: {
      rentalId: string;
      returnData: any;
    }) => {
      return await RentalAPI.returnRental(rentalId, returnData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["rental-statistics"] });
      toast({
        title: "Rental returned successfully",
        description: "The rental has been marked as returned",
      });
      setIsReturnDialogOpen(false);
      setSelectedRental(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error returning rental",
        description: error.response?.data?.message || "Failed to return rental",
        variant: "destructive",
      });
    },
  });

  // Update rental status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      rentalId,
      status,
    }: {
      rentalId: string;
      status: string;
    }) => {
      return await RentalAPI.updateRental(rentalId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["rental-statistics"] });
      toast({
        title: "Rental status updated",
        description: "The rental status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating status",
        description:
          error.response?.data?.message || "Failed to update rental status",
        variant: "destructive",
      });
    },
  });

  // Delete rental mutation
  const deleteRentalMutation = useMutation({
    mutationFn: async (rentalId: string) => {
      return await RentalAPI.deleteRental(rentalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["rental-statistics"] });
      toast({
        title: "Rental deleted successfully",
        description: "The rental has been deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting rental",
        description: error.response?.data?.message || "Failed to delete rental",
        variant: "destructive",
      });
    },
  });

  const rentals = (rentalsData as any)?.rentals || [];
  const pagination = (rentalsData as any) || {};

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: "default" as const,
        icon: Clock,
        color: "bg-blue-100 text-blue-800",
      },
      returned: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
      },
      overdue: {
        variant: "destructive" as const,
        icon: AlertTriangle,
        color: "bg-red-100 text-red-800",
      },
      cancelled: {
        variant: "secondary" as const,
        icon: X,
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleReturnRental = () => {
    if (!selectedRental) return;

    // Validate required fields
    if (!returnData.returnDate) {
      toast({
        title: "Error",
        description: "Please select a return date",
        variant: "destructive",
      });
      return;
    }

    if (!returnData.returnCondition) {
      toast({
        title: "Error",
        description: "Please select a return condition",
        variant: "destructive",
      });
      return;
    }

    const returnPayload = {
      returnDate: returnData.returnDate,
      returnCondition: returnData.returnCondition,
      returnNotes: returnData.returnNotes,
      lateFee: returnData.lateFee,
      damageFee: returnData.damageFee,
    };

    console.log("Returning rental:", selectedRental._id, returnPayload);

    returnRentalMutation.mutate({
      rentalId: selectedRental._id,
      returnData: returnPayload,
    });
  };

  const handleStatusUpdate = (rentalId: string, status: string) => {
    updateStatusMutation.mutate({ rentalId, status });
  };

  const handleDeleteRental = (rentalId: string) => {
    deleteRentalMutation.mutate(rentalId);
  };

  if (isLoadingRentals) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading rentals..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Rental & Return Management
          </h1>
          <p className="text-muted-foreground">
            Manage inventory item rentals, process returns, and track rental
            status
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Rentals
                </CardTitle>
                <Package2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.totalRentals}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Rentals
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.activeRentals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently rented
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {statistics.overdueRentals}
                </div>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{statistics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">From rentals</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search rentals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Return Processing Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Return Processing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Process rental returns and manage return requests
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Pending Returns
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics?.pendingReturns || 0}
                </p>
                <p className="text-sm text-blue-700">Awaiting processing</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    Processed Today
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {statistics?.processedToday || 0}
                </p>
                <p className="text-sm text-green-700">Returns completed</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">
                    Overdue Items
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {statistics?.overdueRentals || 0}
                </p>
                <p className="text-sm text-yellow-700">Need attention</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Returns
              </Button>
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Overdue
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Returns
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rentals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental: Rental) => (
                  <TableRow key={rental._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rental.item.name}</div>
                        {rental.item.description && (
                          <div className="text-sm text-muted-foreground">
                            {rental.item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rental.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rental.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{rental.quantity}</TableCell>
                    <TableCell>₵{rental.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(rental.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(rental.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRental(rental);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {rental.status === "active" && (
                          <Dialog
                            open={isReturnDialogOpen}
                            onOpenChange={setIsReturnDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRental(rental)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Return Rental</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    Return Date
                                  </label>
                                  <DatePicker
                                    date={returnData.returnDate}
                                    onDateChange={(date: Date | undefined) =>
                                      setReturnData({
                                        ...returnData,
                                        returnDate: date,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Condition
                                  </label>
                                  <Select
                                    value={returnData.returnCondition}
                                    onValueChange={(
                                      value: "good" | "fair" | "damaged"
                                    ) =>
                                      setReturnData({
                                        ...returnData,
                                        returnCondition: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="good">Good</SelectItem>
                                      <SelectItem value="fair">Fair</SelectItem>
                                      <SelectItem value="damaged">
                                        Damaged
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Notes
                                  </label>
                                  <Input
                                    placeholder="Return notes..."
                                    value={returnData.returnNotes}
                                    onChange={(e) =>
                                      setReturnData({
                                        ...returnData,
                                        returnNotes: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Late Fee (₵)
                                    </label>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={returnData.lateFee}
                                      onChange={(e) =>
                                        setReturnData({
                                          ...returnData,
                                          lateFee: Number(e.target.value),
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Damage Fee (₵)
                                    </label>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={returnData.damageFee}
                                      onChange={(e) =>
                                        setReturnData({
                                          ...returnData,
                                          damageFee: Number(e.target.value),
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={handleReturnRental}
                                  className="w-full"
                                >
                                  Return Item
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Rental</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this rental?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRental(rental._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(pagination.currentPage * 10, pagination.total)} of{" "}
                  {pagination.total} rentals
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Rental Modal */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                Rental Details
              </DialogTitle>
            </DialogHeader>
            {selectedRental && (
              <div className="space-y-8">
                {/* Header with Status and Amount */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {selectedRental.item.name}
                      </h2>
                      <p className="text-gray-600">
                        Rental #{selectedRental._id.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ₵{selectedRental.amount.toLocaleString()}
                      </div>
                      {getStatusBadge(selectedRental.status)}
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Item Information Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                          Item Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {selectedRental.item.name}
                            </h3>
                            {selectedRental.item.description && (
                              <p className="text-sm text-gray-600">
                                {selectedRental.item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Package2 className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Quantity</p>
                              <p className="font-semibold">
                                {selectedRental.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="font-semibold">
                                ₵{selectedRental.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* User Information Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="h-5 w-5 text-purple-600" />
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {selectedRental.user.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedRental.user.email}
                            </p>
                          </div>
                        </div>
                        {selectedRental.user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{selectedRental.user.phone}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Rental Period Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CalendarIcon className="h-5 w-5 text-orange-600" />
                          Rental Period
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-semibold">
                              {new Date(
                                selectedRental.startDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-red-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="font-semibold">
                              {new Date(
                                selectedRental.endDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Created</span>
                            <span className="font-medium">
                              {new Date(
                                selectedRental.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Transaction Information Card */}
                    {selectedRental.transaction && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            Payment Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">
                                ₵
                                {selectedRental.transaction.amount.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {selectedRental.transaction.method}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              Transaction ID:{" "}
                              {selectedRental.transaction._id.slice(-12)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Notes Card */}
                    {selectedRental.notes && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-gray-600" />
                            Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {selectedRental.notes}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Return Information */}
                {selectedRental.status === "returned" && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Return Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {selectedRental.returnDate && (
                          <div className="text-center p-3 bg-white rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Return Date</p>
                            <p className="font-semibold">
                              {new Date(
                                selectedRental.returnDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {selectedRental.returnCondition && (
                          <div className="text-center p-3 bg-white rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Condition</p>
                            <p className="font-semibold capitalize">
                              {selectedRental.returnCondition}
                            </p>
                          </div>
                        )}
                        {selectedRental.lateFee &&
                          selectedRental.lateFee > 0 && (
                            <div className="text-center p-3 bg-white rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Late Fee</p>
                              <p className="font-semibold">
                                ₵{selectedRental.lateFee.toLocaleString()}
                              </p>
                            </div>
                          )}
                        {selectedRental.damageFee &&
                          selectedRental.damageFee > 0 && (
                            <div className="text-center p-3 bg-white rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Damage Fee
                              </p>
                              <p className="font-semibold">
                                ₵{selectedRental.damageFee.toLocaleString()}
                              </p>
                            </div>
                          )}
                      </div>
                      {selectedRental.returnNotes && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-sm text-gray-600 mb-2">
                            Return Notes:
                          </p>
                          <p className="text-gray-700 bg-white p-3 rounded-lg">
                            {selectedRental.returnNotes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
