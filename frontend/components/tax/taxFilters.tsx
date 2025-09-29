"use client";

import { Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TaxFiltersProps {
  filters: {
    search: string;
    status: string;
    type: string;
  };
  onFiltersChange: (filters: any) => void;
  isSuperAdmin?: boolean;
}

const TaxFilters = ({
  filters,
  onFiltersChange,
  isSuperAdmin = false,
}: TaxFiltersProps) => {
  const handleInputChange = (name: string, value: string) => {
    onFiltersChange({ ...filters, [name]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      status: "",
      type: "",
    });
  };

  return (
    <Card className="border-gray-200 mb-6">
      <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h6 className="font-semibold">Filters</h6>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or type..."
              value={filters.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
              className="border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Tax Type</Label>
            <Input
              id="type"
              placeholder="Filter by type..."
              value={filters.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="border-gray-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxFilters;
