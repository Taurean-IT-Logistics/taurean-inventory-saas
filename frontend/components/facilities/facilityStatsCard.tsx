import { Building, CheckCircle, XCircle, Star } from "lucide-react";
import type { Facility } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface FacilityStatsCardsProps {
  facilities: Facility[];
}

const FacilityStatsCards = ({ facilities }: FacilityStatsCardsProps) => {
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter(
    (f) => f.isActive && !f.isDeleted
  ).length;
  const inactiveFacilities = facilities.filter(
    (f) => !f.isActive || f.isDeleted
  ).length;
  const averageRating =
    facilities.reduce((sum, f) => sum + (f.rating?.average || 0), 0) /
      totalFacilities || 0;

  const stats = [
    {
      title: "Total Facilities",
      value: totalFacilities,
      icon: Building,
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Active Facilities",
      value: activeFacilities,
      icon: CheckCircle,
      bgColor: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Inactive Facilities",
      value: inactiveFacilities,
      icon: XCircle,
      bgColor: "bg-red-500",
      textColor: "text-red-600",
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(1),
      icon: Star,
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <div className={`rounded-full p-3 ${stat.bgColor} mr-4`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FacilityStatsCards;
