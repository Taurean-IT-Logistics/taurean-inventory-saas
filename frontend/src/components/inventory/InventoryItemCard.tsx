import React, { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);

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

  const getImageUrl = () => {
    if (imageError) {
      return 'https://via.placeholder.com/300x400/666/fff?text=No+Image';
    }

    if (item.images && item.images.length > 0 && item.images[0]) {
      const url = item.images[0];
      // Ensure URL has protocol for external images
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return url;
    }

    return 'https://via.placeholder.com/300x400/666/fff?text=No+Image';
  };

  const handleImageError = () => {
    console.warn(
      `Failed to load image for item: ${item.name}`,
      item.images?.[0]
    );
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const isAvailable = item.status === 'in_stock' && item.quantity > 0;
  const price = item.purchaseInfo.purchasePrice || 0;

  return (
    <Link
      to={`/rental/${item._id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <Card className="h-100 border-secondary" style={{ minWidth: 290 }}>
        <div className="position-relative">
          <Card.Img
            variant="top"
            src="http://placehold.co/300x400"
            style={{ height: '200px', objectFit: 'cover' }}
            alt={item.name}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          <div className="position-absolute top-0 start-0 p-2">
            {getStatusBadge(item.status)}
          </div>
          <div className="position-absolute top-0 end-0 p-2">
            <Button
              variant="outline-light"
              size="sm"
              className="rounded-circle"
              onClick={() => onAddToWishlist(item)}
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
              <span className="text-white fw-bold">
                {currencyFormat(price)}/day
              </span>
              <Badge bg="secondary">{item.category}</Badge>
            </div>
            <div className="text-muted small">
              <div>Quantity: {item.quantity}</div>
              <div>SKU: {item.sku || 'N/A'}</div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="primary"
              size="sm"
              className="flex-fill"
              disabled={!isAvailable}
              onClick={() => onAddToCart(item)}
            >
              <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
              {isAvailable ? 'Add to Cart' : 'Unavailable'}
            </Button>
            <Link
              to={`/inventory/${item._id}`}
              className="btn btn-outline-secondary btn-sm"
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
