import React from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const DealsOtherInformation = () => {
  return (
    <Card>
      <Card.Body>
        <h4 className="mb-5">Others Information</h4>
        <Row className="g-3">
          <Col xs={12}>
            <div className="mb-4">
              <div className="d-flex flex-wrap justify-content-between mb-2">
                <h5 className="mb-0 text-body-highlight me-2">Category</h5>
                <Link to="#!" className="fw-bold fs-9">
                  Add new category
                </Link>
              </div>
              <Form.Select>
                <option value="financial">Financial</option>
                <option value="marketplace">Marketplace</option>
                <option value="travel">Travel</option>
                <option value="e-commerce">E-commerce</option>
                <option value="cloud-computing">Cloud Computing</option>
              </Form.Select>
            </div>
            <div className="mb-4">
              <h5 className="mb-0 text-body-highlight mb-2">Priority</h5>
              <Form.Select>
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="urgent">Urgent</option>
              </Form.Select>
            </div>
            <div className="mb-4">
              <h5 className="mb-0 text-body-highlight mb-2">Stage</h5>
              <Form.Select>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="canceled">Canceled</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </div>
            <div className="mb-4">
              <div className="d-flex flex-wrap justify-content-between mb-2">
                <h5 className="mb-0 text-body-highlight me-2">Lead Source</h5>
                <Link to="#!" className="fw-bold fs-9">
                  Add new
                </Link>
              </div>
              <Form.Select>
                <option value="referrals">Referrals</option>
                <option value="former-clients">Former Clients</option>
                <option value="competitors">Competitors</option>
                <option value="business-sales">Business &amp; sales</option>
                <option value="google-resources">Google resources</option>
                <option value="linkedin">Linkedin</option>
                <option value="marketing">Marketing</option>
              </Form.Select>
            </div>
            <div>
              <div className="d-flex flex-wrap justify-content-between mb-2">
                <h5 className="mb-0 text-body-highlight me-2">
                  Campaign Source
                </h5>
                <Link to="#!" className="fw-bold fs-9">
                  Add new
                </Link>
              </div>
              <Form.Select>
                <option value="online-campaign">Online Campaign</option>
                <option value="offline-campaign">Offline Campaign</option>
              </Form.Select>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DealsOtherInformation;
