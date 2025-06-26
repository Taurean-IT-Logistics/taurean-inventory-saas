import { faBuilding, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Form } from 'react-bootstrap';

const SettingsCompanyInfo = () => {
  return (
    <>
      <h4 className="mb-4">Company Info</h4>
      <div className="form-icon-container mb-3">
        <Form.Floating>
          <Form.Control
            id="companyName"
            type="text"
            placeholder="Company Name"
            className="form-icon-input"
          />
          <label
            htmlFor="companyName"
            className="form-icon-label text-body-tertiary"
          >
            COMPANY NAME
          </label>
        </Form.Floating>
        <FontAwesomeIcon
          icon={faBuilding}
          className="text-body fs-9 form-icon"
        />
      </div>
      <div className="form-icon-container">
        <Form.Floating>
          <Form.Control
            id="website"
            type="text"
            placeholder="Website"
            className="form-icon-input"
          />
          <label
            htmlFor="website"
            className="form-icon-label text-body-tertiary"
          >
            WEBSITE
          </label>
        </Form.Floating>
        <FontAwesomeIcon icon={faGlobe} className="text-body fs-9 form-icon" />
      </div>
    </>
  );
};

export default SettingsCompanyInfo;
