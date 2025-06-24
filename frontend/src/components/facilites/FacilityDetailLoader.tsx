import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Placeholder,
  Badge
} from 'react-bootstrap';

const ImageGallerySkeleton: React.FC = () => (
  <Row className="g-2 mb-4">
    <Col md={8}>
      <Placeholder as="div" animation="glow">
        <Placeholder
          bg="secondary"
          style={{ height: 400, display: 'block', borderRadius: '1rem' }}
        />
      </Placeholder>
    </Col>
    <Col md={4}>
      <Row className="g-2 h-100">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Col xs={6} key={idx}>
            <Placeholder as="div" animation="glow">
              <Placeholder
                bg="secondary"
                style={{ height: 190, display: 'block', borderRadius: '.5rem' }}
              />
            </Placeholder>
          </Col>
        ))}
      </Row>
    </Col>
  </Row>
);

const TitleSkeleton: React.FC = () => (
  <div className="mb-4">
    <Placeholder as="h1" animation="glow">
      <Placeholder xs={8} bg="secondary" style={{ height: '3rem' }} />
    </Placeholder>
    <Placeholder as="div" animation="glow">
      <Placeholder xs={6} bg="secondary" />
    </Placeholder>
  </div>
);

const BadgesSkeleton: React.FC = () => (
  <div className="d-flex gap-2 mb-4">
    {[1, 2].map((_, idx) => (
      <Placeholder as={Badge} key={idx} animation="glow" bg="secondary" pill>
        <Placeholder xs={3} style={{ height: '1.5rem' }} />
      </Placeholder>
    ))}
  </div>
);

const DescriptionSkeleton: React.FC = () => (
  <div className="mb-5">
    <Placeholder as="h3" animation="glow">
      <Placeholder xs={4} bg="secondary" style={{ height: '1.5rem' }} />
    </Placeholder>
    <Placeholder as="p" animation="glow">
      <Placeholder xs={12} bg="secondary" />
    </Placeholder>
    <Placeholder as="p" animation="glow">
      <Placeholder xs={10} bg="secondary" />
    </Placeholder>
    <Placeholder as="p" animation="glow">
      <Placeholder xs={8} bg="secondary" />
    </Placeholder>
  </div>
);

const KeyDetailsSkeleton: React.FC = () => (
  <Row className="mb-5">
    {Array.from({ length: 3 }).map((_, idx) => (
      <Col md={4} className="mb-3" key={idx}>
        <div className="d-flex align-items-center">
          <Placeholder as="div" animation="glow" className="me-3">
            <Placeholder
              bg="secondary"
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'inline-block'
              }}
            />
          </Placeholder>
          <div className="flex-grow-1">
            <Placeholder as="div" animation="glow">
              <Placeholder xs={8} bg="secondary" className="mb-1" />
              <Placeholder xs={6} bg="secondary" />
            </Placeholder>
          </div>
        </div>
      </Col>
    ))}
  </Row>
);

const AmenitiesSkeleton: React.FC = () => (
  <div className="mb-5">
    <Placeholder as="h3" animation="glow">
      <Placeholder xs={5} bg="secondary" style={{ height: '1.5rem' }} />
    </Placeholder>
    <Row>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Col md={6} className="mb-3" key={idx}>
          <div className="d-flex align-items-center">
            <Placeholder as="div" animation="glow" className="me-3">
              <Placeholder
                bg="secondary"
                style={{
                  width: '1rem',
                  height: '1rem',
                  display: 'inline-block'
                }}
              />
            </Placeholder>
            <Placeholder as="span" animation="glow" className="flex-grow-1">
              <Placeholder xs={7} bg="secondary" />
            </Placeholder>
          </div>
        </Col>
      ))}
    </Row>
  </div>
);

const BookingCardSkeleton: React.FC = () => (
  <Card border="secondary">
    <Card.Body className="p-4">
      <Placeholder as="div" animation="glow">
        <div className="d-flex align-items-baseline mb-3">
          <Placeholder xs={4} bg="secondary" style={{ height: '2rem' }} />
          <Placeholder xs={3} bg="secondary" className="ms-2" />
        </div>
        <div className="d-grid gap-2 mb-3">
          <Placeholder
            bg="secondary"
            style={{ height: '3rem', borderRadius: '.5rem' }}
          />
          <Placeholder
            bg="secondary"
            style={{ height: '2.5rem', borderRadius: '.5rem' }}
          />
        </div>
        <div className="text-center mb-3">
          <Placeholder xs={6} bg="secondary" />
        </div>
        <hr className="border-secondary" />
        <div className="small">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div className="d-flex justify-content-between mb-2" key={idx}>
              <Placeholder xs={4} bg="secondary" />
              <Placeholder xs={3} bg="secondary" />
            </div>
          ))}
        </div>
      </Placeholder>
    </Card.Body>
  </Card>
);

const LoadingOverlay: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1050
    }}
  >
    <div className="d-flex flex-column align-items-center">
      <Spinner
        animation="border"
        variant="primary"
        style={{ width: '3rem', height: '3rem' }}
      />
      <p className="mt-3 text-muted">Loading facility details...</p>
    </div>
  </div>
);

const FacilityDetailLoader: React.FC = () => (
  <div style={{ minHeight: '100vh' }}>
    <Container fluid>
      <ImageGallerySkeleton />
    </Container>
    <Container>
      <Row>
        <Col lg={8}>
          <TitleSkeleton />
          <BadgesSkeleton />
          <DescriptionSkeleton />
          <KeyDetailsSkeleton />
          <AmenitiesSkeleton />
        </Col>
        <Col lg={4}>
          <BookingCardSkeleton />
        </Col>
      </Row>
    </Container>
    <LoadingOverlay />
  </div>
);

export default FacilityDetailLoader;
