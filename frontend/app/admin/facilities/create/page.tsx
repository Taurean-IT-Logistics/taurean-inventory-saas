"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Facility } from "@/types";
import FacilityProgressSteps from "@/components/facilities/facilityProgressSteps";
import BasicInfoStep from "@/components/facilities/basicInfoStep";
import DetailsAmenitiesStep from "@/components/facilities/detailsAmenitiesStep";
import AvailabilityPricingStep from "@/components/facilities/availabilityPricingStep";
import { useMutation } from "@tanstack/react-query";
import { FacilitiesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const CreateFacility = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Facility>>({
    name: "",
    description: "",
    capacity: { maximum: 0, recommended: 0 },
    operationalHours: { opening: "", closing: "" },
    location: { address: "", coordinates: { latitude: 0, longitude: 0 } },
    amenities: [],
    pricing: [{ unit: "hour", amount: 0, isDefault: true }],
    availability: [],
    images: [],
    isActive: true,
    isTaxable: true,
  });

  const setNestedValue = (obj: any, path: string[], value: any): any => {
    if (path.length === 1) {
      return { ...obj, [path[0]]: value };
    }
    const [key, ...rest] = path;
    return {
      ...obj,
      [key]: setNestedValue(obj?.[key] || {}, rest, value),
    };
  };

  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [step, setStep] = useState(1);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const inputValue = type === "number" ? Number(value) : value;
    const path = name.split(".");

    setFormData((prev) => setNestedValue(prev, path, inputValue));
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const previewImages = Array.from(files).map((file) => ({
        path: URL.createObjectURL(file),
        originalName: file.name,
        mimetype: file.type,
        size: file.size,
      }));

      setRawFiles((prev) => [...prev, ...Array.from(files)]);

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...previewImages],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
    setRawFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateAvailability = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      availability:
        prev.availability?.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ) || [],
    }));
  };

  // Create facility mutation
  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: Partial<Facility>) => {
      // Create a clean copy without the preview image URLs
      const cleanData = { ...facilityData };
      if (cleanData.images) {
        cleanData.images = cleanData.images.map((img) => ({
          path: img.path,
          originalName: img.originalName,
          mimetype: img.mimetype,
          size: img.size,
        }));
      }

      return FacilitiesAPI.create(cleanData, rawFiles);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Facility created successfully!",
        variant: "default",
      });
      router.push("/admin/facilities");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.images || formData.images.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one image is required for the facility.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFacilityMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error creating facility:", error);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          formData.name &&
          formData.capacity?.maximum &&
          formData.images &&
          formData.images.length > 0
        );
      case 2:
        return (
          formData.operationalHours?.opening &&
          formData.operationalHours?.closing
        );
      case 3:
        return formData.pricing && formData.pricing[0]?.amount > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Create New Facility</h1>
            <p className="text-muted-foreground mb-0">
              Add a new facility to your booking system
            </p>
          </div>
        </div>
        <FacilityProgressSteps currentStep={step} />

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <BasicInfoStep
                formData={formData}
                handleInputChange={handleInputChange}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                uploadingImages={uploadingImages}
              />
            )}

            {step === 2 && (
              <DetailsAmenitiesStep
                formData={formData}
                handleInputChange={handleInputChange}
                newAmenity={newAmenity}
                setNewAmenity={setNewAmenity}
                addAmenity={addAmenity}
                removeAmenity={removeAmenity}
              />
            )}

            {step === 3 && (
              <AvailabilityPricingStep
                formData={formData}
                setFormData={setFormData}
                updateAvailability={updateAvailability}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={createFacilityMutation.isPending}
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div>
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(step)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      !isStepValid(step) || createFacilityMutation.isPending
                    }
                  >
                    {createFacilityMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Facility...
                      </>
                    ) : (
                      "Create Facility"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {!isStepValid(step) && (
              <Alert className="mt-6">
                <AlertDescription>
                  Please complete all required fields before proceeding.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFacility;
