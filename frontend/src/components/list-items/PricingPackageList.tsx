import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Badge from 'components/base/Badge';
import { Feature } from 'data/pricing';
import React from 'react';
import { Col, Row } from 'react-bootstrap';

const PricingPackageList = ({ features }: { features: Feature[] }) => {
  return (
    <Row>
      {features.map(item => (
        <Col key={item.id} md={6} xxl={12}>
          <PackageItem item={item} />
        </Col>
      ))}
    </Row>
  );
};

const PackageItem = ({ item }: { item: Feature }) => {
  return (
    <div className="rounded-3 py-2 px-3 bg-body-emphasis d-flex align-items-center mb-3">
      <FontAwesomeIcon icon={faCheck} className="text-primary me-3 fs-9" />
      <p className="mb-0 text-body-secondary">{item.label}</p>
      {item.new && (
        <Badge variant="phoenix" bg="primary" className="ms-2">
          New
        </Badge>
      )}
    </div>
  );
};

export default PricingPackageList;
