import React from 'react';
import { Container, Row, Col, Card, Placeholder } from 'react-bootstrap';

const ImageGallerySkeleton = () => (
  <Card border="secondary" className="mb-4">
    <Card.Body className="p-0">
      <Placeholder as="div" animation="glow">
        <Placeholder
          bg="secondary"
          style={{
            height: '24rem',
            borderTopLeftRadius: '.5rem',
            borderTopRightRadius: '.5rem'
          }}
        />
        <div className="d-flex gap-2 p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Placeholder
              key={index}
              bg="secondary"
              style={{ height: '5rem', width: '5rem', borderRadius: '.5rem' }}
            />
          ))}
        </div>
      </Placeholder>
    </Card.Body>
  </Card>
);

const ItemDetailsSkeleton = () => (
  <div className="mb-4">
    <Placeholder as="div" animation="glow">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <Placeholder
            xs={8}
            bg="secondary"
            className="mb-2"
            style={{ height: '2rem' }}
          />
          <div className="d-flex gap-2">
            <Placeholder
              xs={4}
              bg="secondary"
              style={{ height: '1.5rem', width: '5rem' }}
            />
            <Placeholder
              xs={6}
              bg="secondary"
              style={{ height: '1rem', width: '6rem' }}
            />
          </div>
        </div>
        <Placeholder
          bg="secondary"
          style={{ height: '2.5rem', width: '2.5rem', borderRadius: '.5rem' }}
        />
      </div>

      <div className="mb-4">
        <Placeholder
          xs={4}
          bg="secondary"
          className="mb-2"
          style={{ height: '2rem' }}
        />
        <Placeholder
          xs={12}
          bg="secondary"
          className="mb-2"
          style={{ height: '1rem' }}
        />
        <Placeholder xs={9} bg="secondary" style={{ height: '1rem' }} />
      </div>
    </Placeholder>
  </div>
);

const RentalOptionsSkeleton = () => (
  <Card border="secondary" className="mb-4">
    <Card.Header className="border-secondary">
      <Placeholder as="div" animation="glow">
        <Placeholder xs={4} bg="secondary" style={{ height: '1.5rem' }} />
      </Placeholder>
    </Card.Header>
    <Card.Body>
      <Placeholder as="div" animation="glow">
        <Row className="mb-3">
          <Col md={6}>
            <Placeholder
              xs={4}
              bg="secondary"
              className="mb-2"
              style={{ height: '1rem' }}
            />
            <Placeholder
              bg="secondary"
              style={{ height: '2.5rem', borderRadius: '.5rem' }}
            />
          </Col>
          <Col md={6}>
            <Placeholder
              xs={5}
              bg="secondary"
              className="mb-2"
              style={{ height: '1rem' }}
            />
            <Placeholder
              bg="secondary"
              style={{ height: '2.5rem', borderRadius: '.5rem' }}
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Placeholder xs={4} bg="secondary" style={{ height: '1rem' }} />
          <Placeholder xs={3} bg="secondary" style={{ height: '1.5rem' }} />
        </div>

        <Placeholder
          bg="secondary"
          style={{ height: '3rem', borderRadius: '.5rem' }}
        />
      </Placeholder>
    </Card.Body>
  </Card>
);

const ItemInformationSkeleton = () => (
  <Card border="secondary">
    <Card.Header className="border-secondary">
      <Placeholder as="div" animation="glow">
        <Placeholder xs={5} bg="secondary" style={{ height: '1.5rem' }} />
      </Placeholder>
    </Card.Header>
    <Card.Body>
      <Placeholder as="div" animation="glow">
        <Row>
          {Array.from({ length: 6 }).map((_, index) => (
            <Col md={6} key={index} className="mb-3">
              <Placeholder
                xs={6}
                bg="secondary"
                className="mb-1"
                style={{ height: '.75rem' }}
              />
              <Placeholder xs={4} bg="secondary" style={{ height: '1rem' }} />
            </Col>
          ))}
        </Row>
      </Placeholder>
    </Card.Body>
  </Card>
);

const InventoryItemDetailSkeleton = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Container fluid className="py-4">
        {/* Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Placeholder as="div" animation="glow">
            <Placeholder
              xs={8}
              bg="secondary"
              style={{ height: '2.5rem', width: '8rem' }}
            />
          </Placeholder>
        </div>

        <Row>
          <Col lg={6}>
            <ImageGallerySkeleton />
          </Col>

          <Col lg={6}>
            <ItemDetailsSkeleton />
            <RentalOptionsSkeleton />
            <ItemInformationSkeleton />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InventoryItemDetailSkeleton;
