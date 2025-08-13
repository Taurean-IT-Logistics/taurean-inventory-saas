import { Card, Row, Col } from 'components/ui';

interface FacilityProgressStepsProps {
  currentStep: number;
}

const FacilityProgressSteps = ({ currentStep }: FacilityProgressStepsProps) => {
  const steps = [
    { number: 1, title: 'Basic Info & Images' },
    { number: 2, title: 'Details & Amenities' },
    { number: 3, title: 'Availability & Pricing' }
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        <Row className="text-center">
          {steps.map((step, index) => (
            <Col key={step.number} id={`step-${index}`} xs={4}>
              <div
                className={`d-flex align-items-center justify-content-center ${
                  currentStep >= step.number ? 'text-primary' : 'text-muted'
                }`}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center me-2 text-white ${
                    currentStep >= step.number ? 'bg-primary' : 'bg-secondary'
                  }`}
                  style={{ width: '30px', height: '30px' }}
                >
                  <span className="small fw-bold">{step.number}</span>
                </div>
                <span className="small fw-semibold">{step.title}</span>
              </div>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default FacilityProgressSteps;
