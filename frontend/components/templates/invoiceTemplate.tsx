import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Printer,
  FileText,
  CheckCircle,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { currencyFormat, formatDate, formatDateTime } from "@/lib/utils";
import {
  generateInvoiceNumber,
  getNextInvoiceConfig,
  CompanyInvoiceFormat,
} from "@/lib/invoiceUtils";
import { TaxesAPI } from "@/lib/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { getResourceUrl } from "@/lib/api";
import { logo } from "@/assets";
import React from "react";

interface PaymentTransaction {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  type: string;
  category: string;
  amount: number;
  method: string;
  ref: string;
  accessCode?: string;
  reconciled: boolean;
  facility: {
    _id: string;
    name: string;
    description: string;
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
      address: string;
    };
    pricing: Array<{
      unit: string;
      amount: number;
      isDefault: boolean;
      _id: string;
    }>;
  };
  inventoryItem?: {
    _id: string;
    name: string;
    description: string;
  };
  description: string;
  company: {
    logo?: {
      path: string;
      originalName: string;
      mimetype: string;
      size: number;
    };
    invoiceFormat: {
      type: string;
      prefix: string;
      nextNumber: number;
      padding: number;
    };
    _id: string;
    name: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
    currency: string;
  };
  paymentDetails: {
    mobileMoneyDetails?: {
      provider: string;
    };
    paystackReference?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InvoiceTemplateProps {
  transaction: PaymentTransaction;
}

export function InvoiceTemplate({ transaction }: InvoiceTemplateProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // // Debug logging
  // React.useEffect(() => {
  //   console.log("InvoiceTemplate rendered with transaction:", {
  //     id: transaction._id,
  //     amount: transaction.amount,
  //     company: transaction.company,
  //     user: transaction.user.name,
  //     facility: transaction.facility?.name,
  //   });
  // }, [transaction]);

  // Fetch taxes using Tanstack Query
  const {
    data: taxes = [],
    isLoading: taxLoading,
    error: taxError,
  } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => TaxesAPI.list(),
    enabled: !!transaction.company._id,
  });

  // Handle tax loading error
  if (taxError) {
    console.warn("Error loading taxes:", taxError);
  }

  // Calculate applicable taxes for this transaction
  const applicableTaxes = React.useMemo(() => {
    if (!taxes || !Array.isArray(taxes)) return [];

    return taxes.filter((tax: any) => {
      // Check if tax applies to this transaction type
      const appliesToTransaction =
        tax.appliesTo === "transaction" ||
        tax.appliesTo === "both" ||
        (tax.appliesTo === "inventory_item" && transaction.inventoryItem) ||
        (tax.appliesTo === "facility" && transaction.facility);

      // Check if it's a super admin tax or company-specific tax
      const isCompanyTax =
        tax.isSuperAdminTax ||
        (tax.company && tax.company === transaction.company._id);

      return appliesToTransaction && isCompanyTax;
    });
  }, [taxes, transaction]);

  // Calculate tax amounts - taxes are already included in transaction.amount
  const taxBreakdown = React.useMemo(() => {
    if (!applicableTaxes.length) {
      return {
        subtotal: transaction.amount,
        totalTax: 0,
        total: transaction.amount,
      };
    }

    // Since taxes are already included, we need to work backwards
    // Calculate what the original amount was before taxes
    const totalTaxRate = applicableTaxes.reduce(
      (sum, tax) => sum + (tax.rate || 0),
      0
    );
    const taxMultiplier = totalTaxRate / 100;

    // Original amount before taxes: total / (1 + taxRate)
    const subtotal = transaction.amount / (1 + taxMultiplier);
    const totalTax = transaction.amount - subtotal;

    // Validate that our calculation is correct
    const calculatedTotal = subtotal + totalTax;
    const isCalculationValid =
      Math.abs(calculatedTotal - transaction.amount) < 0.01;

    if (!isCalculationValid) {
      console.warn("Tax calculation validation failed:", {
        originalAmount: transaction.amount,
        calculatedTotal,
        difference: Math.abs(calculatedTotal - transaction.amount),
      });
    }

    return {
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      totalTax: Math.round(totalTax * 100) / 100,
      total: transaction.amount,
      isValid: isCalculationValid,
    };
  }, [applicableTaxes, transaction.amount]);

  // Calculate individual tax amounts for display
  const individualTaxAmounts = React.useMemo(() => {
    if (!applicableTaxes.length) return [];

    return applicableTaxes.map((tax: any) => {
      // Use the validated subtotal for calculations
      const taxAmount = (taxBreakdown.subtotal * (tax.rate || 0)) / 100;

      return {
        ...tax,
        calculatedAmount: Math.round(taxAmount * 100) / 100,
      };
    });
  }, [applicableTaxes, taxBreakdown.subtotal]);

  // Verify that individual tax amounts sum up to total tax
  const totalCalculatedTax = React.useMemo(() => {
    return individualTaxAmounts.reduce(
      (sum, tax) => sum + tax.calculatedAmount,
      0
    );
  }, [individualTaxAmounts]);

  // Use the more accurate calculation
  const finalTaxBreakdown = React.useMemo(() => {
    if (!applicableTaxes.length) {
      return taxBreakdown;
    }

    // If individual calculations are more accurate, use them
    if (Math.abs(totalCalculatedTax - taxBreakdown.totalTax) < 0.01) {
      return {
        subtotal: taxBreakdown.subtotal,
        totalTax: totalCalculatedTax,
        total: transaction.amount,
        isValid: true,
      };
    }

    return taxBreakdown;
  }, [
    taxBreakdown,
    totalCalculatedTax,
    transaction.amount,
    applicableTaxes.length,
  ]);

  // Generate invoice number based on company configuration
  const getInvoiceNumber = () => {
    if (transaction.company.invoiceFormat) {
      // Cast the invoiceFormat to match our interface
      const companyFormat: CompanyInvoiceFormat = {
        type: transaction.company.invoiceFormat.type as
          | "auto"
          | "prefix"
          | "paystack",
        prefix: transaction.company.invoiceFormat.prefix,
        nextNumber: transaction.company.invoiceFormat.nextNumber,
        padding: transaction.company.invoiceFormat.padding,
      };

      // Use the transaction ref if it exists, otherwise generate a new one
      return generateInvoiceNumber(companyFormat) || transaction.ref;
    }

    // Fallback to transaction ref or generate a simple invoice number
    return (
      transaction.ref ||
      `INV-${new Date().getFullYear()}-${(new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${transaction._id.slice(-6)}`
    );
  };

  const invoiceNumber = getInvoiceNumber();

  const printInvoice = () => {
    try {
      const printWindow = window.open("", "_blank");
      if (printWindow && invoiceRef.current) {
        const printStyles = `
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: white;
              color: #1f2937;
              line-height: 1.5;
            }
            .invoice-container { 
              max-width: 800px; 
              margin: 0 auto;
            }
            .no-print { display: none !important; }
            .bg-primary { background-color: #3b82f6 !important; color: white !important; }
            .bg-green-600 { background-color: #059669 !important; color: white !important; }
            .bg-yellow-600 { background-color: #ca8a04 !important; color: white !important; }
            .text-primary { color: #3b82f6 !important; }
            .text-muted-foreground { color: #6b7280 !important; }
            .text-muted { color: #6b7280 !important; }
            .font-bold { font-weight: 700 !important; }
            .border { border: 1px solid #e5e7eb !important; }
            .border-t { border-top: 1px solid #e5e7eb !important; }
            .border-b { border-bottom: 1px solid #e5e7eb !important; }
            .border-primary { border-color: #3b82f6 !important; }
            .border-b-2 { border-bottom: 2px solid #3b82f6 !important; }
            .rounded { border-radius: 0.5rem !important; }
            .rounded-full { border-radius: 9999px !important; }
            .p-4 { padding: 1rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-8 { padding: 2rem !important; }
            .pb-3 { padding-bottom: 0.75rem !important; }
            .pb-6 { padding-bottom: 1.5rem !important; }
            .pt-2 { padding-top: 0.5rem !important; }
            .pt-3 { padding-top: 0.75rem !important; }
            .mb-1 { margin-bottom: 0.25rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-3 { margin-bottom: 0.75rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-6 { margin-bottom: 1.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mt-1 { margin-top: 0.25rem !important; }
            .mt-2 { margin-top: 0.5rem !important; }
            .my-2 { margin: 0.5rem 0 !important; }
            .ml-2 { margin-left: 0.5rem !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-end { justify-content: flex-end !important; }
            .justify-center { justify-content: center !important; }
            .items-center { align-items: center !important; }
            .items-start { align-items: flex-start !important; }
            .flex-shrink-0 { flex-shrink: 0 !important; }
            .grid { display: grid !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-1 { gap: 0.25rem !important; }
            .gap-2 { gap: 0.5rem !important; }
            .gap-3 { gap: 0.75rem !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .gap-8 { gap: 2rem !important; }
            .space-y-1 > * + * { margin-top: 0.25rem !important; }
            .space-y-2 > * + * { margin-top: 0.5rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
            .opacity-75 { opacity: 0.75 !important; }
            .opacity-90 { opacity: 0.9 !important; }
            .text-xs { font-size: 0.75rem !important; }
            .text-sm { font-size: 0.875rem !important; }
            .text-lg { font-size: 1.125rem !important; }
            .text-xl { font-size: 1.25rem !important; }
            .text-2xl { font-size: 1.5rem !important; }
            .text-3xl { font-size: 1.875rem !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            .capitalize { text-transform: capitalize !important; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important; }
            .w-4 { width: 1rem !important; }
            .w-5 { width: 1.25rem !important; }
            .h-4 { height: 1rem !important; }
            .h-5 { height: 1.25rem !important; }
            .h-100 { height: 6.25rem !important; }
            .w-100 { width: 6.25rem !important; }
            .border-t-2 { border-top-width: 2px !important; }
            .border-b-2 { border-bottom-width: 2px !important; }
            img { max-width: 100%; height: auto; object-fit: contain; }
            .logo-container img { width: 100px !important; height: 100px !important; object-fit: contain !important; }
            @media print {
              body { margin: 0; padding: 10px; }
              .invoice-container { box-shadow: none; }
              .grid { display: grid !important; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
            @media screen and (min-width: 1024px) {
              .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
          </style>
        `;

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoiceNumber}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              ${printStyles}
            </head>
            <body>
              <div class="invoice-container">
                ${invoiceRef.current?.innerHTML || ""}
              </div>
              <script>
                window.addEventListener('load', function() {
                  setTimeout(() => { window.print(); }, 500);
                });
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        console.error("Failed to open print window or invoice ref is null");
      }
    } catch (error) {
      console.error("Error printing invoice:", error);
    }
  };

  const exportToPDF = async () => {
    if (!invoiceRef.current) {
      console.error("Invoice ref is null, cannot export PDF");
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const noPrintElements = clonedDoc.querySelectorAll(".no-print");
          noPrintElements.forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        },
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.7);

      const pdf = new jsPDF("portrait", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      if (imgHeight > pageHeight) {
        let heightLeft = imgHeight - pageHeight;
        let position = -pageHeight;

        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
        }
      }

      pdf.save(`Invoice_${invoiceNumber}.pdf`);
      console.log("PDF exported successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // You could add a toast notification here to inform the user
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" onClick={printInvoice}>
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
        <Button variant="outline" onClick={exportToPDF} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Generating..." : "Export PDF"}
        </Button>
      </div>

      {/* Invoice Content */}
      <Card className="shadow-lg">
        <CardContent className="p-8" ref={invoiceRef}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-primary">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="logo-container">
                  <Image
                    src={
                      transaction.company?.logo?.path
                        ? getResourceUrl(transaction.company?.logo?.path)
                        : logo
                    }
                    alt="logo"
                    className="rounded-full"
                    width={100}
                    height={100}
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      // Fallback to default logo if company logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = typeof logo === "string" ? logo : logo.src;
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {transaction.company.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {transaction.company.location}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {transaction.company.contactPhone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {transaction.company.contactEmail}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-primary mb-2">INVOICE</h2>
              <div className="text-lg font-semibold mb-1">{invoiceNumber}</div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date: {formatDate(transaction.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Bill To */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Bill To:
                </h3>
                <div className="space-y-1">
                  <div className="font-semibold">{transaction.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.user.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.user.phone}
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transaction Details
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{transaction.type}</span>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2 capitalize">
                      {transaction.category}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Method:</span>
                    <span className="ml-2 capitalize">
                      {transaction.method}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Reference:</span>
                    <span className="ml-2 font-mono text-sm">
                      {transaction.ref}
                    </span>
                  </div>
                  {transaction.paymentDetails?.paystackReference && (
                    <div>
                      <span className="font-medium">Paystack Ref:</span>
                      <span className="ml-2 font-mono text-sm">
                        {transaction.paymentDetails.paystackReference}
                      </span>
                    </div>
                  )}
                  {transaction.description && (
                    <div className="pt-3 border-t">
                      <span className="font-medium block mb-1">
                        Description:
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Facility Details */}
              {transaction.facility && (
                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Facility Information
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{transaction.facility.name}</span>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <span className="ml-2">
                        {transaction.facility.description}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        {transaction.facility.location.address}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Amount */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <div className="text-lg mb-2 opacity-90">
                    {applicableTaxes.length > 0
                      ? "Total Amount (Including Taxes)"
                      : "Total Amount"}
                  </div>
                  <div className="text-3xl font-bold">
                    {currencyFormat(transaction.amount)}
                  </div>
                  <div className="text-sm mt-2 opacity-75">
                    {transaction.company.currency}
                    {applicableTaxes.length > 0 && (
                      <div className="mt-1 text-xs opacity-75">
                        Taxes already included
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tax Breakdown */}
              {!taxLoading && applicableTaxes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold">Tax Breakdown</h3>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {individualTaxAmounts.map((tax: any) => {
                      return (
                        <div
                          key={tax._id}
                          className="flex justify-between items-center"
                        >
                          <span className="flex items-center gap-2">
                            <span>{tax.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {tax.rate}%
                            </Badge>
                          </span>
                          <span className="font-mono">
                            {currencyFormat(tax.calculatedAmount)}
                          </span>
                        </div>
                      );
                    })}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal (Before Tax):</span>
                      <span>{currencyFormat(taxBreakdown.subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Tax:</span>
                      <span>{currencyFormat(taxBreakdown.totalTax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Amount:</span>
                      <span>{currencyFormat(transaction.amount)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Status */}
              <Card
                className={`${
                  transaction.reconciled ? "bg-green-600" : "bg-yellow-600"
                } text-white`}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      Payment {transaction.reconciled ? "Completed" : "Pending"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold">Payment Information</h3>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{transaction.ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      variant={transaction.reconciled ? "default" : "outline"}
                      className={
                        transaction.reconciled
                          ? "bg-green-600 text-white"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {transaction.reconciled ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Processed:</span>
                    <span>{formatDateTime(transaction.createdAt)}</span>
                  </div>
                  {transaction.accessCode && (
                    <div className="flex justify-between">
                      <span>Access Code:</span>
                      <span className="font-mono">
                        {transaction.accessCode}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <Separator className="mb-6" />
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-primary">
              Thank you for your business!
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {transaction.company.contactPhone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {transaction.company.contactEmail}
                </span>
              </div>
              <p>Questions? Contact us for support and assistance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
