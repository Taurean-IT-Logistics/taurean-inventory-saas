import type { InventoryItem } from "@/types";
import { Package, CheckCircle, AlertTriangle, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InventoryStatsCardsProps {
  items: InventoryItem[];
}

const InventoryStatsCards = ({ items }: InventoryStatsCardsProps) => {
  const activeItems = items.filter((i) => !i.isDeleted);
  const inStockItems = items.filter(
    (i) => i.status === "in_stock" && !i.isDeleted
  );
  const lowStockItems = items.filter((i) => i.quantity <= 2 && !i.isDeleted);
  const maintenanceItems = items.filter(
    (i) => i.status === "maintenance" && !i.isDeleted
  );

  const stats = [
    {
      title: "Total Items",
      value: activeItems.length,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "In Stock",
      value: inStockItems.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Low Stock",
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      title: "Under Maintenance",
      value: maintenanceItems.length,
      icon: Wrench,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InventoryStatsCards;
