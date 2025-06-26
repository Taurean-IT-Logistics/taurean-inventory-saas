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
  faShoppingCart,
  faHeart,
  faCalendar,
  faInfo,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { showToast } from 'components/toaster/toaster';
import { currencyFormat } from 'helpers/utils';
import { useCart } from 'hooks/useCart';
import { useWishlist } from 'hooks/useWishlist';
import InventoryItemDetailSkeleton from 'components/inventory/InventoryItemDetailLoader';
import { getResourceUrl } from 'controllers';
import { InventoryItemController } from 'controllers';
import { InventoryItem } from 'types';
import { formatDistanceToNow } from 'date-fns';

const InventoryItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await InventoryItemController.getItemById(id);
        if (data.success && data.data) {
          setItem(data.data);
        } else {
          showToast('error', 'Item not found');
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
        showToast('error', 'Failed to fetch item details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <InventoryItemDetailSkeleton />;
  }

  if (!item) {
    return (
      <div className="min-vh-100">
        <Container className="py-5">
          <div className="text-center">
            <h3 className="mb-3">Item not found</h3>
            <Link to="/equipment" className="btn btn-primary">
              Back to Equipment
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

  const handleAddToCart = () => {
    addToCart({
      type: 'inventory_item',
      itemId: item._id || '',
      quantity,
      name: item.name,
      price,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0].path : undefined,
      notes: `Rental for ${rentalDays} day${rentalDays > 1 ? 's' : ''}`
    });
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      type: 'inventory_item',
      itemId: item._id || '',
      name: item.name,
      price,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0].path : undefined
    });
  };

  const images = item.images || [];

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/equipment" className="btn btn-outline-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Equipment
          </Link>
        </div>

        <Row>
          <Col lg={6}>
            <Card border="secondary" className="mb-4">
              <Card.Body className="p-0">
                <div className="position-relative">
                  <Card.Img
                    src={getResourceUrl(images[selectedImage]?.path || '')}
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
                          src={getResourceUrl(image.path)}
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
                  <h5 className="mb-0">Rental Options</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3 gap-2">
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
                                {i + 1}
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
                          min="1"
                          max="30"
                          value={rentalDays}
                          onChange={e => setRentalDays(Number(e.target.value))}
                          disabled={!isAvailable}
                          className="border-secondary"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-white">Total Cost:</span>
                    <span className="text-primary h4 mb-0">
                      {currencyFormat(totalPrice)}
                    </span>
                  </div>

                  <Link to={isAvailable ? `/rent/${item._id}` : ''}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 mb-2"
                      disabled={!isAvailable}
                    >
                      <FontAwesomeIcon icon={faTag} className="me-2" />
                      {isAvailable ? 'Rent Now' : 'Unavailable'}
                    </Button>
                  </Link>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={!isAvailable}
                    onClick={handleAddToCart}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    {isAvailable ? 'Add to cart' : 'Unavailable'}
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

export default InventoryItemDetailPage;
