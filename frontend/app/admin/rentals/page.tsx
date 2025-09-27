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
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
}

export default function RentalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnData, setReturnData] = useState({
    returnDate: "",
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      
      const response = await api.get(`/rentals?${params}`);
      return response.data;
    },
  });

  // Fetch rental statistics
  const { data: statistics } = useQuery({
    queryKey: ["rental-statistics"],
    queryFn: async () => {
      const response = await api.get("/rentals/statistics");
      return response.data.data as RentalStatistics;
    },
  });

  // Return rental mutation
  const returnRentalMutation = useMutation({
    mutationFn: async ({ rentalId, returnData }: { rentalId: string; returnData: any }) => {
      const response = await api.put(`/rentals/${rentalId}/return`, returnData);
      return response.data;
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
    mutationFn: async ({ rentalId, status }: { rentalId: string; status: string }) => {
      const response = await api.put(`/rentals/${rentalId}/status`, { status });
      return response.data;
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
        description: error.response?.data?.message || "Failed to update rental status",
        variant: "destructive",
      });
    },
  });

  // Delete rental mutation
  const deleteRentalMutation = useMutation({
    mutationFn: async (rentalId: string) => {
      const response = await api.delete(`/rentals/${rentalId}`);
      return response.data;
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

  const rentals = rentalsData?.data?.rentals || [];
  const pagination = rentalsData?.data || {};

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, icon: Clock, color: "bg-blue-100 text-blue-800" },
      returned: { variant: "default" as const, icon: CheckCircle, color: "bg-green-100 text-green-800" },
      overdue: { variant: "destructive" as const, icon: AlertTriangle, color: "bg-red-100 text-red-800" },
      cancelled: { variant: "secondary" as const, icon: X, color: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
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

    const returnPayload = {
      returnDate: returnData.returnDate || new Date().toISOString(),
      returnCondition: returnData.returnCondition,
      returnNotes: returnData.returnNotes,
      lateFee: returnData.lateFee,
      damageFee: returnData.damageFee,
    };

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
          <h1 className="text-3xl font-bold mb-2">Rental Management</h1>
          <p className="text-muted-foreground">
            Manage inventory item rentals and returns
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                <Package2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalRentals}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.activeRentals}</div>
                <p className="text-xs text-muted-foreground">Currently rented</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{statistics.overdueRentals}</div>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{statistics.totalRevenue.toLocaleString()}</div>
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
                        <div className="text-sm text-muted-foreground">{rental.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{rental.quantity}</TableCell>
                    <TableCell>₵{rental.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(rental.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(rental.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRental(rental)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {rental.status === "active" && (
                          <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
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
                                  <label className="text-sm font-medium">Return Date</label>
                                  <Input
                                    type="date"
                                    value={returnData.returnDate}
                                    onChange={(e) => setReturnData({ ...returnData, returnDate: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Condition</label>
                                  <Select
                                    value={returnData.returnCondition}
                                    onValueChange={(value: "good" | "fair" | "damaged") => 
                                      setReturnData({ ...returnData, returnCondition: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="good">Good</SelectItem>
                                      <SelectItem value="fair">Fair</SelectItem>
                                      <SelectItem value="damaged">Damaged</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Notes</label>
                                  <Input
                                    placeholder="Return notes..."
                                    value={returnData.returnNotes}
                                    onChange={(e) => setReturnData({ ...returnData, returnNotes: e.target.value })}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Late Fee (₵)</label>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={returnData.lateFee}
                                      onChange={(e) => setReturnData({ ...returnData, lateFee: Number(e.target.value) })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Damage Fee (₵)</label>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={returnData.damageFee}
                                      onChange={(e) => setReturnData({ ...returnData, damageFee: Number(e.target.value) })}
                                    />
                                  </div>
                                </div>
                                <Button onClick={handleReturnRental} className="w-full">
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
                                Are you sure you want to delete this rental? This action cannot be undone.
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
                  Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} rentals
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
      </div>
    </div>
  );
}