import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faShoppingCart,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { InventoryItem } from 'types';
import { mockInventoryItems } from 'data';
import InventoryHeroSection from 'components/inventory/InventoryHeroSection';
import InventoryItemCard from 'components/inventory/InventoryItemCard';
import { useCart } from 'hooks/useCart';
import { useWishlist } from 'hooks/useWishlist';

const RentalPage = () => {
  const [items] = useState<InventoryItem[]>(
    mockInventoryItems.filter(item => !item.isDeleted)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('available');

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'available' &&
        item.status === 'in_stock' &&
        item.quantity > 0) ||
      (statusFilter === 'unavailable' &&
        (item.status !== 'in_stock' || item.quantity === 0));
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));
  const featuredItems = items.filter(
    item => item.status === 'in_stock' && item.quantity > 0
  );

  const handleAddToCart = (item: InventoryItem) => {
    addToCart({
      type: 'inventory_item',
      itemId: item._id || '',
      quantity: 1,
      name: item.name,
      price: item.purchaseInfo.purchasePrice || 0,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0] : undefined
    });
  };

  const handleAddToWishlist = (item: InventoryItem) => {
    addToWishlist({
      type: 'inventory_item',
      itemId: item._id || '',
      name: item.name,
      price: item.purchaseInfo.purchasePrice || 0,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0] : undefined
    });
  };

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

        {/* Featured Items */}
        <InventoryHeroSection
          items={featuredItems}
          title="Featured"
          to="rental"
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />

        {/* Filters */}
        <Row className="mb-4">
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

        {filteredItems.length === 0 && (
          <div className="text-center py-5">
            <h5 className="text-muted">No equipment found</h5>
            <p className="text-muted">Try adjusting your search criteria.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default RentalPage;
