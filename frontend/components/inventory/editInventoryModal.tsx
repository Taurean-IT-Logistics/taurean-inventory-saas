"use client";

import type React from "react";

import { useState, useEffect } from "react";
import type { InventoryItem } from "@/types";
import { Upload, X, Plus } from "lucide-react";
import { getResourceUrl } from "@/lib/api";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface PricingFormProps {
  formData: Partial<InventoryItem>;
  setFormData: (data: Partial<InventoryItem>) => void;
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
    setFormData({ ...formData, pricing: updatedPricing });
  };

  const handleAddPricing = () => {
    const newPricing = {
      unit: "hour" as "hour" | "day" | "week" | "month",
      amount: 0,
      isDefault: false,
    };
    setFormData({
      ...formData,
      pricing: [...pricing, newPricing],
    });
  };

  const handleRemovePricing = (index: number) => {
    const updatedPricing = pricing.filter((_, i) => i !== index);
    setFormData({ ...formData, pricing: updatedPricing });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Pricing Information</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPricing}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pricing
        </Button>
      </div>

      {pricing.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No pricing information added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-4">
            {pricing.map((price, index) => (
              <div
                key={index}
                className={`${index > 0 ? "border-t pt-4" : ""}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h6 className="text-sm font-medium text-gray-600">
                    Pricing Option {index + 1}
                  </h6>
                  {pricing.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePricing(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">Unit</Label>
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
                    <Label className="text-sm">Amount</Label>
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
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`isDefault-${index}`}
                        checked={price.isDefault || false}
                        onCheckedChange={(checked) =>
                          handlePricingChange(index, "isDefault", checked)
                        }
                      />
                      <Label htmlFor={`isDefault-${index}`} className="text-sm">
                        Default Pricing
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface EditInventoryModalProps {
  item: InventoryItem | null;
  show: boolean;
  onHide: () => void;
  onSave: (
    item: InventoryItem,
    rawFiles: File[],
    removedImageIds: string[]
  ) => void;
}

const EditInventoryModal = ({
  item,
  show,
  onHide,
  onSave,
}: EditInventoryModalProps) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const categories = [
    "AV Equipment",
    "Furniture",
    "IT Equipment",
    "Kitchen Appliances",
    "Cleaning Supplies",
    "Office Supplies",
    "Safety Equipment",
    "Decorative Items",
    "Other",
  ];

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
      setImageFiles([]);
      setExistingImages(item.images || []);
      setRemovedImageIds([]);
      setImagePreviews(item.images?.map((i) => i.path) || []);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof InventoryItem] as Partial<InventoryItem>),
          [child]:
            type === "number"
              ? Number(value)
              : type === "date"
              ? value
                ? new Date(value)
                : undefined
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const existingImagesCount = existingImages.length;

    if (index < existingImagesCount) {
      const imageToRemove = existingImages[index];
      if (imageToRemove._id) {
        setRemovedImageIds((prev) => [...prev, imageToRemove._id]);
      }
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImagesCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      let newSpecs: Map<string, string>;

      if (formData.specifications instanceof Map) {
        newSpecs = new Map(formData.specifications);
      } else if (
        formData.specifications &&
        typeof formData.specifications === "object"
      ) {
        newSpecs = new Map(Object.entries(formData.specifications));
      } else {
        newSpecs = new Map();
      }

      newSpecs.set(specKey.trim(), specValue.trim());
      setFormData((prev) => ({
        ...prev,
        specifications: newSpecs,
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    let newSpecs: Map<string, string>;

    if (formData.specifications instanceof Map) {
      newSpecs = new Map(formData.specifications);
    } else if (
      formData.specifications &&
      typeof formData.specifications === "object"
    ) {
      newSpecs = new Map(Object.entries(formData.specifications));
    } else {
      return;
    }

    newSpecs.delete(key);
    setFormData((prev) => ({
      ...prev,
      specifications: newSpecs,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && item) {
      const updatedItem: InventoryItem = {
        ...item,
        ...formData,
        updatedAt: new Date(),
      };
      onSave(updatedItem, imageFiles, removedImageIds);
      onHide();
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  if (!show || !item) return null;

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Item Images</Label>
            <Card>
              <CardContent className="p-4 space-y-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="flex flex-wrap gap-4">
                  {imagePreviews.map((preview, index) => {
                    const isExisting = index < existingImages.length;
                    return (
                      <div key={index} className="relative">
                        <img
                          src={getResourceUrl(preview) || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {!isExisting && (
                          <Badge
                            variant="secondary"
                            className="absolute -bottom-2 -left-2 text-xs bg-green-100 text-green-800"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  {imagePreviews.length === 0 && (
                    <div className="w-full text-center py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No images uploaded</p>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {existingImages.length > 0 && (
                    <div>
                      Existing images: {existingImages.length}
                      {removedImageIds.length > 0 && (
                        <span className="text-red-600">
                          {" "}
                          ({removedImageIds.length} to be removed)
                        </span>
                      )}
                    </div>
                  )}
                  {imageFiles.length > 0 && (
                    <div>New files: {imageFiles.length}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                value={formData.category || ""}
                onChange={handleInputChange}
                list="category-options"
                placeholder="Select or type a category"
                required
              />
              <datalist id="category-options">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity || 0}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "in_stock"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as InventoryItem["status"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing Form */}
          <PricingForm formData={formData} setFormData={setFormData} />

          {/* Specifications */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Specifications</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="md:col-span-2">
                <Input
                  placeholder="Key"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="Value"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                />
              </div>
              <Button type="button" onClick={addSpecification}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specifications &&
                (() => {
                  const specs =
                    formData.specifications instanceof Map
                      ? Array.from(formData.specifications.entries())
                      : Object.entries(formData.specifications);

                  return specs.map(([key, value]) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {key}: {String(value)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeSpecification(key)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ));
                })()}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tax"
                checked={formData.isTaxable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isTaxable: Boolean(checked),
                  }))
                }
              />
              <Label htmlFor="tax">Tax Item</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryModal;
