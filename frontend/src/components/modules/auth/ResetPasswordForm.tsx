import Button from 'components/base/Button';
import React from 'react';
import { Form } from 'react-bootstrap';

const ResetPasswordForm = () => {
  return (
    <div className="text-center mb-6">
      <h4 className="text-body-highlight">Reset new password</h4>
      <p className="text-body-tertiary">Type your new password</p>
      <Form className="mt-5">
        <Form.Control
          className="mb-2"
          id="password"
          type="password"
          placeholder="Type new password"
        />
        <Form.Control
          className="mb-4"
          id="confirmPassword"
          type="password"
          placeholder="Cofirm new password"
        />
        <Button variant="primary" className="w-100">
          Set Password
        </Button>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
