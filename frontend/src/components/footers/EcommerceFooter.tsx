import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  faDribbble,
  faFacebookF,
  faGithub,
  faInstagram,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';

const EcommerceFooter = () => {
  return (
    <footer className="py-5 border-top border-top-secondary">
      <Container fluid>
        <Row className="align-items-center">
          <Col lg={6} className="mb-3 mb-lg-0">
            <ul className="list-inline text-center text-lg-start mb-0">
              <li className="list-inline-item me-4">
                <a href="#" className="text-muted text-decoration-none small">
                  Terms & Conditions
                </a>
              </li>
              <li className="list-inline-item me-4">
                <a href="#" className="text-muted text-decoration-none small">
                  Privacy Policy
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-muted text-decoration-none small">
                  Cookies
                </a>
              </li>
            </ul>
          </Col>

          <Col lg={6}>
            <ul className="list-inline text-center text-lg-end mb-0">
              <li className="list-inline-item me-3">
                <Link
                  to="#"
                  className="text-secondary"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '1.2rem' }}
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                  <span className="visually-hidden">Facebook</span>
                </Link>
              </li>
              <li className="list-inline-item me-3">
                <Link
                  to="#"
                  className="text-secondary"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '1.2rem' }}
                >
                  <FontAwesomeIcon icon={faInstagram} />
                  <span className="visually-hidden">Instagram</span>
                </Link>
              </li>
              <li className="list-inline-item me-3">
                <Link
                  to="#"
                  className="text-secondary"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '1.2rem' }}
                >
                  <FontAwesomeIcon icon={faTwitter} />
                  <span className="visually-hidden">Twitter</span>
                </Link>
              </li>
              <li className="list-inline-item me-3">
                <Link
                  to="#"
                  className="text-secondary"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '1.2rem' }}
                >
                  <FontAwesomeIcon icon={faGithub} />
                  <span className="visually-hidden">GitHub</span>
                </Link>
              </li>
              <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-secondary"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '1.2rem' }}
                >
                  <FontAwesomeIcon icon={faDribbble} />
                  <span className="visually-hidden">Dribbble</span>
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default EcommerceFooter;
