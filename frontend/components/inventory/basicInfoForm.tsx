"use client";

import type React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Facility, InventoryItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { FacilitiesAPI } from "@/lib/api";

interface BasicInfoFormProps {
  formData: Partial<InventoryItem>;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFacilityChange: (facilityId: string) => void;
}

const BasicInfoForm = ({
  formData,
  onInputChange,
  onFacilityChange,
}: BasicInfoFormProps) => {
  const categories = [
    "AV Equipment",
    "Furniture",
    "IT Equipment",
    "Kitchen Appliances",
    "Cleaning Supplies",
    "Office Supplies",
    "Safety Equipment",
    "Decorative Items",
    "Other",
  ];

  const {
    data: facilities,
    isLoading: facilitiesLoading,
    error: facilitiesError,
  } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => FacilitiesAPI.listCompany(),
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalizedValue = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: "category",
        value: capitalizedValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onInputChange(syntheticEvent);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <Label>Item Name *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={onInputChange}
              required
              placeholder="Enter item name"
            />
          </div>
          <div>
            <Label>SKU</Label>
            <Input
              type="text"
              name="sku"
              value={formData.sku || ""}
              onChange={onInputChange}
              placeholder="Enter SKU"
            />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            name="description"
            value={formData.description || ""}
            onChange={onInputChange}
            rows={3}
            placeholder="Describe the item..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Category *</Label>
            <Input
              type="text"
              name="category"
              value={formData.category || ""}
              onChange={handleCategoryChange}
              list="category-options"
              placeholder="Select or type a category"
              required
            />
            <datalist id="category-options">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity || ""}
              onChange={onInputChange}
              required
              min="0"
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status || ""}
              onValueChange={(value) => {
                const syntheticEvent = {
                  target: { name: "status", value },
                } as React.ChangeEvent<HTMLSelectElement>;
                onInputChange(syntheticEvent);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Associated Facility</Label>
          {facilitiesLoading ? (
            <div className="flex items-center space-x-2 p-2 border rounded">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading facilities...</span>
            </div>
          ) : facilitiesError ? (
            <div className="flex items-center space-x-2 p-2 border border-yellow-300 rounded text-yellow-700">
              <AlertTriangle className="w-4 h-4" />
              <span>{facilitiesError.message}</span>
            </div>
          ) : (
            <Select
              value={formData.associatedFacility}
              onValueChange={onFacilityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facility (optional)" />
              </SelectTrigger>
              <SelectContent>
                {facilities?.facilities?.map((facility) => (
                  <SelectItem key={facility._id} value={facility._id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoForm;
