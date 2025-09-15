"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Printer,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { currencyFormat, formatDate, formatDateTime } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { getResourceUrl } from "@/lib/api";
import { logo } from "@/assets";

interface ReceiptTransaction {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  method: string;
  ref: string;
  reconciled: boolean;
  facility?: {
    _id: string;
    name: string;
    description?: string;
    location?: {
      address?: string;
    };
  };
  description?: string;
  company: {
    logo?: { path: string } | null;
    _id: string;
    name: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
    currency: string;
  };
  createdAt: string;
}

interface ReceiptTemplateProps {
  transaction: ReceiptTransaction;
}

export function ReceiptTemplate({ transaction }: ReceiptTemplateProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const printReceipt = () => {
    try {
      const printWindow = window.open("", "_blank");
      if (printWindow && receiptRef.current) {
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
            .container { max-width: 800px; margin: 0 auto; }
            .no-print { display: none !important; }
            .bg-primary { background-color: #10b981 !important; color: white !important; }
            .bg-green-600 { background-color: #10b981 !important; color: white !important; }
            .text-primary { color: #10b981 !important; }
            .text-green-600 { color: #10b981 !important; }
            .text-green-700 { color: #059669 !important; }
            .text-muted-foreground { color: #6b7280 !important; }
            .text-muted { color: #6b7280 !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            .border { border: 1px solid #e5e7eb !important; }
            .border-t { border-top: 1px solid #e5e7eb !important; }
            .border-b { border-bottom: 1px solid #e5e7eb !important; }
            .border-b-2 { border-bottom: 2px solid #10b981 !important; }
            .rounded { border-radius: 0.5rem !important; }
            .rounded-full { border-radius: 9999px !important; }
            .p-4 { padding: 1rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-8 { padding: 2rem !important; }
            .pb-3 { padding-bottom: 0.75rem !important; }
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
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05) !important; }
            .opacity-75 { opacity: 0.75 !important; }
            .opacity-90 { opacity: 0.9 !important; }
            .text-xs { font-size: 0.75rem !important; }
            .text-sm { font-size: 0.875rem !important; }
            .text-lg { font-size: 1.125rem !important; }
            .text-xl { font-size: 1.25rem !important; }
            .text-2xl { font-size: 1.5rem !important; }
            .text-3xl { font-size: 1.875rem !important; }
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
              .container { box-shadow: none; }
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
              <title>Receipt ${transaction.ref}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              ${printStyles}
            </head>
            <body>
              <div class="container">${
                receiptRef.current?.innerHTML || ""
              }</div>
              <script>
                window.addEventListener('load', function() { setTimeout(() => { window.print(); }, 500); });
              <\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error("Error printing receipt:", error);
    }
  };

  const exportToPDF = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
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

      pdf.save(`Receipt_${transaction.ref}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" onClick={printReceipt}>
          <Printer className="h-4 w-4 mr-2" />
          Print Receipt
        </Button>
        <Button variant="outline" onClick={exportToPDF} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Generating..." : "Export PDF"}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8" ref={receiptRef}>
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-green-600">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="logo-container">
                  <Image
                    src={
                      transaction.company?.logo?.path
                        ? getResourceUrl(transaction.company.logo.path)
                        : logo
                    }
                    alt="logo"
                    className="rounded-full"
                    width={100}
                    height={100}
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // @ts-ignore
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
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                RECEIPT
              </h2>
              <div className="text-lg font-semibold mb-1">
                {transaction.ref}
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1 justify-end">
                  <Calendar className="h-4 w-4" />
                  Date: {formatDate(transaction.createdAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">
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
                    {transaction.facility.description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <span className="ml-2">
                          {transaction.facility.description}
                        </span>
                      </div>
                    )}
                    {transaction.facility.location?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          {transaction.facility.location.address}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-green-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-lg mb-2 opacity-90">Amount Paid</div>
                  <div className="text-3xl font-bold">
                    {currencyFormat(transaction.amount)}
                  </div>
                  <div className="text-sm mt-2 opacity-90">
                    {transaction.company.currency}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold">Payment Information</h3>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="capitalize">{transaction.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      className={
                        transaction.reconciled
                          ? "bg-white text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }
                      variant={transaction.reconciled ? "default" : "outline"}
                    >
                      {transaction.reconciled ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Ref:</span>
                    <span className="font-mono">{transaction.ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processed:</span>
                    <span>{formatDateTime(transaction.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="mb-6" />
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-green-700">
              Thank you for your payment!
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
              <p>Keep this receipt for your records.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReceiptTemplate;
