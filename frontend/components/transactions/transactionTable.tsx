"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
  Eye,
  Check,
  Printer,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Receipt,
} from "lucide-react";
import type { Transaction } from "@/types";
import { currencyFormat } from "@/lib/utils";
import SimplePaginatedList from "../paginatedList";

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onReconcile: (transactionId: string) => void;
}

interface InvoiceTemplateRef {
  print: () => void;
  exportToPDF: (isDownload: boolean) => void;
  getDomElement: () => HTMLDivElement | null;
}

interface InvoiceTemplateProps {
  transaction: Transaction;
}

const InvoiceTemplate = forwardRef<InvoiceTemplateRef, InvoiceTemplateProps>(
  ({ transaction }, ref) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const printInvoice = async (isDownload = false) => {
      if (!invoiceRef.current) return;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${transaction.ref}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .invoice-title { font-size: 24px; font-weight: bold; color: #dc2626; }
                .details { margin: 20px 0; }
                .amount { font-size: 20px; font-weight: bold; }
              </style>
            </head>
            <body>
              ${invoiceRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    };

    useImperativeHandle(ref, () => ({
      print: printInvoice,
      exportToPDF: printInvoice,
      getDomElement: () => invoiceRef.current,
    }));

    return (
      <div className="hidden">
        <div ref={invoiceRef} className="bg-white p-8">
          <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-blue-600">
            <div>
              {/* Taurean IT as the parent company issuer */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold mb-2 text-blue-600">
                  Taurean IT
                </h1>
                <div className="text-gray-600 text-sm">
                  <div>
                    Creator and operator of the Taurean Inventory SaaS platform
                  </div>
                  <div>Ghana | admin@taureanit.com | +233000000000</div>
                </div>
              </div>

              {/* Company branding details */}
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-2">Company Name</h2>
                <div className="text-gray-600 text-sm">
                  <div>123 Business Street</div>
                  <div>Phone: (555) 123-4567 | Email: info@company.com</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-red-600 mb-1">INVOICE</h1>
              <div className="text-lg font-bold mb-1">{transaction.ref}</div>
              <div className="text-gray-600 text-sm">
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h5 className="text-blue-600 font-semibold mb-2">Bill To:</h5>
              <div className="font-bold mb-1">{transaction.user.name}</div>
              <div className="text-gray-600 text-sm">
                <div>{transaction.user.email}</div>
                <div>{transaction.user.phone}</div>
              </div>
            </div>

            <div className="border border-blue-600 rounded p-4">
              <h5 className="text-blue-600 font-semibold mb-3 flex items-center">
                <Receipt className="w-4 h-4 mr-2" />
                Transaction Details
              </h5>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Type:</strong>{" "}
                  <span className="capitalize">
                    {transaction.type.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <strong>Method:</strong>{" "}
                  <span className="capitalize">{transaction.method}</span>
                </div>
                <div>
                  <strong>Amount:</strong>{" "}
                  <span className="font-bold text-lg">
                    {currencyFormat(transaction.amount)}
                  </span>
                </div>
                <div>
                  <strong>Reference:</strong>{" "}
                  <span className="font-mono">{transaction.ref}</span>
                </div>
                {transaction.description && (
                  <div className="border-t pt-2 mt-2">
                    <strong>Description:</strong>
                    <p className="mt-1">{transaction.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";

const TransactionTable = ({
  transactions,
  onView,
  onReconcile,
}: TransactionTableProps) => {
  const [invoiceRefs] = useState(
    new Map<string, React.RefObject<InvoiceTemplateRef>>()
  );
  const reportRef = useRef<HTMLDivElement>(null);

  const getInvoiceRef = (transactionRef: string) => {
    if (!invoiceRefs.has(transactionRef)) {
      invoiceRefs.set(transactionRef, React.createRef<InvoiceTemplateRef>());
    }
    return invoiceRefs.get(transactionRef)!;
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

  const handlePrintInvoice = (transaction: Transaction) => {
    const invoiceRef = getInvoiceRef(transaction.ref || "");
    invoiceRef.current?.print();
  };

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
            onClick={() => onView(txn)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {!txn.reconciled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReconcile(txn.ref || "")}
              title="Reconcile"
              className="border-green-300 text-green-600 hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReconcile(txn.ref || "")}
              title="Unreconcile"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrintInvoice(txn)}
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
          </Button>
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

      {transactions.map((txn) => (
        <InvoiceTemplate
          key={txn.ref}
          ref={getInvoiceRef(txn.ref || "")}
          transaction={txn}
        />
      ))}

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
