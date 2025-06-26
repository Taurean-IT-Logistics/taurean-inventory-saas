import OrderInfoItem from 'components/info-items/OrderInfoItem';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const BillingDetails = () => {
  return (
    <>
      <h4 className="mb-5">Billing details</h4>
      <Row className="g-4 flex-sm-column">
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="user" label="Customer" />
          <Link className="fs-9 ms-4" to="#!">
            Shatinon Mekalan
          </Link>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="mail" label="Email" />
          <Link className="fs-9 ms-4" to="mailto:shatinon@jeemail.com">
            shatinon@jeemail.com
          </Link>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="phone" label="Phone" />
          <Link className="fs-9 ms-4" to="tel:+1234567890">
            +1234567890
          </Link>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="home" label="Address" />
          <div className="ms-4">
            <p className="text-body-secondary mb-0 fs-9">Shatinon Mekalan</p>
            <p className="text-body-secondary mb-0 fs-9">
              Vancouver, British Columbia,
              <br className="d-none d-sm-block" />
              Canada
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
};

export const ShippingDetails = () => {
  return (
    <>
      <h4 className="mb-5">Shipping details</h4>
      <Row className="g-4 flex-sm-column">
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="mail" label="Email" />
          <Link className="fs-9 ms-4" to="mailto:shatinon@jeemail.com">
            shatinon@jeemail.com
          </Link>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="phone" label="Phone" />
          <Link className="fs-9 ms-4" to="tel:+1234567890">
            +1234567890
          </Link>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="calendar" label="Shipping Date" />
          <p className="mb-0 text-body-secondary fs-9 ms-4">12 Nov, 2021</p>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="home" label="Address" />
          <div className="ms-4">
            <p className="text-body-secondary mb-0 fs-9">Shatinon Mekalan</p>
            <p className="text-body-secondary mb-0 fs-9">
              Vancouver, British Columbia,
              <br className="d-none d-sm-block" />
              Canada
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
};

export const OtherDetails = () => {
  return (
    <>
      <h4 className="mb-5">Other details</h4>
      <Row className="g-4 flex-sm-column">
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="shopping-bag" label="Gift order" />
          <p className="mb-0 text-body-secondary fs-9 ms-4">Yes</p>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="package" label="Wraping" />
          <p className="mb-0 text-body-secondary fs-9 ms-4">Magic wrapper</p>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="file-text" label="Recipient" />
          <p className="mb-0 text-body-secondary fs-9 ms-4">Recipient</p>
        </Col>
        <Col xs={6} sm={12}>
          <OrderInfoItem icon="mail" label="Gift Meassge" />
          <div className="ms-4">
            <p className="text-body-secondary fs-9 mb-0">
              Happy Birthday Shiniga <br />
              Lots of Love Buga Buga!!
            </p>
            <p className="mb-0 text-body-secondary fs-9">
              Yours, <br />
              Mekalan
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
};
