"use client";

import { useState } from "react";
import type { User, Transaction } from "@/types";
import UserStatsCards from "@/components/user/userStatsCards";
import UserFilters from "@/components/user/userFilters";
import UserTable from "@/components/user/userTable";
import EditUserModal from "@/components/user/editUserModal";
import CompanyJoinRequests from "@/components/admin/CompanyJoinRequests";
import InviteUserModal from "@/components/admin/InviteUserModal";
import CompanyRoleManagement from "@/components/admin/CompanyRoleManagement";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersAPI, TransactionsAPI, CompanyRoleAPI } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { toast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, HelpCircle } from "lucide-react";

const UserManagement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("users");

  // Real-time updates for users
  useRealtimeUpdates({
    queryKeys: ["users-company"],
    events: ["NotificationUser", "NotificationCompany"],
    showNotifications: true,
    notificationTitle: "User Update",
  });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: isErrorUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users-company"],
    queryFn: () => UsersAPI.listCompany(),
  });

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: isErrorTransactions,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => TransactionsAPI.listCompany(),
  });

  let users = (usersData as { users: User[] })?.users ?? [];

  const updateUserMutation = useMutation({
    mutationFn: (user: User) => UsersAPI.update(user._id, user),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      console.log("Success", data);
      queryClient.invalidateQueries({ queryKey: ["users-company"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const restoreUserMutation = useMutation({
    mutationFn: (userId: string) =>
      UsersAPI.update(userId, { isDeleted: false }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User restored successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users-company"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore user",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => UsersAPI.removeUserFromCompany(userId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User removed from company successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users-company"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove user from company",
      });
    },
  });

  const handleRefetchData = async () => {
    await refetchUsers();
    await refetchTransactions();
  };

  // Show loading state
  if (isLoadingUsers || isLoadingTransactions) {
    return <Loader text="Loading..." />;
  }

  if (isErrorUsers || isErrorTransactions) {
    return (
      <ErrorComponent
        message="Failed to load data"
        onRetry={handleRefetchData}
      />
    );
  }

  const filteredUsers = (users as User[]).filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedUser: User) => {
    console.log(updatedUser);

    // If the company role has changed, handle role assignment/removal
    if (updatedUser.companyRole !== editingUser?.companyRole) {
      try {
        if (updatedUser.companyRole === "_no_roles") {
          // Remove role from user
          await CompanyRoleAPI.removeRoleFromUser(updatedUser._id);
          toast({
            title: "Success",
            description: "User role removed successfully",
          });
        } else if (updatedUser.companyRole) {
          // Assign new role to user
          await CompanyRoleAPI.assignRoleToUser(
            updatedUser._id,
            updatedUser.companyRole
          );
          toast({
            title: "Success",
            description: "User role assigned successfully",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update user role",
          variant: "destructive",
        });
        return; // Don't proceed with user update if role assignment fails
      }
    }

    updateUserMutation.mutate(updatedUser);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleRestore = async (userId: string) => {
    restoreUserMutation.mutate(userId);
  };

  const handleDelete = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this user from the company? This will revoke their access to company resources."
      )
    ) {
      return;
    }
    deleteUserMutation.mutate(userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage system users, roles, and permissions
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="requests">Join Requests</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserStatsCards users={users as User[]} />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>
              <InviteUserModal companyId={(user?.company as any)?._id || ""} />
            </div>

            <UserFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              filteredCount={filteredUsers.length}
              totalCount={(users as User[]).length}
            />

            <UserTable
              transactions={transactions as Transaction[]}
              users={filteredUsers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />

            <EditUserModal
              user={editingUser}
              show={showEditModal}
              onHide={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              onSave={handleSaveEdit}
            />
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-6">
            <CompanyRoleManagement companyId={user?.company || ""} />
          </TabsContent>

          {/* Join Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <CompanyJoinRequests />
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support Management
                </CardTitle>
                <CardDescription>
                  Manage support tickets and provide customer assistance through
                  the integrated chat widget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mb-4">
                    <MessageSquare className="h-16 w-16 mx-auto text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Enhanced Support System
                  </h3>
                  <p className="text-gray-600 mb-4">
                    The chat widget provides comprehensive support management
                    including:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Ticket Management
                        </h4>
                        <p className="text-xs text-gray-600">
                          View and respond to support tickets
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Staff Assignment
                        </h4>
                        <p className="text-xs text-gray-600">
                          Assign tickets to team members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Real-time Updates
                        </h4>
                        <p className="text-xs text-gray-600">
                          Live status updates and notifications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-sm">File Handling</h4>
                        <p className="text-xs text-gray-600">
                          Manage attachments and documents
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Use the chat widget in the bottom-right corner to access
                      the full support dashboard
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Chat Widget - Always visible */}
        <EnhancedChatWidget />
      </div>
    </div>
  );
};

export default UserManagement;
