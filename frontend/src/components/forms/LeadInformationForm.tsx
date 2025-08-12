import classNames from 'classnames';
import { Col, FloatingLabel, Form, Row } from 'react-bootstrap';

const LeadInformationForm = ({ className }: { className?: string }) => {
  return (
    <>
      <h4 className="mb-3">Lead Information</h4>
      <Row className={classNames('g-3', className)}>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="lead-woner" label="Lead owner">
            <Form.Select>
              <option value="1">Max Ernst</option>
              <option value="2">Ernst</option>
              <option value="3">Max</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="first-name" label="First name">
            <Form.Control type="text" placeholder="First name" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="last-name" label="Last name">
            <Form.Control type="text" placeholder="Last name" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="company" label="Company">
            <Form.Control type="text" placeholder="Company" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="title" label="Title">
            <Form.Control type="text" placeholder="Title" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="email" label="Email">
            <Form.Control type="email" placeholder="Email" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel
            controlId="alternative-email"
            label="Alternative email"
          >
            <Form.Control type="email" placeholder="Alternative email" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="phone" label="Phone">
            <Form.Control
              type="number"
              placeholder="Phone"
              className="input-spin-none"
            />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="website" label="Website">
            <Form.Control type="text" placeholder="Website" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="linkedin" label="LinkedIn">
            <Form.Control type="text" placeholder="LinkedIn" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="skype" label="Skype id">
            <Form.Control type="text" placeholder="Skype id" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="twitter" label="Twitter">
            <Form.Control type="text" placeholder="Twitter" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel
            controlId="number-of-employees"
            label="Number of employees"
          >
            <Form.Control type="text" placeholder="Number of employees" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="annual-revenue" label="Annual revenue">
            <Form.Control type="text" placeholder="Annual revenue" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="industry" label="Industry">
            <Form.Select>
              <option value="1">Large Enterprise</option>
              <option value="2">Manufacturing</option>
              <option value="3">Education</option>
              <option value="4">Technology</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="lead-status" label="Lead status">
            <Form.Select>
              <option value="1">New</option>
              <option value="2">suspended</option>
              <option value="3">ongoing</option>
              <option value="4">Current</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="lead-source" label="Lead source">
            <Form.Select>
              <option value="1">Advertisement</option>
              <option value="2">Advertisement One</option>
              <option value="3">Advertisement Two</option>
              <option value="4">Consulting</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="rating" label="Rating">
            <Form.Select>
              <option value="1">Active</option>
              <option value="2">Inactive</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
      </Row>
    </>
  );
};

export default LeadInformationForm;
