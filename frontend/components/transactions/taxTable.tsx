"use client";

import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimplePaginatedList from "../paginatedList";
import type { Tax } from "@/types";

interface TaxTableProps {
  taxes: Tax[];
  onEdit: (tax: Tax) => void;
  onDelete: (taxId: string) => void;
  onToggleStatus: (tax: Tax) => void;
}

const TaxTable = ({
  taxes,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaxTableProps) => {
  const tableHeaders = (
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Tax Name
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Rate
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Type
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Applies To
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Status
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  );

  const renderRow = (tax: Tax) => (
    <tr key={tax._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{tax.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-gray-900">{tax.rate}%</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-gray-900">{tax.type}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="outline">
          {tax.appliesTo === "both"
            ? "Both"
            : tax.appliesTo === "inventory_item"
            ? "Inventory"
            : "Facilities"}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={tax.active ? "default" : "secondary"}>
          {tax.active ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(tax)}
            className="text-blue-600 hover:text-blue-900"
          >
            {tax.active ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(tax)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(tax._id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <SimplePaginatedList
      data={taxes}
      itemsPerPage={10}
      emptyMessage="No taxes found"
      tableHeaders={tableHeaders}
      renderRow={renderRow}
    />
  );
};

export default TaxTable;
