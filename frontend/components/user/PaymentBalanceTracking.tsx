"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Building2,
  Home,
  Receipt,
  CreditCard,
} from "lucide-react";
import { currencyFormat } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface PaymentBalanceTrackingProps {
  transactions: any;
  bookings: any;
  rentals: any;
  pendingTransactions: any;
  isLoading: boolean;
  error: any;
}

const PaymentBalanceTracking: React.FC<PaymentBalanceTrackingProps> = ({
  transactions,
  bookings,
  rentals,
  pendingTransactions,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Payment Balance Tracking
          </CardTitle>
          <CardDescription>
            Track your outstanding payments and balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading payment balances...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Payment Balance Tracking
          </CardTitle>
          <CardDescription>
            Track your outstanding payments and balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load payment balances
            </h3>
            <p className="text-sm text-gray-500">
              {(error as any)?.message ||
                "An error occurred while loading data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate outstanding balances based on actual verified payments
  const calculateOutstandingBalances = () => {
    const balances: Array<{
      id: string;
      type: "booking" | "rental";
      description: string;
      totalAmount: number;
      paidAmount: number;
      remainingAmount: number;
      paymentTiming: string;
      dueDate?: Date;
      status: string;
    }> = [];

    // Helper function to calculate verified paid amount from transactions
    const getVerifiedPaidAmount = (
      itemId: string,
      itemType: "booking" | "rental"
    ) => {
      const transactionData = (transactions as any)?.data || [];
      return transactionData
        .filter((tx: any) => {
          const referenceId = itemType === "booking" ? tx.booking : tx.rental;
          return referenceId === itemId && tx.status === "successful";
        })
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
    };

    // Process bookings with advance/split payments
    if (Array.isArray(bookings)) {
      bookings.forEach((booking: any) => {
        // Only process bookings that are confirmed and not completed/cancelled
        if (booking.status === "confirmed" || booking.status === "pending") {
          // Find the transaction for this booking to get payment timing info
          const relatedTransaction = transactions.find(
            (tx: any) =>
              tx.booking &&
              (tx.booking === booking._id || tx.booking._id === booking._id)
          );

          if (
            relatedTransaction?.paymentTiming === "advance" &&
            relatedTransaction?.advanceConfig
          ) {
            const totalAmount = booking.totalPrice || 0;
            const verifiedPaidAmount = getVerifiedPaidAmount(
              booking._id,
              "booking"
            );
            const remainingAmount = totalAmount - verifiedPaidAmount;

            // Only show if there's still a balance to pay
            if (remainingAmount > 0) {
              balances.push({
                id: booking._id,
                type: "booking",
                description: `Booking - ${
                  booking.facility?.name || "Facility"
                }`,
                totalAmount,
                paidAmount: verifiedPaidAmount,
                remainingAmount,
                paymentTiming: "advance",
                dueDate: new Date(booking.startDate),
                status: booking.status,
              });
            }
          } else if (
            relatedTransaction?.paymentTiming === "split" &&
            relatedTransaction?.splitConfig
          ) {
            const totalAmount = booking.totalPrice || 0;
            const verifiedPaidAmount = getVerifiedPaidAmount(
              booking._id,
              "booking"
            );
            const remainingAmount = totalAmount - verifiedPaidAmount;

            // Only show if there's still a balance to pay
            if (remainingAmount > 0) {
              balances.push({
                id: booking._id,
                type: "booking",
                description: `Booking - ${
                  booking.facility?.name || "Facility"
                }`,
                totalAmount,
                paidAmount: verifiedPaidAmount,
                remainingAmount,
                paymentTiming: "split",
                dueDate: relatedTransaction.splitConfig.parts?.[1]?.dueDate
                  ? new Date(relatedTransaction.splitConfig.parts[1].dueDate)
                  : undefined,
                status: booking.status,
              });
            }
          }
        }
      });
    }

    // Process rentals with advance/split payments
    if (Array.isArray(rentals)) {
      rentals.forEach((rental: any) => {
        // Only process rentals that are active and not returned/cancelled
        if (rental.status === "active" || rental.status === "pending") {
          // Find the transaction for this rental to get payment timing info
          const relatedTransaction = transactions.find(
            (tx: any) =>
              (tx.category === "inventory_item" || tx.category === "rental") &&
              (tx.referenceId === rental._id ||
                tx.rental === rental._id ||
                tx.rental?._id === rental._id)
          );

          if (
            relatedTransaction?.paymentTiming === "advance" &&
            relatedTransaction?.advanceConfig
          ) {
            const totalAmount = rental.totalPrice || rental.amount || 0;
            const verifiedPaidAmount = getVerifiedPaidAmount(
              rental._id,
              "rental"
            );
            const remainingAmount = totalAmount - verifiedPaidAmount;

            // Only show if there's still a balance to pay
            if (remainingAmount > 0) {
              balances.push({
                id: rental._id,
                type: "rental",
                description: `Rental - ${rental.item?.name || "Item"}`,
                totalAmount,
                paidAmount: verifiedPaidAmount,
                remainingAmount,
                paymentTiming: "advance",
                dueDate: new Date(rental.startDate),
                status: rental.status,
              });
            }
          } else if (
            relatedTransaction?.paymentTiming === "split" &&
            relatedTransaction?.splitConfig
          ) {
            const totalAmount = rental.totalPrice || rental.amount || 0;
            const verifiedPaidAmount = getVerifiedPaidAmount(
              rental._id,
              "rental"
            );
            const remainingAmount = totalAmount - verifiedPaidAmount;

            // Only show if there's still a balance to pay
            if (remainingAmount > 0) {
              balances.push({
                id: rental._id,
                type: "rental",
                description: `Rental - ${rental.item?.name || "Item"}`,
                totalAmount,
                paidAmount: verifiedPaidAmount,
                remainingAmount,
                paymentTiming: "split",
                dueDate: relatedTransaction.splitConfig.parts?.[1]?.dueDate
                  ? new Date(relatedTransaction.splitConfig.parts[1].dueDate)
                  : undefined,
                status: rental.status,
              });
            }
          }
        }
      });
    }

    return balances;
  };

  const outstandingBalances = calculateOutstandingBalances();
  const totalOutstanding = outstandingBalances.reduce(
    (sum: number, balance: any) => sum + balance.remainingAmount,
    0
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Payments
        </CardTitle>
        <CardDescription>
          Payments that need to be completed and outstanding balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(() => {
          const pendingData = (pendingTransactions as any)?.data || [];
          const hasOutstandingBalances =
            (outstandingBalances as any[]).length > 0;

          if (pendingData.length === 0 && !hasOutstandingBalances) {
            return (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  All payments up to date
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don&apos;t have any pending payments or outstanding
                  balances.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              {/* Outstanding Balances Section */}
              {hasOutstandingBalances && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Total Outstanding Balance
                        </h4>
                        <p className="text-sm text-blue-700">
                          Amount remaining to be paid online
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          {currencyFormat(totalOutstanding)}
                        </div>
                        <div className="text-sm text-blue-700">
                          {(outstandingBalances as any[]).length} payment
                          {(outstandingBalances as any[]).length !== 1
                            ? "s"
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(outstandingBalances as any[]).map((balance: any) => (
                      <div
                        key={balance.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={
                                  balance.type === "booking"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {balance.type === "booking" ? (
                                  <Home className="w-3 h-3 mr-1" />
                                ) : (
                                  <Building2 className="w-3 h-3 mr-1" />
                                )}
                                {balance.type}
                              </Badge>
                              <Badge variant="outline">
                                {balance.paymentTiming}
                              </Badge>
                              <Badge
                                variant={
                                  balance.status === "confirmed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {balance.status}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {balance.description}
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Total:</span>
                                <div className="font-medium">
                                  {currencyFormat(balance.totalAmount)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Paid:</span>
                                <div className="font-medium text-green-600">
                                  {currencyFormat(balance.paidAmount)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Remaining:
                                </span>
                                <div className="font-medium text-red-600">
                                  {currencyFormat(balance.remainingAmount)}
                                </div>
                              </div>
                            </div>
                            {balance.dueDate && (
                              <div className="mt-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Due:{" "}
                                {(() => {
                                  try {
                                    return new Date(
                                      balance.dueDate
                                    ).toLocaleDateString();
                                  } catch (error) {
                                    return "Invalid date";
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Find the booking/rental details
                                const item =
                                  balance.type === "booking"
                                    ? (bookings as any)?.data?.find(
                                        (b: any) => b._id === balance.id
                                      )
                                    : (rentals as any)?.data?.find(
                                        (r: any) => r._id === balance.id
                                      );

                                if (item) {
                                  // Show details in a modal or navigate to details page
                                  console.log("Viewing details for:", item);
                                  // TODO: Implement proper details view
                                }
                              }}
                            >
                              <Receipt className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            {/* Only enable Pay Balance for online payments */}
                            {(() => {
                              const item =
                                balance.type === "booking"
                                  ? (bookings as any)?.data?.find(
                                      (b: any) => b._id === balance.id
                                    )
                                  : (rentals as any)?.data?.find(
                                      (r: any) => r._id === balance.id
                                    );

                              const isOnlinePayment =
                                item?.paymentMethod === "online" ||
                                item?.paymentMethod === "paystack";

                              return (
                                <Button
                                  size="sm"
                                  disabled={!isOnlinePayment}
                                  title={
                                    !isOnlinePayment
                                      ? "This payment must be completed at the facility"
                                      : "Pay remaining balance online"
                                  }
                                  onClick={() => {
                                    if (!isOnlinePayment) {
                                      toast({
                                        title: "Payment Method Mismatch",
                                        description:
                                          "This payment must be completed at the facility using cash or cheque as originally selected.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Pay Balance Online
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facility Payments Section */}
              {pendingData.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Payments to Complete at Facility
                    </h4>
                  </div>

                  {pendingData.map((transaction: any) => (
                    <div
                      key={transaction._id || transaction.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {transaction.type} Payment
                            </h4>
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                transaction.paymentMethod === "cash"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-blue-50 text-blue-700"
                              }
                            >
                              {transaction.paymentMethod === "cash"
                                ? "Cash"
                                : "Cheque"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>Amount:</strong>{" "}
                              {currencyFormat(transaction.amount)}
                            </p>
                            <p>
                              <strong>Created:</strong>{" "}
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </p>
                            {transaction.notes && (
                              <p>
                                <strong>Notes:</strong> {transaction.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {currencyFormat(transaction.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.paymentMethod === "cash"
                              ? "Pay with cash"
                              : "Pay with cheque"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium">
                              Payment Required at Facility
                            </p>
                            <p className="mt-1">
                              Please bring the exact amount in{" "}
                              {transaction.paymentMethod} when you arrive at the
                              facility. Your {transaction.type} will be
                              confirmed once payment is received.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

export default PaymentBalanceTracking;
