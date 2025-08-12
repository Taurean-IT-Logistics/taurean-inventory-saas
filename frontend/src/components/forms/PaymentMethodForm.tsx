import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

import visaCardImage from 'assets/img/logos/visa.png';
import discoverImage from 'assets/img/logos/discover.png';
import masterCardImage from 'assets/img/logos/mastercard.png';
import americanExpressImage from 'assets/img/logos/american_express.png';
import classNames from 'classnames';

type marginTop = 'short' | 'default' | 'long';

interface PaymentMethodFormProps {
  className?: string;
  marginTop?: marginTop;
}

const PaymentMethodForm = ({
  className,
  marginTop = 'default'
}: PaymentMethodFormProps) => {
  const start_year = 1990;
  const end_year = new Date().getFullYear();
  return (
    <div className={className}>
      <h3
        className={classNames('mb-5', {
          'mt-0': marginTop === 'short',
          'mt-7': marginTop === 'default',
          'mt-9': marginTop === 'long'
        })}
      >
        Payment Method
      </h3>
      <Row className="gx-xxl-6 mb-5">
        <Col md="auto">
          <Form.Check>
            <Form.Check.Input
              type="radio"
              name="paymentMethod"
              id="creditCard"
              defaultChecked
            />
            <Form.Check.Label
              className="d-flex gap-2 fs-8 text-body text-nowrap"
              htmlFor="creditCard"
            >
              Credit card
              <img src={visaCardImage} alt="" className="h-100 ms-2" />
              <img src={discoverImage} alt="" className="h-100" />
              <img src={masterCardImage} alt="" className="h-100" />
              <img src={americanExpressImage} alt="" className="h-100" />
            </Form.Check.Label>
          </Form.Check>
        </Col>
        <Col md="auto">
          <Form.Check>
            <Form.Check.Input type="radio" name="paymentMethod" id="paypal" />
            <Form.Check.Label className="fs-8 text-body" htmlFor="paypal">
              Paypal
            </Form.Check.Label>
          </Form.Check>
        </Col>
        <Col md="auto">
          <Form.Check>
            <Form.Check.Input type="radio" name="paymentMethod" id="coupon" />
            <Form.Check.Label className="fs-8 text-body" htmlFor="coupon">
              Coupon
            </Form.Check.Label>
          </Form.Check>
        </Col>
      </Row>
      <Row className="gx-3 gy-4">
        <Col md={6}>
          <label
            htmlFor="selectCard"
            className="fw-bold text-body-highlight mb-1"
          >
            Select card
          </label>
          <Form.Select
            className="text-body-emphasis"
            id="selectCard"
            defaultValue=""
          >
            <option value="">Select a card</option>
            <option value="visa">Visa</option>
            <option value="discover">Discover</option>
            <option value="mastercard">Mastercard</option>
            <option value="american-express">American Express</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <label
            htmlFor="inputCardNumber"
            className="fw-bold text-body-highlight mb-1"
          >
            Card number
          </label>
          <Form.Control
            type="number"
            placeholder="Enter card number"
            aria-label="Card number"
            id="inputCardNumber"
            className="input-spin-none"
          />
        </Col>
        <Col xs={12}>
          <label
            htmlFor="inputName"
            className="fw-bold text-body-highlight mb-1"
          >
            Full name
          </label>
          <Form.Control
            type="text"
            name="inputName"
            placeholder="Ansolo Lazinatov"
            id="inputName"
            aria-label="Full name"
          />
        </Col>
        <Col md={6}>
          <label className="fw-bold text-body-highlight mb-1">Expires on</label>
          <div className="d-flex">
            <Form.Select className="text-body-emphasis me-3" defaultValue="">
              <option value="">Month</option>
              <option value="january">January</option>
              <option value="february">February</option>
              <option value="march">March</option>
            </Form.Select>
            <Form.Select className="text-body-emphasis" defaultValue="">
              <option value="">Year</option>
              {Array.from({ length: end_year - start_year + 1 }).map(
                (_, index) => {
                  const year = start_year + index;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                }
              )}
            </Form.Select>
          </div>
        </Col>
        <Col md={6}>
          <label
            htmlFor="inputCardCVC"
            className="fw-bold text-body-highlight mb-1"
          >
            CVC
          </label>
          <Form.Control
            type="number"
            name="CVC"
            id="inputCardCVC"
            placeholder="Enter a valid CVC"
            aria-label="CVC"
            className="input-spin-none"
          />
        </Col>
        <Col xs={12}>
          <Form.Check>
            <Form.Check.Input type="checkbox" id="gridCheck" />
            <Form.Check.Label
              className="text-body-emphasis fs-8"
              htmlFor="gridCheck"
            >
              Save Card Details
            </Form.Check.Label>
          </Form.Check>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentMethodForm;
