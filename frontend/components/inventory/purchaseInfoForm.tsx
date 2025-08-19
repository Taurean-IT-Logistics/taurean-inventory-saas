"use client";

import type React from "react";

import type { InventoryItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PurchaseInfoFormProps {
  formData: Partial<InventoryItem>;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const PurchaseInfoForm = ({
  formData,
  onInputChange,
}: PurchaseInfoFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Purchase Date</Label>
            <Input
              type="date"
              name="purchaseInfo.purchaseDate"
              value={
                formData.purchaseInfo?.purchaseDate
                  ? new Date(formData.purchaseInfo.purchaseDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={onInputChange}
            />
          </div>
          <div>
            <Label>Purchase Price</Label>
            <Input
              type="number"
              name="purchaseInfo.purchasePrice"
              value={formData.purchaseInfo?.purchasePrice || ""}
              onChange={onInputChange}
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input
              type="text"
              name="purchaseInfo.supplier"
              value={formData.purchaseInfo?.supplier || ""}
              onChange={onInputChange}
              placeholder="Enter supplier name"
            />
          </div>
          <div>
            <Label>Warranty Expiry</Label>
            <Input
              type="date"
              name="purchaseInfo.warrantyExpiry"
              value={
                formData.purchaseInfo?.warrantyExpiry
                  ? new Date(formData.purchaseInfo.warrantyExpiry)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={onInputChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseInfoForm;
