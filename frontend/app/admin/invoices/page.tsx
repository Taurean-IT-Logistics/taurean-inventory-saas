"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Receipt,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { InvoicesAPI } from "@/lib/api";
import { useCompanyInvoices } from "@/hooks/useInvoices";
import InvoiceGenerator, { InvoiceData } from "@/components/invoices/InvoiceGenerator";
import ReceiptGenerator, { ReceiptData } from "@/components/invoices/ReceiptGenerator";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRef } from "react";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const invoiceGeneratorRef = useRef<any>(null);
  const receiptGeneratorRef = useRef<any>(null);

  const { data: invoiceStats } = useQuery({
    queryKey: ["invoice-stats"],
    queryFn: () => InvoicesAPI.getStats(),
  });

  const { data: invoicesData, isLoading } = useCompanyInvoices();

  const invoices = (invoicesData as any)?.invoices || [];
  const stats = invoiceStats as any;

  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = async (invoice: any) => {
    try {
      // Get invoice number from backend
      const invoiceNumberData = await InvoicesAPI.getInvoiceNumber();
      const invoiceNumber = (invoiceNumberData as any)?.invoiceNumber || invoice.invoiceNumber;

      // Prepare invoice data
      const invoiceData: InvoiceData = {
        invoiceNumber,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        company: {
          name: invoice.companyInfo.name,
          address: invoice.companyInfo.address,
          phone: invoice.companyInfo.phone,
          email: invoice.companyInfo.email,
          logo: invoice.companyInfo.logo,
          taxId: invoice.companyInfo.taxId,
        },
        customer: {
          name: invoice.customerInfo.name,
          email: invoice.customerInfo.email,
          phone: invoice.customerInfo.phone,
          address: invoice.customerInfo.address,
        },
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        notes: invoice.notes,
        terms: invoice.terms,
        status: invoice.status,
      };

      setSelectedInvoice(invoiceData);
      
      // Trigger PDF generation
      setTimeout(() => {
        invoiceGeneratorRef.current?.download();
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReceipt = async (invoice: any) => {
    try {
      // Get receipt number from backend
      const receiptNumberData = await InvoicesAPI.getReceiptNumber(invoice._id);
      const receiptNumber = (receiptNumberData as any)?.receiptNumber || `RCP-${Date.now()}`;

      // Prepare receipt data
      const receiptData: ReceiptData = {
        receiptNumber,
        invoiceNumber: invoice.invoiceNumber,
        paymentDate: new Date(invoice.paidDate || new Date()),
        paymentMethod: invoice.paymentMethod || "Online Payment",
        company: {
          name: invoice.companyInfo.name,
          address: invoice.companyInfo.address,
          phone: invoice.companyInfo.phone,
          email: invoice.companyInfo.email,
          logo: invoice.companyInfo.logo,
        },
        customer: {
          name: invoice.customerInfo.name,
          email: invoice.customerInfo.email,
          phone: invoice.customerInfo.phone,
          address: invoice.customerInfo.address,
        },
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        transactionId: invoice.transaction?._id,
      };

      setSelectedReceipt(receiptData);
      
      // Trigger PDF generation
      setTimeout(() => {
        receiptGeneratorRef.current?.download();
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download receipt",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      sent: "secondary",
      paid: "default",
      overdue: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };



  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600">
            Manage and track all invoices for your company
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.paid || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All invoices combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading invoices...</p>
              </div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first invoice"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: any) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.customerInfo.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.customerInfo.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </div>
                        {invoice.taxAmount > 0 && (
                          <div className="text-sm text-gray-500">
                            Tax: {formatCurrency(invoice.taxAmount, invoice.currency)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                // View invoice details
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadInvoice(invoice)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </DropdownMenuItem>
                            {invoice.status === "paid" && (
                              <DropdownMenuItem
                                onClick={() => handleDownloadReceipt(invoice)}
                              >
                                <Receipt className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                // Edit invoice
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Generator (hidden) */}
      {selectedInvoice && (
        <InvoiceGenerator
          ref={invoiceGeneratorRef}
          data={selectedInvoice}
          onGenerate={(pdfBlob) => {
            // Handle PDF generation if needed
            console.log('Invoice PDF generated:', pdfBlob);
          }}
        />
      )}

      {/* Receipt Generator (hidden) */}
      {selectedReceipt && (
        <ReceiptGenerator
          ref={receiptGeneratorRef}
          data={selectedReceipt}
          onGenerate={(pdfBlob) => {
            // Handle PDF generation if needed
            console.log('Receipt PDF generated:', pdfBlob);
          }}
        />
      )}

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Refresh the invoices list
          window.location.reload();
        }}
      />
    </div>
  );
}