import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge } from 'components/ui';
import {  } from '';
import {
  faArrowLeft,
  faCalendar,
  faInfo,
  faTag
} from 'lucide-react';
import { showToast } from 'components/toaster/toaster';
import { currencyFormat } from 'helpers/utils';

import InventoryItemDetailSkeleton from 'components/inventory/InventoryItemDetailLoader';
import { getResourceUrl } from 'controllers';
import { InventoryItemController } from 'controllers';
import { InventoryItem } from 'types';
import { formatDistanceToNow } from 'date-fns';
import Button from 'components/base/Button';

const InventoryItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await InventoryItemController.getItemById(id);
        if (data.success && data.data) {
          setItem(data.data);
          console.log('Fetched item:', data.data);
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
        <Container className="py-8">
          <div className="text-center">
            <h3 className="mb-3">Item not found</h3>
            <Link to="/rental" className="btn btn-primary">
              Back to Rentals
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

  const images = item.images || [];
  const price =
    item.pricing.find(p => p.isDefault || p.unit === 'day')?.amount || 0;

  const unit =
    item.pricing.find(p => p.isDefault || p.unit === 'day')?.unit || 'day';

  const isAvailable = item.status === 'in_stock' && (item.quantity || 0) > 0;

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <Link to="/rental" className="btn btn-outline-secondary">
            < icon={faArrowLeft} className="me-2" />
            Back to Rentals
          </Link>
        </div>

        <Row>
          <Col lg={6}>
            <Card border="secondary" className="mb-4">
              <Card.Body className="p-0">
                <div className="relative">
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
              <div className="flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="mb-2">{item.name}</h1>
                  <div className="flex align-items-center gap-2">
                    <Badge bg="secondary">{item.category}</Badge>
                    <span className="text-info">SKU: {item.sku || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-primary mb-2">
                  {currencyFormat(price)}/{unit}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {item.description ||
                    'No description available for this item.'}
                </p>
              </div>

              <Card className="mb-4">
                <Card.Body>
                  <Link to={isAvailable ? `/rent/${item._id}` : ''}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 mb-2"
                      disabled={!isAvailable}
                    >
                      < icon={faTag} className="me-2" />
                      {isAvailable ? 'Rent Now' : 'Unavailable'}
                    </Button>
                  </Link>
                </Card.Body>
              </Card>

              <Card border="secondary">
                <Card.Header className="border-secondary">
                  <h5 className="mb-0">
                    < icon={faInfo} className="me-2" />
                    Item Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div className="text-gray-600 dark:text-gray-400 small">Available Quantity</div>
                      <div>{item.quantity}</div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-gray-600 dark:text-gray-400 small">Category</div>
                      <div>{item.category}</div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-gray-600 dark:text-gray-400 small">Status</div>
                      <div>{getStatusBadge(item.status)}</div>
                    </Col>
                    <Col md={6} className="mb-3 text-info">
                      <div className="small">SKU</div>
                      <div>{item.sku || 'N/A'}</div>
                    </Col>
                    {item.purchaseInfo.purchaseDate && (
                      <Col xs={12}>
                        <div className="text-gray-600 dark:text-gray-400 small mb-1">
                          < icon={faCalendar} className="me-2" />
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
