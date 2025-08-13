import {
  Container,
  Row,
  Col,
  Card,
  Placeholder,
  Badge,
  Spinner
} from 'components/ui';

const FacilitySummarySkeleton = () => (
  <Card className="mb-3 border-secondary shadow">
    <Card.Body className="p-4">
      <div className="flex mb-3">
        <Placeholder
          as="div"
          animation="glow"
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 16,
            background: '#dee2e6'
          }}
        />
        <div className="flex-grow-1">
          <Placeholder as="h5" animation="glow">
            <Placeholder xs={7} bg="secondary" />
          </Placeholder>
          <Placeholder as="div" animation="glow" className="mb-2">
            <Placeholder xs={5} bg="secondary" />
          </Placeholder>
          <Placeholder as="div" animation="glow">
            <Placeholder xs={3} bg="secondary" />
          </Placeholder>
        </div>
      </div>
      <div className="mb-3">
        <Placeholder as="h6" animation="glow">
          <Placeholder xs={4} bg="secondary" />
        </Placeholder>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Placeholder
              as={Badge}
              key={idx}
              animation="glow"
              bg="secondary"
              style={{ width: 70, height: 24 }}
            >
              &nbsp;
            </Placeholder>
          ))}
          <Placeholder
            as="span"
            animation="glow"
            className="text-gray-600 dark:text-gray-400 small"
            style={{ width: 40 }}
          >
            <Placeholder xs={2} bg="secondary" />
          </Placeholder>
        </div>
      </div>
    </Card.Body>
  </Card>
);

const BookingSummarySkeleton = () => (
  <Card className="border-secondary shadow">
    <Card.Header className="border-secondary">
      <Placeholder as="h5" animation="glow">
        <Placeholder xs={6} bg="secondary" />
      </Placeholder>
    </Card.Header>
    <Card.Body className="p-4">
      <div className="mb-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div className="flex justify-content-between mb-2" key={idx}>
            <Placeholder xs={5} bg="secondary" />
            <Placeholder xs={3} bg="secondary" />
          </div>
        ))}
        <hr className="border-secondary" />
        <div className="flex justify-content-between fw-bold h5">
          <Placeholder xs={3} bg="secondary" />
          <Placeholder xs={3} bg="secondary" />
        </div>
      </div>
      <div className="p-3 bg-success bg-opacity-10 border border-success rounded">
        <Placeholder as="div" animation="glow" className="mb-2">
          <Placeholder xs={5} bg="secondary" />
        </Placeholder>
        <ul className="text-gray-600 dark:text-gray-400 small mb-0 ps-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <li key={idx}>
              <Placeholder xs={7} bg="secondary" />
            </li>
          ))}
        </ul>
      </div>
    </Card.Body>
  </Card>
);

const ProgressStepsSkeleton = () => (
  <Card className="mb-4 border-secondary">
    <Card.Body className="p-3">
      <Row className="text-center">
        <Col xs={6}>
          <Placeholder as="div" animation="glow">
            <Placeholder
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: 8
              }}
              bg="secondary"
            />
            <Placeholder as="span" xs={4} bg="secondary" />
          </Placeholder>
        </Col>
        <Col xs={6}>
          <Placeholder as="div" animation="glow">
            <Placeholder
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: 8
              }}
              bg="secondary"
            />
            <Placeholder as="span" xs={6} bg="secondary" />
          </Placeholder>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

const DateTimeStepSkeleton = () => (
  <Card className="mb-4 border-secondary shadow">
    <Card.Header className="border-secondary">
      <Placeholder as="h5" animation="glow">
        <Placeholder xs={7} bg="secondary" />
      </Placeholder>
    </Card.Header>
    <Card.Body className="p-4">
      <Row>
        <Col md={6} className="mb-3">
          <Placeholder as="label" animation="glow">
            <Placeholder xs={5} bg="secondary" />
          </Placeholder>
          <Placeholder as="div" animation="glow" style={{ height: 38 }} />
        </Col>
        <Col md={6} className="mb-3">
          <Placeholder as="label" animation="glow">
            <Placeholder xs={7} bg="secondary" />
          </Placeholder>
          <Placeholder as="div" animation="glow" style={{ height: 38 }} />
        </Col>
      </Row>
      <div className="mb-3">
        <Placeholder as="label" animation="glow">
          <Placeholder xs={6} bg="secondary" />
        </Placeholder>
        <Row className="g-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Col xs={6} md={3} key={idx}>
              <Placeholder.Button
                variant="secondary"
                style={{ width: '100%', height: 38 }}
              />
            </Col>
          ))}
        </Row>
      </div>
      <div className="mb-3">
        <Placeholder as="label" animation="glow">
          <Placeholder xs={4} bg="secondary" />
        </Placeholder>
        <div className="flex align-items-center gap-3">
          <Placeholder.Button
            variant="secondary"
            style={{ width: 38, height: 38 }}
          />
          <Placeholder as="span" xs={2} bg="secondary" style={{ height: 32 }} />
          <Placeholder.Button
            variant="secondary"
            style={{ width: 38, height: 38 }}
          />
        </div>
        <Placeholder as="small" animation="glow">
          <Placeholder xs={6} bg="secondary" />
        </Placeholder>
      </div>
    </Card.Body>
  </Card>
);

const CustomerInfoStepSkeleton = () => (
  <Card className="mb-4 border-secondary shadow">
    <Card.Header className="border-secondary">
      <Placeholder as="h5" animation="glow">
        <Placeholder xs={8} bg="secondary" />
      </Placeholder>
    </Card.Header>
    <Card.Body className="p-4">
      <Placeholder as="h6" animation="glow" className="mb-3">
        <Placeholder xs={4} bg="secondary" />
      </Placeholder>
      <Row className="mb-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Col md={6} className="mb-3" key={idx}>
            <Placeholder as="label" animation="glow">
              <Placeholder xs={6} bg="secondary" />
            </Placeholder>
            <Placeholder as="div" animation="glow">
              <Placeholder xs={12} bg="secondary" style={{ height: 38 }} />
            </Placeholder>
          </Col>
        ))}
        <Col xs={12} className="mb-3">
          <Placeholder animation="glow">
            <Placeholder xs={7} bg="secondary" />
          </Placeholder>
          <Placeholder animation="glow">
            <Placeholder xs={12} bg="secondary" style={{ height: 38 }} />
          </Placeholder>
        </Col>
      </Row>
      <div className="mb-4">
        <Placeholder as="label" animation="glow">
          <Placeholder as="textarea" animation="glow" style={{ height: 70 }} />
          <Placeholder xs={12} bg="secondary" style={{ height: 70 }} />
        </Placeholder>
        <Placeholder animation="glow" className="bg-opacity-10 border-info">
          <Placeholder xs={10} bg="secondary" className="mb-2" />
          <ul className="text-gray-600 dark:text-gray-400 small mb-0 ps-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <li key={idx}>
                <Placeholder xs={7} bg="secondary" />
              </li>
            ))}
          </ul>
        </Placeholder>
      </div>
    </Card.Body>
  </Card>
);

const BookingPageLoader = () => (
  <div className="min-vh-100">
    <Container fluid className="py-4">
      <div className="flex align-items-center mb-4">
        <Placeholder.Button
          variant="secondary"
          style={{ width: 120, height: 38, marginRight: 16 }}
        />
        <div>
          <Placeholder as="h1" animation="glow" className="mb-0">
            <Placeholder xs={6} bg="secondary" />
          </Placeholder>
          <Placeholder as="p" animation="glow" className="mb-0">
            <Placeholder xs={4} bg="secondary" />
          </Placeholder>
        </div>
      </div>
      <ProgressStepsSkeleton />
      <Row>
        <Col lg={8}>
          <DateTimeStepSkeleton />
          <CustomerInfoStepSkeleton />
          <div className="mb-3">
            <Placeholder.Button
              variant="secondary"
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <Placeholder xs={6} bg="secondary" />
          </div>
          <div className="d-grid mb-3">
            <Placeholder.Button
              variant="secondary"
              style={{ height: 48, borderRadius: 8 }}
            />
          </div>
          <div className="text-center mt-3">
            <Placeholder xs={5} bg="secondary" />
          </div>
        </Col>
        <Col lg={4}>
          <div className="sticky-top" style={{ top: '20px' }}>
            <FacilitySummarySkeleton />
            <BookingSummarySkeleton />
          </div>
        </Col>
      </Row>
    </Container>
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
        <p className="mt-3 text-muted">Loading booking form...</p>
      </div>
    </div>
  </div>
);

export default BookingPageLoader;
