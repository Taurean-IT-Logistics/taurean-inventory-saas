import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShoppingCart,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { InventoryItem } from 'types';
import { currencyFormat } from 'helpers/utils';
import { getResourceUrl } from 'controllers';

interface InventoryItemCardProps {
  item: InventoryItem;
  onAddToCart: (item: InventoryItem) => void;
  onAddToWishlist: (item: InventoryItem) => void;
}

const InventoryItemCard = ({
  item,
  onAddToCart,
  onAddToWishlist
}: InventoryItemCardProps) => {
  // Early return if item is null, undefined, or doesn't have required properties
  if (!item || !item._id || !item.name) {
    return null;
  }

  const mainImage =
    item.images && item.images.length > 0 ? item.images[0].path : '';

  const [image, setImage] = useState<string>('https://placehold.com/300x400');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { bg: 'success', text: 'Available' },
      rented: { bg: 'warning', text: 'Rented' },
      unavailable: { bg: 'danger', text: 'Unavailable' },
      maintenance: { bg: 'info', text: 'Maintenance' },
      retired: { bg: 'secondary', text: 'Retired' }
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.unavailable;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const isAvailable = item.status === 'in_stock' && (item.quantity || 0) > 0;
  const price =
    item.pricing.find(p => p.isDefault || p.unit === 'day').amount || 0;

  useEffect(() => {
    if (mainImage) {
      setImage(getResourceUrl(mainImage));
    }
  }, [mainImage]);

  // Handle click events to prevent navigation when clicking action buttons
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(item);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist(item);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      to={`/item/${item._id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <Card className="h-100 border-secondary" style={{ minWidth: 290 }}>
        <div className="position-relative">
          <Card.Img
            variant="top"
            src={image}
            style={{ height: '200px', objectFit: 'cover' }}
            alt={item.name}
            onError={() => setImage('https://placehold.com/300x400')}
          />
          <div className="position-absolute top-0 start-0 p-2">
            {getStatusBadge(item.status || 'unavailable')}
          </div>
          <div className="position-absolute top-0 end-0 p-2">
            <Button
              variant="outline-light"
              size="sm"
              className="rounded-circle"
              onClick={handleAddToWishlist}
            >
              <FontAwesomeIcon icon={faHeart} />
            </Button>
          </div>
        </div>

        <Card.Body className="d-flex flex-column">
          <div className="flex-grow-1">
            <Card.Title className="text-white h6 mb-2">{item.name}</Card.Title>
            <Card.Text className="text-muted small mb-2">
              {item.description || 'No description available'}
            </Card.Text>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold">
                {currencyFormat(price)}/
                {item.pricing.find(p => p.isDefault || p.unit === 'day').unit}
              </span>
              <Badge bg="secondary">{item.category || 'Uncategorized'}</Badge>
            </div>
            <div className="text-muted small">
              <div>Quantity: {item.quantity || 0}</div>
              <div>SKU: {item.sku || 'N/A'}</div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="primary"
              size="sm"
              className="flex-fill"
              disabled={!isAvailable}
              onClick={handleAddToCart}
            >
              <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
              {isAvailable ? 'Add to Cart' : 'Unavailable'}
            </Button>
            <Link
              to={`/inventory/${item._id}`}
              className="btn btn-outline-secondary btn-sm"
              onClick={handleViewDetails}
            >
              <FontAwesomeIcon icon={faEye} />
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default InventoryItemCard;
