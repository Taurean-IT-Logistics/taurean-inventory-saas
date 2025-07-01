import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faShoppingCart,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { InventoryItem } from 'types';
import InventoryHeroSection from 'components/inventory/InventoryHeroSection';
import InventoryItemCard from 'components/inventory/InventoryItemCard';
import { useCart } from 'hooks/useCart';
import { useWishlist } from 'hooks/useWishlist';
import { InventoryItemController } from 'controllers';

const RentalPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('available');

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // Safe filtering with null checks
  const filteredItems = (items || []).filter(item => {
    if (!item || !item._id || !item.name) return false;

    const matchesSearch =
      (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'available' &&
        item.status === 'in_stock' &&
        (item.quantity || 0) > 0) ||
      (statusFilter === 'unavailable' &&
        (item.status !== 'in_stock' || (item.quantity || 0) === 0));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Safe category extraction with null checks
  const categories = Array.from(
    new Set(
      (items || [])
        .filter(item => item && item.category)
        .map(item => item.category)
    )
  );

  // Safe featured items filtering
  const featuredItems = (items || []).filter(
    item => item && item.status === 'in_stock' && (item.quantity || 0) > 0
  );

  const handleAddToCart = (item: InventoryItem) => {
    if (!item || !item._id) {
      return;
    }

    addToCart({
      type: 'inventory_item',
      itemId: item._id,
      quantity: 1,
      name: item.name || 'Unknown Item',
      price:
        item.pricing.find(p => p.isDefault || p.unit === 'day').amount || 0,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0].path : undefined
    });
  };

  const handleAddToWishlist = (item: InventoryItem) => {
    if (!item || !item._id) {
      return;
    }

    addToWishlist({
      type: 'inventory_item',
      itemId: item._id,
      name: item.name || 'Unknown Item',
      price:
        item.pricing.find(p => p.isDefault || p.unit === 'day').amount || 0,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0].path : undefined
    });
  };

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        setError(null);

        const itemsData = await InventoryItemController.getAllInventoryItems();

        // Safe data extraction with proper null checks
        const rawItems = itemsData?.data;
        if (!Array.isArray(rawItems)) {
          throw new Error('Invalid data format received');
        }

        // Filter out deleted and invalid items
        const filteredItems = rawItems.filter(
          item => item && !item.isDeleted && item._id && item.name
        );

        setItems(filteredItems);
      } catch (error) {
        setError('Failed to load inventory items. Please try again.');
        setItems([]); // Ensure items is always an array
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h5 className="text-danger">Error</h5>
          <p className="text-muted">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Equipment Rental</h1>
            <p className="text-muted mb-0">
              Find and rent the equipment you need
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/cart" className="btn btn-primary">
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              Cart
            </Link>
            <Link to="/wishlist" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={faHeart} className="me-2" />
              Wishlist
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Featured Items - Only show if there are featured items */}
        {featuredItems.length > 0 && (
          <InventoryHeroSection
            items={featuredItems}
            title="Featured"
            to="rental"
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />
        )}

        {/* Filters */}
        <Row className="mb-4 gap-2">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border-secondary"
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="border-secondary"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border-secondary"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('available');
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <Row className="g-3">
            {filteredItems.map(item => (
              <Col key={item._id} xs={12} sm={6} md={4} lg={3}>
                <InventoryItemCard
                  item={item}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5">
            <h5 className="text-muted">
              {items.length === 0
                ? 'No inventory items available'
                : 'No equipment found'}
            </h5>
            <p className="text-muted">
              {items.length === 0
                ? 'Please check back later or contact support.'
                : 'Try adjusting your search criteria.'}
            </p>
            {searchTerm ||
            categoryFilter !== 'all' ||
            statusFilter !== 'available' ? (
              <Button
                variant="outline-primary"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('available');
                }}
              >
                Clear All Filters
              </Button>
            ) : null}
          </div>
        )}
      </Container>
    </div>
  );
};

export default RentalPage;
