"use client";

import { Edit, Trash2, RotateCcw, Shield } from "lucide-react";
import type { Transaction, User, CompanyRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimplePaginatedList from "../paginatedList";
import { useQuery } from "@tanstack/react-query";
import { CompanyRoleAPI } from "@/lib/api";

interface UserTableProps {
  users: User[];
  transactions: Transaction[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
}

const UserTable = ({
  users,
  transactions,
  onEdit,
  onDelete,
  onRestore,
}: UserTableProps) => {
  const { data: rolesData } = useQuery({
    queryKey: ["company-roles"],
    queryFn: CompanyRoleAPI.getCompanyRoles,
  });

  const roles = (rolesData as any)?.roles || rolesData || [];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: "destructive" as const, text: "Admin" },
      staff: { variant: "secondary" as const, text: "Staff" },
      user: { variant: "default" as const, text: "User" },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getCompanyRoleBadge = (companyRoleId?: string) => {
    if (!companyRoleId) {
      return <Badge variant="outline">No Role</Badge>;
    }

    const role = roles.find((r: CompanyRole) => r._id === companyRoleId);
    if (!role) {
      return <Badge variant="outline">Unknown Role</Badge>;
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        {role.name}
      </Badge>
    );
  };

  const getLoyaltyTierBadge = (tier?: string) => {
    if (!tier) return <Badge variant="outline">None</Badge>;

    const tierConfig = {
      bronze: { variant: "secondary" as const, text: "Bronze" },
      silver: { variant: "outline" as const, text: "Silver" },
      gold: { variant: "secondary" as const, text: "Gold" },
      platinum: { variant: "default" as const, text: "Platinum" },
    };

    const config =
      tierConfig[tier as keyof typeof tierConfig] || tierConfig.bronze;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <SimplePaginatedList
      data={users}
      itemsPerPage={5}
      emptyMessage="No users found."
      tableHeaders={
        <>
          <th className="text-left p-4 font-medium text-gray-900">Details</th>
          <th className="text-left p-4 font-medium text-gray-900">
            System Role
          </th>
          <th className="text-left p-4 font-medium text-gray-900">
            Company Role
          </th>
          <th className="text-left p-4 font-medium text-gray-900">Tier</th>
          <th className="text-left p-4 font-medium text-gray-900">Bookings</th>
          <th className="text-left p-4 font-medium text-gray-900">
            Transactions
          </th>
          <th className="text-left p-4 font-medium text-gray-900">Joined</th>
          <th className="text-left p-4 font-medium text-gray-900">Actions</th>
        </>
      }
      renderRow={(user, index) => (
        <tr
          key={user._id}
          className="border-b border-gray-100 hover:bg-gray-50"
        >
          <td className="p-4">
            <div>
              <div className="font-semibold text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="text-sm text-gray-500">@{user.username}</div>
            </div>
          </td>
          <td className="p-4">{getRoleBadge(user.role)}</td>
          <td className="p-4">{getCompanyRoleBadge(user.companyRole)}</td>
          <td className="p-4">
            {getLoyaltyTierBadge(user.loyaltyProfile?.loyaltyTier)}
          </td>
          <td className="p-4">
            <span className="text-gray-900">
              {user.loyaltyProfile?.totalBookings || 0}
            </span>
          </td>
          <td className="p-4">
            <span className="text-gray-900">
              {transactions.filter((t) => t.user._id === user._id).length || 0}
            </span>
          </td>
          <td className="p-4">
            <span className="text-gray-900">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </td>
          <td className="p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              {!user.isDeleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(user._id!)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              {user.isDeleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRestore(user._id)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </td>
        </tr>
      )}
    />
  );
};

export default UserTable;
