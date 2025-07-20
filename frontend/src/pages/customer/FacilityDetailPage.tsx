import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import Badge, { BadgeBg } from 'components/base/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faStar,
  faMapMarkerAlt,
  faUsers,
  faClock,
  faWifi,
  faParking,
  faUtensils,
  faDesktop,
  faSnowflake,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { currencyFormat } from 'helpers/utils';
import FacilityDetailLoader from 'components/facilities/FacilityDetailLoader';
import { Facility, User } from 'types';
import PageHeroSections from 'components/sliders/PageHeroSections';
import { FacilityController } from 'controllers';
import { showToast } from 'components/toaster/toaster';
import { getResourceUrl } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { RootState } from 'lib/store';
import Swiper from 'components/base/Swiper';
import { SwiperSlide } from 'swiper/react';
import { format, parse } from 'date-fns';

interface FacilityImageGalleryProps {
  images: { path: string }[];
  facility: Partial<Facility>;
}

const FacilityImageGallery = ({
  images,
  facility
}: FacilityImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const getStatusBadge = (status: boolean) => {
    const statusConfig = {
      true: { bg: 'success', text: 'Available' },
      false: { bg: 'danger', text: 'Unavailable' }
    };

    const config =
      statusConfig[String(status) as 'true' | 'false'] || statusConfig['false'];
    return <Badge bg={config.bg as BadgeBg}>{config.text}</Badge>;
  };
  return (
    <Card border="secondary" className="mb-4">
      <Card.Body className="p-0">
        <div className="position-relative">
          <Card.Img
            src={getResourceUrl(images[selectedImage]?.path || '')}
            alt={facility.name}
            style={{ height: '400px', objectFit: 'cover' }}
          />
          <div className="position-absolute top-0 start-0 p-3">
            {getStatusBadge(facility.isActive)}
          </div>
        </div>
        {images.length > 1 && (
          <Row className="g-2 p-3">
            {images.map((image, index) => (
              <Col xs={3} key={index}>
                <Card.Img
                  src={getResourceUrl(image.path)}
                  alt={`${facility.name} ${index + 1}`}
                  className={`cursor-pointer ${
                    selectedImage === index
                      ? 'border border-primary border-2'
                      : 'border border-secondary'
                  }`}
                  style={{ height: '80px', objectFit: 'cover' }}
                  onClick={() => setSelectedImage(index)}
                />
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

// --- FacilityDetails ---
interface FacilityDetailsProps {
  facility: Facility;
  hasVerifiedReviews: boolean;
}
const FacilityDetails = ({
  facility,
  hasVerifiedReviews
}: FacilityDetailsProps) => {
  const amPm = (time: string) => {
    const parsedTime = parse(time, 'HH:mm', new Date());
    return format(parsedTime, 'h:mm a');
  };
  return (
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
            <FontAwesomeIcon
              icon={faUsers}
              className="text-primary me-3 fs-4"
            />
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
            <FontAwesomeIcon
              icon={faClock}
              className="text-primary me-3 fs-4"
            />
            <div>
              <div className="fw-semibold">Operating Hours</div>
              <div className="text-muted small">
                {amPm(facility.operationalHours.opening)} -{' '}
                {amPm(facility.operationalHours.closing)}
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
};

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

interface ReviewFormProps {
  facility: Partial<Facility>;
  onClose: () => void;
  reviewsData: Review[];
  setReviewsData: React.Dispatch<React.SetStateAction<Review[]>>;
  setFacility: React.Dispatch<React.SetStateAction<Partial<Facility>>>;
}

const ReviewForm = ({
  facility,
  onClose,
  reviewsData,
  setReviewsData,
  setFacility
}: ReviewFormProps) => {
  const { user, tokens } = useAppSelector((state: RootState) => state.auth);
  const accessToken = tokens?.accessToken;

  const isUserReviewed = reviewsData.find(
    (r: Review) => r.user.username === user?.username
  );
  const [comment, setComment] = useState(
    isUserReviewed ? isUserReviewed.comment : ''
  );
  const [rating, setRating] = useState(
    isUserReviewed ? isUserReviewed.rating : 5
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment.trim()) {
      showToast('error', 'Rating and comment are required.');
      return;
    }

    try {
      const response = await FacilityController.leaveReview(
        facility._id,
        accessToken,
        {
          rating,
          comment
        }
      );

      if (response.success) {
        // Update reviewsData immutably so UI updates
        setReviewsData(prev => [
          ...prev.filter(r => r.user.username !== user.username),
          {
            user: { ...user },
            rating,
            comment
          }
        ]);
        setFacility(response.data as Facility);
        showToast('success', 'Review submitted successfully!');
      }
      onClose();
    } catch (error) {
      showToast('error', error.message);
    }
  };
  return (
    <Card className="border-secondary shadow">
      <Card.Body className="p-4">
        <h5 className="fw-semibold mb-3">Leave a Review</h5>
        <Form onSubmit={handleSubmit}>
          {/* Form fields for review submission */}
          <div className="mb-3">
            <div>
              {[1, 2, 3, 4, 5].map(star => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={`me-1 ${
                    star <= rating ? 'text-warning' : 'text-secondary'
                  }`}
                  style={{
                    cursor: 'pointer',
                    fontSize: '1.5rem'
                  }}
                  onClick={() => setRating(star)}
                  data-testid={`star-${star}`}
                />
              ))}
              <p className="text-muted small mt-1">{rating} out of 5 stars</p>
            </div>
          </div>
          <div className="mb-3">
            <Form.Label htmlFor="comment" className="form-label">
              Comment
            </Form.Label>
            <Form.Control
              as="textarea"
              id="comment"
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
            ></Form.Control>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-100 mb-2"
            onClick={handleSubmit}
          >
            Submit Review
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-100">
            Cancel
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

// --- FacilityReviews ---
interface Review {
  user: Partial<User>;
  rating: number;
  comment: string;
  isVerified?: boolean;
}

interface FacilityReviewsProps {
  reviews: {
    reviews: Review[];
    pagination: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  };
  facility: Partial<Facility>;
  setFacility: React.Dispatch<React.SetStateAction<Partial<Facility>>>;
}

const FacilityReviews = ({
  reviews,
  facility,
  setFacility
}: FacilityReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const toggleReviewForm = () => setShowReviewForm(!showReviewForm);
  const { user, tokens } = useAppSelector((state: RootState) => state.auth);
  const [reviewsData, setReviewsData] = useState(reviews.reviews);
  const location = useLocation();
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate('/sign-in', {
      state: { from: location.pathname }
    });
  };

  useEffect(() => {
    setReviewsData(reviews.reviews);
  }, [reviews.reviews]);
  return (
    <div className="mb-5">
      <div className="d-flex align-items-center mb-4">
        <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
        <h3 className="h4 fw-semibold mb-0">
          {facility.rating.average} · {facility.rating.totalReviews} reviews
        </h3>
      </div>
      <Row>
        <Swiper
          slidesPerView={1}
          direction="horizontal"
          className="mb-4 px-1"
          navigationPosition={{ top: '25%' }}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 16
            },
            450: {
              slidesPerView: 1,
              spaceBetween: 16
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            1200: {
              slidesPerView: 3,
              spaceBetween: 16
            },
            1540: {
              slidesPerView: 4,
              spaceBetween: 16
            }
          }}
        >
          {reviewsData.map((review: Review, idx: number) => (
            <SwiperSlide key={idx}>
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
                      <div className="fw-semibold">{review.user?.name}</div>
                      <div className="d-flex align-items-center">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            className={
                              i < review.rating
                                ? 'text-warning'
                                : 'text-secondary'
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
            </SwiperSlide>
          ))}
        </Swiper>

        <Col>
          {user && tokens ? (
            !showReviewForm && (
              <Button
                variant="primary"
                onClick={toggleReviewForm}
                className="w-100"
              >
                {reviewsData.find(
                  (r: Review) => r.user.username === user.username
                )
                  ? 'Edit Your Review'
                  : 'Leave a Review'}
              </Button>
            )
          ) : (
            <Button
              variant="outline-primary"
              onClick={redirectToLogin}
              className="w-100"
            >
              Sign in to Leave a Review
            </Button>
          )}
        </Col>
      </Row>
      {showReviewForm && (
        <Row className="justify-content-center mt-3">
          <Col>
            <ReviewForm
              facility={facility}
              reviewsData={reviewsData}
              onClose={toggleReviewForm}
              setReviewsData={setReviewsData}
              setFacility={setFacility}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

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
          {currencyFormat(defaultPricing.amount || 0)}
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
                {currencyFormat(pricing?.amount || 0)} per {pricing.unit}
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
  const [isLoading, setIsLoading] = useState(true);
  const [facility, setFacility] = useState<Facility>();
  const [similarFacilities, setSimilarFacilities] = useState<Facility[]>();
  const [reviews, setReviews] = useState();

  useEffect(() => {
    async function fetchFacility() {
      try {
        const [facilityData, similarFacilitiesData, reviewsData] =
          await Promise.all([
            FacilityController.getFacilityById(facilityId!),
            FacilityController.getAllFacilites(),
            FacilityController.getReviews(facilityId!)
          ]);

        if (
          facilityData.success &&
          similarFacilitiesData.success &&
          reviewsData.success
        ) {
          setIsLoading(false);
          setFacility(facilityData.data);
          setReviews(reviewsData.data as any);
          const filteredFacilites = (
            similarFacilitiesData.data.facilities as Facility[]
          ).filter(facility => facility.name != facilityData.data.name);
          setSimilarFacilities(filteredFacilites);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        showToast('error', "Couldn't load facility");
      }
    }

    fetchFacility();
  }, [facilityId]);

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

  const defaultPricing =
    facility.pricing.find((p: Pricing) => p.isDefault) || facility.pricing[0];
  const hasVerifiedReviews = facility.reviews.some(
    (review: Review) => review.isVerified
  );

  return (
    <div className="pt-6">
      <Container fluid>
        <Row>
          <Col lg={8}>
            <FacilityImageGallery
              images={facility.images}
              facility={facility}
            />
            <FacilityDetails
              facility={facility}
              hasVerifiedReviews={hasVerifiedReviews}
            />
            <FacilityAmenities amenities={facility.amenities} />
            <FacilityReviews
              facility={facility}
              setFacility={setFacility}
              reviews={reviews}
            />
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
      {similarFacilities && (
        <div className="mb-6 mt-12">
          <PageHeroSections
            to="facilites"
            title={similarFacilities ? 'Similar spaces you might like' : ''}
            facilities={similarFacilities!}
          />
        </div>
      )}
    </div>
  );
};

export default FacilityDetailPage;
