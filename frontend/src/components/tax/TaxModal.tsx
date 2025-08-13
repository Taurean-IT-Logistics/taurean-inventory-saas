import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'components/ui';
import { Tax } from 'types';

interface TaxModalProps {
  tax: Tax | null;
  show: boolean;
  onHide: () => void;
  onSave: (tax: Tax) => void;
  isEdit?: boolean;
}

const TaxModal = ({
  tax,
  show,
  onHide,
  onSave,
  isEdit = false
}: TaxModalProps) => {
  const [formData, setFormData] = useState<Partial<Tax>>({
    name: '',
    rate: 0,
    type: '',
    appliesTo: 'both',
    active: true
  });

  useEffect(() => {
    if (tax && isEdit) {
      setFormData({ ...tax });
    } else {
      setFormData({
        name: '',
        rate: 0,
        type: '',
        appliesTo: 'both',
        active: true
      });
    }
  }, [tax, isEdit, show]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taxData: Tax = {
      _id: isEdit ? tax?._id : undefined,
      name: formData.name || '',
      rate: formData.rate || 0,
      type: formData.type || '',
      appliesTo: formData.appliesTo || 'both',
      active: formData.active !== undefined ? formData.active : true,
      createdAt: isEdit ? tax?.createdAt : new Date(),
      updatedAt: new Date()
    };

    onSave(taxData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="border-secondary">
        <Modal.Title>{isEdit ? 'Edit Tax' : 'Create New Tax'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Tax Name *</Form.Label>
              <Form.Control
                type="text"
                className=" border-secondary "
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="e.g., VAT, Sales Tax"
                required
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Rate (%) *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="100"
                className=" border-secondary "
                name="rate"
                value={formData.rate || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Tax Type *</Form.Label>
              <Form.Control
                type="text"
                className=" border-secondary "
                name="type"
                value={formData.type || ''}
                onChange={handleInputChange}
                placeholder="e.g., Federal, State, Local"
                required
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Applies To *</Form.Label>
              <Form.Select
                className=" border-secondary "
                name="appliesTo"
                value={formData.appliesTo || 'both'}
                onChange={handleSelectChange}
                required
              >
                <option value="inventory_item">Inventory Items Only</option>
                <option value="facility">Facilities Only</option>
                <option value="both">Both Inventory & Facilities</option>
              </Form.Select>
            </Col>
          </Row>

          <div className="mb-3">
            <Form.Check
              type="checkbox"
              name="active"
              label="Active (Tax will be applied to applicable transactions)"
              checked={formData.active || false}
              onChange={handleCheckboxChange}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className=" border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEdit ? 'Update Tax' : 'Create Tax'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaxModal;
