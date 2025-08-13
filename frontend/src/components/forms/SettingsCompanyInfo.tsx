import { faBuilding, faGlobe } from 'lucide-react';
import {  } from '';
import React from 'react';
import { Form } from 'components/ui';

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
        <
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
        < icon={faGlobe} className="text-body fs-9 form-icon" />
      </div>
    </>
  );
};

export default SettingsCompanyInfo;
