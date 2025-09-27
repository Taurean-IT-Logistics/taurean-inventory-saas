"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { TaxSchedule, Tax } from "@/types";

interface TaxScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (scheduleData: Partial<TaxSchedule>) => Promise<void>;
  schedule?: TaxSchedule | null;
  isEdit: boolean;
  isLoading: boolean;
  availableTaxes: Tax[];
}

const TaxScheduleModal = ({
  open,
  onClose,
  onSave,
  schedule,
  isEdit,
  isLoading,
  availableTaxes,
}: TaxScheduleModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    effectiveDate: "",
    expiryDate: "",
    isActive: true,
    appliesTo: "all" as "all" | "facilities" | "inventory" | "subscriptions",
    selectedTaxes: [] as string[],
    taxInclusive: false,
    taxExclusive: true, // Default to exclusive
    taxOnTax: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && schedule) {
      setFormData({
        name: schedule.name || "",
        description: schedule.description || "",
        type: schedule.type || "percentage",
        value: schedule.value || 0,
        effectiveDate: schedule.effectiveDate
          ? new Date(schedule.effectiveDate).toISOString().split("T")[0]
          : "",
        expiryDate: schedule.expiryDate
          ? new Date(schedule.expiryDate).toISOString().split("T")[0]
          : "",
        isActive: schedule.isActive ?? true,
        appliesTo: schedule.appliesTo || "all",
        selectedTaxes: [], // This would be populated from the schedule's tax references
        taxInclusive: (schedule as any).taxInclusive || false,
        taxExclusive: (schedule as any).taxExclusive ?? true,
        taxOnTax: (schedule as any).taxOnTax || false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        type: "percentage",
        value: 0,
        effectiveDate: "",
        expiryDate: "",
        isActive: true,
        appliesTo: "all",
        selectedTaxes: [],
        taxInclusive: false,
        taxExclusive: true, // Default to exclusive
        taxOnTax: false,
      });
    }
    setErrors({});
  }, [isEdit, schedule, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Schedule name is required";
    }

    if (formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required";
    }

    if (formData.expiryDate && formData.effectiveDate) {
      const effectiveDate = new Date(formData.effectiveDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= effectiveDate) {
        newErrors.expiryDate = "Expiry date must be after effective date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const scheduleData = {
        ...formData,
        effectiveDate: new Date(formData.effectiveDate),
        expiryDate: formData.expiryDate
          ? new Date(formData.expiryDate)
          : undefined,
        value: Number(formData.value),
      };

      await onSave(scheduleData);
    } catch (error) {
      console.error("Error saving tax schedule:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTaxToggle = (taxId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTaxes: prev.selectedTaxes.includes(taxId)
        ? prev.selectedTaxes.filter((id) => id !== taxId)
        : [...prev.selectedTaxes, taxId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEdit ? "Edit Tax Schedule" : "Create Tax Schedule"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the tax schedule details below."
              : "Create a new tax schedule by selecting taxes and setting effective dates."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Schedule Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Q1 2024 Tax Schedule"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="appliesTo">Applies To</Label>
              <Select
                value={formData.appliesTo}
                onValueChange={(value) => handleInputChange("appliesTo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="facilities">Facilities Only</SelectItem>
                  <SelectItem value="inventory">Inventory Only</SelectItem>
                  <SelectItem value="subscriptions">
                    Subscriptions Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description for this tax schedule"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Schedule Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Percentage
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fixed Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                placeholder={formData.type === "percentage" ? "15.5" : "25.00"}
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value}</p>
              )}
              <p className="text-xs text-gray-500">
                {formData.type === "percentage"
                  ? "Enter percentage (e.g., 15.5 for 15.5%)"
                  : "Enter fixed amount (e.g., 25.00)"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  handleInputChange("effectiveDate", e.target.value)
                }
                className={errors.effectiveDate ? "border-red-500" : ""}
              />
              {errors.effectiveDate && (
                <p className="text-sm text-red-500">{errors.effectiveDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  handleInputChange("expiryDate", e.target.value)
                }
                className={errors.expiryDate ? "border-red-500" : ""}
              />
              {errors.expiryDate && (
                <p className="text-sm text-red-500">{errors.expiryDate}</p>
              )}
              <p className="text-xs text-gray-500">
                Optional - leave blank for no expiry
              </p>
            </div>
          </div>

          {/* Tax Calculation Settings for this Schedule */}
          <div className="space-y-4">
            <Label>Tax Calculation Settings</Label>
            <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduleTaxInclusive"
                  checked={formData.taxInclusive || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // When inclusive is checked, uncheck exclusive
                      handleInputChange("taxInclusive", true);
                      handleInputChange("taxExclusive", false);
                    } else {
                      handleInputChange("taxInclusive", false);
                    }
                  }}
                />
                <label
                  htmlFor="scheduleTaxInclusive"
                  className="text-sm font-medium"
                >
                  Tax Inclusive
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduleTaxExclusive"
                  checked={formData.taxExclusive || true}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // When exclusive is checked, uncheck inclusive
                      handleInputChange("taxExclusive", true);
                      handleInputChange("taxInclusive", false);
                    } else {
                      handleInputChange("taxExclusive", false);
                    }
                  }}
                />
                <label
                  htmlFor="scheduleTaxExclusive"
                  className="text-sm font-medium"
                >
                  Tax Exclusive
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduleTaxOnTax"
                  checked={formData.taxOnTax || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("taxOnTax", checked)
                  }
                />
                <label
                  htmlFor="scheduleTaxOnTax"
                  className="text-sm font-medium"
                >
                  Tax on Tax
                </label>
              </div>

              <div className="text-xs text-gray-500 ml-auto">
                Choose either inclusive OR exclusive (not both)
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Select Taxes for This Schedule</Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
              {availableTaxes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No taxes available. Create some taxes first.
                </p>
              ) : (
                availableTaxes.map((tax) => (
                  <div key={tax._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tax-${tax._id}`}
                      checked={formData.selectedTaxes.includes(tax._id)}
                      onChange={() => handleTaxToggle(tax._id)}
                      className="rounded"
                    />
                    <label
                      htmlFor={`tax-${tax._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                    >
                      {tax.name} ({tax.rate}%)
                    </label>
                    <span className="text-xs text-gray-500">
                      {tax.isSuperAdminTax ? "Global" : "Company"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Active Schedule</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEdit
                ? "Update Schedule"
                : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaxScheduleModal;
