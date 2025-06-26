import { WizardFormData } from 'pages/modules/forms/WizardExample';
import { useWizardFormContext } from 'providers/WizardFormProvider';
import { Col, Form, Row } from 'react-bootstrap';

const WizardBillingForm = () => {
  const { formData, onChange, validation } =
    useWizardFormContext<WizardFormData>();

  return (
    <div>
      <Row className="gx-3 gy-2">
        <Col lg={6}>
          <Form.Group>
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="number"
              placeholder="XXXX XXXX XXXX XXXX"
              name="card"
              value={formData.card}
              onChange={onChange}
              required={validation}
            />
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={6}>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={onChange}
              required={validation}
            />
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={6}>
          <Form.Group>
            <Form.Label>Country</Form.Label>
            <Form.Select
              name="country"
              value={formData.country}
              onChange={onChange}
              required={validation}
            >
              <option value="">Select your country ...</option>
              <option value="Afghanistan">Afghanistan</option>
              <option value="Albania">Albania</option>
              <option value="Algeria">Algeria</option>
              <option value="American Samoa">American Samoa</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={6}>
          <Form.Group>
            <Form.Label>Zip</Form.Label>
            <Form.Control
              type="text"
              name="zip"
              placeholder="1234"
              value={formData.zip}
              onChange={onChange}
              required={validation}
            />
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={6}>
          <Form.Group>
            <Form.Label>Date of Expire</Form.Label>
            <Form.Control
              type="text"
              name="date_of_expire"
              placeholder="15/2024"
              value={formData.date_of_expire}
              onChange={onChange}
              required={validation}
            />
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={6}>
          <Form.Group>
            <Form.Label>CVV</Form.Label>
            <Form.Control
              type="number"
              name="cvv"
              placeholder="123"
              value={formData.cvv}
              onChange={onChange}
              required={validation}
            />
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default WizardBillingForm;
