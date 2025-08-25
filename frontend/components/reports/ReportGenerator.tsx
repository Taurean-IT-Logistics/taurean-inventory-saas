"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { format } from "date-fns";
import { currencyFormat } from "@/lib/utils";

export interface ReportData {
  reportNumber: string;
  reportType: string;
  generatedAt: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    totalFacilities: number;
    currency: string;
  };
  metrics: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  charts: Array<{
    title: string;
    type: "line" | "bar" | "pie" | "area";
    data: Array<{
      name: string;
      value: number;
    }>;
  }>;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
}

export interface ReportGeneratorRef {
  generatePDF: () => void;
  print: () => void;
  download: () => void;
}

interface ReportGeneratorProps {
  data: ReportData;
  onGenerate?: (pdfBlob: Blob) => void;
}

const ReportGenerator = forwardRef<ReportGeneratorRef, ReportGeneratorProps>(
  ({ data, onGenerate }, ref) => {
    const reportRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      generatePDF: async () => {
        if (!reportRef.current) return;
        
        try {
          const { jsPDF } = await import('jspdf');
          const html2canvas = await import('html2canvas');
          
          const canvas = await html2canvas.default(reportRef.current, {
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
        if (!reportRef.current) return;
        window.print();
      },
      download: async () => {
        if (!reportRef.current) return;
        
        try {
          const { jsPDF } = await import('jspdf');
          const html2canvas = await import('html2canvas');
          
          const canvas = await html2canvas.default(reportRef.current, {
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
          
          pdf.save(`${data.reportType}-report-${data.reportNumber}.pdf`);
        } catch (error) {
          console.error('Error downloading PDF:', error);
        }
      },
    }));

    return (
      <div className="hidden">
        <div
          ref={reportRef}
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
              <h2 className="text-4xl font-bold text-blue-600 mb-2">
                {data.reportType.toUpperCase()} REPORT
              </h2>
              <div className="text-gray-600 space-y-1">
                <p><strong>Report #:</strong> {data.reportNumber}</p>
                <p><strong>Generated:</strong> {format(data.generatedAt, 'MMM dd, yyyy HH:mm')}</p>
                <p><strong>Period:</strong> {format(data.dateRange.start, 'MMM dd, yyyy')} - {format(data.dateRange.end, 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Total Revenue</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {currencyFormat(data.summary.totalRevenue, data.summary.currency)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Total Bookings</h4>
                <p className="text-2xl font-bold text-green-600">
                  {data.summary.totalBookings}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Active Users</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {data.summary.totalUsers}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Facilities</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {data.summary.totalFacilities}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.metrics.map((metric, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {metric.icon}
                    <h4 className="font-semibold text-gray-900">{metric.label}</h4>
                  </div>
                  <p className="text-xl font-bold text-gray-700">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          {data.charts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h3>
              {data.charts.map((chart, index) => (
                <div key={index} className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{chart.title}</h4>
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <div className="text-center text-gray-500 py-8">
                      [Chart: {chart.type} - {chart.data.length} data points]
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Chart type: {chart.type}</p>
                      <p>Data points: {chart.data.length}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tables Section */}
          {data.tables && data.tables.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Detailed Data</h3>
              {data.tables.map((table, index) => (
                <div key={index} className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{table.title}</h4>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        {table.headers.map((header, headerIndex) => (
                          <th key={headerIndex} className="border border-gray-300 p-3 text-left font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-300">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 p-3">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t pt-6">
            <p>Report generated by {data.company.name}</p>
            <p>Generated on {format(data.generatedAt, 'MMMM dd, yyyy at HH:mm')}</p>
            <p className="mt-2 text-xs">
              This is a computer-generated report. For questions, please contact {data.company.email}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ReportGenerator.displayName = 'ReportGenerator';

export default ReportGenerator;