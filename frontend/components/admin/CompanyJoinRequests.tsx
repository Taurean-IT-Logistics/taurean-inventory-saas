"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyJoinRequestAPI } from "@/lib/api";
import { CompanyJoinRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, UserPlus, Users } from "lucide-react";

export default function CompanyJoinRequests() {
  const [selectedRequest, setSelectedRequest] =
    useState<CompanyJoinRequest | null>(null);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["company-join-requests"],
    queryFn: CompanyJoinRequestAPI.getCompanyPendingRequests,
  });

  const requests = (requestsData as any)?.requests || requestsData || [];

  const approveMutation = useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      CompanyJoinRequestAPI.approveRequest(requestId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users-company"] });
      toast({
        title: "Success",
        description: "Request approved successfully!",
        variant: "default",
      });
      setSelectedRequest(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      CompanyJoinRequestAPI.rejectRequest(requestId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-join-requests"] });
      toast({
        title: "Success",
        description: "Request rejected successfully!",
        variant: "default",
      });
      setSelectedRequest(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({ requestId: selectedRequest._id, notes });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    rejectMutation.mutate({ requestId: selectedRequest._id, notes });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No pending join requests</p>
            <p className="text-sm">
              Users who request to join will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Join Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request: CompanyJoinRequest) => (
            <div
              key={request._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(request.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Review Join Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">User Details</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p>
                            <strong>Name:</strong>{" "}
                            {(request.user as any)?.name || "N/A"}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {(request.user as any)?.email || "N/A"}
                          </p>
                          <p>
                            <strong>Username:</strong>{" "}
                            {(request.user as any)?.username || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Request Details</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p>
                            <strong>Requested:</strong>{" "}
                            {format(
                              new Date(request.createdAt),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                          </p>
                          <p>
                            <strong>Requested By:</strong>{" "}
                            {(request.requestedBy as any)?.name || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Notes (Optional)
                        </label>
                        <Textarea
                          placeholder="Add notes about this request..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(null);
                            setNotes("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={rejectMutation.isPending}
                        >
                          {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                        </Button>
                        <Button
                          onClick={handleApprove}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending
                            ? "Approving..."
                            : "Approve"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
