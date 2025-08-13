import React from 'react';
import { Container, Row, Col, Card, Button, Form } from 'components/ui';
import { Link } from 'react-router-dom';
import {  } from '';
import {
  faArrowLeft,
  faTrash,
  faPlus,
  faMinus,
  faShoppingBag
} from 'lucide-react';
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
        <Container fluid className="py-8">
          <div className="text-center">
            <
              icon={faShoppingBag}
              size="4x"
              className="text-gray-600 dark:text-gray-400 mb-4"
            />
            <h3 className="mb-3">Your cart is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Shopping Cart</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline-danger" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link to="/rental" className="btn btn-outline-secondary">
              < icon={faArrowLeft} className="me-2" />
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
                      <p className="text-gray-600 dark:text-gray-400 small mb-1">Type: {item.type}</p>
                      <p className="font-bold mb-0">
                        {currencyFormat(item.price || 0)}/day
                      </p>
                      {item.notes && (
                        <p className="text-gray-600 dark:text-gray-400 small mt-1">
                          Notes: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex align-items-center me-3">
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
                        < icon={faMinus} />
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
                        < icon={faPlus} />
                      </Button>
                    </div>
                    <div className="text-end">
                      <div className="font-bold mb-2">
                        {currencyFormat(
                          (item.price || 0) * (item.quantity || 1)
                        )}
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        < icon={faTrash} />
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
                <div className="flex justify-content-between mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Items ({totalItems})</span>
                  <span>{currencyFormat(totalPrice)}</span>
                </div>
                <div className="flex justify-content-between mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                  <span>Free</span>
                </div>
                <hr className="border-secondary" />
                <div className="flex justify-content-between mb-4">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">{currencyFormat(totalPrice)}</span>
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
