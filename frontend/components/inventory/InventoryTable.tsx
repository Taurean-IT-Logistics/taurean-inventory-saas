"use client";

import type { InventoryItem } from "@/types";
import { currencyFormat } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, RotateCcw, Package } from "lucide-react";
import SimplePaginatedList from "../paginatedList";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  onRestore: (itemId: string) => void;
  onReturnRequest?: (item: InventoryItem) => void;
}

const InventoryTable = ({
  items,
  onEdit,
  onDelete,
  onRestore,
  onReturnRequest,
}: InventoryTableProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: {
        variant: "default",
        text: "In Stock",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      rented: {
        variant: "secondary",
        text: "Rented",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      unavailable: {
        variant: "destructive",
        text: "Unavailable",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
      maintenance: {
        variant: "outline",
        text: "Maintenance",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      },
      retired: {
        variant: "secondary",
        text: "Retired",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.unavailable;
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getAlerts = (item: InventoryItem) => {
    const alerts = [];
    if (item.quantity <= 2) alerts.push({ type: "warning", text: "Low Stock" });
    if (item.alerts.maintenanceDue)
      alerts.push({ type: "info", text: "Maintenance Due" });
    if (item.alerts.warrantyExpiring)
      alerts.push({ type: "danger", text: "Warranty Expiring" });
    return alerts;
  };

  const getAlertBadgeClass = (type: string) => {
    const classes = {
      warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      info: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      danger: "bg-red-100 text-red-800 hover:bg-red-100",
    };
    return classes[type as keyof typeof classes] || classes.warning;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <SimplePaginatedList
          data={items}
          itemsPerPage={5}
          emptyMessage="No inventory items found."
          tableHeaders={
            <tr className="border-b">
              <th className="text-left p-4 font-semibold text-gray-900">
                Item Details
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                Category
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                Status
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                Quantity
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                Value
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                Alerts
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          }
          renderRow={(item) => (
            <tr key={item._id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div>
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-blue-600">{item.sku}</div>
                  {item.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-4">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 hover:bg-gray-100"
                >
                  {item.category}
                </Badge>
              </td>
              <td className="p-4">{getStatusBadge(item.status)}</td>
              <td className="p-4">
                <span
                  className={`font-bold ${
                    item.quantity <= 2 ? "text-yellow-600" : "text-gray-900"
                  }`}
                >
                  {item.quantity}
                </span>
              </td>
              <td className="p-4">
                <div className="text-gray-900">
                  {item.purchaseInfo.purchasePrice
                    ? currencyFormat(item.purchaseInfo.purchasePrice)
                    : "N/A"}
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  {getAlerts(item).map((alert, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`text-xs ${getAlertBadgeClass(alert.type)}`}
                    >
                      {alert.text}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onReturnRequest && item.status === "rented" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReturnRequest(item)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Request Return"
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  )}
                  {!item.isDeleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(item._id!)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {item.isDeleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(item._id!)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryTable;
