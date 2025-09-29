"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { format } from "date-fns";
import { currencyFormat } from "@/lib/utils";
import { Tax } from "@/types";

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    taxId?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate?: number;
    tax?: number;
  }>;
  subtotal: number;
  serviceFee?: number;
  serviceFeeRate?: number;
  taxAmount: number;
  taxBreakdown?: Array<{
    tax: Tax;
    amount: number;
    rate: number;
  }>;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  status: string;
}

export interface InvoiceGeneratorRef {
  generatePDF: () => void;
  print: () => void;
  download: () => void;
}

interface InvoiceGeneratorProps {
  data: InvoiceData;
  onGenerate?: (pdfBlob: Blob) => void;
}

const InvoiceGenerator = forwardRef<InvoiceGeneratorRef, InvoiceGeneratorProps>(
  ({ data, onGenerate }, ref) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      generatePDF: async () => {
        if (!invoiceRef.current) return;

        try {
          const { jsPDF } = await import("jspdf");
          const html2canvas = await import("html2canvas");

          const canvas = await html2canvas.default(invoiceRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          const pdfBlob = pdf.output("blob");
          onGenerate?.(pdfBlob);
        } catch (error) {
          console.error("Error generating PDF:", error);
        }
      },
      print: () => {
        if (!invoiceRef.current) return;
        window.print();
      },
      download: async () => {
        if (!invoiceRef.current) return;

        try {
          const { jsPDF } = await import("jspdf");
          const html2canvas = await import("html2canvas");

          const canvas = await html2canvas.default(invoiceRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`invoice-${data.invoiceNumber}.pdf`);
        } catch (error) {
          console.error("Error downloading PDF:", error);
        }
      },
    }));

    return (
      <div className="hidden">
        <div
          ref={invoiceRef}
          className="bg-white p-8 max-w-[800px] mx-auto font-sans"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              {data.company.logo && (
                <img
                  src={data.company.logo}
                  alt="Company Logo"
                  className="h-16 mb-4"
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {data.company.name}
              </h1>
              <div className="text-gray-600 space-y-1">
                <p>{data.company.address}</p>
                <p>Phone: {data.company.phone}</p>
                <p>Email: {data.company.email}</p>
                {data.company.taxId && <p>Tax ID: {data.company.taxId}</p>}
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h2>
              <div className="text-gray-600 space-y-1">
                <p>
                  <strong>Invoice #:</strong> {data.invoiceNumber}
                </p>
                <p>
                  <strong>Issue Date:</strong>{" "}
                  {format(data.issueDate, "MMM dd, yyyy")}
                </p>
                <p>
                  <strong>Due Date:</strong>{" "}
                  {format(data.dueDate, "MMM dd, yyyy")}
                </p>
                <p>
                  <strong>Status:</strong> {data.status.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bill To:
            </h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold text-gray-900">
                {data.customer.name}
              </p>
              <p className="text-gray-600">{data.customer.email}</p>
              {data.customer.phone && (
                <p className="text-gray-600">Phone: {data.customer.phone}</p>
              )}
              {data.customer.address && (
                <p className="text-gray-600">{data.customer.address}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Item
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">
                    Qty
                  </th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">
                    Unit Price
                  </th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="border border-gray-300 p-3">{index + 1}</td>
                    <td className="border border-gray-300 p-3">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {currencyFormat(item.unitPrice, data.currency)}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {currencyFormat(item.amount, data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-semibold">Subtotal:</span>
                <span>{currencyFormat(data.subtotal, data.currency)}</span>
              </div>
              {data.serviceFee && data.serviceFee > 0 && (
                <div className="flex justify-between py-2">
                  <span>Service Fee ({data.serviceFeeRate?.toFixed(2)}%):</span>
                  <span>{currencyFormat(data.serviceFee, data.currency)}</span>
                </div>
              )}
              {data.taxBreakdown && data.taxBreakdown.length > 0 ? (
                <>
                  {data.taxBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span>
                        {item.tax.name} ({item.rate.toFixed(2)}%):
                      </span>
                      <span>{currencyFormat(item.amount, data.currency)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-semibold">
                    <span>Total Tax:</span>
                    <span>{currencyFormat(data.taxAmount, data.currency)}</span>
                  </div>
                </>
              ) : (
                data.taxAmount > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Tax:</span>
                    <span>{currencyFormat(data.taxAmount, data.currency)}</span>
                  </div>
                )
              )}
              {data.discountAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span>Discount:</span>
                  <span>
                    -{currencyFormat(data.discountAmount, data.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
                <span>Total:</span>
                <span>{currencyFormat(data.totalAmount, data.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {data.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notes:
              </h3>
              <p className="text-gray-600">{data.notes}</p>
            </div>
          )}

          {data.terms && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Terms & Conditions:
              </h3>
              <p className="text-gray-600">{data.terms}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t pt-6">
            <p>Thank you for your business!</p>
            <p>
              {data.company.name} - {data.company.address}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceGenerator.displayName = "InvoiceGenerator";

export default InvoiceGenerator;
