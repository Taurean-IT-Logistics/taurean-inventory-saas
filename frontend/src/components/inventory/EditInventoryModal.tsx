import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { InventoryItem } from 'types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';

interface EditInventoryModalProps {
  item: InventoryItem | null;
  show: boolean;
  onHide: () => void;
  onSave: (item: InventoryItem) => void;
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
      setImagePreviews(item.images || []);
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
    setImageFiles(prev => [...prev, ...files]);

    // Create preview URLs
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
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      const newSpecs = new Map(formData.specifications);
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
    const newSpecs = new Map(formData.specifications);
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
        images: imagePreviews,
        updatedAt: new Date()
      };
      onSave(updatedItem);
      console.log(imageFiles);
      onHide();
    }
  };

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
              <div className="d-flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => (
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
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0"
                      style={{ transform: 'translate(25%, -25%)' }}
                      onClick={() => removeImage(index)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  </div>
                ))}
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
            </div>
          </div>

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
              <Form.Select
                className="border-secondary"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
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

          <div className="mb-3">
            <Form.Label>Specifications</Form.Label>
            <Row className="mb-2">
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
                  className="d-flex"
                  variant="primary"
                  onClick={addSpecification}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add
                </Button>
              </Col>
            </Row>
            <div className="d-flex flex-wrap gap-2">
              {formData.specifications &&
                Array.from(formData.specifications.entries()).map(
                  ([key, value]) => (
                    <Badge
                      key={key}
                      bg="secondary"
                      className="d-flex align-items-center gap-2"
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
                  )
                )}
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
