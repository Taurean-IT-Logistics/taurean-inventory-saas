"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { InventoryReturnsAPI } from "@/lib/api";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export function ReturnRequestsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const {
    data: returnRequests,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["inventory-returns"],
    queryFn: () => InventoryReturnsAPI.list(),
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => InventoryReturnsAPI.approve(requestId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return request approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-returns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve return request",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      InventoryReturnsAPI.reject(requestId, reason),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return request rejected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-returns"] });
      setIsRejectModalOpen(false);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject return request",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (requestId: string) => InventoryReturnsAPI.complete(requestId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-returns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete return",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = (returnRequests as any)?.filter((request: any) =>
    request.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleApprove = (requestId: string) => {
    approveMutation.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    setSelectedRequest({ id: requestId });
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    rejectMutation.mutate({
      requestId: selectedRequest.id,
      reason: rejectReason,
    });
  };

  const handleComplete = (requestId: string) => {
    completeMutation.mutate(requestId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Loading return requests...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <p className="text-red-500">Error loading return requests</p>
          <Button onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Return Requests</h2>
          <p className="text-gray-600">Manage inventory return requests</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search return requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Return Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No return requests found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request: any) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{request.itemName}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Requested by:</span> {request.user?.name}
                      </div>
                      <div>
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                      <div>
                        <span className="font-medium">Requested:</span>{" "}
                        {format(new Date(request.createdAt), "MMM dd, yyyy")}
                      </div>
                    </div>

                    {request.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Details:</span> {request.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request._id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request._id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {request.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => handleComplete(request._id)}
                        disabled={completeMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name</Label>
                    <p className="text-sm text-gray-600">{selectedRequest.itemName}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Requested By</Label>
                    <p className="text-sm text-gray-600">{selectedRequest.user?.name}</p>
                  </div>
                  <div>
                    <Label>Request Date</Label>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedRequest.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <p className="text-sm text-gray-600">{selectedRequest.reason}</p>
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <p className="text-sm text-gray-600">{selectedRequest.condition}</p>
                  </div>
                </div>

                {selectedRequest.description && (
                  <div>
                    <Label>Additional Details</Label>
                    <p className="text-sm text-gray-600">{selectedRequest.description}</p>
                  </div>
                )}

                {selectedRequest.returnDate && (
                  <div>
                    <Label>Preferred Return Date</Label>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedRequest.returnDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}

                {selectedRequest.rejectionReason && (
                  <div>
                    <Label>Rejection Reason</Label>
                    <p className="text-sm text-red-600">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Return Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason">Reason for Rejection *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this return request..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}