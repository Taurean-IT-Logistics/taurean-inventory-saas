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
import { RentalGrid } from "@/components/rentals/rental-grid";
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
            Available Rentals
          </CardTitle>
          <CardDescription>
            Browse and rent equipment for your events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rentalsError ? (
            <ErrorComponent
              title="Error loading rentals"
              message={
                (rentalsError as any)?.message || "Failed to load rentals"
              }
            />
          ) : (
            <RentalGrid
              title="Available Equipment"
              rentals={(rentals as any) || []}
              isLoading={rentalsLoading}
              error={
                (rentalsError as any)?.message || "Error loading rentals"
              }
            />
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support
          </CardTitle>
          <CardDescription>
            Get help and support from our team
          </CardDescription>
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
