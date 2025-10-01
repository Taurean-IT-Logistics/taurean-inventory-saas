"use client";

import type React from "react";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryItem } from "@/types";
import Image from "next/image";

// Utility function to format file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface ImageUploadFormProps {
  images: InventoryItem["images"];
  onImagesChange: (images: InventoryItem["images"], files: File[]) => void;
}

const ImageUploadForm = ({ images, onImagesChange }: ImageUploadFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = (files: File[]) => {
    // Validate file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(
          `File "${file.name}" exceeds the 10MB size limit and will be skipped.`
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const updatedFiles = [...imageFiles, ...validFiles];
    setImageFiles(updatedFiles);

    const newPreviews: string[] = [];
    let loadedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
        }

        loadedCount++;
        if (loadedCount === validFiles.length) {
          const updatedPreviews = [...previewUrls, ...newPreviews];
          setPreviewUrls(updatedPreviews);

          // Create image objects for the form data
          const newImageObjects = validFiles.map((file, index) => ({
            path: newPreviews[index], // Use preview URL as temporary path
            originalName: file.name,
            mimetype: file.type,
            size: file.size,
          }));

          const updatedImages = [...images, ...newImageObjects];
          onImagesChange(updatedImages, updatedFiles);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    setImageFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
    onImagesChange(updatedImages, updatedFiles);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Images</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload images to showcase your inventory item. Supported formats: JPG,
          PNG, GIF, WebP
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-4"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload
                className={`w-8 h-8 mx-auto mb-2 ${
                  isDragOver ? "text-blue-500" : "text-muted-foreground"
                }`}
              />
              <p
                className={`text-sm ${
                  isDragOver ? "text-blue-600" : "text-muted-foreground"
                }`}
              >
                {isDragOver
                  ? "Drop images here"
                  : "Click to upload images or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: 10MB per image
              </p>
            </label>
          </div>

          {images && images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">
                Image Previews ({images.length} image
                {images.length !== 1 ? "s" : ""})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={image.path || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <div className="truncate" title={image.originalName}>
                        {image.originalName}
                      </div>
                      <div className="text-xs opacity-75">
                        {formatFileSize(image.size)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!images || images.length === 0) && (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No images uploaded yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload images to provide visual context for your inventory item
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadForm;
