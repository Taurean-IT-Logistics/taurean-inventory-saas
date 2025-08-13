import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'components/ui';
import { InventoryItem } from 'types';
import {  } from '';
import { faUpload, faTimes, faPlus } from 'lucide-react';
import { getResourceUrl } from 'controllers';

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
    if (field === 'amount') {
      updatedPricing[index] = {
        ...updatedPricing[index],
        amount: value === '' ? 0 : Number(value)
      };
    } else if (field === 'unit') {
      updatedPricing[index] = {
        ...updatedPricing[index],
        unit: value as 'hour' | 'day' | 'week' | 'month'
      };
    } else {
      updatedPricing[index] = {
        ...updatedPricing[index],
        [field]: value
      };
    }
    setFormData({ ...formData, pricing: updatedPricing });
  };

  const handleAddPricing = () => {
    const newPricing = {
      unit: 'hour' as 'hour' | 'day' | 'week' | 'month',
      amount: 0,
      isDefault: false
    };
    setFormData({
      ...formData,
      pricing: [...pricing, newPricing]
    });
  };

  const handleRemovePricing = (index: number) => {
    const updatedPricing = pricing.filter((_, i) => i !== index);
    setFormData({ ...formData, pricing: updatedPricing });
  };

  return (
    <div className="mb-3">
      <div className="flex justify-content-between align-items-center mb-2">
        <Form.Label className="mb-0">Pricing Information</Form.Label>
        <Button
          type="button"
          variant="outline-primary"
          size="sm"
          onClick={handleAddPricing}
        >
          < icon={faPlus} className="me-1" />
          Add Pricing
        </Button>
      </div>

      {pricing.length === 0 ? (
        <div className="border border-secondary rounded p-3">
          <p className="text-gray-600 dark:text-gray-400 mb-0 text-center">
            No pricing information added yet.
          </p>
        </div>
      ) : (
        <div className="border border-secondary rounded p-3">
          {pricing.map((price, index) => (
            <div
              key={index}
              className={`${index > 0 ? 'border-top pt-3 mt-3' : ''}`}
            >
              <div className="flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-muted">Pricing Option {index + 1}</h6>
                {pricing.length > 1 && (
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemovePricing(index)}
                  >
                    < icon={faTimes} />
                  </Button>
                )}
              </div>
              <Row>
                <Col md={4} className="mb-2">
                  <Form.Label className="small">Unit</Form.Label>
                  <Form.Select
                    className="border-secondary"
                    value={price.unit || ''}
                    onChange={e =>
                      handlePricingChange(index, 'unit', e.target.value)
                    }
                    size="sm"
                  >
                    <option value="">Select unit</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </Form.Select>
                </Col>
                <Col md={4} className="mb-2">
                  <Form.Label className="small">Amount</Form.Label>
                  <Form.Control
                    type="number"
                    className="border-secondary"
                    value={price.amount || ''}
                    onChange={e =>
                      handlePricingChange(index, 'amount', e.target.value)
                    }
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    size="sm"
                  />
                </Col>
                <Col md={4} className="mb-2 d-flex align-items-end">
                  <Form.Check
                    type="checkbox"
                    id={`isDefault-${index}`}
                    label="Default Pricing"
                    checked={price.isDefault || false}
                    onChange={e =>
                      handlePricingChange(index, 'isDefault', e.target.checked)
                    }
                    className="small"
                  />
                </Col>
              </Row>
            </div>
          ))}
        </div>
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
  onSave
}: EditInventoryModalProps) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const categories = [
    'AV Equipment',
    'Furniture',
    'IT Equipment',
    'Kitchen Appliances',
    'Cleaning Supplies',
    'Office Supplies',
    'Safety Equipment',
    'Decorative Items',
    'Other'
  ];

  useEffect(() => {
    if (item) {
      setFormData({ ...item });

      // Reset file states when item changes
      setImageFiles([]);
      setExistingImages(item.images || []);
      setRemovedImageIds([]);

      // Set previews for existing images
      setImagePreviews(item.images?.map(i => i.path) || []);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof InventoryItem] as Partial<InventoryItem>),
          [child]:
            type === 'number'
              ? Number(value)
              : type === 'date'
              ? value
                ? new Date(value)
                : undefined
              : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Add new files to the existing files
    setImageFiles(prev => [...prev, ...files]);

    // Create preview URLs for new files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setImagePreviews(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const existingImagesCount = existingImages.length;

    if (index < existingImagesCount) {
      // Removing an existing image - track its ID for removal
      const imageToRemove = existingImages[index];
      if (imageToRemove._id) {
        setRemovedImageIds(prev => [...prev, imageToRemove._id]);
      }
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Removing a new file
      const fileIndex = index - existingImagesCount;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      let newSpecs: Map<string, string>;

      if (formData.specifications instanceof Map) {
        newSpecs = new Map(formData.specifications);
      } else if (
        formData.specifications &&
        typeof formData.specifications === 'object'
      ) {
        newSpecs = new Map(Object.entries(formData.specifications));
      } else {
        newSpecs = new Map();
      }

      newSpecs.set(specKey.trim(), specValue.trim());
      setFormData(prev => ({
        ...prev,
        specifications: newSpecs
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    let newSpecs: Map<string, string>;

    if (formData.specifications instanceof Map) {
      newSpecs = new Map(formData.specifications);
    } else if (
      formData.specifications &&
      typeof formData.specifications === 'object'
    ) {
      newSpecs = new Map(Object.entries(formData.specifications));
    } else {
      return;
    }

    newSpecs.delete(key);
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && item) {
      const updatedItem: InventoryItem = {
        ...item,
        ...formData,
        updatedAt: new Date()
      };
      // Pass the updated item, raw files, and removed image IDs
      onSave(updatedItem, imageFiles, removedImageIds);
      onHide();
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  if (!show || !item) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="border-secondary">
        <Modal.Title>Edit Inventory Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Image Upload Section */}
          <div className="mb-4">
            <Form.Label>Item Images</Form.Label>
            <div className="border border-secondary rounded p-3">
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="border-secondary mb-3"
              />
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => {
                  const isExisting = index < existingImages.length;
                  return (
                    <div key={index} className="relative">
                      <img
                        src={getResourceUrl(preview)}
                        alt={`Preview ${index + 1}`}
                        className="rounded"
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover'
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0"
                        style={{ transform: 'translate(25%, -25%)' }}
                        onClick={() => removeImage(index)}
                      >
                        < icon={faTimes} />
                      </Button>
                      {!isExisting && (
                        <Badge
                          bg="success"
                          className="position-absolute bottom-0 start-0"
                          style={{
                            transform: 'translate(-25%, 25%)',
                            fontSize: '0.6rem'
                          }}
                        >
                          New
                        </Badge>
                      )}
                    </div>
                  );
                })}
                {imagePreviews.length === 0 && (
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
              <div className="mt-2 text-muted small">
                {existingImages.length > 0 && (
                  <div>
                    Existing images: {existingImages.length}
                    {removedImageIds.length > 0 && (
                      <span className="text-danger">
                        {' '}
                        ({removedImageIds.length} to be removed)
                      </span>
                    )}
                  </div>
                )}
                {imageFiles.length > 0 && (
                  <div>New files: {imageFiles.length}</div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <Row>
            <Col md={8} className="mb-3">
              <Form.Label>Item Name *</Form.Label>
              <Form.Control
                type="text"
                className="border-secondary"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
              />
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label>SKU</Form.Label>
              <Form.Control
                type="text"
                className="border-secondary"
                name="sku"
                value={formData.sku || ''}
                onChange={handleInputChange}
              />
            </Col>
          </Row>

          <div className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              className="border-secondary"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <Row>
            <Col md={4} className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Control
                type="text"
                className="border-secondary"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                list="category-options"
                placeholder="Select or type a category"
                required
              />
              <datalist id="category-options">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label>Quantity *</Form.Label>
              <Form.Control
                type="number"
                className="border-secondary"
                name="quantity"
                value={formData.quantity || 0}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                className="border-secondary"
                name="status"
                value={formData.status || 'in_stock'}
                onChange={handleInputChange}
              >
                <option value="in_stock">In Stock</option>
                <option value="rented">Rented</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Pricing Form - Now properly integrated */}
          <PricingForm formData={formData} setFormData={setFormData} />

          {/* Specifications */}
          <div className="mb-3">
            <Form.Label>Specifications</Form.Label>
            <Row className="mb-2 gap-2">
              <Col md={4}>
                <Form.Control
                  type="text"
                  className="border-secondary"
                  placeholder="Key"
                  value={specKey}
                  onChange={e => setSpecKey(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="text"
                  className="border-secondary"
                  placeholder="Value"
                  value={specValue}
                  onChange={e => setSpecValue(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button
                  className="flex"
                  variant="primary"
                  onClick={addSpecification}
                >
                  < icon={faPlus} className="me-2" />
                  Add
                </Button>
              </Col>
            </Row>
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
                      bg="secondary"
                      className="flex align-items-center gap-2"
                    >
                      {key}: {String(value)}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => removeSpecification(key)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ));
                })()}
            </div>
            <div className="mt-4">
              <Form.Check type="checkbox" className="mb-0">
                <Form.Check.Input
                  id="tax"
                  checked={formData.isTaxable}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      isTaxable: Boolean(e.target.checked)
                    }))
                  }
                  defaultChecked
                />
                <Form.Check.Label htmlFor="tax" className="mb-0">
                  Tax Item
                </Form.Check.Label>
              </Form.Check>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditInventoryModal;
