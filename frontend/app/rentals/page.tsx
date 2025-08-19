"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import type { InventoryItem } from "@/types";
import { RentalCard } from "@/components/rentals/rental-card";
import { InventoryAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { RentalGrid } from "@/components/rentals/rental-grid";

const RentalPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["rentals"],
    queryFn: () => InventoryAPI.list(),
  });

  let rentals = data as InventoryItem[] | undefined;

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("available");

  // Safe filtering with null checks
  const filteredItems = (rentals || []).filter((item: any) => {
    if (!item || !item._id || !item.name) return false;

    const matchesSearch =
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" &&
        item.status === "in_stock" &&
        (item.quantity || 0) > 0) ||
      (statusFilter === "unavailable" &&
        (item.status !== "in_stock" || (item.quantity || 0) === 0));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Safe category extraction with null checks
  const categories = Array.from(
    new Set(
      (rentals || [])
        .filter((item) => item && item.category)
        .map((item) => item.category)
    )
  );

  // Safe featured items filtering
  const featuredItems = (rentals || []).filter(
    (item) => item && item.status === "in_stock" && (item.quantity || 0) > 0
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("available");
  };

  const hasActiveFilters =
    searchTerm || categoryFilter !== "all" || statusFilter !== "available";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Loader text="Loading inventory..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <ErrorComponent
          title="Failed to Load Inventory"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      <div className="container mx-auto px-10 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Item Rental
            </h1>
            <p className="text-gray-600">Find and rent the item you need</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2 bg-transparent"
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>
                  {filteredItems.length} of {rentals?.length || 0} items shown
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <RentalCard key={item._id} rental={item} />
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {rentals?.length === 0
                  ? "No inventory items available"
                  : "No equipment found"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {rentals?.length === 0
                  ? "Please check back later or contact support."
                  : "Try adjusting your search criteria to find what you're looking for."}
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RentalPage;
