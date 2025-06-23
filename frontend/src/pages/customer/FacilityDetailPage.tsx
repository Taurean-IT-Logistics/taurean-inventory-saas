import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Badge from 'components/base/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faStar,
  faHeart,
  faHeart as faHeartRegular,
  faMapMarkerAlt,
  faUsers,
  faClock,
  faWifi,
  faParking,
  faUtensils,
  faDesktop,
  faSnowflake,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { currencyFormat } from 'helpers/utils';
import { mockFacilities } from 'data';
import FacilityDetailLoader from 'components/facilites/FacilityDetailLoader';
import { Facility } from 'types';
import PageHeroSections from 'components/sliders/PageHeroSections';

interface FacilityImageGalleryProps {
  images: { path: string }[];
  name: string;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  nextImage: () => void;
  prevImage: () => void;
}

const FacilityImageGallery = ({
  images,
  name,
  currentImageIndex,
  setCurrentImageIndex,
  nextImage,
  prevImage
}: FacilityImageGalleryProps) => (
  <Row className="g-2 mb-4">
    <Col md={8}>
      <div
        className="position-relative rounded-3 overflow-hidden"
        style={{ height: '400px' }}
      >
        <img
          src={
            images[currentImageIndex]?.path ||
            '/placeholder.svg?height=400&width=600'
          }
          alt={name}
          className="w-100 h-100 object-fit-cover"
        />
        {images.length > 1 && (
          <>
            <Button
              variant="dark"
              className="position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle border-0"
              style={{ width: '40px', height: '40px', opacity: 0.75 }}
              onClick={prevImage}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
            <Button
              variant="dark"
              className="position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle border-0"
              style={{ width: '40px', height: '40px', opacity: 0.75 }}
              onClick={nextImage}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </>
        )}
        <div className="position-absolute bottom-0 end-0 m-3">
          <Badge bg="secondary" style={{ opacity: 0.75 }}>
            {currentImageIndex + 1} / {images.length}
          </Badge>
        </div>
      </div>
    </Col>
    <Col md={4}>
      <Row className="g-2 h-100">
        {images.slice(1, 5).map((image: { path: string }, idx: number) => (
          <Col xs={6} key={idx}>
            <div
              className="position-relative rounded-2 overflow-hidden"
              style={{ height: '190px', cursor: 'pointer' }}
              onClick={() => setCurrentImageIndex(idx + 1)}
            >
              <img
                src={image.path || '/placeholder.svg'}
                alt={`${name} ${idx + 2}`}
                className="w-100 h-100 object-fit-cover"
              />
              {idx === 3 && images.length > 5 && (
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ background: 'rgba(0,0,0,0.75)' }}
                >
                  <span className="text-light fw-bold">
                    +{images.length - 4} more
                  </span>
                </div>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </Col>
  </Row>
);

// --- FacilityDetails ---
interface FacilityDetailsProps {
  facility: Facility;
  isLiked: boolean;
  handleHeartClick: () => void;
  hasVerifiedReviews: boolean;
}
const FacilityDetails = ({
  facility,
  isLiked,
  handleHeartClick,
  hasVerifiedReviews
}: FacilityDetailsProps) => (
  <>
    <div className="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h1 className="display-6 fw-bold mb-2">{facility.name}</h1>
        <div className="d-flex align-items-center gap-3 text-muted">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
            <span>{facility.location.address}</span>
          </div>
          {facility.rating && (
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
              <span className="fw-semibold">{facility.rating.average}</span>
              <span className="ms-1 text-muted">
                ({facility.rating.totalReviews} reviews)
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="d-flex gap-2">
        <Button variant="outline-secondary" onClick={handleHeartClick}>
          <FontAwesomeIcon
            icon={isLiked ? faHeart : faHeartRegular}
            className={isLiked ? 'text-danger' : ''}
          />
        </Button>
      </div>
    </div>
    <div className="d-flex gap-2 mb-4">
      {hasVerifiedReviews && (
        <Badge bg="success" className="d-flex align-items-center">
          <FontAwesomeIcon icon={faCheck} className="me-1" />
          Verified
        </Badge>
      )}
      {facility.isActive ? (
        <Badge bg="primary">Available</Badge>
      ) : (
        <Badge bg="warning">Currently Unavailable</Badge>
      )}
    </div>
    <div className="mb-5">
      <h3 className="h4 fw-semibold mb-3">About this space</h3>
      <p className="text-muted lh-lg">{facility.description}</p>
      {facility.terms && (
        <div className="mt-3">
          <h5 className="fw-semibold mb-2">Terms & Conditions</h5>
          <p className="text-muted small">{facility.terms}</p>
        </div>
      )}
    </div>
    <Row className="mb-5">
      <Col md={4} className="mb-3">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faUsers} className="text-primary me-3 fs-4" />
          <div>
            <div className="fw-semibold">Capacity</div>
            <div className="text-muted small">
              Up to {facility.capacity.maximum} guests
            </div>
            <div className="text-muted small">
              Recommended: {facility.capacity.recommended}
            </div>
          </div>
        </div>
      </Col>
      <Col md={4} className="mb-3">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faClock} className="text-primary me-3 fs-4" />
          <div>
            <div className="fw-semibold">Operating Hours</div>
            <div className="text-muted small">
              {facility.operationalHours.opening} -{' '}
              {facility.operationalHours.closing}
            </div>
          </div>
        </div>
      </Col>
      <Col md={4} className="mb-3">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-primary me-3 fs-4"
          />
          <div>
            <div className="fw-semibold">Availability</div>
            <div className="text-muted small">
              {
                facility.availability.filter(
                  (a: { isAvailable: boolean }) => a.isAvailable
                ).length
              }{' '}
              days/week
            </div>
          </div>
        </div>
      </Col>
    </Row>
  </>
);

// --- FacilityAmenities ---
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
interface FacilityAmenitiesProps {
  amenities: string[];
}
const FacilityAmenities = ({ amenities }: FacilityAmenitiesProps) => (
  <div className="mb-5">
    <h3 className="h4 fw-semibold mb-3">What this place offers</h3>
    <Row>
      {amenities.map((amenity: string, idx: number) => (
        <Col md={6} className="mb-3" key={idx}>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon
              icon={getAmenityIcon(amenity)}
              className="text-primary me-3"
            />
            <span>{amenity}</span>
          </div>
        </Col>
      ))}
    </Row>
  </div>
);

// --- FacilityReviews ---
interface Review {
  user: { name: string };
  rating: number;
  comment: string;
  isVerified?: boolean;
}

interface FacilityReviewsProps {
  facility: {
    rating: { average: number; totalReviews: number };
    reviews: Review[];
  };
}

const FacilityReviews = ({ facility }: FacilityReviewsProps) => (
  <div className="mb-5">
    <div className="d-flex align-items-center mb-4">
      <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
      <h3 className="h4 fw-semibold mb-0">
        {facility.rating.average} · {facility.rating.totalReviews} reviews
      </h3>
    </div>
    <Row>
      {facility.reviews.slice(0, 2).map((review: Review, idx: number) => (
        <Col md={6} className="mb-4" key={idx}>
          <Card className="border-secondary bg-opacity-50">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <div
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px' }}
                >
                  <span className="text-light fw-bold">
                    {review.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="fw-semibold">{review.user.name}</div>
                  <div className="d-flex align-items-center">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={
                          i < review.rating ? 'text-warning' : 'text-secondary'
                        }
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted mb-0">{review.comment}</p>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
    {facility.reviews.length > 2 && (
      <Button variant="outline-primary">
        Show all {facility.rating.totalReviews} reviews
      </Button>
    )}
  </div>
);

// --- FacilityBookingCard ---
interface Pricing {
  amount: number;
  unit: string;
  isDefault?: boolean;
}

interface FacilityBookingCardProps {
  facility: Facility;
  defaultPricing: Pricing;
}

const FacilityBookingCard = ({
  facility,
  defaultPricing
}: FacilityBookingCardProps) => (
  <Card className="border-secondary shadow mb-3">
    <Card.Body className="p-4">
      <div className="d-flex align-items-baseline mb-3">
        <span className="h3 fw-bold mb-0">
          {currencyFormat(defaultPricing.amount)}
        </span>
        <span className="text-muted ms-2">per {defaultPricing.unit}</span>
      </div>
      {facility.pricing.length > 1 && (
        <div className="mb-3">
          <small className="text-muted">Other pricing options:</small>
          {facility.pricing
            .filter((p: Pricing) => !p.isDefault)
            .map((pricing: Pricing, idx: number) => (
              <div key={idx} className="small text-muted">
                {currencyFormat(pricing.amount)} per {pricing.unit}
              </div>
            ))}
        </div>
      )}
      <div className="d-grid gap-2 mb-3">
        <Link
          to={`/facility/${facility._id}/booking`}
          className="btn btn-primary btn-lg fw-semibold"
        >
          Book Now
        </Link>
        <Button variant="outline-primary">Check Availability</Button>
      </div>
      <div className="text-center">
        <small className="text-muted">You won't be charged yet</small>
      </div>
      <hr className="border-secondary" />
      <div className="small">
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Response time:</span>
          <span>Within 1 hour</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Cancellation:</span>
          <span>Free until 24h before</span>
        </div>
        <div className="d-flex justify-content-between">
          <span className="text-muted">Languages:</span>
          <span>English, Spanish</span>
        </div>
      </div>
    </Card.Body>
  </Card>
);

// --- FacilityContactCard ---
const FacilityContactCard = () => (
  <Card className="border-secondary shadow">
    <Card.Body className="p-4 text-center">
      <h5 className="fw-semibold mb-3">Need help?</h5>
      <p className="text-muted small mb-3">
        Our team is here to assist you with your booking
      </p>
      <Button variant="outline-primary" className="w-100">
        Contact Support
      </Button>
    </Card.Body>
  </Card>
);

// --- Main Page ---
const FacilityDetailPage = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const facility = mockFacilities.find(f => f._id === facilityId);

  if (isLoading) return <FacilityDetailLoader />;

  if (!facility) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="mb-3">Facility not found</h2>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </Container>
    );
  }

  const similarFacilities = mockFacilities
    .filter(f => f.name !== facility.name)
    .slice(0, 4);
  const defaultPricing =
    facility.pricing.find((p: Pricing) => p.isDefault) || facility.pricing[0];
  const hasVerifiedReviews = facility.reviews.some(
    (review: Review) => review.isVerified
  );

  const handleHeartClick = () => setIsLiked(!isLiked);

  const nextImage = () =>
    setCurrentImageIndex(prev =>
      prev === facility.images.length - 1 ? 0 : prev + 1
    );
  const prevImage = () =>
    setCurrentImageIndex(prev =>
      prev === 0 ? facility.images.length - 1 : prev - 1
    );

  return (
    <div className="pt-6">
      <Container fluid>
        <FacilityImageGallery
          images={facility.images}
          name={facility.name}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          nextImage={nextImage}
          prevImage={prevImage}
        />
        <Row>
          <Col lg={8}>
            <FacilityDetails
              facility={facility}
              isLiked={isLiked}
              handleHeartClick={handleHeartClick}
              hasVerifiedReviews={hasVerifiedReviews}
            />
            <FacilityAmenities amenities={facility.amenities} />
            <FacilityReviews facility={facility} />
          </Col>
          <Col lg={4}>
            <div style={{ position: 'sticky', top: 20 }}>
              <FacilityBookingCard
                facility={facility}
                defaultPricing={defaultPricing}
              />
              <FacilityContactCard />
            </div>
          </Col>
        </Row>
      </Container>
      <div className="mb-6 mt-12">
        <PageHeroSections
          to="facilites"
          title="Similar spaces you might like"
          facilities={similarFacilities}
        />
      </div>
    </div>
  );
};

export default FacilityDetailPage;
