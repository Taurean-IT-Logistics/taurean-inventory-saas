import { WizardFormData } from 'pages/modules/forms/WizardExample';
import { useWizardFormContext } from 'providers/WizardFormProvider';
import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const WizardAccountForm = ({ id }: { id: string }) => {
  const methods = useWizardFormContext<WizardFormData>();
  const { formData, onChange, validation } = methods;

  return (
    <>
      <Form.Group className="mb-2">
        <Form.Label className="text-body">Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="John Smith"
          value={formData.name || ''}
          onChange={onChange}
          required={validation}
        />
        <Form.Control.Feedback type="invalid">
          This field is required.
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Email*</Form.Label>
        <Form.Control
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email || ''}
          onChange={onChange}
          required={validation}
        />
        <Form.Control.Feedback type="invalid">
          This field is required.
        </Form.Control.Feedback>
      </Form.Group>
      <Row className="g-3 mb-3">
        <Col sm={6}>
          <Form.Group className="mb-2 mb-sm-0">
            <Form.Label className="text-body">Password*</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password || ''}
              onChange={onChange}
              required={validation}
            />{' '}
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group className="mb-2">
            <Form.Label className="text-body">Confirm Password*</Form.Label>
            <Form.Control
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password || ''}
              onChange={onChange}
              required={validation}
            />{' '}
            <Form.Control.Feedback type="invalid">
              This field is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Form.Check className="form-check">
        <Form.Check.Input
          type="checkbox"
          name="terms"
          id={`${id}-terms`}
          checked={formData.accept_terms}
          onChange={onChange}
        />
        <Form.Check.Label className="text-body" htmlFor={`${id}-terms`}>
          I accept the <Link to="#!">terms</Link> and{' '}
          <Link to="#!">privacy policy</Link>
        </Form.Check.Label>
      </Form.Check>
    </>
  );
};

export default WizardAccountForm;
