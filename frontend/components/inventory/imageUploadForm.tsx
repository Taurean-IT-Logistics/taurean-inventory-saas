"use client";

import type React from "react";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryItem } from "@/types";

interface ImageUploadFormProps {
  images: any[];
  onImagesChange: (images: InventoryItem["images"], files: File[]) => void;
}

const ImageUploadForm = ({ images, onImagesChange }: ImageUploadFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const updatedFiles = [...imageFiles, ...files];
    setImageFiles(updatedFiles);

    const newPreviews: string[] = [];
    let loadedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
        }

        loadedCount++;
        if (loadedCount === files.length) {
          const updatedPreviews = [...images, ...newPreviews];
          onImagesChange(updatedPreviews, updatedFiles);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    onImagesChange(updatedImages, updatedFiles);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
          <div className="flex flex-wrap gap-4">
            {images &&
              images.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            {!images ||
              (images.length === 0 && (
                <div className="text-center w-full py-8">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No images uploaded</p>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadForm;
