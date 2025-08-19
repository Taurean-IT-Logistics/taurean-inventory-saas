"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { InventoryItem } from "@/types";
import BasicInfoForm from "@/components/inventory/basicInfoForm";
import PurchaseInfoForm from "@/components/inventory/purchaseInfoForm";
import SpecificationsForm from "@/components/inventory/specificationsForm";
import ImageUploadForm from "@/components/inventory/imageUploadForm";
import PricingForm from "@/components/inventory/pricingForm";
import { InventoryAPI } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Key for local storage
const DRAFT_KEY = "inventory_draft";

const CreateInventory = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize form data with draft if exists
  const [formData, setFormData] = useState<Partial<InventoryItem>>(() => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem(DRAFT_KEY);
      return draft
        ? JSON.parse(draft)
        : {
            name: "",
            description: "",
            sku: "",
            quantity: 1,
            status: "in_stock",
            category: "",
            images: [],
            purchaseInfo: {
              purchaseDate: undefined,
              purchasePrice: undefined,
              supplier: "",
              warrantyExpiry: undefined,
            },
            pricing: [
              {
                unit: "day",
                amount: 0,
                isDefault: false,
              },
            ],
            associatedFacility: undefined,
            specifications: new Map(),
            alerts: {
              lowStock: false,
              maintenanceDue: false,
              warrantyExpiring: false,
            },
            isDeleted: false,
            isTaxable: true,
          };
    }
    return {
      // Default empty state
    };
  });

  const [rawFiles, setRawFiles] = useState<File[]>([]);

  // Save draft whenever form data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = {
        ...formData,
        // Convert Map to array for serialization
        specifications: Array.from(formData.specifications || new Map()),
        // Don't save files in draft
        images: formData.images?.map((img) => ({
          path: img.path,
          originalName: img.originalName,
          mimetype: img.mimetype,
          size: img.size,
        })),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [formData]);

  // Clear draft when component unmounts or when successfully submitted
  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_KEY);
      setFormData({} as Partial<InventoryItem>);
    }
  };

  // Create inventory mutation
  const createInventoryMutation = useMutation({
    mutationFn: async (inventoryData: Partial<InventoryItem>) => {
      // Convert Map to array for specifications
      const payload = {
        ...inventoryData,
        specifications: Array.from(inventoryData.specifications || new Map()),
      };

      return InventoryAPI.create(payload, rawFiles);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item created successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      clearDraft();
      router.push("/inventory");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });

  // Save as draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (inventoryData: Partial<InventoryItem>) => {
      // Convert Map to array for specifications
      const payload = {
        ...inventoryData,
        specifications: Array.from(inventoryData.specifications || new Map()),
        isDraft: true, // Mark as draft
      };

      // You might want to implement a separate API endpoint for drafts
      // For now, we'll just use local storage
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 500);
      });
    },
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Your draft has been saved locally",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save draft",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof InventoryItem] as any),
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

  const handleFacilityChange = (facilityId: string) => {
    setFormData((prev) => ({
      ...prev,
      associatedFacility: facilityId,
    }));
  };

  const handleSpecificationAdd = (key: string, value: string) => {
    const newSpecs = new Map(formData.specifications);
    newSpecs.set(key, value);
    setFormData((prev) => ({
      ...prev,
      specifications: newSpecs,
    }));
  };

  const handleSpecificationRemove = (key: string) => {
    const newSpecs = new Map(formData.specifications);
    newSpecs.delete(key);
    setFormData((prev) => ({
      ...prev,
      specifications: newSpecs,
    }));
  };

  const handleImagesChange = (
    images: InventoryItem["images"],
    files: File[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }));
    setRawFiles(files);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Name and category are required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.images?.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one image is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createInventoryMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error creating inventory:", error);
    }
  };

  const handleSaveAsDraft = () => {
    saveDraftMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Add New Inventory Item</h1>
            <p className="text-muted-foreground">
              Add a new item to your inventory system
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoForm
              formData={formData}
              onInputChange={handleInputChange}
              onFacilityChange={handleFacilityChange}
            />

            <ImageUploadForm
              images={formData.images as any}
              onImagesChange={handleImagesChange}
            />

            <PurchaseInfoForm
              formData={formData}
              onInputChange={handleInputChange}
            />

            <SpecificationsForm
              formData={formData}
              onSpecificationAdd={handleSpecificationAdd}
              onSpecificationRemove={handleSpecificationRemove}
            />

            <PricingForm formData={formData} setFormData={setFormData} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={createInventoryMutation.isPending}
                    className="w-full"
                  >
                    {createInventoryMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Item"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleSaveAsDraft}
                    disabled={saveDraftMutation.isPending}
                  >
                    {saveDraftMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save as Draft"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={clearDraft}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInventory;
