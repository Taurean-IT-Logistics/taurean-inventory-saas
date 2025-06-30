import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faHeart,
  faCalendar,
  faInfo,
  faClock,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from 'hooks/useWishlist';
import RentDetailSkeleton from 'components/inventory/RentailDetailLoader';
import { InventoryItem } from 'types';
import { getResourceUrl } from 'controllers';
import { InventoryItemController, TransactionController } from 'controllers';
import { currencyFormat } from 'helpers/utils';
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow
} from 'date-fns';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { showToast } from 'components/toaster/toaster';

interface PaymentResponse {
  payment: {
    authorization_url: string;
  };
}

const RentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );
  const accessToken = tokens.accessToken;
  const [selectedImage, setSelectedImage] = useState(0);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [item, setItem] = useState<InventoryItem>();
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (startDate && endDate) {
      const diff = differenceInCalendarDays(
        new Date(endDate),
        new Date(startDate)
      );
      setRentalDays(diff > 0 ? diff : 1);
    }
  }, [startDate, endDate]);

  const daysFromNow = (date: Date) => {
    const diff = differenceInCalendarDays(date, new Date());
    return diff === 0 ? 'today' : `${diff} day${diff > 1 ? 's' : ''}`;
  };

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await InventoryItemController.getItemById(id);
        if (res?.data) {
          setItem(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  useEffect(() => {
    localStorage.setItem('paymentReference', transactionRef);
  }, [transactionRef]);

  if (isLoading) return <RentDetailSkeleton />;
  if (!item) {
    return (
      <div className="min-vh-100">
        <Container className="py-5">
          <div className="text-center">
            <h3 className="mb-3">Item not found</h3>
            <Link to="/rental" className="btn btn-primary">
              Back to Rental
            </Link>
          </div>
        </Container>
      </div>
    );
  }

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

  const isAvailable = item.status === 'in_stock' && item.quantity > 0;
  const price = item.purchaseInfo.purchasePrice || 0;
  const totalPrice = price * quantity * rentalDays;

  const handleAddToWishlist = () => {
    addToWishlist({
      type: 'inventory_item',
      itemId: item._id || '',
      name: item.name,
      price: price,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0].path : undefined
    });
  };

  const handleTransaction = async () => {
    if (!user || !accessToken) return;

    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const transactionData = {
        email: user.email,
        amount: totalPrice,
        category: 'inventory_item',
        description: `Rental for ${item.name} (${item._id}) from ${startDate} to ${endDate}`
      };

      const transactionResponse = await TransactionController.createTransaction(
        transactionData,
        accessToken
      );

      if (transactionResponse?.success) {
        showToast('success', 'Redirecting to Paystack...');
        setTransactionRef((transactionResponse.data as any).transaction.ref);
        window.location.href = (
          transactionResponse.data as PaymentResponse
        ).payment.authorization_url;
      } else {
        showToast('error', 'Transaction failed to initialize.');
      }
    } catch (error) {
      showToast('error', 'Something went wrong during transaction.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const images = item.images?.map(img => img.path) || ['/placeholder.svg'];

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/rental" className="btn btn-outline-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Rental
          </Link>
          <Link to="/wishlist" className="btn btn-primary">
            <FontAwesomeIcon icon={faHeart} className="me-2" />
            View Wishlist
          </Link>
        </div>

        <Row>
          <Col lg={6}>
            <Card border="secondary" className="mb-4">
              <Card.Body className="p-0">
                <div className="position-relative">
                  <Card.Img
                    src={getResourceUrl(images[selectedImage])}
                    alt={item.name}
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 start-0 p-3">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
                {images.length > 1 && (
                  <Row className="g-2 p-3">
                    {images.map((image, index) => (
                      <Col xs={3} key={index}>
                        <Card.Img
                          src={getResourceUrl(image)}
                          alt={`${item.name} ${index + 1}`}
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
          </Col>

          <Col lg={6}>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="mb-2">{item.name}</h1>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="secondary">{item.category}</Badge>
                    <span className="text-muted">SKU: {item.sku || 'N/A'}</span>
                  </div>
                </div>
                <Button
                  variant={
                    isInWishlist(item._id || '') ? 'danger' : 'outline-light'
                  }
                  onClick={handleAddToWishlist}
                >
                  <FontAwesomeIcon icon={faHeart} />
                </Button>
              </div>

              <div className="mb-4">
                <h2 className="text-primary mb-2">
                  {currencyFormat(price)}/day
                </h2>
                <p className="text-muted mb-3">
                  {item.description ||
                    'No description available for this item.'}
                </p>
              </div>

              <Card border="secondary" className="mb-4">
                <Card.Header className="border-secondary">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    Book Your Rental
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3 gap-2">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          disabled={!isAvailable}
                          className="border-secondary"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          disabled={!isAvailable}
                          className="border-secondary"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Quantity</Form.Label>
                        <Form.Select
                          value={quantity}
                          onChange={e => setQuantity(Number(e.target.value))}
                          disabled={!isAvailable}
                          className="border-secondary"
                        >
                          {Array.from(
                            { length: Math.min(item.quantity, 10) },
                            (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} {i === 0 ? 'item' : 'items'}
                              </option>
                            )
                          )}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Rental Days</Form.Label>
                        <Form.Control
                          type="number"
                          value={rentalDays}
                          readOnly
                          disabled={!isAvailable}
                          className="border-secondary"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {startDate && endDate && (
                    <div className="bg-primary p-3 text-white rounded mb-3">
                      <div>
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        Period: Ends on{' '}
                        {format(new Date(endDate), 'MMMM d, yyyy')},{' '}
                        {daysFromNow(new Date(endDate))} from now.
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Total Cost:</span>
                    <span className="text-primary h4 mb-0">
                      {currencyFormat(totalPrice)}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={
                      !isAvailable || !startDate || !endDate || isSubmitting
                    }
                    onClick={handleTransaction}
                  >
                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                    {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                </Card.Body>
              </Card>

              <Card border="secondary">
                <Card.Header className="border-secondary">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faInfo} className="me-2" />
                    Item Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div className="text-muted small">Available Quantity</div>
                      <div>{item.quantity}</div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-muted small">Category</div>
                      <div>{item.category}</div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-muted small">Status</div>
                      <div>{getStatusBadge(item.status)}</div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-muted small">SKU</div>
                      <div>{item.sku || 'N/A'}</div>
                    </Col>
                    {item.purchaseInfo.purchaseDate && (
                      <Col xs={12}>
                        <div className="text-muted small mb-1">
                          <FontAwesomeIcon icon={faCalendar} className="me-2" />
                          Purchase Date
                        </div>
                        <div>
                          {formatDistanceToNow(
                            new Date(item.purchaseInfo.purchaseDate),
                            { addSuffix: true }
                          )}
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RentDetailPage;
