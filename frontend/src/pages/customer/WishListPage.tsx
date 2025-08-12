import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faTrash,
  faShoppingCart,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from 'hooks/useWishlist';
import { useCart } from 'hooks/useCart';
import { currencyFormat } from 'helpers/utils';
import { getResourceUrl } from 'controllers';

const WishlistPage = () => {
  const { items, removeFromWishlist, clearWishlist, totalItems } =
    useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: any) => {
    addToCart(item);
    removeFromWishlist(item.itemId);
  };

  if (items.length === 0) {
    return (
      <div className="min-vh-100">
        <Container fluid className="py-5">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faHeart}
              size="4x"
              className="text-muted mb-4"
            />
            <h3 className="mb-3">Your wishlist is empty</h3>
            <p className="text-muted mb-4">
              Save items you like to your wishlist
            </p>
            <Link to="/rental" className="btn btn-primary">
              Browse Equipment
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">My Wishlist</h1>
            <p className="text-muted mb-0">
              {totalItems} item{totalItems !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={clearWishlist}>
              Clear Wishlist
            </Button>
            <Link to="/cart" className="btn btn-primary">
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              View Cart
            </Link>
            <Link to="/rental" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Wishlist Items */}
        <Row className="g-4">
          {items.map(item => (
            <Col
              key={`${item.type}-${item.itemId}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Card className="h-100 border-secondary">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={getResourceUrl(item.imageUrl)}
                    style={{ height: '200px', objectFit: 'cover' }}
                    alt={item.name}
                  />
                  <div className="position-absolute top-0 end-0 p-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFromWishlist(item.itemId)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>

                <Card.Body className="d-flex flex-column">
                  <div className="flex-grow-1">
                    <Card.Title className="h6 mb-2">{item.name}</Card.Title>
                    <div className="fw-bold mb-2">
                      {currencyFormat(item.price || 0)}/day
                    </div>
                    <div className="text-muted small mb-3">
                      Type: {item.type.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-fill"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                      Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default WishlistPage;
