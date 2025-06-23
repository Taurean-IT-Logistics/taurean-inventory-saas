import { faRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { Col, Row } from 'react-bootstrap';
import { Suspense, lazy } from 'react';
import PhoenixLoader from 'components/common/PhoenixLoader';

const Mapbox = lazy(() => import('components/base/MapBox'));

const Location = () => {
  return (
    <div className="mb-8">
      <h3 className="mb-5 mb-xl-4">Location</h3>
      <div className="mb-3 mb-xl-4 location-map border border-translucent overflow-hidden">
        <Suspense fallback={<PhoenixLoader />}>
          <Mapbox
            className="border rounded-3"
            options={{
              center: [-74.0020158, 40.7228022],
              zoom: 14,
              scrollZoom: false
            }}
          />
        </Suspense>
      </div>
      <Row className="flex-between-center gx-0 gy-3">
        <Col xs={12} sm="auto" className="me-1">
          <div className="d-flex">
            <h5 className="fw-bold text-body-highlight me-2 mb-0">
              James Tiberius Auditorium
            </h5>
            <p className="mb-0 text-body-highlight fs-9">Vancouver</p>
          </div>
        </Col>
        <Col xs={12} sm="auto" xl={12}>
          <Button
            variant="phoenix-primary"
            className="w-100"
            startIcon={<FontAwesomeIcon icon={faRotate} className="me-2" />}
          >
            Get directions
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Location;
