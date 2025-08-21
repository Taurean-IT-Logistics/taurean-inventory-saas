"use client";

import type React from "react";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Loader2 } from "lucide-react";
import type { Facility } from "@/types";
import Image from "next/image";

interface BasicInfoStepProps {
  formData: Partial<Facility>;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleImageUpload: (files: FileList) => void;
  removeImage: (index: number) => void;
  uploadingImages: boolean;
}

const BasicInfoStep = ({
  formData,
  handleInputChange,
  handleImageUpload,
  removeImage,
  uploadingImages,
}: BasicInfoStepProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          Step 1: Basic Information & Images
        </h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload Section */}
        <div>
          <Label className="text-sm font-semibold">Facility Images *</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center mt-2">
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = e.target.files;
                if (files) handleImageUpload(files);
              }}
              className="hidden"
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-muted-foreground">
                <strong>Click to upload images</strong> or drag and drop
              </div>
              <small className="text-muted-foreground">
                PNG, JPG, GIF up to 10MB each
              </small>
            </label>
          </div>

          {uploadingImages && (
            <div className="flex items-center justify-center mt-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Uploading images...</span>
            </div>
          )}

          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image.path || "/placeholder.svg"}
                    alt={image.originalName}
                    width={128}
                    height={64}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <small className="text-muted-foreground block mt-1 truncate">
                    {image.originalName}
                  </small>
                </div>
              ))}
            </div>
          )}

          {(!formData.images || formData.images.length === 0) && (
            <Alert className="mt-4">
              <AlertDescription>
                At least one image is required for the facility.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-semibold">
              Facility Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              placeholder="Enter facility name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-sm font-semibold">
              Address
            </Label>
            <Input
              id="address"
              name="location.address"
              value={formData.location?.address || ""}
              onChange={handleInputChange}
              placeholder="Enter facility address"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude" className="text-sm font-semibold">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              name="location.coordinates.latitude"
              value={formData.location?.coordinates?.latitude || ""}
              onChange={handleInputChange}
              placeholder="Latitude"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="longitude" className="text-sm font-semibold">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              name="location.coordinates.longitude"
              value={formData.location?.coordinates?.longitude || ""}
              onChange={handleInputChange}
              placeholder="Longitude"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-semibold">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            placeholder="Describe the facility..."
            rows={4}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxCapacity" className="text-sm font-semibold">
              Maximum Capacity *
            </Label>
            <Input
              id="maxCapacity"
              type="number"
              name="capacity.maximum"
              value={formData.capacity?.maximum || ""}
              onChange={handleInputChange}
              min="1"
              placeholder="Maximum number of people"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="recCapacity" className="text-sm font-semibold">
              Recommended Capacity
            </Label>
            <Input
              id="recCapacity"
              type="number"
              name="capacity.recommended"
              value={formData.capacity?.recommended || ""}
              onChange={handleInputChange}
              min="1"
              placeholder="Recommended number of people"
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoStep;
