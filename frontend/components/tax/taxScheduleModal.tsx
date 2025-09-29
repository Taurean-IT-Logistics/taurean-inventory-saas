"use client";

import { useState, useEffect } from "react";
import { Calendar, Percent, DollarSign } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";
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
    effectiveDate: undefined as Date | undefined,
    expiryDate: undefined as Date | undefined,
    isActive: true,
    appliesTo: "all" as "all" | "facilities" | "inventory" | "subscriptions",
    selectedTaxes: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total tax from selected taxes
  const calculateTotalTax = () => {
    if (formData.selectedTaxes.length === 0)
      return { percentage: 0, fixedAmount: 0 };

    const selectedTaxes = availableTaxes.filter((tax) =>
      formData.selectedTaxes.includes(tax._id)
    );

    const percentageTotal = selectedTaxes
      .filter((tax) => tax.taxType === "percentage" || !tax.taxType)
      .reduce((total, tax) => total + tax.rate, 0);

    const fixedAmountTotal = selectedTaxes
      .filter((tax) => tax.taxType === "fixed_amount")
      .reduce((total, tax) => total + (tax.fixedAmount || 0), 0);

    return { percentage: percentageTotal, fixedAmount: fixedAmountTotal };
  };

  const totalTax = calculateTotalTax();

  useEffect(() => {
    if (isEdit && schedule) {
      setFormData({
        name: schedule.name || "",
        description: schedule.description || "",
        effectiveDate: schedule.effectiveDate
          ? new Date(schedule.effectiveDate)
          : undefined,
        expiryDate: schedule.expiryDate
          ? new Date(schedule.expiryDate)
          : undefined,
        isActive: schedule.isActive ?? true,
        appliesTo: schedule.appliesTo || "all",
        selectedTaxes: schedule.components
          ? schedule.components.map((tax) => tax._id)
          : [], // Extract tax IDs from components
      });
    } else {
      setFormData({
        name: "",
        description: "",
        effectiveDate: undefined,
        expiryDate: undefined,
        isActive: true,
        appliesTo: "all",
        selectedTaxes: [],
      });
    }
    setErrors({});
  }, [isEdit, schedule, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Schedule name is required";
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required";
    }

    if (formData.expiryDate && formData.effectiveDate) {
      if (formData.expiryDate <= formData.effectiveDate) {
        newErrors.expiryDate = "Expiry date must be after effective date";
      }
    }

    if (formData.selectedTaxes.length === 0) {
      newErrors.selectedTaxes = "At least one tax must be selected";
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
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate,
        components: formData.selectedTaxes
          .map((taxId) => availableTaxes.find((tax) => tax._id === taxId))
          .filter(Boolean) as Tax[], // Map tax IDs to Tax objects
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
              <Label>Effective Date *</Label>
              <DatePicker
                date={formData.effectiveDate}
                onDateChange={(date) =>
                  handleInputChange("effectiveDate", date)
                }
                placeholder="Select effective date"
                className={errors.effectiveDate ? "border-red-500" : ""}
              />
              {errors.effectiveDate && (
                <p className="text-sm text-red-500">{errors.effectiveDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <DatePicker
                date={formData.expiryDate}
                onDateChange={(date) => handleInputChange("expiryDate", date)}
                placeholder="Select expiry date (optional)"
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Taxes for This Schedule</Label>
              {(totalTax.percentage > 0 || totalTax.fixedAmount > 0) && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {totalTax.percentage > 0 && (
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      <span className="font-medium">
                        Total Rate: {totalTax.percentage.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {totalTax.fixedAmount > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        Fixed Amount: GHS {totalTax.fixedAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                      {tax.name} (
                      {tax.taxType === "fixed_amount"
                        ? `GHS ${tax.fixedAmount}`
                        : `${tax.rate}%`}
                      )
                    </label>
                    <span className="text-xs text-gray-500">
                      {tax.isSuperAdminTax ? "Global" : "Company"}
                    </span>
                  </div>
                ))
              )}
            </div>
            {errors.selectedTaxes && (
              <p className="text-sm text-red-500">{errors.selectedTaxes}</p>
            )}
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
            {!isEdit && availableTaxes.length === 0 && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                <strong>Cannot create schedule:</strong> No taxes are available.
                Please create some taxes first before creating a tax schedule.
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (!isEdit && availableTaxes.length === 0)}
              >
                {isLoading
                  ? "Saving..."
                  : isEdit
                  ? "Update Schedule"
                  : "Create Schedule"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaxScheduleModal;
