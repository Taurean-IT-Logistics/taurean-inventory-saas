import React from 'react';
import { Container, Row, Col, Card, Button } from 'components/ui';
import { Link } from 'react-router-dom';
import {  } from '';
import {
  faArrowLeft,
  faTrash,
  faShoppingCart,
  faHeart
} from 'lucide-react';
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
        <Container fluid className="py-8">
          <div className="text-center">
            <
              icon={faHeart}
              size="4x"
              className="text-gray-600 dark:text-gray-400 mb-4"
            />
            <h3 className="mb-3">Your wishlist is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">My Wishlist</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              {totalItems} item{totalItems !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline-danger" onClick={clearWishlist}>
              Clear Wishlist
            </Button>
            <Link to="/cart" className="btn btn-primary">
              < icon={faShoppingCart} className="me-2" />
              View Cart
            </Link>
            <Link to="/rental" className="btn btn-outline-secondary">
              < icon={faArrowLeft} className="me-2" />
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
                <div className="relative">
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
                      < icon={faTrash} />
                    </Button>
                  </div>
                </div>

                <Card.Body className="flex flex-column">
                  <div className="flex-grow-1">
                    <Card.Title className="h6 mb-2">{item.name}</Card.Title>
                    <div className="font-bold mb-2">
                      {currencyFormat(item.price || 0)}/day
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 small mb-3">
                      Type: {item.type.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-fill"
                      onClick={() => handleMoveToCart(item)}
                    >
                      < icon={faShoppingCart} className="me-1" />
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
