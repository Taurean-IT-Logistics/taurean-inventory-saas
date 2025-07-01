import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Badge,
  InputGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Facility } from 'types';
import { getResourceUrl } from 'controllers';

interface PricingFormProps {
  formData: Partial<Facility>;
  setFormData: (data: Partial<Facility>) => void;
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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Form.Label className="mb-0">Pricing Information</Form.Label>
        <Button
          type="button"
          variant="outline-primary"
          size="sm"
          onClick={handleAddPricing}
        >
          <FontAwesomeIcon icon={faPlus} className="me-1" />
          Add Pricing
        </Button>
      </div>

      {pricing.length === 0 ? (
        <div className="border border-secondary rounded p-3">
          <p className="text-muted mb-0 text-center">
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-muted">Pricing Option {index + 1}</h6>
                {pricing.length > 1 && (
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemovePricing(index)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
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
  isEdit = false
}: FacilityModalProps) => {
  const [formData, setFormData] = useState<Partial<Facility>>({
    name: '',
    description: '',
    capacity: { maximum: 0, recommended: 0 },
    operationalHours: { opening: '', closing: '' },
    location: { address: '' },
    amenities: [],
    pricing: [{ unit: 'hour', amount: 0, isDefault: true }],
    isActive: true
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  useEffect(() => {
    if (facility) {
      setFormData({ ...facility });

      setImageFiles([]);
      setExistingImages(facility.images || []);
      setRemovedImageIds([]);

      setImagePreviews(facility.images?.map(i => i.path) || []);
      setErrors({});
    }
  }, [facility, isEdit, show]);

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
          ...(prev[parent as keyof Facility] as any),
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities?.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Facility name is required';
    }
    if (!formData.capacity?.maximum || formData.capacity.maximum <= 0) {
      newErrors['capacity.maximum'] = 'Maximum capacity must be greater than 0';
    }
    if (!formData.operationalHours?.opening) {
      newErrors['operationalHours.opening'] = 'Opening time is required';
    }
    if (!formData.operationalHours?.closing) {
      newErrors['operationalHours.closing'] = 'Closing time is required';
    }
    if (!formData.pricing?.[0]?.amount || formData.pricing[0].amount <= 0) {
      newErrors.pricing = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData, imageFiles, removedImageIds);
      onHide();
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  if (!show || !facility) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className=" border-secondary">
        <Modal.Title>{isEdit ? 'Edit' : 'Create'} Facility</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
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
              <div className="d-flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => {
                  const isExisting = index < existingImages.length;
                  return (
                    <div key={index} className="position-relative">
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
                        <FontAwesomeIcon icon={faTimes} />
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
                    <FontAwesomeIcon
                      icon={faUpload}
                      size="3x"
                      className="text-muted mb-2"
                    />
                    <p className="text-muted">No images uploaded</p>
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
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Facility Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className=" border-secondary "
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="location.address"
                  value={formData.location?.address || ''}
                  onChange={handleInputChange}
                  className=" border-secondary "
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className=" border-secondary "
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Maximum Capacity *</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity.maximum"
                  value={formData.capacity?.maximum || ''}
                  onChange={handleInputChange}
                  className=" border-secondary "
                  isInvalid={!!errors['capacity.maximum']}
                />
                <Form.Control.Feedback type="invalid">
                  {errors['capacity.maximum']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Recommended Capacity</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity.recommended"
                  value={formData.capacity?.recommended || ''}
                  onChange={handleInputChange}
                  className=" border-secondary "
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Opening Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="operationalHours.opening"
                  value={formData.operationalHours?.opening || ''}
                  onChange={handleInputChange}
                  className=" border-secondary "
                  isInvalid={!!errors['operationalHours.opening']}
                />
                <Form.Control.Feedback type="invalid">
                  {errors['operationalHours.opening']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Closing Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="operationalHours.closing"
                  value={formData.operationalHours?.closing || ''}
                  onChange={handleInputChange}
                  className=" border-secondary "
                  isInvalid={!!errors['operationalHours.closing']}
                />
                <Form.Control.Feedback type="invalid">
                  {errors['operationalHours.closing']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <PricingForm formData={formData} setFormData={setFormData} />
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Amenities</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                type="text"
                placeholder="Add amenity"
                value={newAmenity}
                onChange={e => setNewAmenity(e.target.value)}
                className=" border-secondary "
                onKeyPress={e =>
                  e.key === 'Enter' && (e.preventDefault(), addAmenity())
                }
              />
              <Button
                variant="outline-primary"
                onClick={addAmenity}
                disabled={!newAmenity.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </InputGroup>
            <div>
              {formData.amenities?.map((amenity, index) => (
                <Badge
                  key={index}
                  bg="secondary"
                  className="me-2 mb-2 p-2"
                  style={{ cursor: 'pointer' }}
                >
                  {amenity}
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="ms-2"
                    onClick={() => removeAmenity(index)}
                  />
                </Badge>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isActive"
              label="Active"
              checked={formData.isActive || false}
              onChange={handleCheckboxChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isTaxable"
              label="Tax Facility"
              checked={formData.isTaxable || false}
              onChange={handleCheckboxChange}
            />
          </Form.Group>

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Please correct the errors above before submitting.
            </Alert>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className=" border-secondary">
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isEdit ? 'Update' : 'Create'} Facility
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FacilityModal;
