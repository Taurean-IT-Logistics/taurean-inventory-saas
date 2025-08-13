import { useState } from 'react';
import {  } from '';
import { faUpload, faTimes } from 'lucide-react';
import { InventoryItem } from 'types';

interface ImageUploadFormProps {
  images: any[];
  onImagesChange: (images: InventoryItem['images'], files: File[]) => void;
}

const ImageUploadForm = ({ images, onImagesChange }: ImageUploadFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const updatedFiles = [...imageFiles, ...files];
    setImageFiles(updatedFiles);

    const newPreviews: string[] = [];
    let loadedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
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
    <div className="card border-secondary mb-4">
      <div className="card-header border-secondary">
        <h5 className="mb-0">Item Images</h5>
      </div>
      <div className="card-body">
        <div className="border border-secondary rounded p-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="form-control border-secondary mb-3"
          />
          <div className="flex flex-wrap gap-3">
            {images.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="rounded"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                  style={{ transform: 'translate(25%, -25%)' }}
                  onClick={() => removeImage(index)}
                >
                  < icon={faTimes} />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="text-center w-100 py-4">
                <
                  icon={faUpload}
                  size="3x"
                  className="text-gray-600 dark:text-gray-400 mb-2"
                />
                <p className="text-gray-600 dark:text-gray-400">No images uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadForm;
