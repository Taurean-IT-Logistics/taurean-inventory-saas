"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, MoreHorizontal } from "lucide-react";
import { currencyFormat } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/booking/booking-calendar/paymentStatusBadge";
import { InvoiceTemplate } from "@/components/templates/invoiceTemplate";
import { ReceiptTemplate } from "@/components/templates/receiptTemplate";
import { ErrorComponent } from "@/components/ui/error";

interface TransactionsTableProps {
  transactions: any;
  transactionsError: any;
  viewingInvoice: string | null;
  viewingReceipt: string | null;
  onViewInvoice: (transactionId: string) => void;
  onViewReceipt: (transactionId: string) => void;
  onCloseInvoice: () => void;
  onCloseReceipt: () => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
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
              ← Back to Transactions
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
              ← Back to Transactions
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
          All Transactions
        </CardTitle>
        <CardDescription>
          Detailed list of all your transactions
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(transactions as any).map((transaction: any) => (
                <TableRow key={transaction._id}>
                  <TableCell className="font-medium">
                    #{transaction._id.slice(-8)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    {currencyFormat(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      transaction.createdAt
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge
                      status={
                        transaction.reconciled ? "completed" : "pending"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewInvoice(transaction._id)}
                        >
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onViewReceipt(transaction._id)}
                        >
                          View Receipt
                        </DropdownMenuItem>
                        {transaction.status === "pending" && (
                          <DropdownMenuItem>
                            Cancel Transaction
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;
