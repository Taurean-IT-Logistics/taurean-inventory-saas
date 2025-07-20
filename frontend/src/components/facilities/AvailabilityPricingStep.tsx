import React from 'react';
import { Card, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Facility } from 'types';

interface AvailabilityPricingStepProps {
  formData: Partial<Facility>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Facility>>>;
  updateAvailability: (index: number, field: string, value: any) => void;
}

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const AvailabilityPricingStep = ({
  formData,
  setFormData,
  updateAvailability
}: AvailabilityPricingStepProps) => {
  React.useEffect(() => {
    if (!formData.availability || formData.availability.length !== 7) {
      setFormData((prev: Partial<Facility>) => ({
        ...prev,
        availability: DAYS.map((d, i) => ({
          day: d.value as
            | 'monday'
            | 'tuesday'
            | 'wednesday'
            | 'thursday'
            | 'friday'
            | 'saturday'
            | 'sunday',
          startTime: prev.availability?.[i]?.startTime || '08:00',
          endTime: prev.availability?.[i]?.endTime || '17:00',
          isAvailable: prev.availability?.[i]?.isAvailable ?? true
        }))
      }));
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Step 3: Availability & Pricing</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <Form.Label className="fw-semibold mb-3">
            Weekly Availability
          </Form.Label>
          {formData.availability && formData.availability.length === 7 ? (
            formData.availability.map((day, index) => (
              <Card key={day.day} className="mb-2">
                <Card.Body className="py-2">
                  <Row className="align-items-center gap-2">
                    <Col md={3}>
                      <Form.Select size="sm" value={day.day} disabled>
                        {DAYS.map(d => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
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
                    <Col md={3}>
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
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted py-3">
              Loading weekly availability...
            </div>
          )}
        </div>

        <div className="mb-4">
          <Form.Label className="fw-semibold">Pricing *</Form.Label>
          <Row className="gap-2">
            <Col md={6}>
              <Form.Select
                value={formData.pricing?.[0]?.unit || 'hour'}
                onChange={e =>
                  setFormData((prev: Partial<Facility>) => ({
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
                <InputGroup.Text>₵</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Price amount"
                  step="0.01"
                  min="0"
                  value={formData.pricing?.[0]?.amount || ''}
                  onChange={e =>
                    setFormData((prev: Partial<Facility>) => ({
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
            <Col md={6} className="mt-4">
              <Form.Check>
                <Form.Check.Input
                  id="tax"
                  checked={formData.isTaxable}
                  onChange={e =>
                    setFormData((prev: Partial<Facility>) => ({
                      ...prev,
                      isTaxable: Boolean(e.target.checked)
                    }))
                  }
                  defaultChecked
                />
                <Form.Check.Label htmlFor="tax" className="mb-0">
                  Tax Facility
                </Form.Check.Label>
              </Form.Check>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AvailabilityPricingStep;
