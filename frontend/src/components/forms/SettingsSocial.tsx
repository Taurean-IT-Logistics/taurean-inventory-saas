import {
  faArtstation,
  faBehance,
  faFacebook,
  faLinkedin,
  faTwitter,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Form } from 'react-bootstrap';
import { Col, Row } from 'react-bootstrap';

const SettingsSocial = () => {
  return (
    <div className="mb-6">
      <h4 className="mb-4">Social</h4>
      <Row className="g-3">
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="facebook"
                type="text"
                placeholder="Facebook"
                className="form-icon-input"
              />
              <label
                htmlFor="facebook"
                className="form-icon-label text-body-tertiary"
              >
                FACEBOOK
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faFacebook}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="twitter"
                type="text"
                placeholder="Twitter"
                className="form-icon-input"
              />
              <label
                htmlFor="twitter"
                className="form-icon-label text-body-tertiary"
              >
                TWITTER
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faTwitter}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="linkedin"
                type="text"
                placeholder="Linkedin"
                className="form-icon-input"
              />
              <label
                htmlFor="linkedin"
                className="form-icon-label text-body-tertiary"
              >
                LINKEDIN
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faLinkedin}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="youtube"
                type="text"
                placeholder="youtube"
                className="form-icon-input"
              />
              <label
                htmlFor="youtube"
                className="form-icon-label text-body-tertiary"
              >
                YOUTUBE
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faYoutube}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="artstation"
                type="text"
                placeholder="Artstation"
                className="form-icon-input"
              />
              <label
                htmlFor="artstation"
                className="form-icon-label text-body-tertiary"
              >
                ARTSTATION
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faArtstation}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="form-icon-container">
            <Form.Floating>
              <Form.Control
                id="behance"
                type="text"
                placeholder="Behance"
                className="form-icon-input"
              />
              <label
                htmlFor="behance"
                className="form-icon-label text-body-tertiary"
              >
                BEHANCE
              </label>
            </Form.Floating>
            <FontAwesomeIcon
              icon={faBehance}
              className="text-body fs-9 form-icon"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsSocial;
