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
import { Home, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ErrorComponent } from "@/components/ui/error";

interface RentalsSectionProps {
  rentals: any;
  rentalsError: any;
  rentalsLoading: boolean;
}

const RentalsSection: React.FC<RentalsSectionProps> = ({
  rentals,
  rentalsError,
  rentalsLoading,
}) => {
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            My Rentals
          </CardTitle>
          <CardDescription>
            View your active and completed equipment rentals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rentalsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading your rentals...
              </p>
            </div>
          ) : rentalsError ? (
            <ErrorComponent
              title="Error loading rentals"
              message={
                (rentalsError as any)?.message || "Failed to load rentals"
              }
            />
          ) : !rentals ||
            !(rentals as any).rentals ||
            (rentals as any).rentals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No rentals found</p>
              <p className="text-sm">
                You haven&apos;t rented any equipment yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(rentals as any).rentals.map((rental: any) => (
                <div key={rental._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {rental.item?.name || "Unknown Item"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {rental.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Amount: ₵{rental.amount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rental.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : rental.status === "returned"
                            ? "bg-green-100 text-green-800"
                            : rental.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rental.status?.charAt(0).toUpperCase() +
                          rental.status?.slice(1)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(rental.startDate).toLocaleDateString()} -{" "}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support
          </CardTitle>
          <CardDescription>Get help and support from our team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Support assistance available</p>
            <p className="text-sm">
              Use the chat widget in the bottom-right corner for immediate
              support
            </p>
            <div className="mt-4">
              <Button asChild className="flex items-center gap-2">
                <Link href="/support">
                  <MessageSquare className="h-4 w-4" />
                  Visit Support Page
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default RentalsSection;
