"use client";

import { RentalCard } from "./rental-card";
import type { InventoryItem } from "@/types";
import { RentalCardSkeleton } from "./rental-card-skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface RentalGridProps {
  title: string;
  rentals: InventoryItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onFavoriteToggle?: (rentalId: string) => void;
}

export function RentalGrid({
  title,
  rentals,
  isLoading = false,
  error = null,
  onRetry,
  onFavoriteToggle,
}: RentalGridProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">{error}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/rentals"
            className="text-2xl font-semibold text-slate-900 hover:underline cursor-pointer"
          >
            {title} &gt;
          </Link>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors">
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <RentalCardSkeleton key={index} />
              ))
            : rentals &&
              rentals.map((rental) => (
                <RentalCard key={rental._id} rental={rental} />
              ))}
        </div>

        {!isLoading && rentals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No facilities found in this area.</p>
          </div>
        )}
      </div>
    </section>
  );
}
