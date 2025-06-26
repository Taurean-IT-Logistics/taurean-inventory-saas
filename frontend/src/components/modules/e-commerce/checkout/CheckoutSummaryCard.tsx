import Button from 'components/base/Button';
import { cartItems } from 'data/e-commerce/products';
import { currencyFormat } from 'helpers/utils';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const CheckoutSummaryCard = () => {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">Summary</h3>
          <Button variant="link" className="pe-0" type="button">
            Edit cart
          </Button>
        </div>
        <div className="border-dashed border-bottom border-translucent mb-4">
          <div className="ms-n2 mb-5">
            {cartItems.map(item => (
              <Row className="align-items-center g-3 mb-2" key={item.id}>
                <Col xs={8} md={7} lg={8}>
                  <div className="d-flex align-items-center">
                    <img
                      className="me-2 ms-1"
                      src={item.image}
                      width={40}
                      alt={item.name}
                    />
                    <h6 className="fw-semibold text-body-highlight lh-base line-clamp-2">
                      {item.name}
                    </h6>
                  </div>
                </Col>
                <Col xs={2} md={3} lg={2}>
                  <h6 className="fs-10 mb-0">x1</h6>
                </Col>
                <Col xs={2} className="ps-0">
                  <h5 className="mb-0 fw-semibold text-end">
                    {currencyFormat(item.price * item.quantity)}
                  </h5>
                </Col>
              </Row>
            ))}
          </div>
        </div>

        <div className="border-dashed border-bottom border-translucent mb-3">
          <div className="d-flex justify-content-between mb-2">
            <h5 className="text-body fw-semibold">Items subtotal: </h5>
            <h5 className="text-body fw-semibold">$691</h5>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <h5 className="text-body fw-semibold">Discount: </h5>
            <h5 className="text-danger fw-semibold">-$59</h5>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <h5 className="text-body fw-semibold">Tax: </h5>
            <h5 className="text-body fw-semibold">$126.20</h5>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <h5 className="text-body fw-semibold">Subtotal </h5>
            <h5 className="text-body fw-semibold">$665</h5>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <h5 className="text-body fw-semibold">Shipping Cost </h5>
            <h5 className="text-body fw-semibold">$30 </h5>
          </div>
        </div>

        <div className="d-flex justify-content-between">
          <h4 className="mb-0">Total :</h4>
          <h4 className="mb-0">$695.20</h4>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CheckoutSummaryCard;
