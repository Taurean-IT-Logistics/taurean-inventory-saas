"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyJoinRequestsAPI } from "@/lib/api";
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
import {
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Users,
  Building2,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Label } from "@/components/ui/label";

export default function UserInvitations() {
  const [selectedRequest, setSelectedRequest] =
    useState<CompanyJoinRequest | null>(null);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["company-join-requests", "user"],
    queryFn: CompanyJoinRequestsAPI.getUserRequests,
  });

  const requests = (requestsData as any)?.requests || requestsData || [];

  const acceptInvitationMutation = useMutation({
    mutationFn: (requestId: string) =>
      CompanyJoinRequestsAPI.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company-join-requests", "user"],
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "Success",
        description: "Invitation accepted successfully!",
        variant: "default",
      });
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    },
  });

  const declineInvitationMutation = useMutation({
    mutationFn: (requestId: string) =>
      CompanyJoinRequestsAPI.declineRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company-join-requests", "user"],
      });
      toast({
        title: "Success",
        description: "Invitation declined successfully!",
        variant: "destructive",
      });
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to decline invitation",
        variant: "destructive",
      });
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      CompanyJoinRequestsAPI.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company-join-requests", "user"],
      });
      toast({
        title: "Success",
        description: "Request cancelled successfully!",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCompanyName = (request: CompanyJoinRequest) => {
    if (typeof request.company === "string") {
      return request.company;
    }
    return request.company?.name || "Unknown Company";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            My Invitations
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
            <UserPlus className="h-5 w-5" />
            My Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No invitations or requests</p>
            <p className="text-sm">
              You&apos;ll see company invitations and join requests here
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
          <UserPlus className="h-5 w-5" />
          My Invitations ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request: CompanyJoinRequest) => (
            <div
              key={request._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-lg">
                      {getCompanyName(request)}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(request.createdAt), "MMM dd, yyyy")}
                    </div>
                    {request.notes && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Has message
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {request.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          cancelRequestMutation.mutate(request._id)
                        }
                        disabled={cancelRequestMutation.isPending}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {request.notes && (
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-medium text-gray-700 mb-1">Message:</p>
                  <p className="text-gray-600">{request.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Invitation Details Modal */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Company Invitation:{" "}
              {selectedRequest && getCompanyName(selectedRequest)}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {getCompanyName(selectedRequest)}
                  </span>
                </div>
                <p className="text-blue-700 text-sm">
                  You&apos;ve been invited to join this company. Accept to
                  become a member.
                </p>
              </div>

              {selectedRequest.notes && (
                <div>
                  <Label className="text-sm font-medium">
                    Message from company:
                  </Label>
                  <div className="bg-gray-50 rounded p-3 mt-1">
                    <p className="text-sm text-gray-700">
                      {selectedRequest.notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    declineInvitationMutation.mutate(selectedRequest._id)
                  }
                  disabled={declineInvitationMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {declineInvitationMutation.isPending
                    ? "Declining..."
                    : "Decline"}
                </Button>
                <Button
                  onClick={() =>
                    acceptInvitationMutation.mutate(selectedRequest._id)
                  }
                  disabled={acceptInvitationMutation.isPending}
                >
                  {acceptInvitationMutation.isPending
                    ? "Accepting..."
                    : "Accept Invitation"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
