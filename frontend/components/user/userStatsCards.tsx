import { Users, User, UserCheck, Shield } from "lucide-react";
import type { User as UserType } from "@/types";

interface UserStatsCardsProps {
  users: UserType[];
}

const UserStatsCards = ({ users }: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-blue-600 mb-1">
              {users.filter((u) => !u.isDeleted).length}
            </h3>
            <p className="text-gray-600 text-sm mb-0">Total Users</p>
          </div>
          <Users className="text-blue-600 w-8 h-8" />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-green-600 mb-1">
              {users.filter((u) => u.role === "user" && !u.isDeleted).length}
            </h3>
            <p className="text-gray-600 text-sm mb-0">Customers</p>
          </div>
          <User className="text-green-600 w-8 h-8" />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-yellow-600 mb-1">
              {users.filter((u) => u.role === "staff" && !u.isDeleted).length}
            </h3>
            <p className="text-gray-600 text-sm mb-0">Staff</p>
          </div>
          <UserCheck className="text-yellow-600 w-8 h-8" />
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-red-600 mb-1">
              {users.filter((u) => u.role === "admin" && !u.isDeleted).length}
            </h3>
            <p className="text-gray-600 text-sm mb-0">Admins</p>
          </div>
          <Shield className="text-red-600 w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;
