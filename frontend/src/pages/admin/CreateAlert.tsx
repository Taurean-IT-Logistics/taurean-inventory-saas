import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

const CreateAlert = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    category: 'system',
    targetUsers: [] as string[],
    scheduledFor: '',
    expiresAt: '',
    isActive: true
  });

  const [newUser, setNewUser] = useState('');

  const alertTypes = [
    { value: 'info', label: 'Information', color: 'info' },
    { value: 'warning', label: 'Warning', color: 'warning' },
    { value: 'error', label: 'Error', color: 'danger' },
    { value: 'success', label: 'Success', color: 'success' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const categories = [
    { value: 'system', label: 'System' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'security', label: 'Security' },
    { value: 'update', label: 'Update' },
    { value: 'announcement', label: 'Announcement' }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addTargetUser = () => {
    if (newUser.trim() && !formData.targetUsers.includes(newUser.trim())) {
      setFormData(prev => ({
        ...prev,
        targetUsers: [...prev.targetUsers, newUser.trim()]
      }));
      setNewUser('');
    }
  };

  const removeTargetUser = (user: string) => {
    setFormData(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.filter(u => u !== user)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating alert:', formData);
    alert('Alert created successfully!');
  };

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold  mb-1">Create New Alert</h1>
            <p className="text-muted mb-0">
              Create a new system alert or notification
            </p>
          </div>
          <Button as={Link} to="/admin/alerts" variant="outline-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Alerts
          </Button>
        </div>

        <Card className="order-secondary">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={8} className="mb-3">
                  <Form.Label>Alert Title *</Form.Label>
                  <Form.Control
                    type="text"
                    className="border-secondary text-white"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter alert title"
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select
                    className="border-secondary"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {alertTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Label>Message *</Form.Label>
                <Form.Control
                  as="textarea"
                  className="border-secondary"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter alert message..."
                />
              </div>

              <Row>
                <Col md={4} className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    className="border-secondary"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    className="border-secondary"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="form-check mt-4">
                    <Form.Check
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      label="Active Alert"
                    />
                  </div>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button as={Link} to="/admin/alerts" variant="secondary">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Create Alert
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CreateAlert;
