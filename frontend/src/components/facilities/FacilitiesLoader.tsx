import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Placeholder,
  Stack
} from 'components/ui';

const HeaderLoader: React.FC = () => (
  <Row className="mb-4">
    <Col>
      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center mb-3"
      >
        <div>
          <Placeholder as="h1" animation="glow">
            <Placeholder xs={6} bg="secondary" style={{ height: '2.5rem' }} />
          </Placeholder>
          <Placeholder as="div" animation="glow">
            <Placeholder xs={4} bg="secondary" />
          </Placeholder>
        </div>
        <Stack direction="horizontal" gap={2}>
          <Placeholder.Button
            variant="secondary"
            style={{ width: 40, height: 40 }}
          />
          <Placeholder.Button
            variant="secondary"
            style={{ width: 40, height: 40 }}
          />
        </Stack>
      </Stack>
    </Col>
  </Row>
);

const FilterCardLoader: React.FC = () => (
  <Row className="mb-4">
    <Col>
      <Card className="border-secondary">
        <Card.Body>
          <Row className="items-center">
            {[4, 2, 2, 2].map((col, idx) => (
              <Col md={col} className="mb-2" key={idx}>
                <Placeholder as="div" animation="glow">
                  <Placeholder
                    xs={12}
                    bg="secondary"
                    style={{ height: '2.5rem', borderRadius: '.5rem' }}
                  />
                </Placeholder>
              </Col>
            ))}
          </Row>
          <Row className="mt-3 pt-3 border-top border-secondary">
            {[3, 3, 6].map((col, idx) => (
              <Col md={col} className="mb-3" key={idx}>
                <Placeholder as="div" animation="glow">
                  <Placeholder
                    xs={8}
                    bg="secondary"
                    style={{ height: '1.5rem' }}
                  />
                  <Placeholder xs={12} bg="secondary" />
                </Placeholder>
              </Col>
            ))}
            <Col xs={12}>
              <Placeholder.Button
                variant="secondary"
                size="sm"
                style={{ width: 120 }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);

const FilterActionsLoader: React.FC = () => (
  <Row className="mb-4">
    <Col>
      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center"
      >
        <Placeholder as="div" animation="glow">
          <Placeholder xs={3} bg="secondary" />
        </Placeholder>
        <Stack direction="horizontal" gap={2}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Placeholder.Button
              key={idx}
              variant="secondary"
              size="sm"
              style={{ width: 80 }}
            />
          ))}
        </Stack>
      </Stack>
    </Col>
  </Row>
);

const FacilityCardLoader: React.FC = () => (
  <Card className="border-secondary">
    <div style={{ width: '100%' }}>
      <Placeholder as="div" animation="glow">
        <Placeholder
          xs={12}
          bg="secondary"
          style={{
            height: 160,
            borderRadius: '.5rem .5rem 0 0',
            display: 'block'
          }}
        />
      </Placeholder>
    </div>
    <Card.Body>
      <Placeholder as="h5" animation="glow">
        <Placeholder xs={7} bg="secondary" />
      </Placeholder>
      <Placeholder as="div" animation="glow">
        <Placeholder xs={10} bg="secondary" />
        <Placeholder xs={6} bg="secondary" />
      </Placeholder>
      <Stack direction="horizontal" gap={2} className="mt-3">
        <Placeholder.Button variant="secondary" style={{ width: 80 }} />
        <Placeholder.Button variant="secondary" style={{ width: 80 }} />
      </Stack>
    </Card.Body>
  </Card>
);

const FacilitiesGridLoader: React.FC = () => (
  <Row className="g-4">
    {Array.from({ length: 8 }).map((_, idx) => (
      <Col key={idx} sm={6} lg={4} xl={3}>
        <FacilityCardLoader />
      </Col>
    ))}
  </Row>
);

const OverlayLoader: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1050
    }}
  >
    <div className="flex flex-column align-items-center">
      <Spinner
        animation="border"
        variant="primary"
        style={{ width: '3rem', height: '3rem' }}
      />
      <p className="mt-3 text-muted">Loading facilities...</p>
    </div>
  </div>
);

const FacilitiesLoader: React.FC = () => (
  <Container fluid className="py-4">
    <HeaderLoader />
    <FilterCardLoader />
    <FilterActionsLoader />
    <FacilitiesGridLoader />
    <OverlayLoader />
  </Container>
);

export default FacilitiesLoader;
