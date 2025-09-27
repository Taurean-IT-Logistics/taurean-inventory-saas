"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Plus, 
  Search, 
  Filter,
  Receipt,
  CreditCard,
  Calendar,
  FileText
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FinancialDashboard {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyRevenue: { month: string; amount: number }[];
  monthlyExpenses: { month: string; amount: number }[];
  topExpenseCategories: { category: string; amount: number }[];
  recentTransactions: any[];
  upcomingPayments: any[];
}

interface Expense {
  _id: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  vendor?: string;
  status: "pending" | "approved" | "rejected";
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Discount {
  _id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  applicableTo: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usedCount: number;
  usageLimit?: number;
}

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expensePage, setExpensePage] = useState(1);
  const [discountPage, setDiscountPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    subcategory: "",
    description: "",
    amount: "",
    date: "",
    paymentMethod: "cash",
    vendor: "",
    tags: "",
  });
  const [discountForm, setDiscountForm] = useState({
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    applicableTo: "all",
    startDate: "",
    endDate: "",
    usageLimit: "",
  });

  const queryClient = useQueryClient();

  // Fetch financial dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["financial-dashboard"],
    queryFn: async () => {
      const response = await api.get("/financial/dashboard");
      return response.data.data as FinancialDashboard;
    },
  });

  // Fetch expenses
  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["expenses", expensePage, searchTerm, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: expensePage.toString(),
        limit: "10",
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      
      const response = await api.get(`/financial/expenses?${params}`);
      return response.data;
    },
  });

  // Fetch discounts
  const { data: discountsData, isLoading: isLoadingDiscounts } = useQuery({
    queryKey: ["discounts", discountPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: discountPage.toString(),
        limit: "10",
      });
      
      const response = await api.get(`/financial/discounts?${params}`);
      return response.data;
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await api.post("/financial/expenses", expenseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["financial-dashboard"] });
      toast({
        title: "Expense created successfully",
        description: "The expense has been added to your records",
      });
      setIsExpenseDialogOpen(false);
      setExpenseForm({
        category: "",
        subcategory: "",
        description: "",
        amount: "",
        date: "",
        paymentMethod: "cash",
        vendor: "",
        tags: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating expense",
        description: error.response?.data?.message || "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  // Create discount mutation
  const createDiscountMutation = useMutation({
    mutationFn: async (discountData: any) => {
      const response = await api.post("/financial/discounts", discountData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast({
        title: "Discount created successfully",
        description: "The discount has been added to your system",
      });
      setIsDiscountDialogOpen(false);
      setDiscountForm({
        name: "",
        type: "percentage",
        value: "",
        applicableTo: "all",
        startDate: "",
        endDate: "",
        usageLimit: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating discount",
        description: error.response?.data?.message || "Failed to create discount",
        variant: "destructive",
      });
    },
  });

  const handleCreateExpense = () => {
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount || !expenseForm.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createExpenseMutation.mutate({
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      tags: expenseForm.tags ? expenseForm.tags.split(',').map(tag => tag.trim()) : [],
    });
  };

  const handleCreateDiscount = () => {
    if (!discountForm.name || !discountForm.value || !discountForm.startDate || !discountForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createDiscountMutation.mutate({
      ...discountForm,
      value: parseFloat(discountForm.value),
      usageLimit: discountForm.usageLimit ? parseInt(discountForm.usageLimit) : undefined,
    });
  };

  if (isLoadingDashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading financial dashboard..." />
      </div>
    );
  }

  const expenses = expensesData?.data?.expenses || [];
  const discounts = discountsData?.data?.discounts || [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Financial Management</h1>
          <p className="text-muted-foreground">
            Track expenses, manage discounts, and monitor financial performance
          </p>
        </div>

        {/* Financial Overview Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₵{dashboardData.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₵{dashboardData.totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${dashboardData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₵{dashboardData.netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${dashboardData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardData.profitMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "expenses" ? "default" : "outline"}
            onClick={() => setActiveTab("expenses")}
          >
            Expenses
          </Button>
          <Button
            variant={activeTab === "discounts" ? "default" : "outline"}
            onClick={() => setActiveTab("discounts")}
          >
            Discounts
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentTransactions?.slice(0, 5).map((transaction: any) => (
                    <div key={transaction._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.description || "Transaction"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "income" ? "+" : "-"}₵{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.topExpenseCategories?.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {((category.amount / dashboardData.totalExpenses) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                      <p className="font-medium">₵{category.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Expenses</CardTitle>
                  <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Category *</label>
                          <Input
                            value={expenseForm.category}
                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                            placeholder="e.g., Office Supplies"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description *</label>
                          <Input
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                            placeholder="Expense description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Amount *</label>
                            <Input
                              type="number"
                              value={expenseForm.amount}
                              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Date *</label>
                            <Input
                              type="date"
                              value={expenseForm.date}
                              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Payment Method</label>
                          <Select
                            value={expenseForm.paymentMethod}
                            onValueChange={(value) => setExpenseForm({ ...expenseForm, paymentMethod: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="paystack">Paystack</SelectItem>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleCreateExpense} className="w-full">
                          Create Expense
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="office_supplies">Office Supplies</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense: Expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            {expense.vendor && (
                              <p className="text-sm text-muted-foreground">{expense.vendor}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell>₵{expense.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.status === "approved" ? "default" :
                              expense.status === "pending" ? "secondary" : "destructive"
                            }
                          >
                            {expense.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === "discounts" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Discounts</CardTitle>
                  <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Discount
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Discount</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name *</label>
                          <Input
                            value={discountForm.name}
                            onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                            placeholder="e.g., Summer Sale"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Type *</label>
                            <Select
                              value={discountForm.type}
                              onValueChange={(value: "percentage" | "fixed") => 
                                setDiscountForm({ ...discountForm, type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Value *</label>
                            <Input
                              type="number"
                              value={discountForm.value}
                              onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                              placeholder={discountForm.type === "percentage" ? "10" : "50"}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Start Date *</label>
                            <Input
                              type="date"
                              value={discountForm.startDate}
                              onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">End Date *</label>
                            <Input
                              type="date"
                              value={discountForm.endDate}
                              onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleCreateDiscount} className="w-full">
                          Create Discount
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount: Discount) => (
                      <TableRow key={discount._id}>
                        <TableCell className="font-medium">{discount.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {discount.type === "percentage" ? "%" : "₵"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {discount.type === "percentage" ? `${discount.value}%` : `₵${discount.value}`}
                        </TableCell>
                        <TableCell>
                          {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {discount.usedCount}
                          {discount.usageLimit && ` / ${discount.usageLimit}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={discount.isActive ? "default" : "secondary"}>
                            {discount.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}