"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuperAdminAPI } from "@/lib/api";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Users,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Eye,
  Download,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";

export default function SuperAdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAssignCompanyModalOpen, setIsAssignCompanyModalOpen] =
    useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const queryClient = useQueryClient();

  // Queries
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["super-admin-users"],
    queryFn: SuperAdminAPI.getAllUsers,
  });

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["super-admin-companies"],
    queryFn: SuperAdminAPI.getAllCompanies,
  });

  const { data: unassignedUsersData, isLoading: unassignedUsersLoading } =
    useQuery({
      queryKey: ["super-admin-unassigned-users"],
      queryFn: SuperAdminAPI.getUnassignedUsers,
    });

  // Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return SuperAdminAPI.updateUserRole(userId, role);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const assignUserToCompanyMutation = useMutation({
    mutationFn: async ({
      userId,
      companyId,
    }: {
      userId: string;
      companyId: string;
    }) => {
      return SuperAdminAPI.assignUserToCompany(userId, companyId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User assigned to company successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
      queryClient.invalidateQueries({
        queryKey: ["super-admin-unassigned-users"],
      });
      setIsAssignCompanyModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign user to company",
        variant: "destructive",
      });
    },
  });

  const removeUserFromCompanyMutation = useMutation({
    mutationFn: async (userId: string) => {
      return SuperAdminAPI.removeUserFromCompany(userId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User removed from company successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
      queryClient.invalidateQueries({
        queryKey: ["super-admin-unassigned-users"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from company",
        variant: "destructive",
      });
    },
  });

  const handleRoleUpdate = (userId: string, role: string) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleAssignCompany = (userId: string) => {
    setSelectedUser(
      (usersData as any)?.users?.find((u: any) => u._id === userId)
    );
    setIsAssignCompanyModalOpen(true);
  };

  const handleRemoveFromCompany = (userId: string) => {
    removeUserFromCompanyMutation.mutate(userId);
  };

  if (usersLoading) return <Loader text="Loading users..." />;
  if (usersError)
    return (
      <ErrorComponent message="Failed to load users" onRetry={refetchUsers} />
    );

  const filteredUsers =
    (usersData as any)?.users?.filter(
      (user: any) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user: any) => (
          <Card key={user._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAssignCompany(user._id)}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Assign Company
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <Badge
                  variant={user.role === "superAdmin" ? "default" : "secondary"}
                  className={
                    user.role === "superAdmin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {user.role === "superAdmin" ? (
                    <Crown className="h-3 w-3 mr-1" />
                  ) : (
                    <Shield className="h-3 w-3 mr-1" />
                  )}
                  {user.role}
                </Badge>
              </div>

              {/* Company */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company:</span>
                <Badge
                  variant={user.company ? "default" : "secondary"}
                  className={
                    user.company
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {user.company ? (user.company as any).name : "Unassigned"}
                </Badge>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  variant={user.status === "active" ? "default" : "secondary"}
                  className={
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {user.status}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleRoleUpdate(
                      user._id,
                      user.role === "admin" ? "user" : "admin"
                    )
                  }
                  disabled={
                    updateUserRoleMutation.isPending ||
                    user.role === "superAdmin"
                  }
                >
                  {user.role === "admin" ? "Make User" : "Make Admin"}
                </Button>
                {user.company ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRemoveFromCompany(user._id)}
                    disabled={removeUserFromCompanyMutation.isPending}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAssignCompany(user._id)}
                  >
                    Assign
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Username</Label>
                  <p className="text-sm font-medium">
                    @{selectedUser.username}
                  </p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm font-medium">
                    {selectedUser.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge
                    variant={
                      selectedUser.role === "superAdmin"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant={
                      selectedUser.status === "active" ? "default" : "secondary"
                    }
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              {selectedUser.company && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Company Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <p className="text-sm font-medium">
                        {(selectedUser.company as any).name}
                      </p>
                    </div>
                    <div>
                      <Label>Company Role</Label>
                      <p className="text-sm font-medium">
                        {(selectedUser.companyRole as any).name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedUser.createdAt), "PPP")}
                    </p>
                  </div>
                  <div>
                    <Label>Last Updated</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedUser.updatedAt), "PPP")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Company Modal */}
      <Dialog
        open={isAssignCompanyModalOpen}
        onOpenChange={setIsAssignCompanyModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUser && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>User:</strong> {selectedUser.name} (
                  {selectedUser.email})
                </p>
              </div>
            )}

            <div>
              <Label>Select Company</Label>
              <Select
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company" />
                </SelectTrigger>
                <SelectContent>
                  {(companiesData as any)?.companies?.map((company: any) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAssignCompanyModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser && selectedCompanyId) {
                    assignUserToCompanyMutation.mutate({
                      userId: selectedUser._id,
                      companyId: selectedCompanyId,
                    });
                  }
                }}
                disabled={
                  !selectedCompanyId || assignUserToCompanyMutation.isPending
                }
                className="flex-1"
              >
                {assignUserToCompanyMutation.isPending
                  ? "Assigning..."
                  : "Assign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
