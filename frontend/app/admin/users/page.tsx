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
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersAPI, TransactionsAPI } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { toast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users-company"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
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
    mutationFn: (userId: string) =>
      UsersAPI.update(userId, { isDeleted: true }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users-company"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
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
    updateUserMutation.mutate(updatedUser);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleRestore = async (userId: string) => {
    restoreUserMutation.mutate(userId);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="requests">Join Requests</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserStatsCards users={users as User[]} />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>
              <InviteUserModal companyId={user?.company || ""} />
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
        </Tabs>
      </div>
    </div>
  );
};

export default UserManagement;
