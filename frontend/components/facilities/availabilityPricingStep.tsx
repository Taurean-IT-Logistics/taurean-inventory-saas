"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import type { Facility } from "@/types";
import { TimePicker } from "@/components/ui/time-picker";

interface AvailabilityPricingStepProps {
  formData: Partial<Facility>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Facility>>>;
  updateAvailability: (index: number, field: string, value: any) => void;
}

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const AvailabilityPricingStep = ({
  formData,
  setFormData,
  updateAvailability,
}: AvailabilityPricingStepProps) => {
  React.useEffect(() => {
    if (!formData.availability || formData.availability.length !== 7) {
      setFormData((prev: Partial<Facility>) => ({
        ...prev,
        availability: DAYS.map((d, i) => ({
          day: d.value as
            | "monday"
            | "tuesday"
            | "wednesday"
            | "thursday"
            | "friday"
            | "saturday"
            | "sunday",
          startTime: prev.availability?.[i]?.startTime || "08:00",
          endTime: prev.availability?.[i]?.endTime || "17:00",
          isAvailable: prev.availability?.[i]?.isAvailable ?? true,
        })),
      }));
    }
  }, [setFormData, formData.availability]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          Step 3: Availability & Pricing
        </h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-semibold mb-4 block">
            Weekly Availability
          </Label>
          {formData.availability && formData.availability.length === 7 ? (
            <div className="space-y-3">
              {formData.availability.map((day, index) => (
                <Card key={day.day} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <Select value={day.day} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <TimePicker
                        value={day.startTime}
                        onChange={(time) =>
                          updateAvailability(index, "startTime", time)
                        }
                        placeholder="Start time"
                      />
                    </div>
                    <div>
                      <TimePicker
                        value={day.endTime}
                        onChange={(time) =>
                          updateAvailability(index, "endTime", time)
                        }
                        placeholder="End time"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`available-${index}`}
                        checked={day.isAvailable}
                        onCheckedChange={(checked) =>
                          updateAvailability(index, "isAvailable", checked)
                        }
                      />
                      <Label htmlFor={`available-${index}`}>Available</Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Loading weekly availability...
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-semibold">Pricing *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <Select
                value={formData.pricing?.[0]?.unit || "hour"}
                onValueChange={(value) =>
                  setFormData((prev: Partial<Facility>) => ({
                    ...prev,
                    pricing: [
                      {
                        unit: value as any,
                        amount: prev.pricing?.[0]?.amount || 0,
                        isDefault: true,
                      },
                    ],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Per Hour</SelectItem>
                  <SelectItem value="day">Per Day</SelectItem>
                  <SelectItem value="week">Per Week</SelectItem>
                  <SelectItem value="month">Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                ₵
              </span>
              <Input
                type="number"
                placeholder="Price amount"
                step="0.01"
                min="0"
                value={formData.pricing?.[0]?.amount || ""}
                onChange={(e) =>
                  setFormData((prev: Partial<Facility>) => ({
                    ...prev,
                    pricing: [
                      {
                        unit: prev.pricing?.[0]?.unit || "hour",
                        amount: Number(e.target.value),
                        isDefault: true,
                      },
                    ],
                  }))
                }
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="taxable"
              checked={formData.isTaxable}
              onCheckedChange={(checked) =>
                setFormData((prev: Partial<Facility>) => ({
                  ...prev,
                  isTaxable: Boolean(checked),
                }))
              }
            />
            <Label htmlFor="taxable">Tax Facility</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityPricingStep;
