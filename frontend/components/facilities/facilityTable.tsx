"use client";

import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Star,
  MapPin,
  Clock,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import type { Facility } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SimplePaginatedList from "../paginatedList";

interface FacilityTableProps {
  facilities: Facility[];
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string) => void;
  onToggleStatus: (facilityId: string) => void;
  onViewReviews: (facility: Facility) => void;
}

const FacilityTable = ({
  facilities,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewReviews,
}: FacilityTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const getStatusVariant = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "destructive";
    return isActive ? "default" : "secondary";
  };

  const getStatusText = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "Deleted";
    return isActive ? "Active" : "Inactive";
  };

  return (
    <SimplePaginatedList
      data={facilities}
      itemsPerPage={5}
      emptyMessage="No facilities found."
      tableHeaders={
        <>
          <th className="text-left p-4 font-medium text-gray-900">Name</th>
          <th className="text-left p-4 font-medium text-gray-900">Location</th>
          <th className="text-left p-4 font-medium text-gray-900">Capacity</th>
          <th className="text-left p-4 font-medium text-gray-900">Hours</th>
          <th className="text-left p-4 font-medium text-gray-900">Price</th>
          <th className="text-left p-4 font-medium text-gray-900">Rating</th>
          <th className="text-left p-4 font-medium text-gray-900">Status</th>
          <th className="text-left p-4 font-medium text-gray-900 w-[100px]">
            Actions
          </th>
        </>
      }
      renderRow={(facility, index) => (
        <tr
          key={facility._id}
          className="border-b border-gray-100 hover:bg-gray-50"
        >
          <td className="p-4">
            <div>
              <div className="font-medium">{facility.name}</div>
              {facility.description && (
                <div className="text-sm text-gray-500">
                  {facility.description.length > 50
                    ? `${facility.description.substring(0, 50)}...`
                    : facility.description}
                </div>
              )}
            </div>
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {facility.location?.address || "Not specified"}
              </span>
            </div>
          </td>
          <td className="p-4">
            <div>
              <div className="font-medium">
                {facility.capacity?.maximum || 0} max
              </div>
              {facility.capacity?.recommended && (
                <div className="text-sm text-gray-500">
                  {facility.capacity.recommended} recommended
                </div>
              )}
            </div>
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {facility.operationalHours?.opening || "--"} -{" "}
                {facility.operationalHours?.closing || "--"}
              </span>
            </div>
          </td>
          <td className="p-4">
            {facility.pricing && facility.pricing.length > 0 ? (
              <div>
                <div className="font-medium">
                  {formatCurrency(facility.pricing[0].amount)}
                </div>
                <div className="text-sm text-gray-500">
                  per {facility.pricing[0].unit}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Not set</span>
            )}
          </td>
          <td className="p-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">
                {facility.rating?.average?.toFixed(1) || "0.0"}
              </span>
              <span className="text-xs text-gray-500">
                ({facility.rating?.totalReviews || 0})
              </span>
            </div>
          </td>
          <td className="p-4">
            <Badge
              variant={getStatusVariant(
                facility.isActive,
                facility.isDeleted || false
              )}
            >
              {getStatusText(facility.isActive, facility.isDeleted || false)}
            </Badge>
          </td>
          <td className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(facility)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(facility._id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {facility.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewReviews(facility)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View Reviews
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(facility._id)}
                  className={
                    !facility.isDeleted ? "text-red-600" : "text-green-600"
                  }
                >
                  {!facility.isDeleted ? (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      )}
    />
  );
};

export default FacilityTable;
