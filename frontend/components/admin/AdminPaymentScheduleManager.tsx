"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PaymentScheduleAPI } from "@/lib/api";
import {
  Loader2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { currencyFormat } from "@/lib/utils";

interface PaymentSchedule {
  _id: string;
  userId: string;
  companyId: string;
  bookingId?: string;
  rentalId?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentType: "advance" | "split" | "full";
  status: "active" | "completed" | "cancelled" | "overdue" | "partial";
  scheduledPayments: Array<{
    amount: number;
    dueDate: string;
    status: "pending" | "paid" | "overdue" | "cancelled";
    paymentMethod: "paystack" | "cash" | "cheque";
    paidAt?: string;
    transactionId?: string;
    notes?: string;
    paymentReference?: string;
    isAdvance?: boolean;
  }>;
  advanceConfig?: {
    percentage?: number;
    fixedAmount?: number;
    inputMode: "percentage" | "amount";
    dueDate?: string;
    isPaid?: boolean;
    paidAt?: string;
    transactionId?: string;
  };
  splitConfig?: {
    numberOfParts: number;
    intervalDays?: number;
    customSchedule?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export function AdminPaymentScheduleManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSchedule, setSelectedSchedule] =
    useState<PaymentSchedule | null>(null);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["payment-schedules", "company"],
    queryFn: () => PaymentScheduleAPI.getCompanyPaymentSchedules(),
  });

  const { data: advancePayments, isLoading: advanceLoading } = useQuery({
    queryKey: ["payment-schedules", "advance"],
    queryFn: () => PaymentScheduleAPI.getPendingAdvancePayments(),
  });

  const { data: splitPayments, isLoading: splitLoading } = useQuery({
    queryKey: ["payment-schedules", "split"],
    queryFn: () => PaymentScheduleAPI.getPendingSplitPayments(),
  });

  const processPayment = useMutation({
    mutationFn: async ({
      scheduleId,
      paymentReference,
    }: {
      scheduleId: string;
      paymentReference: string;
    }) => {
      return PaymentScheduleAPI.processPayment(
        scheduleId,
        paymentReference,
        "temp-transaction-id"
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const cancelSchedule = useMutation({
    mutationFn: async ({
      scheduleId,
      reason,
    }: {
      scheduleId: string;
      reason?: string;
    }) => {
      return PaymentScheduleAPI.cancelSchedule(scheduleId, reason);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment schedule cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel schedule",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      completed: "default",
      cancelled: "destructive",
      overdue: "destructive",
      partial: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const filteredSchedules = () => {
    const schedulesData = schedules as any;
    if (!schedulesData?.schedules) return [];

    switch (activeTab) {
      case "advance":
        return schedulesData.schedules.filter(
          (s: PaymentSchedule) => s.paymentType === "advance"
        );
      case "split":
        return schedulesData.schedules.filter(
          (s: PaymentSchedule) => s.paymentType === "split"
        );
      case "overdue":
        return schedulesData.schedules.filter(
          (s: PaymentSchedule) => s.status === "overdue"
        );
      default:
        return schedulesData.schedules;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Payment Schedules</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Total: {(schedules as any)?.schedules?.length || 0}
          </Badge>
          <Badge variant="outline">
            Active:{" "}
            {(schedules as any)?.schedules?.filter(
              (s: PaymentSchedule) => s.status === "active"
            ).length || 0}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Schedules</TabsTrigger>
          <TabsTrigger value="advance">Advance Payments</TabsTrigger>
          <TabsTrigger value="split">Split Payments</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedules</CardTitle>
              <CardDescription>
                Manage and monitor payment schedules for bookings and rentals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules().map((schedule: PaymentSchedule) => (
                    <TableRow key={schedule._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {schedule.bookingId
                              ? `BOOK-${schedule.bookingId.slice(-6)}`
                              : schedule.rentalId
                              ? `RENT-${schedule.rentalId.slice(-6)}`
                              : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {schedule.paymentType.toUpperCase()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.paymentType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {currencyFormat(schedule.totalAmount)}
                          </div>
                          {schedule.advanceAmount && (
                            <div className="text-sm text-gray-500">
                              Advance: {currencyFormat(schedule.advanceAmount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {currencyFormat(schedule.paidAmount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round(
                              (schedule.paidAmount / schedule.totalAmount) * 100
                            )}
                            %
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>
                        {format(new Date(schedule.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSchedule(schedule)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {schedule.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                cancelSchedule.mutate({
                                  scheduleId: schedule._id,
                                  reason: "Cancelled by admin",
                                })
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Schedule Details Modal */}
      {selectedSchedule && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule Details</CardTitle>
            <CardDescription>
              Detailed view of payment schedule and individual payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <div className="text-2xl font-bold">
                    {currencyFormat(selectedSchedule.totalAmount)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Paid Amount</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {currencyFormat(selectedSchedule.paidAmount)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Remaining</Label>
                  <div className="text-2xl font-bold text-red-600">
                    {currencyFormat(selectedSchedule.remainingAmount)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Scheduled Payments</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSchedule.scheduledPayments.map(
                      (payment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {payment.paymentReference || `PAY-${index + 1}`}
                              </div>
                              {payment.isAdvance && (
                                <Badge variant="secondary" className="text-xs">
                                  ADVANCE
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {currencyFormat(payment.amount)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.dueDate), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getPaymentStatusIcon(payment.status)}
                              <span className="text-sm">{payment.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  processPayment.mutate({
                                    scheduleId: selectedSchedule._id,
                                    paymentReference:
                                      payment.paymentReference ||
                                      `PAY-${index + 1}`,
                                  })
                                }
                                disabled={processPayment.isPending}
                              >
                                {processPayment.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CreditCard className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSchedule(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
