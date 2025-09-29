import { Calculator, ToggleLeft, ToggleRight, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Tax } from "@/types";

interface TaxStatsCardsProps {
  taxes: Tax[] | any; // Allow any type to handle different API response formats
}

const TaxStatsCards = ({ taxes }: TaxStatsCardsProps) => {
  // Handle different data structures that might be returned from API
  let taxesArray: Tax[] = [];

  if (Array.isArray(taxes)) {
    taxesArray = taxes;
  } else if (taxes && typeof taxes === "object") {
    // Handle paginated response or object with data property
    if (Array.isArray(taxes.data)) {
      taxesArray = taxes.data;
    } else if (Array.isArray(taxes.taxes)) {
      taxesArray = taxes.taxes;
    } else if (Array.isArray(taxes.items)) {
      taxesArray = taxes.items;
    }
  }

  const activeTaxes = taxesArray.filter((tax) => tax.active);
  const averageRate =
    taxesArray.length > 0
      ? taxesArray.reduce((sum, tax) => sum + tax.rate, 0) / taxesArray.length
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-blue-600">
            {taxesArray.length}
          </h4>
          <p className="text-gray-600 text-sm">Total Taxes</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <ToggleRight className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-green-600">
            {activeTaxes.length}
          </h4>
          <p className="text-gray-600 text-sm">Active Taxes</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <Percent className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-yellow-600">
            {averageRate.toFixed(1)}%
          </h4>
          <p className="text-gray-600 text-sm">Average Rate</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <ToggleLeft className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-red-600">
            {taxes.length - activeTaxes.length}
          </h4>
          <p className="text-gray-600 text-sm">Inactive Taxes</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxStatsCards;
