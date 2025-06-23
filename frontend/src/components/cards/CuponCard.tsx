import React from 'react';
import { Card, InputGroup, Form, Button } from 'react-bootstrap';

const CouponCard = () => {
  return (
    <Card className="bg-info-subtle border-info-subtle coupon-card-sticky-top mb-9 mb-lg-0">
      <Card.Body>
        <h4>Have a coupon?</h4>
        <p className="mb-4 fs-9 text-body-tertiary">
          Enter code to get a discount
        </p>
        <InputGroup className="gap-2">
          <Form.Control type="text" placeholder="Coupon Code" />
          <Button variant="primary" className="rounded">
            Submit
          </Button>
        </InputGroup>
      </Card.Body>
    </Card>
  );
};

export default CouponCard;
