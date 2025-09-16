"use client";

import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Download,
  FileSpreadsheet,
  MoreVertical,
  FileText,
  Printer,
} from "lucide-react";
import type { Transaction } from "@/types";
import { currencyFormat } from "@/lib/utils";
import SimplePaginatedList from "../paginatedList";
import { InvoiceTemplate as InvoiceViewTemplate } from "@/components/templates/invoiceTemplate";
import { ReceiptTemplate as ReceiptViewTemplate } from "@/components/templates/receiptTemplate";
// Removed companies fetch; transactions include embedded company details

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onReconcile: (transactionId: string) => void;
}

// Modal state for viewing Invoice/Receipt

const TransactionTable = ({
  transactions,
  onView,
  onReconcile,
}: TransactionTableProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [showInvoice, setShowInvoice] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);

  // Company details are embedded on each transaction; no extra fetch/mapping needed

  const closeModals = () => {
    setShowInvoice(null);
    setShowReceipt(null);
  };

  const getStatusBadge = (reconciled: boolean) =>
    reconciled ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Reconciled
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Pending
      </Badge>
    );

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      card: { className: "bg-blue-100 text-blue-800", text: "Card" },
      mobile_money: {
        className: "bg-cyan-100 text-cyan-800",
        text: "Mobile Money",
      },
      bank: { className: "bg-gray-100 text-gray-800", text: "Bank Transfer" },
      cash: { className: "bg-green-100 text-green-800", text: "Cash" },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || {
      className: "bg-gray-100 text-gray-800",
      text: method,
    };
    return (
      <Badge variant="secondary" className={config.className}>
        {config.text}
      </Badge>
    );
  };

  // Removed legacy print via hidden template; printing can be done from template UIs

  const exportToExcel = () => {
    // Excel export functionality would go here
    console.log("Exporting to Excel...");
  };

  const exportToCSV = () => {
    // CSV export functionality would go here
    console.log("Exporting to CSV...");
  };

  const printReport = () => {
    if (!reportRef.current) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Transaction Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${reportRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const reconciledCount = transactions.filter((t) => t.reconciled).length;
  const pendingCount = transactions.filter((t) => !t.reconciled).length;
  const reconciledAmount = transactions
    .filter((t) => t.reconciled)
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions
    .filter((t) => !t.reconciled)
    .reduce((sum, t) => sum + t.amount, 0);

  const tableHeaders = (
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Reference
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        User
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Type
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Amount
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Method
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Status
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Date
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  );

  const renderRow = (txn: Transaction, index: number) => (
    <tr key={index} className="hover:bg-gray-50">
      <td className="px-4 py-4 whitespace-nowrap">
        <div>
          <div className="font-semibold text-gray-900">{txn.ref}</div>
          <div className="text-sm text-gray-500">{txn.description}</div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div>
          <div className="text-gray-900">{txn.user.name}</div>
          <div className="text-sm text-gray-500">{txn.user.email}</div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          {txn.type}
        </Badge>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="font-bold text-gray-900">
          {currencyFormat(txn.amount)}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {getMethodBadge(txn.method)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {getStatusBadge(txn.reconciled)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="text-gray-500">
          {new Date(txn.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReconcile(txn.ref || "")}
            title={txn.reconciled ? "Unreconcile" : "Reconcile"}
            className={
              txn.reconciled
                ? "border-red-300 text-red-600 hover:bg-red-50"
                : "border-green-300 text-green-600 hover:bg-green-50"
            }
          >
            <Check className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" title="More">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowInvoice(txn._id)}>
                View Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReceipt(txn._id)}>
                View Receipt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <Card>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Transactions</h3>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={printReport}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-2">
          <SimplePaginatedList
            data={transactions}
            itemsPerPage={5}
            emptyMessage="No transactions found"
            tableHeaders={tableHeaders}
            renderRow={renderRow}
          />
        </div>
      </Card>

      {showInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Invoice</h2>
              <Button onClick={closeModals} variant="outline">
                Close
              </Button>
            </div>
            <div className="p-4">
              {(() => {
                const txn = transactions.find((t) => t._id === showInvoice);
                return txn ? (
                  <InvoiceViewTemplate
                    transaction={
                      // Reuse the same shape already used by the invoice template component
                      {
                        ...txn,
                        company: (txn as any).company,
                      } as any
                    }
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Receipt</h2>
              <Button onClick={closeModals} variant="outline">
                Close
              </Button>
            </div>
            <div className="p-4">
              {(() => {
                const txn = transactions.find((t) => t._id === showReceipt);
                return txn ? (
                  <ReceiptViewTemplate
                    transaction={{
                      _id: txn._id,
                      user: txn.user as any,
                      amount: txn.amount,
                      method: txn.method,
                      ref: txn.ref || "",
                      reconciled: txn.reconciled,
                      facility: txn.facility as any,
                      description: txn.description,
                      company: (txn as any).company,
                      createdAt: txn.createdAt as any as string,
                    }}
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Report Template for Printing */}
      <div className="hidden">
        <div ref={reportRef}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">Transaction Report</h3>
            <p className="text-gray-600">
              Generated on {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 border rounded">
              <h5 className="font-semibold mb-2">Total Transactions</h5>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </div>
            <div className="text-center p-4 border rounded">
              <h5 className="font-semibold mb-2">Total Amount</h5>
              <div className="text-2xl font-bold">
                {currencyFormat(totalAmount)}
              </div>
            </div>
            <div className="text-center p-4 border rounded">
              <h5 className="font-semibold mb-2">Reconciled</h5>
              <div className="text-2xl font-bold">{reconciledCount}</div>
              <div className="text-gray-600">
                {currencyFormat(reconciledAmount)}
              </div>
            </div>
            <div className="text-center p-4 border rounded">
              <h5 className="font-semibold mb-2">Pending</h5>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-gray-600">
                {currencyFormat(pendingAmount)}
              </div>
            </div>
          </div>

          {/* Detailed Transaction Table */}
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Reference</th>
                <th className="border p-2 text-left">User</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">Amount</th>
                <th className="border p-2 text-left">Method</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index}>
                  <td className="border p-2">
                    <div className="font-bold">{txn.ref}</div>
                    {txn.description && (
                      <div className="text-sm text-gray-600">
                        {txn.description}
                      </div>
                    )}
                  </td>
                  <td className="border p-2">
                    <div>{txn.user.name}</div>
                    <div className="text-sm text-gray-600">
                      {txn.user.email}
                    </div>
                  </td>
                  <td className="border p-2">{txn.type}</td>
                  <td className="border p-2 font-bold">
                    {currencyFormat(txn.amount)}
                  </td>
                  <td className="border p-2">{txn.method}</td>
                  <td className="border p-2">
                    {txn.reconciled ? "Reconciled" : "Pending"}
                  </td>
                  <td className="border p-2">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
