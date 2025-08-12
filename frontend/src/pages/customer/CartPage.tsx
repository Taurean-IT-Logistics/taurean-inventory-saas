import React from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faTrash,
  faPlus,
  faMinus,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from 'hooks/useCart';
import { currencyFormat } from 'helpers/utils';
import { getResourceUrl } from 'controllers';

const CartPage = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Get the first facility ID for booking (assuming single facility booking)
  const facilityId = items.length > 0 ? items[0].itemId : null;

  if (items.length === 0) {
    return (
      <div className="min-vh-100">
        <Container fluid className="py-5">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faShoppingBag}
              size="4x"
              className="text-muted mb-4"
            />
            <h3 className="mb-3">Your cart is empty</h3>
            <p className="text-muted mb-4">
              Start shopping to add items to your cart
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
            <h1 className="h3 fw-bold mb-1">Shopping Cart</h1>
            <p className="text-muted mb-0">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link to="/rental" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        <Row>
          <Col lg={8}>
            {/* Cart Items */}
            <Card className="border-secondary mb-4">
              <Card.Body>
                {items.map((item, index) => (
                  <div
                    key={`${item.type}-${item.itemId}`}
                    className={`d-flex align-items-center py-3 ${
                      index < items.length - 1
                        ? 'border-bottom border-secondary'
                        : ''
                    }`}
                  >
                    <div className="me-3">
                      <img
                        src={getResourceUrl(item.imageUrl)}
                        alt={item.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover'
                        }}
                        className="rounded"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted small mb-1">Type: {item.type}</p>
                      <p className="fw-bold mb-0">
                        {currencyFormat(item.price || 0)}/day
                      </p>
                      {item.notes && (
                        <p className="text-muted small mt-1">
                          Notes: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="d-flex align-items-center me-3">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.itemId,
                            (item.quantity || 1) - 1
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </Button>
                      <Form.Control
                        type="number"
                        value={item.quantity || 1}
                        onChange={e =>
                          handleQuantityChange(
                            item.itemId,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="mx-2 text-center border-secondary"
                        style={{ width: '60px' }}
                        min="1"
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.itemId,
                            (item.quantity || 1) + 1
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold mb-2">
                        {currencyFormat(
                          (item.price || 0) * (item.quantity || 1)
                        )}
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Order Summary */}
            <Card className="border-secondary">
              <Card.Header className="border-secondary">
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Items ({totalItems})</span>
                  <span>{currencyFormat(totalPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Delivery</span>
                  <span>Free</span>
                </div>
                <hr className="border-secondary" />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold">{currencyFormat(totalPrice)}</span>
                </div>
                <Link
                  to={`/facility/${facilityId}/booking`}
                  className="btn btn-primary btn-lg w-100 mb-3"
                >
                  Proceed to Booking
                </Link>
                <Link
                  to="/wishlist"
                  className="btn btn-outline-secondary w-100"
                >
                  View Wishlist
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CartPage;
