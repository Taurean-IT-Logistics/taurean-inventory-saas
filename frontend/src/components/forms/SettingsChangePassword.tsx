import { faKey, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Form } from 'react-bootstrap';

const SettingsChangePassword = () => {
  return (
    <>
      <h4 className="mb-4">Change Password</h4>
      <div className="form-icon-container mb-3">
        <Form.Floating>
          <Form.Control
            id="oldPassword"
            type="password"
            placeholder="Old Password"
            className="form-icon-input"
          />
          <label
            htmlFor="oldPassword"
            className="form-icon-label text-body-tertiary"
          >
            OLD PASSWORD
          </label>
        </Form.Floating>
        <FontAwesomeIcon icon={faLock} className="text-body fs-9 form-icon" />
      </div>
      <div className="form-icon-container mb-3">
        <Form.Floating>
          <Form.Control
            id="newPassword"
            type="password"
            placeholder="New password"
            className="form-icon-input"
          />
          <label
            htmlFor="newPassword"
            className="form-icon-label text-body-tertiary"
          >
            NEW PASSWORD
          </label>
        </Form.Floating>
        <FontAwesomeIcon icon={faKey} className="text-body fs-9 form-icon" />
      </div>
      <div className="form-icon-container">
        <Form.Floating>
          <Form.Control
            id="newPassword2"
            type="password"
            placeholder="Confirm New password"
            className="form-icon-input"
          />
          <label
            htmlFor="newPassword2"
            className="form-icon-label text-body-tertiary"
          >
            CONFIRM NEW PASSWORD
          </label>
        </Form.Floating>
        <FontAwesomeIcon icon={faKey} className="text-body fs-9 form-icon" />
      </div>
    </>
  );
};

export default SettingsChangePassword;
