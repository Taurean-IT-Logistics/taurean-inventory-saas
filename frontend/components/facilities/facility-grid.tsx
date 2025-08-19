"use client";

import { FacilityCard } from "./facility-card";
import type { Facility } from "@/types";
import { FacilityCardSkeleton } from "./facility-card-skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface FacilityGridProps {
  title: string;
  facilities?: Facility[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function FacilityGrid({
  title,
  facilities = [],
  isLoading = false,
  error,
  onRetry,
}: FacilityGridProps) {
  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Failed to load facilities
            </h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button
              onClick={onRetry}
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
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
                <FacilityCardSkeleton key={index} />
              ))
            : facilities &&
              facilities.map((facility) => (
                <FacilityCard key={facility._id} facility={facility} />
              ))}
        </div>

        {!isLoading && facilities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No facilities found in this area.</p>
          </div>
        )}
      </div>
    </section>
  );
}
