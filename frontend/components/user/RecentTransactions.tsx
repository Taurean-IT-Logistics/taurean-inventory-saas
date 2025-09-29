"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { currencyFormat } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/booking/booking-calendar/paymentStatusBadge";
import { InvoiceTemplate } from "@/components/templates/invoiceTemplate";
import { ReceiptTemplate } from "@/components/templates/receiptTemplate";
import { ErrorComponent } from "@/components/ui/error";

interface RecentTransactionsProps {
  transactions: any;
  transactionsError: any;
  viewingInvoice: string | null;
  viewingReceipt: string | null;
  onViewInvoice: (transactionId: string) => void;
  onViewReceipt: (transactionId: string) => void;
  onCloseInvoice: () => void;
  onCloseReceipt: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  transactionsError,
  viewingInvoice,
  viewingReceipt,
  onViewInvoice,
  onViewReceipt,
  onCloseInvoice,
  onCloseReceipt,
}) => {
  if (viewingInvoice) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Invoice Details
            </CardTitle>
            <Button variant="outline" onClick={onCloseInvoice}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const transaction = (transactions as any)?.find(
              (t: any) => t._id === viewingInvoice
            );
            if (!transaction) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  Transaction not found
                </div>
              );
            }
            return <InvoiceTemplate transaction={transaction} />;
          })()}
        </CardContent>
      </Card>
    );
  }

  if (viewingReceipt) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Receipt Details
            </CardTitle>
            <Button variant="outline" onClick={onCloseReceipt}>
              ← Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const transaction = (transactions as any)?.find(
              (t: any) => t._id === viewingReceipt
            );
            if (!transaction) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  Transaction not found
                </div>
              );
            }
            return <ReceiptTemplate transaction={transaction} />;
          })()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Recent Transactions
        </CardTitle>
        <CardDescription>
          Your latest payment activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactionsError ? (
          <ErrorComponent
            title="Error loading transactions"
            message={transactionsError.message}
          />
        ) : !(transactions as any) ||
          (transactions as any).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions found
          </p>
        ) : (
          <div className="space-y-4">
            {(transactions as any)
              .slice(0, 5)
              .map((transaction: any) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <PaymentStatusBadge
                      status={
                        transaction.reconciled
                          ? "completed"
                          : "pending"
                      }
                    />
                    <div>
                      <p className="font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          transaction.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {currencyFormat(transaction.amount)}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewInvoice(transaction._id)}
                        className="mt-1 h-6 px-2 text-xs"
                      >
                        Invoice
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewReceipt(transaction._id)}
                        className="mt-1 h-6 px-2 text-xs"
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
