import {
  faCircleInfo,
  faEnvelope,
  faPhone,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Form, Row } from 'react-bootstrap';

const SettingsPersonalInfo = () => {
  return (
    <div className="mb-6">
      <h4 className="mb-4">Personal Information</h4>
      <Row className="g-3">
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="firstName"
                type="text"
                placeholder="First Name"
                className="form-icon-input"
              />
              <label
                htmlFor="firstName"
                className="form-icon-label text-body-tertiary"
              >
                FIRST NAME
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faUser}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="lastName"
                type="text"
                placeholder="Last Name"
                className="form-icon-input"
              />
              <label
                htmlFor="lastName"
                className="form-icon-label text-body-tertiary"
              >
                LAST NAME
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faUser}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="email"
                type="email"
                placeholder="Enter your email"
                className="form-icon-input"
              />
              <label
                htmlFor="email"
                className="form-icon-label text-body-tertiary"
              >
                ENTER YOUR EMAIL
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="phone"
                type="tel"
                placeholder="Enter your phone"
                className="form-icon-input"
              />
              <label
                htmlFor="phone"
                className="form-icon-label text-body-tertiary"
              >
                ENTER YOUR PHONE
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faPhone}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="info"
                as="textarea"
                style={{ height: '115px' }}
                type="text"
                placeholder="info"
                className="form-icon-input"
              />
              <label
                htmlFor="lastName"
                className="form-icon-label text-body-tertiary"
              >
                INFO
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPersonalInfo;
