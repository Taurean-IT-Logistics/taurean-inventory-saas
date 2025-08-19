"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  FileText,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("invoices");

  const mockInvoices = [
    {
      id: "INV-001",
      amount: "GH₵299.00",
      status: "paid",
      date: "2024-01-15",
      dueDate: "2024-01-15",
      description: "Premium Plan - Monthly Subscription",
    },
    {
      id: "INV-002",
      amount: "GH₵299.00",
      status: "pending",
      date: "2024-02-15",
      dueDate: "2024-02-15",
      description: "Premium Plan - Monthly Subscription",
    },
    {
      id: "INV-003",
      amount: "GH₵299.00",
      status: "overdue",
      date: "2024-03-15",
      dueDate: "2024-03-15",
      description: "Premium Plan - Monthly Subscription",
    },
  ];

  const mockSubscription = {
    plan: "Premium",
    status: "active",
    amount: "GH₵299.00",
    billingCycle: "monthly",
    nextBilling: "2024-04-15",
    features: [
      "Unlimited facilities",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const downloadInvoice = (invoiceId: string) => {
    console.log(`Downloading invoice ${invoiceId}`);
    // In a real implementation, this would call an API to download the invoice
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-600">Manage your subscription and view billing history</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Subscription Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{mockSubscription.plan} Plan</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">{mockSubscription.amount}</p>
              <p className="text-sm text-gray-600 capitalize">{mockSubscription.billingCycle} billing</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              <p className="text-sm text-gray-600 mt-1">Next billing: {mockSubscription.nextBilling}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="space-y-1">
                {mockSubscription.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {feature}
                  </li>
                ))}
                {mockSubscription.features.length > 3 && (
                  <li className="text-sm text-gray-500">
                    +{mockSubscription.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "invoices"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab("payment-methods")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "payment-methods"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab("subscription")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "subscription"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Subscription
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "invoices" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invoice.status)}
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">{invoice.id}</h4>
                      <p className="text-sm text-gray-600">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{invoice.amount}</p>
                    <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => downloadInvoice(invoice.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "payment-methods" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No payment methods added yet</p>
              <p className="text-sm">Add a payment method to manage your subscription</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "subscription" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Current Plan</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{mockSubscription.plan}</p>
                  <p className="text-sm text-gray-600">{mockSubscription.amount} per month</p>
                  <Button className="mt-3" variant="outline">
                    Change Plan
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Billing Cycle</h4>
                  <p className="text-lg font-semibold capitalize">{mockSubscription.billingCycle}</p>
                  <p className="text-sm text-gray-600">Next billing: {mockSubscription.nextBilling}</p>
                  <Button className="mt-3" variant="outline">
                    Change Billing
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
