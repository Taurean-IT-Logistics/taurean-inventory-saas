"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, Plus, Upload } from "lucide-react";
import type { Facility } from "@/types";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PricingForm from "./pricingForm";
import { getResourceUrl } from "@/lib/api";
import { TimePicker } from "@/components/ui/time-picker";

interface FacilityModalProps {
  show: boolean;
  onHide: () => void;
  facility?: Facility | null;
  onSave: (
    facility: Partial<Facility>,
    rawFiles: File[],
    removeImageIds: string[]
  ) => void;
  isEdit?: boolean;
}

const FacilityModal = ({
  show,
  onHide,
  facility,
  onSave,
  isEdit = false,
}: FacilityModalProps) => {
  const [formData, setFormData] = useState<Partial<Facility>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (facility) {
      setFormData(facility);
      const imagePaths = (facility.images || []).map((img: any) =>
        typeof img === "string" ? img : img.path
      );
      setExistingImages(imagePaths);
      setImagePreviews(imagePaths);
    }
  }, [facility]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic here
    if (!formData.name) {
      setErrors({ name: "Facility name is required" });
      return;
    }
    if (!formData.capacity?.maximum) {
      setErrors({ "capacity.maximum": "Maximum capacity is required" });
      return;
    }
    if (!formData.operationalHours?.opening) {
      setErrors({ "operationalHours.opening": "Opening time is required" });
      return;
    }
    if (!formData.operationalHours?.closing) {
      setErrors({ "operationalHours.closing": "Closing time is required" });
      return;
    }
    setErrors({});
    onSave(formData, rawFiles, removeImageIds);
    onHide();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews([...imagePreviews, ...previews]);
      setRawFiles([...rawFiles, ...files]);
    }
  };

  const removeImage = (index: number) => {
    const isExisting = index < existingImages.length;
    if (isExisting) {
      setRemoveImageIds([...removeImageIds, existingImages[index]]);
    }
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setRawFiles(rawFiles.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity],
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Create"} Facility</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Facility Images</Label>
            <Card>
              <CardContent className="p-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => {
                    const isExisting = index < existingImages.length;
                    return (
                      <div key={index} className="relative">
                        <Image
                          src={getResourceUrl(preview) || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={40}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {!isExisting && (
                          <Badge className="absolute -bottom-2 -left-2 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  {imagePreviews.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No images uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Facility Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="location.address"
                value={formData.location?.address || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          {/* Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Maximum Capacity *</Label>
              <Input
                id="maxCapacity"
                name="capacity.maximum"
                type="number"
                value={formData.capacity?.maximum || ""}
                onChange={handleInputChange}
                className={errors["capacity.maximum"] ? "border-red-500" : ""}
              />
              {errors["capacity.maximum"] && (
                <p className="text-sm text-red-500">
                  {errors["capacity.maximum"]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recCapacity">Recommended Capacity</Label>
              <Input
                id="recCapacity"
                name="capacity.recommended"
                type="number"
                value={formData.capacity?.recommended || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Operational Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opening">Opening Time *</Label>
              <TimePicker
                value={formData.operationalHours?.opening || ""}
                onChange={(time) => {
                  const event = {
                    target: {
                      name: "operationalHours.opening",
                      value: time,
                    },
                  } as any;
                  handleInputChange(event);
                }}
                placeholder="Select opening time"
                className={
                  errors["operationalHours.opening"] ? "border-red-500" : ""
                }
              />
              {errors["operationalHours.opening"] && (
                <p className="text-sm text-red-500">
                  {errors["operationalHours.opening"]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing">Closing Time *</Label>
              <TimePicker
                value={formData.operationalHours?.closing || ""}
                onChange={(time) => {
                  const event = {
                    target: {
                      name: "operationalHours.closing",
                      value: time,
                    },
                  } as any;
                  handleInputChange(event);
                }}
                placeholder="Select closing time"
                className={
                  errors["operationalHours.closing"] ? "border-red-500" : ""
                }
              />
              {errors["operationalHours.closing"] && (
                <p className="text-sm text-red-500">
                  {errors["operationalHours.closing"]}
                </p>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <PricingForm formData={formData} setFormData={setFormData} />

          {/* Amenities */}
          <div className="space-y-4">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add amenity"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAmenity())
                }
              />
              <Button
                type="button"
                onClick={addAmenity}
                disabled={!newAmenity.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities?.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                >
                  {amenity}
                  <X
                    className="h-3 w-3 ml-1"
                    onClick={() => removeAmenity(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTaxable"
                checked={formData.isTaxable || false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isTaxable: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="isTaxable">Taxable</Label>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please correct the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update" : "Create"} Facility
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacilityModal;
