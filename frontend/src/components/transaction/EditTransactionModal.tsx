import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Transaction } from 'types';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  show: boolean;
  onHide: () => void;
  onSave: (transaction: Transaction) => void;
}

const EditTransactionModal = ({
  transaction,
  show,
  onHide,
  onSave
}: EditTransactionModalProps) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({});

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && transaction) {
      onSave({ ...transaction, ...formData } as Transaction);
      onHide();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'number'
          ? Number(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="border-secondary">
        <Modal.Title>Transaction Details</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Reference</Form.Label>
                <Form.Control
                  type="text"
                  name="ref"
                  value={formData.ref || ''}
                  onChange={handleInputChange}
                  className="border-secondary"
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  className="border-secondary"
                  step="0.01"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type || ''}
                  onChange={handleInputChange}
                  className="border-secondary"
                >
                  <option value="booking_payment">Booking Payment</option>
                  <option value="refund">Refund</option>
                  <option value="deposit">Deposit</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Method</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method || ''}
                  onChange={handleInputChange}
                  className="border-secondary"
                >
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="border-secondary"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="reconciled"
                  checked={formData.reconciled || false}
                  onChange={handleInputChange}
                  label="Reconciled"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditTransactionModal;
