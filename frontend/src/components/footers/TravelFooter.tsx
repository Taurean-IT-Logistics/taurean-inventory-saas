import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import bg43 from 'assets/img/bg/43.png';
const footerList1: string[] = [
  'Home',
  'Terms',
  'Talent & culture',
  'Destination',
  'Sitemap'
];
const footerList2: string[] = ['Refund policy', 'EMI Policy', 'Privacy Policy'];
const TravelFooter = () => {
  return (
    <section className="py-0 mb-5 mb-md-7 mb-lg-9">
      <div className="container-medium-md px-0 px-md-3">
        <div className="p-5 p-sm-7 py-xl-12 px-xl-15 rounded-md-2 overflow-hidden position-relative">
          <div
            className="bg-holder overlay bg-opacity-85"
            style={{
              backgroundImage: `url(${bg43})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
          <Row className="g-5 position-relative justify-content-between">
            <Col md={6} lg={3}>
              <h5 className="text-white mb-3">Discover</h5>
              <Row className="g-3">
                <Col>
                  <ul className="list-unstyled mb-0">
                    {footerList1.map((item, index) => (
                      <li key={index} className="mb-1">
                        <Link to="#!" className="text-secondary-lighter">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Col>
                <Col>
                  <ul className="list-unstyled mb-0">
                    {footerList2.map((item, index) => (
                      <li key={index} className="mb-1">
                        <Link to="#!" className="text-secondary-lighter">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>
            </Col>
            <Col md={6} lg={3}>
              <h5 className="text-white mb-3">Contact</h5>
              <Link
                to="mailto:info@phoenixtravels.com"
                className="d-block text-secondary-lighter mb-1 text-nowrap"
              >
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="me-2 me-lg-1 me-xl-2"
                />
                info@phoenixtravels.com
              </Link>
              <Link
                to="tel:+13134048290"
                className="d-block text-secondary-lighter mb-1"
              >
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                +13134048290
              </Link>
            </Col>
            <Col lg={5}>
              <h2 className="text-white mb-2 fw-semibold">
                Enjoy your trip to the fullest
              </h2>
              <p className="mb-5 text-secondary-lighter">
                Sign up and get notified
                <br /> about best deals immediately
              </p>
              <div className="d-flex gap-2">
                <div className="form-icon-container flex-1">
                  <Form.Control
                    id="PickPlace"
                    type="email"
                    placeholder="Your email address"
                    className="form-icon-input"
                  />
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="form-icon text-body fs-9"
                    transform="up-2"
                  />
                </div>
                <Button variant="primary" className="rounded px-md-7">
                  Sign up
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </section>
  );
};

export default TravelFooter;
