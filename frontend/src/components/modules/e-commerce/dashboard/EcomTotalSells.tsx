import EcomTotalSellsChart from 'components/charts/e-charts/EcomTotalSellsChart';
import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';

const EcomTotalSells = () => {
  return (
    <>
      <Row className="justify-content-between align-items-center mb-4 g-3">
        <Col xs="auto">
          <h3>Total sells</h3>
          <p className="text-body-tertiary lh-sm mb-0">
            Payment received across all channels
          </p>
        </Col>
        <Col xs={8} sm={4}>
          <Form.Select size="sm">
            <option value="mar">Mar 1 - 31, 2023</option>
            <option value="apr">April 1 - 30, 2023</option>
            <option value="may">May 1 - 31, 2023</option>
          </Form.Select>
        </Col>
      </Row>
      <EcomTotalSellsChart />
    </>
  );
};

export default EcomTotalSells;
