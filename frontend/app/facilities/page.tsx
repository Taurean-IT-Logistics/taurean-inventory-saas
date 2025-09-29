"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import {
  Search,
  Filter,
  MapPin,
  Users,
  Star,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { FacilityCard } from "@/components/facilities/facility-card";
import { FacilitiesAPI, getResourceUrl } from "@/lib/api";
import type { Facility } from "@/types";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

interface FilterOptions {
  search: string;
  location: string;
  capacity: string;
  priceRange: string;
  amenities: string[];
  rating: string;
  availability: string;
}

const capacityOptions = [
  { value: "any", label: "Any Capacity" },
  { value: "1-10", label: "1-10 guests" },
  { value: "11-25", label: "11-25 guests" },
  { value: "26-50", label: "26-50 guests" },
  { value: "51-100", label: "51-100 guests" },
  { value: "100+", label: "100+ guests" },
];

const priceRangeOptions = [
  { value: "any", label: "Any Price" },
  { value: "0-50", label: "GHS0 - GHS50" },
  { value: "51-100", label: "GHS51 - GHS100" },
  { value: "101-200", label: "GHS101 - GHS200" },
  { value: "201-500", label: "GHS201 - GHS500" },
  { value: "500+", label: "GHS500+" },
];

function FacilitiesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => FacilitiesAPI.list(),
  });
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "name" | "price" | "rating" | "capacity"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    location: "",
    capacity: "any",
    priceRange: "any",
    amenities: [],
    rating: "any",
    availability: "any",
  });

  const allAmenities = React.useMemo(() => {
    try {
      const facilities = (data as any)?.data || (data as any)?.facilities || [];
      if (!Array.isArray(facilities) || facilities.length === 0) {
        return [];
      }

      const amenities = facilities
        .filter((f: any) => f?.amenities && Array.isArray(f.amenities))
        .flatMap((f: any) =>
          f.amenities.filter(
            (amenity: any) => amenity && typeof amenity === "string"
          )
        )
        .filter(Boolean);

      return Array.from(new Set(amenities)).sort();
    } catch (error) {
      console.error("Error processing amenities:", error);
      return [];
    }
  }, [data]);

  useEffect(() => {
    const applyFiltersAndSort = () => {
      try {
        const facilities =
          (data as any)?.data || (data as any)?.facilities || [];
        if (!Array.isArray(facilities)) {
          setFilteredFacilities([]);
          return;
        }

        let filtered = [...facilities];

        // Search
        if (filters.search?.trim()) {
          const searchTerm = filters.search.toLowerCase().trim();
          filtered = filtered.filter((facility) => {
            if (!facility) return false;

            const name = facility.name?.toLowerCase() || "";
            const description = facility.description?.toLowerCase() || "";
            const address = facility.location?.address?.toLowerCase() || "";

            return (
              name.includes(searchTerm) ||
              description.includes(searchTerm) ||
              address.includes(searchTerm)
            );
          });
        }

        // Location
        if (filters.location?.trim()) {
          const locationTerm = filters.location.toLowerCase().trim();
          filtered = filtered.filter((facility) =>
            facility?.location?.address?.toLowerCase().includes(locationTerm)
          );
        }

        // Capacity
        if (filters.capacity !== "any") {
          filtered = filtered.filter((facility) => {
            const capacity = facility?.capacity?.maximum;
            if (typeof capacity !== "number") return false;

            switch (filters.capacity) {
              case "1-10":
                return capacity >= 1 && capacity <= 10;
              case "11-25":
                return capacity >= 11 && capacity <= 25;
              case "26-50":
                return capacity >= 26 && capacity <= 50;
              case "51-100":
                return capacity >= 51 && capacity <= 100;
              case "100+":
                return capacity > 100;
              default:
                return true;
            }
          });
        }

        // Price
        if (filters.priceRange !== "any") {
          filtered = filtered.filter((facility) => {
            if (!facility?.pricing || !Array.isArray(facility.pricing))
              return false;

            const defaultPricing =
              facility.pricing.find((p: any) => p?.isDefault) ||
              facility.pricing[0];
            const price = defaultPricing?.amount || 0;

            switch (filters.priceRange) {
              case "0-50":
                return price >= 0 && price <= 50;
              case "51-100":
                return price >= 51 && price <= 100;
              case "101-200":
                return price >= 101 && price <= 200;
              case "201-500":
                return price >= 201 && price <= 500;
              case "500+":
                return price > 500;
              default:
                return true;
            }
          });
        }

        // Amenities
        if (filters.amenities?.length > 0) {
          filtered = filtered.filter((facility) => {
            if (!facility?.amenities || !Array.isArray(facility.amenities))
              return false;

            return filters.amenities.every((amenity) =>
              facility.amenities.includes(amenity)
            );
          });
        }

        // Rating
        if (filters.rating && filters.rating !== "any") {
          const minRating = Number.parseFloat(filters.rating);
          if (!isNaN(minRating)) {
            filtered = filtered.filter((facility) => {
              const rating = facility?.rating?.average;
              return typeof rating === "number" && rating >= minRating;
            });
          }
        }

        // Availability
        if (filters.availability && filters.availability !== "any") {
          filtered = filtered.filter((facility) => {
            if (filters.availability === "available")
              return facility?.isActive === true;
            if (filters.availability === "unavailable")
              return facility?.isActive === false;
            return true;
          });
        }

        // Sort
        filtered.sort((a, b) => {
          if (!a || !b) return 0;

          let aValue: string | number;
          let bValue: string | number;

          switch (sortBy) {
            case "name":
              aValue = a.name?.toLowerCase() || "";
              bValue = b.name?.toLowerCase() || "";
              break;
            case "price":
              aValue = a.pricing?.find((p: any) => p?.isDefault)?.amount || 0;
              bValue = b.pricing?.find((p: any) => p?.isDefault)?.amount || 0;
              break;
            case "rating":
              aValue = a.rating?.average || 0;
              bValue = b.rating?.average || 0;
              break;
            case "capacity":
              aValue = a.capacity?.maximum || 0;
              bValue = b.capacity?.maximum || 0;
              break;
            default:
              return 0;
          }

          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });

        setFilteredFacilities(filtered);
      } catch (error) {
        console.error("Error applying filters:", error);
        setFilteredFacilities([]);
      }
    };

    applyFiltersAndSort();
  }, [data, filters, sortBy, sortOrder]);

  const handleFilterChange = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    try {
      setFilters((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error("Error updating filter:", error);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    try {
      if (!amenity?.trim()) return;

      setFilters((prev) => ({
        ...prev,
        amenities: prev.amenities?.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...(prev.amenities || []), amenity],
      }));
    } catch (error) {
      console.error("Error toggling amenity:", error);
    }
  };

  const clearFilters = () => {
    try {
      setFilters({
        search: "",
        location: "",
        capacity: "any",
        priceRange: "any",
        amenities: [],
        rating: "any",
        availability: "any",
      });
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    try {
      if (sortBy === newSortBy) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(newSortBy);
        setSortOrder("asc");
      }
    } catch (error) {
      console.error("Error updating sort:", error);
    }
  };

  const retryFetch = () => {
    window.location.reload();
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading facilities..." />;
  }

  if (error) {
    return (
      <ErrorComponent
        title="Failed to Load Facilities"
        message={error.message}
        onRetry={retryFetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          filteredCount={filteredFacilities?.length || 0}
          totalCount={
            Array.isArray((data as any)?.data || (data as any)?.facilities)
              ? ((data as any)?.data || (data as any)?.facilities).length
              : 0
          }
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          allAmenities={allAmenities}
          onAmenityToggle={handleAmenityToggle}
          clearFilters={clearFilters}
        />

        <SortBar
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          resultCount={filteredFacilities?.length || 0}
        />

        <FacilitiesList
          filteredFacilities={filteredFacilities || []}
          viewMode={viewMode}
          clearFilters={clearFilters}
        />

        {filteredFacilities && filteredFacilities.length > 0 && (
          <div className="flex justify-center pt-8">
            <Button variant="outline" size="lg">
              Load More Facilities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({
  filteredCount,
  totalCount,
  viewMode,
  setViewMode,
}: {
  filteredCount: number;
  totalCount: number;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          All Facilities
        </h1>
        <p className="text-gray-600">
          Discover {filteredCount} of {totalCount} available spaces
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("grid")}
          aria-label="Grid view"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FiltersBar({
  filters,
  onFilterChange,
  showFilters,
  setShowFilters,
  allAmenities,
  onAmenityToggle,
  clearFilters,
}: {
  filters: FilterOptions;
  onFilterChange: <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  allAmenities: string[];
  onAmenityToggle: (amenity: string) => void;
  clearFilters: () => void;
}) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search facilities..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Select
            value={filters.capacity || "any"}
            onValueChange={(value) => onFilterChange("capacity", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Capacity" />
            </SelectTrigger>
            <SelectContent>
              {capacityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filters.priceRange || "any"}
            onValueChange={(value) => onFilterChange("priceRange", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              {priceRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter location..."
                  value={filters.location || ""}
                  onChange={(e) => onFilterChange("location", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <Select
                value={filters.rating || "any"}
                onValueChange={(value) => onFilterChange("rating", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  <SelectItem value="3.0">3.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <Select
                value={filters.availability || "any"}
                onValueChange={(value) => onFilterChange("availability", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {allAmenities.slice(0, 8).map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={filters.amenities?.includes(amenity) || false}
                      onCheckedChange={() => onAmenityToggle(amenity)}
                    />
                    <label
                      htmlFor={`amenity-${amenity}`}
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SortBar({
  sortBy,
  sortOrder,
  onSort,
  resultCount,
}: {
  sortBy: "name" | "price" | "rating" | "capacity";
  sortOrder: "asc" | "desc";
  onSort: (sortBy: "name" | "price" | "rating" | "capacity") => void;
  resultCount: number;
}) {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <p className="text-gray-600">
        Showing {resultCount} result{resultCount !== 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Sort by:</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={sortBy === "name" ? "default" : "outline"}
            onClick={() => onSort("name")}
            className="text-xs"
          >
            Name {getSortIcon("name")}
          </Button>
          <Button
            size="sm"
            variant={sortBy === "price" ? "default" : "outline"}
            onClick={() => onSort("price")}
            className="text-xs"
          >
            Price {getSortIcon("price")}
          </Button>
          <Button
            size="sm"
            variant={sortBy === "rating" ? "default" : "outline"}
            onClick={() => onSort("rating")}
            className="text-xs"
          >
            Rating {getSortIcon("rating")}
          </Button>
          <Button
            size="sm"
            variant={sortBy === "capacity" ? "default" : "outline"}
            onClick={() => onSort("capacity")}
            className="text-xs"
          >
            Capacity {getSortIcon("capacity")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FacilitiesList({
  filteredFacilities,
  viewMode,
  clearFilters,
}: {
  filteredFacilities: Facility[];
  viewMode: "grid" | "list";
  clearFilters: () => void;
}) {
  if (!Array.isArray(filteredFacilities) || filteredFacilities.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No facilities found
        </h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your search criteria or filters
        </p>
        <Button onClick={clearFilters}>Clear Filters</Button>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFacilities.map((facility, index) => {
          if (!facility) return null;

          return (
            <FacilityCard
              key={facility._id || `facility-${index}`}
              facility={facility}
            />
          );
        })}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      {filteredFacilities.map((facility, index) => {
        if (!facility) return null;

        return (
          <FacilityListItem
            key={facility._id || `facility-${index}`}
            facility={facility}
          />
        );
      })}
    </div>
  );
}

function FacilityListItem({ facility }: { facility: Facility }) {
  if (!facility) return null;

  const defaultPricing =
    facility.pricing?.find((p) => p?.isDefault) || facility.pricing?.[0];
  const facilityImage =
    facility.images?.[0]?.path || "/placeholder.svg?height=150&width=200";
  const facilityName = facility.name || "Unnamed Facility";
  const facilityDescription =
    facility.description || "No description available";
  const facilityAddress = facility.location?.address || "Address not available";
  const facilityCapacity = facility.capacity?.maximum || 0;
  const facilityRating = facility.rating?.average;
  const facilityReviews = facility.rating?.totalReviews || 0;

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="md:col-span-1">
          <Image
            src={getResourceUrl(facilityImage) || "/placeholder.svg"}
            alt={facilityName}
            width={200}
            height={150}
            className="w-full h-40 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg?height=150&width=200";
            }}
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">
            {facilityName}
          </h3>
          <p className="text-gray-600 line-clamp-2">{facilityDescription}</p>

          <div className="space-y-2">
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{facilityAddress}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">Up to {facilityCapacity} guests</span>
            </div>
            {facilityRating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{facilityRating}</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({facilityReviews} reviews)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1 text-right space-y-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {defaultPricing?.amount ? `$${defaultPricing.amount}` : "Contact"}
            </div>
            {defaultPricing?.unit && (
              <div className="text-sm text-gray-500">
                per {defaultPricing.unit}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <a href={`/facility/${facility._id}`}>View Details</a>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href={`/facility/${facility._id}/book`}>Book Now</a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default FacilitiesPage;
