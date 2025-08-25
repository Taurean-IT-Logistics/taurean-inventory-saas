"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { format } from "date-fns";
import { currencyFormat } from "@/lib/utils";

export interface ReceiptData {
  receiptNumber: string;
  invoiceNumber: string;
  paymentDate: Date;
  paymentMethod: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
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
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  transactionId?: string;
}

export interface ReceiptGeneratorRef {
  generatePDF: () => void;
  print: () => void;
  download: () => void;
}

interface ReceiptGeneratorProps {
  data: ReceiptData;
  onGenerate?: (pdfBlob: Blob) => void;
}

const ReceiptGenerator = forwardRef<ReceiptGeneratorRef, ReceiptGeneratorProps>(
  ({ data, onGenerate }, ref) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      generatePDF: async () => {
        if (!receiptRef.current) return;
        
        try {
          const { jsPDF } = await import('jspdf');
          const html2canvas = await import('html2canvas');
          
          const canvas = await html2canvas.default(receiptRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          const pdfBlob = pdf.output('blob');
          onGenerate?.(pdfBlob);
        } catch (error) {
          console.error('Error generating PDF:', error);
        }
      },
      print: () => {
        if (!receiptRef.current) return;
        window.print();
      },
      download: async () => {
        if (!receiptRef.current) return;
        
        try {
          const { jsPDF } = await import('jspdf');
          const html2canvas = await import('html2canvas');
          
          const canvas = await html2canvas.default(receiptRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          pdf.save(`receipt-${data.receiptNumber}.pdf`);
        } catch (error) {
          console.error('Error downloading PDF:', error);
        }
      },
    }));

    return (
      <div className="hidden">
        <div
          ref={receiptRef}
          className="bg-white p-8 max-w-[800px] mx-auto font-sans"
          style={{ fontFamily: 'Arial, sans-serif' }}
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
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-4xl font-bold text-green-600 mb-2">RECEIPT</h2>
              <div className="text-gray-600 space-y-1">
                <p><strong>Receipt #:</strong> {data.receiptNumber}</p>
                <p><strong>Invoice #:</strong> {data.invoiceNumber}</p>
                <p><strong>Payment Date:</strong> {format(data.paymentDate, 'MMM dd, yyyy')}</p>
                <p><strong>Payment Method:</strong> {data.paymentMethod}</p>
                {data.transactionId && (
                  <p><strong>Transaction ID:</strong> {data.transactionId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Paid By:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold text-gray-900">{data.customer.name}</p>
              <p className="text-gray-600">{data.customer.email}</p>
              {data.customer.phone && <p className="text-gray-600">Phone: {data.customer.phone}</p>}
              {data.customer.address && <p className="text-gray-600">{data.customer.address}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold">Item</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">Qty</th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">Unit Price</th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="border border-gray-300 p-3">{index + 1}</td>
                    <td className="border border-gray-300 p-3">{item.description}</td>
                    <td className="border border-gray-300 p-3 text-right">{item.quantity}</td>
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
              {data.taxAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span>Tax:</span>
                  <span>{currencyFormat(data.taxAmount, data.currency)}</span>
                </div>
              )}
              {data.discountAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span>Discount:</span>
                  <span>-{currencyFormat(data.discountAmount, data.currency)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg text-green-600">
                <span>Total Paid:</span>
                <span>{currencyFormat(data.totalAmount, data.currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Payment Confirmed</h3>
                <p className="text-green-700">
                  Thank you for your payment. This receipt serves as proof of payment for the above transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t pt-6">
            <p>Thank you for your business!</p>
            <p>{data.company.name} - {data.company.address}</p>
            <p className="mt-2 text-xs">
              This is a computer-generated receipt. No signature required.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptGenerator.displayName = 'ReceiptGenerator';

export default ReceiptGenerator;