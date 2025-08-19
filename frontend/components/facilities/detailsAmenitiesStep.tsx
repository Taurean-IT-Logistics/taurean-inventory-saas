"use client";

import type React from "react";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { Facility } from "@/types";

interface DetailsAmenitiesStepProps {
  formData: Partial<Facility>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newAmenity: string;
  setNewAmenity: (value: string) => void;
  addAmenity: () => void;
  removeAmenity: (index: number) => void;
}

const DetailsAmenitiesStep = ({
  formData,
  handleInputChange,
  newAmenity,
  setNewAmenity,
  addAmenity,
  removeAmenity,
}: DetailsAmenitiesStepProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">Step 2: Details & Amenities</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="opening" className="text-sm font-semibold">
              Opening Time *
            </Label>
            <Input
              id="opening"
              type="time"
              name="operationalHours.opening"
              value={formData.operationalHours?.opening || ""}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="closing" className="text-sm font-semibold">
              Closing Time *
            </Label>
            <Input
              id="closing"
              type="time"
              name="operationalHours.closing"
              value={formData.operationalHours?.closing || ""}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">Amenities</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add an amenity"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAmenity();
                }
              }}
            />
            <Button onClick={addAmenity} disabled={!newAmenity.trim()}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {formData.amenities?.map((amenity, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <span>{amenity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => removeAmenity(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          {(!formData.amenities || formData.amenities.length === 0) && (
            <small className="text-muted-foreground">
              No amenities added yet.
            </small>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailsAmenitiesStep;
