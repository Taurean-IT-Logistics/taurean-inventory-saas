import { Calculator, ToggleLeft, ToggleRight, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Tax } from "@/types";

interface TaxStatsCardsProps {
  taxes: Tax[];
}

const TaxStatsCards = ({ taxes }: TaxStatsCardsProps) => {
  const activeTaxes = taxes.filter((tax) => tax.active);
  const averageRate =
    taxes.length > 0
      ? taxes.reduce((sum, tax) => sum + tax.rate, 0) / taxes.length
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-blue-600">{taxes.length}</h4>
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
