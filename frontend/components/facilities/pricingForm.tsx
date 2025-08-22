"use client";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface PricingOption {
  unit: "hour" | "day" | "week" | "month";
  amount: number;
  isDefault: boolean;
}

interface Facility {
  pricing?: PricingOption[];
  [key: string]: any;
}

interface PricingFormProps {
  formData: Partial<Facility>;
  setFormData: (data: Partial<Facility>) => void;
}

const PricingForm = ({ formData, setFormData }: PricingFormProps) => {
  const pricing = formData.pricing || [];

  const handlePricingChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedPricing = [...pricing];
    if (field === "amount") {
      updatedPricing[index] = {
        ...updatedPricing[index],
        amount: value === "" ? 0 : Number(value),
      };
    } else if (field === "unit") {
      updatedPricing[index] = {
        ...updatedPricing[index],
        unit: value as "hour" | "day" | "week" | "month",
      };
    } else {
      updatedPricing[index] = {
        ...updatedPricing[index],
        [field]: value,
      };
    }
    setFormData((prev: any) => ({ ...prev, pricing: updatedPricing }));
  };

  const handleAddPricing = () => {
    const newPricing = {
      unit: "hour" as "hour" | "day" | "week" | "month",
      amount: 0,
      isDefault: false,
    };
    setFormData((prev: any) => ({
      ...prev,
      pricing: [...pricing, newPricing],
    }));
  };

  const handleRemovePricing = (index: number) => {
    const updatedPricing = pricing.filter((_, i) => i !== index);
    setFormData((prev: any) => ({ ...prev, pricing: updatedPricing }));
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pricing Information</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPricing}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pricing
        </Button>
      </CardHeader>
      <CardContent>
        {pricing.length === 0 ? (
          <p className="text-muted-foreground">
            No pricing information added yet.
          </p>
        ) : (
          pricing.map((price, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h6 className="font-medium">Pricing Option {index + 1}</h6>
                {pricing.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePricing(index)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={price.unit || ""}
                    onValueChange={(value) =>
                      handlePricingChange(index, "unit", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={price.amount || ""}
                    onChange={(e) =>
                      handlePricingChange(index, "amount", e.target.value)
                    }
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id={`isDefault-${index}`}
                    checked={price.isDefault || false}
                    onCheckedChange={(checked) =>
                      handlePricingChange(index, "isDefault", checked)
                    }
                  />
                  <Label htmlFor={`isDefault-${index}`}>Default Pricing</Label>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="tax"
            checked={formData.isTaxable || false}
            onCheckedChange={(checked) =>
              setFormData((prev: any) => ({
                ...prev,
                isTaxable: Boolean(checked),
              }))
            }
          />
          <Label htmlFor="tax">Tax Item</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingForm;
