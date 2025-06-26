import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Avatar from 'components/base/Avatar';

const EcomProfileCard = () => {
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="border-bottom border-dashed pb-4">
          <Row className="align-items-center g-3 g-sm-5 text-center text-sm-start">
            <Col xs={12} sm="auto">
              <Avatar size="5xl" variant="name">
                U
              </Avatar>
            </Col>
            <Col xs={12} sm="auto" className="flex-1">
              <h3>Ansolo Lazinatov</h3>
              <p className="text-body-secondary">Joined 3 months ago</p>
            </Col>
          </Row>
        </div>
        <div className="d-flex flex-between-center pt-4">
          <div>
            <h6 className="mb-2 text-body-secondary">Total Spent</h6>
            <h4 className="fs-7 text-body-highlight mb-0">$894</h4>
          </div>
          <div className="text-end">
            <h6 className="mb-2 text-body-secondary">Last Order</h6>
            <h4 className="fs-7 text-body-highlight mb-0">1 week ago</h4>
          </div>
          <div className="text-end">
            <h6 className="mb-2 text-body-secondary">Total Orders</h6>
            <h4 className="fs-7 text-body-highlight mb-0">97</h4>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EcomProfileCard;
