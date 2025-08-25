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
  });

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
      });
    }
  }, [tax, isEdit, show]);

  const handleInputChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rate" ? Number.parseFloat(value as string) || 0 : value,
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

    onSave(taxData as Tax);
    onHide();
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tax" : "Create New Tax"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                <Label htmlFor="rate">Rate (%) *</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate || ""}
                  onChange={(e) => handleInputChange("rate", e.target.value)}
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
              {isEdit ? "Update Tax" : "Create Tax"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaxModal;
