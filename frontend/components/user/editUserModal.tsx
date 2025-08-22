"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { User, CompanyRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { CompanyRoleAPI } from "@/lib/api";

interface EditUserModalProps {
  user: User | null;
  show: boolean;
  onHide: () => void;
  onSave: (user: User) => void;
}

const EditUserModal = ({ user, show, onHide, onSave }: EditUserModalProps) => {
  const [formData, setFormData] = useState<Partial<User>>({});

  const { data: rolesData } = useQuery({
    queryKey: ["company-roles"],
    queryFn: CompanyRoleAPI.getCompanyRoles,
  });

  const roles = (rolesData as any)?.roles || rolesData || [];

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && user) {
      onSave({ ...user, ...formData } as User);
      onHide();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as User["role"] }));
  };

  const handleCompanyRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, companyRole: value }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <Button variant="ghost" size="sm" onClick={onHide}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">System Role</Label>
                <Select
                  value={formData.role || user?.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select system role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyRole">Company Role</Label>
                <Select
                  value={formData.companyRole || ""}
                  onValueChange={handleCompanyRoleChange}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select company role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_no_roles">No Company Role</SelectItem>
                    {roles.map((role: CompanyRole) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Company roles define granular permissions within your company
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
