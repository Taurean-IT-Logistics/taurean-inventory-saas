"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { Tax } from "@/types";
import { useAuth } from "../AuthProvider";

interface TaxModalProps {
  tax: Tax | null;
  show: boolean;
  onHide: () => void;
  onSave: (tax: Tax) => void;
  isEdit?: boolean;
}

const TaxModal = ({
  tax,
  show,
  onHide,
  onSave,
  isEdit = false,
}: TaxModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Tax>>({
    name: "",
    rate: 0,
    type: "",
    appliesTo: "both",
    isSuperAdminTax: false,
    active: true,
    taxType: "percentage",
    fixedAmount: 0,
  });
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (tax && isEdit) {
      setFormData({ ...tax });
    } else {
      setFormData({
        name: "",
        rate: 0,
        type: "",
        appliesTo: "both",
        active: true,
        taxType: "percentage",
        fixedAmount: 0,
      });
    }
    setReason("");
  }, [tax, isEdit, show]);

  const handleInputChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "rate" || name === "fixedAmount"
          ? Number.parseFloat(value as string) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taxData: Partial<Tax> = {
      name: formData.name || "",
      rate: formData.rate || 0,
      type: formData.type || "",
      appliesTo: formData.appliesTo || "both",
      active: formData.active !== undefined ? formData.active : true,
      createdAt: isEdit ? tax?.createdAt : new Date(),
      updatedAt: new Date(),
    };

    // If editing, include the reason for creating a new version
    if (isEdit && reason) {
      (taxData as any).reason = reason;
    }

    onSave(taxData as Tax);
    onHide();
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Create New Independent Tax" : "Create New Tax"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {isEdit && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    Creating Independent Tax
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  This will create a completely new independent tax and archive
                  the current one. The current tax will remain accessible for
                  existing transactions to maintain audit integrity.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tax Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., VAT, Sales Tax"
                  required
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="rate">
                  {formData.taxType === "fixed_amount"
                    ? "Fixed Amount (GHS) *"
                    : "Rate (%) *"}
                </Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.taxType === "fixed_amount" ? undefined : "100"}
                  value={
                    formData.taxType === "fixed_amount"
                      ? formData.fixedAmount || ""
                      : formData.rate || ""
                  }
                  onChange={(e) =>
                    handleInputChange(
                      formData.taxType === "fixed_amount"
                        ? "fixedAmount"
                        : "rate",
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  required
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tax Type *</Label>
                <Input
                  id="type"
                  value={formData.type || ""}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  placeholder="e.g., Federal, State, Local"
                  required
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="appliesTo">Applies To *</Label>
                <Select
                  value={formData.appliesTo || "both"}
                  onValueChange={(value) =>
                    handleInputChange("appliesTo", value)
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory_item">
                      Inventory Items Only
                    </SelectItem>
                    <SelectItem value="facility">Facilities Only</SelectItem>
                    <SelectItem value="both">
                      Both Inventory & Facilities
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxType">Tax Calculation Type *</Label>
                <Select
                  value={formData.taxType || "percentage"}
                  onValueChange={(value) => handleInputChange("taxType", value)}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">
                      Fixed Amount (GHS)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>{/* Empty div for grid layout */}</div>
            </div>

            {isEdit && (
              <div>
                <Label htmlFor="reason">Reason for New Independent Tax *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Rate increase, regulatory change, etc."
                  required
                  rows={3}
                  className="border-gray-300"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active || false}
                onCheckedChange={(checked) =>
                  handleInputChange("active", checked)
                }
              />
              <Label htmlFor="active">
                Active (Tax will be applied to applicable transactions)
              </Label>
            </div>
            {user?.isSuperAdmin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isSuperAdminTax"
                  checked={formData.isSuperAdminTax || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("isSuperAdminTax", checked)
                  }
                />

                <Label htmlFor="isSuperAdminTax">
                  Super Admin Tax (Tax will be applied to all transactions)
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Create New Independent Tax" : "Create Tax"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaxModal;
