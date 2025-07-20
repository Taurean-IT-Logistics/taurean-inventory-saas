import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { currencyFormat } from 'helpers/utils';
import { Booking, Facility, Tax } from 'types';
import BookingPageLoader from 'booking/BookingPageLoader';
import { showToast } from 'components/toaster/toaster';
import {
  BookingController,
  FacilityController,
  getResourceUrl,
  TransactionController,
  TaxController
} from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';

interface PaymentResponse {
  payment: {
    authorization_url: string;
  };
}

interface BookingFormData {
  selectedDate: string;
  selectedTime: string;
  endTime: string;
  duration: string;
  guests: number;
  customerInfo: {
    name: string;
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
                <Form.Control
                  className="mx-3 fw-bold text-center"
                  size="sm"
                  value={formData.duration}
                  onChange={() =>
                    handleDurationChange(parseInt(formData.duration) - 1)
                  }
                  style={{ width: '70px' }}
                />
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
                <Form.Control
                  type="number"
                  min={1}
                  max={facility.capacity.maximum}
                  value={formData.guests}
                  onChange={e =>
                    handleGuestsChange(
                      Math.min(
                        Math.max(1, parseInt(e.target.value) || 1),
                        facility.capacity.maximum
                      )
                    )
                  }
                  className="mx-3 text-center"
                  style={{ width: '70px' }}
                />
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
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.customerInfo.name}
                  readOnly
                  disabled
                  className="text-secondary"
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
            getResourceUrl(facility.images[0]?.path) ||
            '/placeholder.svg?height=80&width=80'
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
              <div className="fw-semibold">{formData.customerInfo.name}</div>
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
  const { tokens, user } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const accessToken = tokens.accessToken;
  const { facilityId } = useParams<{ facilityId: string }>();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [facility, setFacility] = useState<Facility>();
  const [transactionRef, setTransactionRef] = useState<string>('');

  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: '',
    selectedTime: '',
    endTime: '',
    duration: '1',
    guests: 1,
    customerInfo: {
      name: user.name,
      email: user.email,
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

  useEffect(() => {
    async function fetchFacility() {
      try {
        const [facilityData, taxData] = await Promise.all([
          FacilityController.getFacilityById(facilityId!),
          TaxController.getAllTaxes(accessToken)
        ]);

        if (facilityData.success) {
          setIsLoading(false);
          setFacility(facilityData.data);
        } else {
          setIsLoading(false);
        }

        if (taxData.success) {
          setTaxes(
            taxData.data.filter(
              (b: Tax) => b.appliesTo === 'facility' || b.appliesTo === 'both'
            )
          );
        } else {
          setTaxes([]);
        }
      } catch (error) {
        setIsLoading(false);
        showToast('error', "Couldn't load facility");
      }
    }

    fetchFacility();
  }, [facilityId]);

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
    const normalized = (str: string) =>
      str.trim().replace(/\s/g, '').toLowerCase();

    const serviceFeeRate = facility.isTaxable
      ? taxes.find(t => normalized(t.name).includes('servicefee'))?.rate || 0
      : 0;

    const taxRate = facility.isTaxable
      ? taxes.find(t => !normalized(t.name).includes('servicefee'))?.rate || 0
      : 0;

    const subtotal = basePrice * duration;
    const serviceFee = Math.round(subtotal * (serviceFeeRate / 100));
    const tax = Math.round((subtotal + serviceFee) * (taxRate / 100));
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

  const getDayOfWeek = (
    dateStr: string
  ): Facility['availability'][0]['day'] => {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ] as const;

    const dayIndex = new Date(dateStr).getDay(); // 0 = Sunday, 6 = Saturday
    return days[dayIndex];
  };

  const generateTimeSlots = (start: string, end: string): string[] => {
    const slots: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const current = new Date();
    current.setHours(startH, startM, 0, 0);

    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    while (current <= endTime) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${h}:${m}`);

      current.setHours(current.getHours() + 1); // hourly interval
    }

    return slots;
  };

  const checkAvailability = async (date: string, facility: Facility) => {
    if (!date || !facility) return;

    setIsCheckingAvailability(true);

    setTimeout(() => {
      const dayOfWeek = getDayOfWeek(date);
      const daySchedule = facility.availability.find(
        d => d.day === dayOfWeek && d.isAvailable
      );

      if (daySchedule) {
        const slots = generateTimeSlots(
          daySchedule.startTime,
          daySchedule.endTime
        );
        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
      }

      setIsCheckingAvailability(false);
    }, 500); // simulate API delay
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: '',
      endTime: ''
    }));
    checkAvailability(date, facility!);
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
    setIsLoading(true);
    try {
      if (!facility) throw new Error('Facility not found');
      const bookingData = {
        facility: facility._id,
        startDate: new Date(
          `${formData.selectedDate}T${formData.selectedTime}:00`
        ),
        endDate: new Date(`${formData.selectedDate}T${formData.endTime}:00`),
        duration: formData.duration,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        totalPrice: pricing.total
      };

      const data = await BookingController.bookFacility(
        bookingData as unknown as Partial<Booking>,
        accessToken
      );

      const transactionData = {
        email: user.email,
        amount: pricing.total,
        category: 'booking',
        description: `Booking for ${facility.name}: ${facility._id}`
      };

      const transactionResponse = await TransactionController.createTransaction(
        transactionData,
        accessToken
      );

      if (data.success && transactionResponse.success) {
        setIsSubmitting(false);
        setIsLoading(false);
        showToast('success', 'Booking completed redirecting to paystack');

        setTransactionRef((transactionResponse.data as any).transaction.ref);
        window.location.href = (
          transactionResponse.data as PaymentResponse
        ).payment.authorization_url;
      } else if (!data.success) {
        showToast('error', 'Booking Failed');
        setIsSubmitting(false);
        setIsLoading(false);
      } else if (!transactionResponse.success) {
        showToast('error', 'Transaction Initialization');
        setIsSubmitting(false);
        setIsLoading(false);
      } else {
        showToast('error', 'Something went wrong');
        setIsSubmitting(false);
        setIsLoading(false);
      }
    } catch (error) {
      showToast('error', 'Something went wrong');
      setIsSubmitting(false);
      setIsLoading(false);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('paymentReference', transactionRef);
  }, [transactionRef]);

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
          to={`/facility/${facility._id}`}
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
                    !formData.customerInfo.name ||
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
