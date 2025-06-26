import { Card, Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Facility } from 'types';

interface AvailabilityPricingStepProps {
  formData: Partial<Facility>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Facility>>>;
  addAvailabilityDay: () => void;
  updateAvailability: (index: number, field: string, value: any) => void;
  removeAvailabilityDay: (index: number) => void;
}

const AvailabilityPricingStep = ({
  formData,
  setFormData,
  addAvailabilityDay,
  updateAvailability,
  removeAvailabilityDay
}: AvailabilityPricingStepProps) => {
  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Step 3: Availability & Pricing</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Label className="fw-semibold mb-0">
              Weekly Availability
            </Form.Label>
            <Button variant="primary" size="sm" onClick={addAvailabilityDay}>
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Add Day
            </Button>
          </div>

          {formData.availability && formData.availability.length > 0 ? (
            formData.availability.map((day, index) => (
              <Card key={index} className="mb-2">
                <Card.Body className="py-2">
                  <Row className="align-items-center">
                    <Col md={3}>
                      <Form.Select
                        size="sm"
                        value={day.day}
                        onChange={e =>
                          updateAvailability(index, 'day', e.target.value)
                        }
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        type="time"
                        size="sm"
                        value={day.startTime}
                        onChange={e =>
                          updateAvailability(index, 'startTime', e.target.value)
                        }
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        type="time"
                        size="sm"
                        value={day.endTime}
                        onChange={e =>
                          updateAvailability(index, 'endTime', e.target.value)
                        }
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Check
                        type="checkbox"
                        label="Available"
                        checked={day.isAvailable}
                        onChange={e =>
                          updateAvailability(
                            index,
                            'isAvailable',
                            e.target.checked
                          )
                        }
                      />
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeAvailabilityDay(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted py-3">
              No availability schedule added yet. Click "Add Day" to get
              started.
            </div>
          )}
        </div>

        <div className="mb-4">
          <Form.Label className="fw-semibold">Pricing *</Form.Label>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Select
                value={formData.pricing?.[0]?.unit || 'hour'}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    pricing: [
                      {
                        unit: e.target.value as any,
                        amount: prev.pricing?.[0]?.amount || 0,
                        isDefault: true
                      }
                    ]
                  }))
                }
              >
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Price amount"
                  step="0.01"
                  min="0"
                  value={formData.pricing?.[0]?.amount || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      pricing: [
                        {
                          unit: prev.pricing?.[0]?.unit || 'hour',
                          amount: Number(e.target.value),
                          isDefault: true
                        }
                      ]
                    }))
                  }
                  required
                />
              </InputGroup>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AvailabilityPricingStep;
