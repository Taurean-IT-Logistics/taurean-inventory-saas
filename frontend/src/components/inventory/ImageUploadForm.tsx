import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ImageUploadFormProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const ImageUploadForm = ({ images, onImagesChange }: ImageUploadFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          const newImages = [...images, event.target.result as string];
          onImagesChange(newImages);
        }
      };
      reader.readAsDataURL(file);
    });

    console.log(imageFiles);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card border-secondary mb-4">
      <div className="card-header border-secondary">
        <h5 className="mb-0">Item Images</h5>
      </div>
      <div className="card-body">
        <div className="border border-secondary rounded p-3 ">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="form-control  border-secondary mb-3"
          />
          <div className="d-flex flex-wrap gap-3">
            {images.map((preview, index) => (
              <div key={index} className="position-relative">
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
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="text-center w-100 py-4">
                <FontAwesomeIcon
                  icon={faUpload}
                  size="3x"
                  className="text-muted mb-2"
                />
                <p className="text-muted">No images uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadForm;
