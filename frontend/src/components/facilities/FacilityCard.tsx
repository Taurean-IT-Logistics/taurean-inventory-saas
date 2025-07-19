import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Image, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { faCheck, faStar, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Facility } from 'types';
import { currencyFormat } from 'helpers/utils';
import { getResourceUrl } from 'controllers';

interface FacilityCardProps {
  facility: Facility;
  onAddToCart?: (facility: Facility) => void;
  onAddToWishlist?: (facility: Facility) => void;
}

// Image Dots Component
const ImageDots: React.FC<{ count: number }> = ({ count }) => (
  <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2">
    <Stack direction="horizontal" gap={1}>
      {[...Array(Math.min(count, 5))].map((_, index) => (
        <span
          key={index}
          className={`rounded-circle ${
            index === 0 ? 'bg-white' : 'text-muted'
          }`}
          style={{
            width: 6,
            height: 6,
            background: index === 0 ? '#fff' : undefined,
            opacity: index === 0 ? 1 : 0.5,
            display: 'inline-block'
          }}
        />
      ))}
    </Stack>
  </div>
);

// Verified Badge Component
const VerifiedBadge: React.FC = () => (
  <div className="position-absolute top-0 start-0 m-2">
    <Badge bg="success" className="d-flex align-items-center">
      <FontAwesomeIcon icon={faCheck} className="me-1" />
      <span className="fw-semibold">Verified</span>
    </Badge>
  </div>
);

// Amenities Component
const Amenities: React.FC<{ amenities: string[] }> = ({ amenities }) => (
  <div className="mb-3">
    <Stack direction="horizontal" gap={1} className="flex-wrap">
      {amenities.slice(0, 2).map((amenity, idx) => (
        <Badge
          key={idx}
          bg="primary"
          className="rounded-pill text-body-emphasis"
        >
          {amenity}
        </Badge>
      ))}
      {amenities.length > 2 && (
        <span className="text-muted small align-self-center">
          +{amenities.length - 2} more
        </span>
      )}
    </Stack>
  </div>
);

// Rating Component
const Rating: React.FC<{ average: number; totalReviews: number }> = ({
  average,
  totalReviews
}) =>
  average > 0 ? (
    <Stack
      direction="horizontal"
      gap={1}
      className="align-items-center flex-shrink-0"
    >
      <FontAwesomeIcon
        icon={faStar}
        className="text-body-emphasis"
        style={{ fontSize: 12 }}
      />
      <span className="fw-bold text-body-emphasis small">
        {average.toFixed(2)}
      </span>
      <span className="text-body-secondary small">({totalReviews})</span>
    </Stack>
  ) : null;

// Main FacilityCard Component
const FacilityCard = ({ facility }: FacilityCardProps) => {
  const mainImage =
    facility.images && facility.images.length > 0
      ? facility.images[0].path
      : '';

  const [image, setImage] = useState<string>('https://placehold.co/300x400');

  useEffect(() => {
    setImage(getResourceUrl(mainImage));
  }, []);

  const defaultPricing =
    facility.pricing.find(p => p.isDefault) || facility.pricing[0];

  const hasVerifiedReviews = facility.reviews.some(review => review.isVerified);
  const isAvailable = facility.isActive;

  return (
    <Link
      to={`/facility/${facility._id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <Card
        className="shadow-sm h-100 overflow-hidden border border-secondary box-shadow"
        style={{ minWidth: 280, borderRadius: 12, border: 'none' }}
      >
        <div className="position-relative" style={{ height: 220 }}>
          <Image
            src={image}
            alt={facility.name}
            className="w-100 h-100"
            style={{
              objectFit: 'cover',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12
            }}
            fluid
          />

          {facility.images.length > 1 && (
            <ImageDots count={facility.images.length} />
          )}
          {hasVerifiedReviews && <VerifiedBadge />}
        </div>
        <Card.Body className="p-3 d-flex flex-column">
          <div className="flex-grow-1">
            <Stack
              direction="horizontal"
              className="justify-content-between align-items-start mb-2"
            >
              <div className="flex-grow-1 me-2">
                <Card.Title
                  as="h6"
                  className="mb-0 fw-semibold text-body-emphasis lh-sm"
                >
                  {facility.location?.address?.split(',')[0] ||
                    'Professional Space'}
                </Card.Title>
              </div>
              {facility.rating && (
                <Rating
                  average={facility.rating.average}
                  totalReviews={facility.rating.totalReviews}
                />
              )}
            </Stack>
            <Card.Text className="text-body-secondary mb-2 lh-sm">
              {facility.name}
            </Card.Text>
            <Card.Text className="text-body-secondary mb-2 small">
              {facility.capacity.maximum} guests
            </Card.Text>
            {facility.amenities && facility.amenities.length > 0 && (
              <Amenities amenities={facility.amenities} />
            )}
            <Stack
              direction="horizontal"
              className="justify-content-between align-items-center mb-3"
            >
              <div>
                {defaultPricing && (
                  <Stack
                    direction="horizontal"
                    gap={1}
                    className="align-items-baseline"
                  >
                    <span className="fw-bold text-body-emphasis text-decoration-underline">
                      {currencyFormat(defaultPricing.amount)}
                    </span>
                    <span className="text-body-emphasis small">
                      per {defaultPricing.unit}
                    </span>
                  </Stack>
                )}
              </div>
              {!facility.isActive && (
                <Badge bg="warning" text="dark">
                  Unavailable
                </Badge>
              )}
            </Stack>
          </div>

          <div className="d-flex gap-2">
            <Button
              as={Link}
              to={`/facility/${facility._id}`}
              variant={'primary'}
              size="sm"
              disabled={!isAvailable}
              className="flex-fill"
            >
              <FontAwesomeIcon icon={faEye} className="me-1" />
              {isAvailable ? 'Book Now' : 'Unavailable'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default FacilityCard;
