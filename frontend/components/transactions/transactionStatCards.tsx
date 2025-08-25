import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Receipt, CheckCircle, Clock } from "lucide-react";
import type { Transaction } from "@/types";
import { currencyFormat } from "@/lib/utils";

interface TransactionStatsCardsProps {
  transactions: Transaction[];
}

const TransactionStatsCards = ({
  transactions,
}: TransactionStatsCardsProps) => {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const reconciledCount = transactions.filter((t) => t.reconciled).length;
  const pendingCount = transactions.filter((t) => !t.reconciled).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-green-700 mb-1">
                {currencyFormat(totalRevenue)}
              </h3>
              <p className="text-gray-600 text-sm">Total Revenue</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-blue-700 mb-1">
                {transactions.length}
              </h3>
              <p className="text-gray-600 text-sm">Total Transactions</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-cyan-50 border-cyan-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-cyan-700 mb-1">
                {reconciledCount}
              </h3>
              <p className="text-gray-600 text-sm">Reconciled</p>
            </div>
            <CheckCircle className="w-8 h-8 text-cyan-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-yellow-700 mb-1">
                {pendingCount}
              </h3>
              <p className="text-gray-600 text-sm">Pending</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionStatsCards;
