"use client";

import { useState } from "react";
import { CompanyRoleAPI } from "@/lib/api";
import { CompanyRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

interface CompanyRoleManagementProps {
  companyId: string;
}

export default function CompanyRoleManagement({
  companyId,
}: CompanyRoleManagementProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CompanyRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: {
      viewInvoices: false,
      accessFinancials: false,
      viewBookings: true,
      viewInventory: true,
      createRecords: false,
      editRecords: false,
      manageUsers: false,
      manageFacilities: false,
      manageInventory: false,
      manageTransactions: false,
    },
  });

  const queryClient = useQueryClient();

  // Don't render if no companyId
  if (!companyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Company ID not available. Please ensure you are associated with a
            company.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["company-roles"],
    queryFn: CompanyRoleAPI.getCompanyRoles,
  });

  const roles = (rolesData as any)?.roles || rolesData || [];

  const createRoleMutation = useMutation({
    mutationFn: CompanyRoleAPI.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      toast({
        title: "Success",
        description: "Role created successfully!",
        variant: "default",
      });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, updates }: { roleId: string; updates: any }) =>
      CompanyRoleAPI.updateRole(roleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      toast({
        title: "Success",
        description: "Role updated successfully!",
        variant: "default",
      });
      setIsEditModalOpen(false);
      setEditingRole(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: CompanyRoleAPI.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      toast({
        title: "Success",
        description: "Role deleted successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const initializeDefaultRolesMutation = useMutation({
    mutationFn: CompanyRoleAPI.initializeDefaultRoles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      toast({
        title: "Success",
        description: "Default roles initialized successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize default roles",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      permissions: {
        viewInvoices: false,
        accessFinancials: false,
        viewBookings: true,
        viewInventory: true,
        createRecords: false,
        editRecords: false,
        manageUsers: false,
        manageFacilities: false,
        manageInventory: false,
        manageTransactions: false,
      },
    });
  };

  const handleCreateRole = () => {
    createRoleMutation.mutate(formData);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;
    updateRoleMutation.mutate({
      roleId: editingRole._id,
      updates: formData,
    });
  };

  const handleEditRole = (role: CompanyRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: {
        viewInvoices: role.permissions.viewInvoices || false,
        accessFinancials: role.permissions.accessFinancials || false,
        viewBookings: role.permissions.viewBookings || false,
        viewInventory: role.permissions.viewInventory || false,
        createRecords: role.permissions.createRecords || false,
        editRecords: role.permissions.editRecords || false,
        manageUsers: role.permissions.manageUsers || false,
        manageFacilities: role.permissions.manageFacilities || false,
        manageInventory: role.permissions.manageInventory || false,
        manageTransactions: role.permissions.manageTransactions || false,
      },
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleInitializeDefaults = () => {
    if (
      window.confirm("This will create Admin, Staff, and User roles. Continue?")
    ) {
      initializeDefaultRolesMutation.mutate();
    }
  };

  const handlePermissionChange = (
    permission: keyof typeof formData.permissions,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  const getPermissionIcon = (permission: string) => {
    const iconMap: Record<string, any> = {
      viewInvoices: Eye,
      accessFinancials: Shield,
      viewBookings: Users,
      viewInventory: Settings,
      createRecords: Plus,
      editRecords: Edit,
      manageUsers: Users,
      manageFacilities: Settings,
      manageInventory: Settings,
      manageTransactions: Shield,
    };
    return iconMap[permission] || Eye;
  };

  const getPermissionLabel = (permission: string) => {
    const labelMap: Record<string, string> = {
      viewInvoices: "View Invoices",
      accessFinancials: "Access Financials",
      viewBookings: "View Bookings",
      viewInventory: "View Inventory",
      createRecords: "Create Records",
      editRecords: "Edit Records",
      manageUsers: "Manage Users",
      manageFacilities: "Manage Facilities",
      manageInventory: "Manage Inventory",
      manageTransactions: "Manage Transactions",
    };
    return labelMap[permission] || permission;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Company Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Company Roles ({roles.length})
          </CardTitle>
          <div className="flex gap-2">
            {roles.length === 0 && (
              <Button
                variant="outline"
                onClick={handleInitializeDefaults}
                disabled={initializeDefaultRolesMutation.isPending}
              >
                {initializeDefaultRolesMutation.isPending
                  ? "Initializing..."
                  : "Initialize Default Roles"}
              </Button>
            )}
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Permissions</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {Object.entries(formData.permissions).map(
                        ([key, value]) => {
                          const Icon = getPermissionIcon(key);
                          return (
                            <div
                              key={key}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={key}
                                checked={value}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    key as keyof typeof formData.permissions,
                                    !!checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={key}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Icon className="h-4 w-4" />
                                {getPermissionLabel(key)}
                              </Label>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRole}
                      disabled={
                        !formData.name.trim() || createRoleMutation.isPending
                      }
                    >
                      {createRoleMutation.isPending
                        ? "Creating..."
                        : "Create Role"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No roles defined yet</p>
            <p className="text-sm">Create roles to manage user permissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role: CompanyRole) => (
              <div
                key={role._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{role.name}</h3>
                    <p className="text-sm text-gray-600">
                      {Object.values(role.permissions).filter(Boolean).length}{" "}
                      permissions enabled
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role._id)}
                      disabled={deleteRoleMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(role.permissions).map(([key, value]) => {
                    const Icon = getPermissionIcon(key);
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2 text-sm ${
                          value ? "text-green-700" : "text-gray-500"
                        }`}
                      >
                        {value ? (
                          <Icon className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={value ? "font-medium" : ""}>
                          {getPermissionLabel(key)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Role Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role: {editingRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editRoleName">Role Name</Label>
              <Input
                id="editRoleName"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter role name"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Permissions</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {Object.entries(formData.permissions).map(([key, value]) => {
                  const Icon = getPermissionIcon(key);
                  return (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${key}`}
                        checked={value}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            key as keyof typeof formData.permissions,
                            !!checked
                          )
                        }
                      />
                      <Label
                        htmlFor={`edit-${key}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Icon className="h-4 w-4" />
                        {getPermissionLabel(key)}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={!formData.name.trim() || updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
