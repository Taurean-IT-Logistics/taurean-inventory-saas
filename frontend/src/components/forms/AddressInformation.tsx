import classNames from 'classnames';
import { Col, FloatingLabel, Form, Row } from 'react-bootstrap';

const AddressInformation = ({ className }: { className?: string }) => {
  return (
    <>
      <h4 className="mb-3">Address Information</h4>
      <Row className={classNames('g-3', className)}>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="street" label="Street">
            <Form.Control type="text" placeholder="Street" />
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="city" label="City">
            <Form.Select>
              <option value="1">Neo centrola</option>
              <option value="2">London</option>
              <option value="3">New York</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col sm={6} md={4}>
          <FloatingLabel controlId="state" label="state">
            <Form.Select>
              <option value="1">Qualimando</option>
              <option value="2">Sovereign</option>
              <option value="3">Northeastern United States</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col sm={6}>
          <FloatingLabel controlId="country" label="Country">
            <Form.Select>
              <option value="1">United Empire of Brekania</option>
              <option value="2">UK</option>
              <option value="3">USA</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col sm={6}>
          <FloatingLabel controlId="zip-code" label="Zip code">
            <Form.Control type="text" placeholder="Zip code" />
          </FloatingLabel>
        </Col>
      </Row>
    </>
  );
};

export default AddressInformation;
