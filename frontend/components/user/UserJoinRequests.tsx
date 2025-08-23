"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyJoinRequestsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Building,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";

export default function UserJoinRequests() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["user-join-requests"],
    queryFn: CompanyJoinRequestsAPI.getUserRequests,
  });

  const requests = (requestsData as any)?.requests || requestsData || [];

  const cancelRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      CompanyJoinRequestsAPI.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-join-requests"] });
      toast({
        title: "Success",
        description: "Join request cancelled successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel request",
        variant: "destructive",
      });
    },
  });

  const handleCancelRequest = (requestId: string) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this join request? This action cannot be undone."
      )
    ) {
      cancelRequestMutation.mutate(requestId);
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            My Join Requests
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
            <Building className="h-5 w-5" />
            My Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No join requests yet</p>
            <p className="text-sm">
              You haven't requested to join any companies yet.
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
          <Building className="h-5 w-5" />
          My Join Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request: any) => (
            <div
              key={request._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {(request.company as any)?.name || "Unknown Company"}
                    </h3>
                    <Badge className={getStatusColor(request.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {(request.company as any)?.description ||
                      "No description available"}
                  </p>
                </div>
                {request.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRequest(request._id)}
                    disabled={cancelRequestMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Requested:</span>
                  <span className="font-medium">
                    {format(
                      new Date(request.createdAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>

                {request.approvedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Approved:</span>
                    <span className="font-medium">
                      {format(
                        new Date(request.approvedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                )}

                {request.rejectedAt && (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Rejected:</span>
                    <span className="font-medium">
                      {format(
                        new Date(request.rejectedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                )}

                {request.approvedBy && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Approved by:</span>
                    <span className="font-medium">
                      {(request.approvedBy as any)?.name || "Unknown"}
                    </span>
                  </div>
                )}

                {request.rejectedBy && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Rejected by:</span>
                    <span className="font-medium">
                      {(request.rejectedBy as any)?.name || "Unknown"}
                    </span>
                  </div>
                )}
              </div>

              {request.message && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Message:
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {request.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-red-700">
                        Rejection Reason:
                      </span>
                      <p className="text-sm text-red-600 mt-1">
                        {request.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
