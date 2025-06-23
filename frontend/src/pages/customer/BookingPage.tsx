import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  faCalendarAlt,
  faClock,
  faUsers,
  faMapMarkerAlt,
  faArrowLeft,
  faCheck,
  faCreditCard,
  faShieldAlt,
  faPlus,
  faMinus,
  faWifi,
  faParking,
  faUtensils,
  faDesktop,
  faSnowflake,
  faStar,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Badge from 'components/base/Badge';
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Container
} from 'react-bootstrap';
import { mockFacilities } from 'data';
import { currencyFormat } from 'helpers/utils';
import { Facility, User } from 'types';
import BookingPageLoader from 'booking/BookingPageLoader';

interface BookingFormData {
  selectedDate: string;
  selectedTime: string;
  endTime: string;
  duration: string;
  guests: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  };
  specialRequests: string;
  agreeToTerms: boolean;
}

interface PricingBreakdown {
  basePrice: number;
  duration: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
}

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('wifi')) return faWifi;
  if (amenityLower.includes('parking')) return faParking;
  if (amenityLower.includes('coffee') || amenityLower.includes('catering'))
    return faUtensils;
  if (amenityLower.includes('projector') || amenityLower.includes('video'))
    return faDesktop;
  if (amenityLower.includes('air') || amenityLower.includes('climate'))
    return faSnowflake;
  return faCheck;
};

// Facility Not Found
const FacilityNotFound = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-100">
    <div className="text-center">
      <h2 className="mb-3">Facility not found</h2>
      <Button as={Link} to="/" variant="primary">
        Back to Home
      </Button>
    </div>
  </div>
);
const BookingFormStep = ({
  facility,
  formData,
  setFormData,
  handleDateChange,
  handleTimeChange,
  handleDurationChange,
  availableSlots,
  isCheckingAvailability,
  handleGuestsChange
}: {
  facility: Facility;
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  handleDateChange: (date: string) => void;
  handleTimeChange: (time: string) => void;
  handleDurationChange: (duration: number) => void;
  availableSlots: string[];
  isCheckingAvailability: boolean;
  handleGuestsChange: (guests: number) => void;
}) => (
  <Card className="mb-4 border-secondary shadow">
    <Card.Header className="border-secondary">
      <h5 className="mb-0">
        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
        Book Your Space
      </h5>
    </Card.Header>
    <Card.Body className="p-4">
      <Form>
        {/* Date Selection */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Select Date
              </Form.Label>
              <Form.Control
                type="date"
                value={formData.selectedDate}
                onChange={e => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Select Time
              </Form.Label>
              {isCheckingAvailability ? (
                <div className="text-center p-3">
                  <Spinner animation="border" size="sm" />
                  <div className="mt-2 text-muted">
                    Checking availability...
                  </div>
                </div>
              ) : (
                <Form.Select
                  value={formData.selectedTime}
                  onChange={e => handleTimeChange(e.target.value)}
                  disabled={!formData.selectedDate}
                  required
                >
                  <option value="">Choose time</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Duration and Guests */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Duration (hours)</Form.Label>
              <div className="d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    handleDurationChange(parseInt(formData.duration) - 1)
                  }
                  disabled={parseInt(formData.duration) <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
                <span className="mx-3 fw-bold">{formData.duration}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    handleDurationChange(parseInt(formData.duration) + 1)
                  }
                  disabled={parseInt(formData.duration) >= 12}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Number of Guests
              </Form.Label>
              <div className="d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleGuestsChange(formData.guests - 1)}
                  disabled={formData.guests <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
                <span className="mx-3 fw-bold">{formData.guests}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleGuestsChange(formData.guests + 1)}
                  disabled={formData.guests >= facility.capacity.maximum}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>
              <small className="text-muted">
                Max capacity: {facility.capacity.maximum}
              </small>
            </Form.Group>
          </Col>
        </Row>

        {/* Customer Information */}
        <div className="mb-4">
          <h6 className="text-primary mb-3">Customer Information</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.customerInfo.firstName}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      customerInfo: {
                        ...prev.customerInfo,
                        firstName: e.target.value
                      }
                    }))
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.customerInfo.lastName}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      customerInfo: {
                        ...prev.customerInfo,
                        lastName: e.target.value
                      }
                    }))
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      customerInfo: {
                        ...prev.customerInfo,
                        email: e.target.value
                      }
                    }))
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.customerInfo.phone}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      customerInfo: {
                        ...prev.customerInfo,
                        phone: e.target.value
                      }
                    }))
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Company/Organization (Optional)</Form.Label>
            <Form.Control
              type="text"
              value={formData.customerInfo.company || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  customerInfo: {
                    ...prev.customerInfo,
                    company: e.target.value
                  }
                }))
              }
            />
          </Form.Group>
        </div>

        {/* Special Requests */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            Special Requests (Optional)
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.specialRequests}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                specialRequests: e.target.value
              }))
            }
            placeholder="Any special requirements or requests..."
          />
        </Form.Group>

        {/* Terms and Conditions */}
        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                agreeToTerms: e.target.checked
              }))
            }
            label="I agree to the terms and conditions and cancellation policy"
            required
          />
        </Form.Group>
      </Form>
    </Card.Body>
  </Card>
);

// Progress Steps
const ProgressSteps = ({ currentStep }: { currentStep: number }) => (
  <Card className="mb-4 border-secondary">
    <Card.Body className="p-3">
      <Row className="text-center">
        <Col xs={6}>
          <div
            className={`d-flex align-items-center justify-content-center ${
              currentStep >= 1 ? 'text-primary' : 'text-muted'
            }`}
          >
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                currentStep >= 1
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-white'
              }`}
              style={{ width: '30px', height: '30px' }}
            >
              <span className="small fw-bold">1</span>
            </div>
            <span className="small fw-semibold">Date, Time & Details</span>
          </div>
        </Col>
        <Col xs={6}>
          <div
            className={`d-flex align-items-center justify-content-center ${
              currentStep >= 2 ? 'text-primary' : 'text-muted'
            }`}
          >
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                currentStep >= 2
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-white'
              }`}
              style={{ width: '30px', height: '30px' }}
            >
              <span className="small fw-bold">2</span>
            </div>
            <span className="small fw-semibold">Review & Pay</span>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

// Facility Summary Sidebar
const FacilitySummary = ({ facility }: { facility: Facility }) => (
  <Card className="mb-3 border-secondary shadow">
    <Card.Body className="p-4">
      <div className="d-flex mb-3">
        <img
          src={
            facility.images[0]?.path || '/placeholder.svg?height=80&width=80'
          }
          alt={facility.name}
          className="rounded me-3 object-fit-cover"
          style={{ width: '80px', height: '80px' }}
        />
        <div>
          <h5 className="fw-semibold mb-1">{facility.name}</h5>
          <div className="text-muted small d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
            {facility.location.address?.split(',')[0]}
          </div>
          {facility.rating && (
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
              <span className="small">{facility.rating.average}</span>
              <span className="text-muted small ms-1">
                ({facility.rating.totalReviews})
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mb-3">
        <h6 className="mb-2">Key Amenities</h6>
        <div className="d-flex flex-wrap gap-2">
          {facility.amenities
            .slice(0, 4)
            .map((amenity: string, index: number) => (
              <Badge
                key={index}
                bg="secondary"
                className="d-flex align-items-center"
              >
                <FontAwesomeIcon
                  icon={getAmenityIcon(amenity)}
                  className="me-1"
                />
                {amenity}
              </Badge>
            ))}
          {facility.amenities.length > 4 && (
            <span className="text-muted small">
              +{facility.amenities.length - 4} more
            </span>
          )}
        </div>
      </div>
    </Card.Body>
  </Card>
);

// Booking Summary Sidebar
const BookingSummary = ({
  formData,
  pricing,
  defaultPricing
}: {
  formData: BookingFormData;
  pricing: PricingBreakdown;
  defaultPricing: {
    amount: number;
    unit: string;
    isDefault?: boolean;
  };
}) => (
  <div style={{ position: 'sticky', top: '24px', zIndex: 2 }}>
    <Card className="border-secondary shadow">
      <Card.Header className="border-secondary">
        <h5 className="mb-0">Booking Summary</h5>
      </Card.Header>
      <Card.Body className="p-4">
        {formData.selectedDate && formData.selectedTime && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Date:</span>
              <span className="fw-semibold">
                {new Date(formData.selectedDate).toLocaleDateString()}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Time:</span>
              <span className="fw-semibold">
                {formData.selectedTime}{' '}
                {formData.endTime && `- ${formData.endTime}`}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Duration:</span>
              <span className="fw-semibold">{formData.duration}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Guests:</span>
              <span className="fw-semibold">{formData.guests}</span>
            </div>
            <hr className="border-secondary" />
          </div>
        )}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">
              {currencyFormat(pricing.basePrice)} ×{' '}
              {Number.parseInt(formData.duration) || 1} {defaultPricing.unit}
              {(Number.parseInt(formData.duration) || 1) > 1 ? 's' : ''}
            </span>
            <span>{currencyFormat(pricing.subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Service fee</span>
            <span>{currencyFormat(pricing.serviceFee)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tax</span>
            <span>{currencyFormat(pricing.tax)}</span>
          </div>
          <hr className="border-secondary" />
          <div className="d-flex justify-content-between fw-bold h5">
            <span>Total</span>
            <span>{currencyFormat(pricing.total)}</span>
          </div>
        </div>
        <div className="p-3 bg-success bg-opacity-10 border border-success rounded">
          <div className="d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faShieldAlt} className="text-success me-2" />
            <span className="text-success fw-semibold small">
              Secure Booking
            </span>
          </div>
          <ul className="text-muted small mb-0 ps-3">
            <li>SSL encrypted payment processing</li>
            <li>Instant booking confirmation</li>
            <li>24/7 customer support</li>
            <li>Money-back guarantee</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  </div>
);

const ReviewConfirmationStep = ({
  formData,
  pricing,
  onEdit,
  onSubmit,
  isSubmitting
}: {
  formData: BookingFormData;
  pricing: PricingBreakdown;
  onEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) => (
  <Card className="mb-4 border-secondary shadow">
    <Card.Header className="border-secondary d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <FontAwesomeIcon icon={faCheck} className="me-2 text-primary" />
        Review Your Booking
      </h5>
      <Button variant="outline-primary" size="sm" onClick={onEdit}>
        <FontAwesomeIcon icon={faEdit} className="me-2" />
        Edit Details
      </Button>
    </Card.Header>
    <Card.Body className="p-4">
      {/* Booking Details */}
      <div className="mb-4">
        <h6 className="text-primary mb-3">Booking Details</h6>
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <strong className="text-muted small">DATE & TIME</strong>
              <div className="fw-semibold">
                {new Date(formData.selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-muted">
                {formData.selectedTime} - {formData.endTime}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <strong className="text-muted small">DURATION & GUESTS</strong>
              <div className="fw-semibold">
                {formData.duration} hour
                {Number.parseInt(formData.duration) > 1 ? 's' : ''}
              </div>
              <div className="text-muted">
                {formData.guests} guest{formData.guests > 1 ? 's' : ''}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Customer Information */}
      <div className="mb-4">
        <h6 className="text-primary mb-3">Customer Information</h6>
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <strong className="text-muted small">CONTACT PERSON</strong>
              <div className="fw-semibold">
                {formData.customerInfo.firstName}{' '}
                {formData.customerInfo.lastName}
              </div>
              <div className="text-muted">{formData.customerInfo.email}</div>
              <div className="text-muted">{formData.customerInfo.phone}</div>
            </div>
          </Col>
          {formData.customerInfo.company && (
            <Col md={6}>
              <div className="mb-3">
                <strong className="text-muted small">ORGANIZATION</strong>
                <div className="fw-semibold">
                  {formData.customerInfo.company}
                </div>
              </div>
            </Col>
          )}
        </Row>
      </div>

      {/* Special Requests */}
      {formData.specialRequests && (
        <div className="mb-4">
          <h6 className="text-primary mb-3">Special Requests</h6>
          <div className="p-3 bg-light rounded">
            <p className="mb-0">{formData.specialRequests}</p>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="mb-4">
        <h6 className="text-primary mb-3">Payment Summary</h6>
        <div className="p-3 border rounded">
          <div className="d-flex justify-content-between mb-2">
            <span>
              Base Price ({formData.duration} hour
              {Number.parseInt(formData.duration) > 1 ? 's' : ''})
            </span>
            <span>{currencyFormat(pricing.subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Service Fee</span>
            <span>{currencyFormat(pricing.serviceFee)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tax</span>
            <span>{currencyFormat(pricing.tax)}</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold h5">
            <span>Total Amount</span>
            <span className="text-primary">
              {currencyFormat(pricing.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <Form onSubmit={onSubmit}>
        <div className="d-grid">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="fw-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                Proceed to Pay - {currencyFormat(pricing.total)}
              </>
            )}
          </Button>
        </div>
        <div className="text-center mt-3">
          <small className="text-muted">
            You will be redirected to Paystack for secure payment processing
          </small>
        </div>
      </Form>
    </Card.Body>
  </Card>
);

const BookingPage = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: '',
    selectedTime: '',
    endTime: '',
    duration: '1',
    guests: 1,
    customerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: ''
    },
    specialRequests: '',
    agreeToTerms: false
  });

  const [pricing, setPricing] = useState<PricingBreakdown>({
    basePrice: 0,
    duration: 1,
    subtotal: 0,
    serviceFee: 0,
    tax: 0,
    total: 0
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Find facility by slug
  const facility = mockFacilities.find(f => f._id === facilityId);

  useEffect(() => {
    if (facility) {
      const defaultPricing =
        facility.pricing.find(p => p.isDefault) || facility.pricing[0];
      const durationNumber = Number.parseInt(formData.duration) || 1;
      calculatePricing(defaultPricing.amount, durationNumber);
    }
    // eslint-disable-next-line
  }, [facility, formData.duration]);

  const calculatePricing = (basePrice: number, duration: number) => {
    const subtotal = basePrice * duration;
    const serviceFee = subtotal * 0.1;
    const tax = (subtotal + serviceFee) * 0.08;
    const total = subtotal + serviceFee + tax;
    setPricing({
      basePrice,
      duration,
      subtotal,
      serviceFee,
      tax,
      total
    });
  };

  const checkAvailability = async (date: string) => {
    if (!date) return;
    setIsCheckingAvailability(true);
    setTimeout(() => {
      const slots = [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00'
      ];
      setAvailableSlots(slots);
      setIsCheckingAvailability(false);
    }, 1000);
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: '',
      endTime: ''
    }));
    checkAvailability(date);
  };

  const handleTimeChange = (time: string) => {
    const startHour = Number.parseInt(time.split(':')[0]);
    const endHour = startHour + (Number.parseInt(formData.duration) || 1);
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    setFormData(prev => ({
      ...prev,
      selectedTime: time,
      endTime: endTime
    }));
  };

  const handleDurationChange = (newDuration: number) => {
    if (newDuration < 1 || newDuration > 12) return;
    if (!facility) return;
    const defaultPricing =
      facility.pricing.find(p => p.isDefault) || facility.pricing[0];
    setFormData(prev => {
      const startHour = prev.selectedTime
        ? Number.parseInt(prev.selectedTime.split(':')[0])
        : 0;
      const endHour = startHour + newDuration;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      return {
        ...prev,
        duration: `${newDuration}`,
        endTime: prev.selectedTime ? endTime : ''
      };
    });
    calculatePricing(defaultPricing.amount, newDuration);
  };

  const handleGuestsChange = (guests: number) => {
    setFormData(prev => ({
      ...prev,
      guests
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!facility) throw new Error('Facility not found');
      const bookingData = {
        user: {
          name: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName}`,
          username: formData.customerInfo.email.split('@')[0],
          email: formData.customerInfo.email,
          phone: formData.customerInfo.phone,
          password: 'hashed',
          role: 'user' as const,
          cart: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        facility: facility,
        startDate: new Date(
          `${formData.selectedDate}T${formData.selectedTime}:00`
        ),
        endDate: new Date(`${formData.selectedDate}T${formData.endTime}:00`),
        duration: formData.duration,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        totalPrice: pricing.total,
        paymentDetails: {
          user: {
            name: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName}`,
            username: formData.customerInfo.email.split('@')[0],
            email: formData.customerInfo.email,
            phone: formData.customerInfo.phone,
            password: 'hashed',
            role: 'user' as const,
            cart: [],
            createdAt: new Date(),
            updatedAt: new Date()
          } as Partial<User>,
          type: 'booking',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to success page or show success message
      navigate('/booking-success', { state: { bookingData } });
    } catch (error) {
      console.error('Booking failed:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <BookingPageLoader />;
  }

  if (!facility) {
    return <FacilityNotFound />;
  }

  const defaultPricing =
    facility.pricing.find(p => p.isDefault) || facility.pricing[0];

  return (
    <Container fluid className="py-4 min-vh-100">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          as={Link}
          to={`/facilities/${facility._id}`}
          variant="outline"
          className="d-flex align-items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Facility
        </Button>
      </div>

      {/* Progress Steps */}
      <ProgressSteps currentStep={currentStep} />

      <Row>
        <Col lg={8}>
          {currentStep === 1 && (
            <>
              <BookingFormStep
                facility={facility}
                formData={formData}
                setFormData={setFormData}
                handleDateChange={handleDateChange}
                handleTimeChange={handleTimeChange}
                handleDurationChange={handleDurationChange}
                availableSlots={availableSlots}
                isCheckingAvailability={isCheckingAvailability}
                handleGuestsChange={handleGuestsChange}
              />
              <div className="d-grid mb-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setCurrentStep(2)}
                  disabled={
                    !formData.selectedDate ||
                    !formData.selectedTime ||
                    !formData.customerInfo.firstName ||
                    !formData.customerInfo.lastName ||
                    !formData.customerInfo.email ||
                    !formData.customerInfo.phone ||
                    !formData.agreeToTerms
                  }
                >
                  Continue to Review
                </Button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <ReviewConfirmationStep
              formData={formData}
              pricing={pricing}
              onEdit={() => setCurrentStep(1)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </Col>

        <Col lg={4}>
          <FacilitySummary facility={facility} />
          <BookingSummary
            formData={formData}
            pricing={pricing}
            defaultPricing={defaultPricing}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default BookingPage;
