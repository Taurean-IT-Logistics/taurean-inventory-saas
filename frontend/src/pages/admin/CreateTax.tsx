import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faPercent,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { Tax } from 'types';
import { TaxController } from 'controllers';
import { showToast } from 'components/toaster/toaster';
import { useAppSelector } from 'hooks/useAppDispatch';
import { RootState } from 'lib/store';

const CreateTax = () => {
  const { tokens } = useAppSelector((state: RootState) => state.auth);
  const accessToken = tokens.accessToken;
  const navigate = useNavigate();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Tax>>({
    name: '',
    rate: 0,
    type: '',
    appliesTo: 'both',
    active: true
  });

  const showAlert = (type: string, message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.type ||
      formData.rate === undefined ||
      formData.rate < 0
    ) {
      showAlert(
        'danger',
        'Please fill in all required fields with valid values.'
      );
      return;
    }

    if (formData.rate > 100) {
      showAlert('warning', 'Tax rate cannot exceed 100%.');
      return;
    }

    try {
      const response = await TaxController.createTax(formData, accessToken);

      if (response.success) {
        showToast('success', 'Tax Created successfully!');
        showAlert('success', 'Tax created successfully!');
        setTimeout(() => {
          navigate('/admin/tax');
        }, 2000);
      }
    } catch (error) {
      showToast('error', error || 'Tax not created');
    }
  };

  return (
    <div className="min-vh-100  ">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center mb-3">
              <Button
                as={Link}
                to="/admin/tax"
                variant="outline-secondary"
                className="me-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back to Tax Management
              </Button>
            </div>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon
                icon={faPercent}
                size="2x"
                className="text-primary me-3"
              />
              <div>
                <h1 className="h3  mb-1">Create New Tax</h1>
                <p className="text-muted mb-0">
                  Configure a new tax rate for your system
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alert */}
        {alert && (
          <Alert
            variant={alert.type}
            className="mb-4"
            dismissible
            onClose={() => setAlert(null)}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {alert.message}
          </Alert>
        )}

        {/* Create Tax Form */}
        <Row className="justify-content-center">
          <Col xl={8}>
            <Card className=" border-secondary">
              <Card.Header className=" border-secondary">
                <h5 className=" mb-0">Tax Configuration</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Label className="">
                        Tax Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className=" border-secondary "
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Value Added Tax (VAT)"
                        required
                      />
                      <Form.Text className="text-muted">
                        Enter a descriptive name for this tax
                      </Form.Text>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label className="">
                        Tax Rate (%) <span className="text-danger">*</span>
                      </Form.Label>
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
                      <Form.Text className="text-muted">
                        Enter the tax rate as a percentage (0-100)
                      </Form.Text>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Label className="">
                        Tax Type <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className=" border-secondary "
                        name="type"
                        value={formData.type || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Federal, State, Local"
                        required
                      />
                      <Form.Text className="text-muted">
                        Specify the type/category of this tax
                      </Form.Text>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label className="">
                        Applies To <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        className=" border-secondary "
                        name="appliesTo"
                        value={formData.appliesTo || 'both'}
                        onChange={handleSelectChange}
                        required
                      >
                        <option value="inventory_item">
                          Inventory Items Only
                        </option>
                        <option value="facility">Facilities Only</option>
                        <option value="both">
                          Both Inventory & Facilities
                        </option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Choose what this tax applies to
                      </Form.Text>
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <Form.Check
                      type="checkbox"
                      className=""
                      name="active"
                      label="Active (Tax will be applied to applicable transactions)"
                      checked={formData.active || false}
                      onChange={handleCheckboxChange}
                    />
                  </div>

                  <hr className="border-secondary my-4" />

                  <div className="d-flex justify-content-between">
                    <Button as={Link} to="/taxes" variant="outline-secondary">
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      className="d-flex align-items-center"
                    >
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Create Tax
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateTax;
