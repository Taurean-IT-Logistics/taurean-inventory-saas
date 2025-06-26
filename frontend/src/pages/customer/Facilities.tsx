import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Stack
} from 'react-bootstrap';
import {
  faSearch,
  faFilter,
  faMapMarkerAlt,
  faUsers,
  faStar,
  faTh,
  faList,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FacilitiesLoader from 'components/facilites/FacilitiesLoader';
import FacilityCard from 'components/facilites/FacilityCard';
import { mockFacilities } from 'data';
import { Facility } from 'types';

interface FilterOptions {
  search: string;
  location: string;
  capacity: string;
  priceRange: string;
  amenities: string[];
  rating: string;
  availability: string;
}

const capacityOptions = [
  { value: '', label: 'Any Capacity' },
  { value: '1-10', label: '1-10 guests' },
  { value: '11-25', label: '11-25 guests' },
  { value: '26-50', label: '26-50 guests' },
  { value: '51-100', label: '51-100 guests' },
  { value: '100+', label: '100+ guests' }
];

const priceRangeOptions = [
  { value: '', label: 'Any Price' },
  { value: '0-50', label: '$0 - $50' },
  { value: '51-100', label: '$51 - $100' },
  { value: '101-200', label: '$101 - $200' },
  { value: '201-500', label: '$201 - $500' },
  { value: '500+', label: '$500+' }
];

function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate async loading
    const timer = setTimeout(() => {
      setFacilities(mockFacilities);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return { facilities, isLoading };
}

function FacilitiesPage() {
  const { facilities, isLoading } = useFacilities();
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<
    'name' | 'price' | 'rating' | 'capacity'
  >('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    location: '',
    capacity: '',
    priceRange: '',
    amenities: [],
    rating: '',
    availability: ''
  });

  const allAmenities = React.useMemo(
    () => Array.from(new Set(mockFacilities.flatMap(f => f.amenities))).sort(),
    []
  );

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line
  }, [facilities, filters, sortBy, sortOrder]);

  const applyFiltersAndSort = () => {
    let filtered = [...facilities];

    // Search
    if (filters.search) {
      filtered = filtered.filter(
        facility =>
          facility.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          facility.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          facility.location.address
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Location
    if (filters.location) {
      filtered = filtered.filter(
        facility =>
          facility.location.address
            ?.toLowerCase()
            .includes(filters.location.toLowerCase())
      );
    }

    // Capacity
    if (filters.capacity) {
      filtered = filtered.filter(facility => {
        const capacity = facility.capacity.maximum;
        switch (filters.capacity) {
          case '1-10':
            return capacity >= 1 && capacity <= 10;
          case '11-25':
            return capacity >= 11 && capacity <= 25;
          case '26-50':
            return capacity >= 26 && capacity <= 50;
          case '51-100':
            return capacity >= 51 && capacity <= 100;
          case '100+':
            return capacity > 100;
          default:
            return true;
        }
      });
    }

    // Price
    if (filters.priceRange) {
      filtered = filtered.filter(facility => {
        const price = facility.pricing.find(p => p.isDefault)?.amount || 0;
        switch (filters.priceRange) {
          case '0-50':
            return price >= 0 && price <= 50;
          case '51-100':
            return price >= 51 && price <= 100;
          case '101-200':
            return price >= 101 && price <= 200;
          case '201-500':
            return price >= 201 && price <= 500;
          case '500+':
            return price > 500;
          default:
            return true;
        }
      });
    }

    // Amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(facility =>
        filters.amenities.every(amenity => facility.amenities.includes(amenity))
      );
    }

    // Rating
    if (filters.rating) {
      const minRating = Number.parseFloat(filters.rating);
      filtered = filtered.filter(
        facility => facility.rating.average >= minRating
      );
    }

    // Availability
    if (filters.availability) {
      filtered = filtered.filter(facility => {
        if (filters.availability === 'available') return facility.isActive;
        if (filters.availability === 'unavailable') return !facility.isActive;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.pricing.find(p => p.isDefault)?.amount || 0;
          bValue = b.pricing.find(p => p.isDefault)?.amount || 0;
          break;
        case 'rating':
          aValue = a.rating.average;
          bValue = b.rating.average;
          break;
        case 'capacity':
          aValue = a.capacity.maximum;
          bValue = b.capacity.maximum;
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredFacilities(filtered);
  };

  const handleFilterChange = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      capacity: '',
      priceRange: '',
      amenities: [],
      rating: '',
      availability: ''
    });
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return isLoading ? (
    <FacilitiesLoader />
  ) : (
    <Container fluid className="py-4">
      <Header
        filteredCount={filteredFacilities.length}
        totalCount={facilities.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      <Row className="mb-4">
        <Col>
          <FiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            allAmenities={allAmenities}
            onAmenityToggle={handleAmenityToggle}
            clearFilters={clearFilters}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <SortBar
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            resultCount={filteredFacilities.length}
          />
        </Col>
      </Row>
      <FacilitiesList
        filteredFacilities={filteredFacilities}
        viewMode={viewMode}
        clearFilters={clearFilters}
      />
      {filteredFacilities.length > 0 && (
        <Row className="mt-5">
          <Col className="text-center">
            <Button variant="outline-primary" size="lg">
              Load More Facilities
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
}

function Header({
  filteredCount,
  totalCount,
  viewMode,
  setViewMode
}: {
  filteredCount: number;
  totalCount: number;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}) {
  return (
    <Row className="mb-4">
      <Col>
        <Stack
          direction="horizontal"
          className="justify-content-between align-items-center mb-3"
        >
          <div>
            <h1 className="h2 fw-bold mb-1">All Facilities</h1>
            <div className="text-muted mb-0">
              Discover {filteredCount} of {totalCount} available spaces
            </div>
          </div>
          <Stack direction="horizontal" gap={2}>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <FontAwesomeIcon icon={faTh} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <FontAwesomeIcon icon={faList} />
            </Button>
          </Stack>
        </Stack>
      </Col>
    </Row>
  );
}

function FiltersBar({
  filters,
  onFilterChange,
  showFilters,
  setShowFilters,
  allAmenities,
  onAmenityToggle,
  clearFilters
}: {
  filters: FilterOptions;
  onFilterChange: <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  allAmenities: string[];
  onAmenityToggle: (amenity: string) => void;
  clearFilters: () => void;
}) {
  return (
    <Card className="border-secondary">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={4} className="mb-2">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search facilities..."
                value={filters.search}
                onChange={e => onFilterChange('search', e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={2} className="mb-2">
            <Form.Select
              value={filters.capacity}
              onChange={e => onFilterChange('capacity', e.target.value)}
            >
              {capacityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {' '}
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2} className="mb-2">
            <Form.Select
              value={filters.priceRange}
              onChange={e => onFilterChange('priceRange', e.target.value)}
            >
              {priceRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2} className="mb-2">
            <Form.Select
              value={filters.availability}
              onChange={e => onFilterChange('availability', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </Form.Select>
          </Col>
          <Col md={2} className="mb-2">
            <Button
              variant="outline-primary"
              className="w-100"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              Filters
              <FontAwesomeIcon icon={faChevronDown} className="ms-2" />
            </Button>
          </Col>
        </Row>
        {showFilters && (
          <>
            <Row className="mt-3 pt-3 border-top border-secondary">
              <Col md={3} className="mb-3">
                <Form.Label className="small">Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={e => onFilterChange('location', e.target.value)}
                />
              </Col>
              <Col md={3} className="mb-3">
                <Form.Label className="small">Minimum Rating</Form.Label>
                <Form.Select
                  value={filters.rating}
                  onChange={e => onFilterChange('rating', e.target.value)}
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="small">Amenities</Form.Label>
                <div
                  className="d-flex flex-wrap gap-2"
                  style={{ maxHeight: '100px', overflowY: 'auto' }}
                >
                  {allAmenities.slice(0, 8).map(amenity => (
                    <Form.Check
                      key={amenity}
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      label={
                        <span className="small text-muted">{amenity}</span>
                      }
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => onAmenityToggle(amenity)}
                    />
                  ))}
                </div>
              </Col>
              <Col xs={12}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

function SortBar({
  sortBy,
  sortOrder,
  onSort,
  resultCount
}: {
  sortBy: 'name' | 'price' | 'rating' | 'capacity';
  sortOrder: 'asc' | 'desc';
  onSort: (sortBy: 'name' | 'price' | 'rating' | 'capacity') => void;
  resultCount: number;
}) {
  return (
    <Stack
      direction="horizontal"
      className="justify-content-between align-items-center"
    >
      <div className="text-muted">
        Showing {resultCount} result{resultCount !== 1 ? 's' : ''}
      </div>
      <Stack direction="horizontal" gap={2}>
        <span className="text-muted small align-self-center me-2">
          Sort by:
        </span>
        <Button
          size="sm"
          variant={sortBy === 'name' ? 'primary' : 'outline-secondary'}
          onClick={() => onSort('name')}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          size="sm"
          variant={sortBy === 'price' ? 'primary' : 'outline-secondary'}
          onClick={() => onSort('price')}
        >
          Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          size="sm"
          variant={sortBy === 'rating' ? 'primary' : 'outline-secondary'}
          onClick={() => onSort('rating')}
        >
          Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          size="sm"
          variant={sortBy === 'capacity' ? 'primary' : 'outline-secondary'}
          onClick={() => onSort('capacity')}
        >
          Capacity {sortBy === 'capacity' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </Stack>
    </Stack>
  );
}

function FacilitiesList({
  filteredFacilities,
  viewMode,
  clearFilters
}: {
  filteredFacilities: Facility[];
  viewMode: 'grid' | 'list';
  clearFilters: () => void;
}) {
  if (filteredFacilities.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-3">
          <FontAwesomeIcon icon={faSearch} size="3x" />
        </div>
        <h4 className="mb-2">No facilities found</h4>
        <div className="text-muted mb-3">
          Try adjusting your search criteria or filters
        </div>
        <Button variant="primary" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <Row className="g-4">
        {filteredFacilities.map((facility, index) => (
          <Col key={facility._id || index} sm={6} lg={4} xl={3}>
            <FacilityCard facility={facility} />
          </Col>
        ))}
      </Row>
    );
  }

  // List view
  return (
    <div>
      {filteredFacilities.map((facility, index) => (
        <div key={facility._id || index} className="mb-4">
          <FacilityListItem facility={facility} />
        </div>
      ))}
    </div>
  );
}

function FacilityListItem({ facility }: { facility: Facility }) {
  const defaultPricing =
    facility.pricing.find(p => p.isDefault) || facility.pricing[0];

  return (
    <Card className="border-secondary">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={3}>
            <img
              src={
                facility.images[0]?.path ||
                '/placeholder.svg?height=150&width=200'
              }
              alt={facility.name}
              className="img-fluid rounded"
              style={{ height: '150px', width: '100%', objectFit: 'cover' }}
            />
          </Col>
          <Col md={6}>
            <h5 className="fw-bold mb-2">{facility.name}</h5>
            <div className="mb-2 text-muted">{facility.description}</div>
            <Stack direction="horizontal" gap={2} className="mb-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
              <span className="small text-muted">
                {facility.location.address}
              </span>
            </Stack>
            <Stack direction="horizontal" gap={2} className="mb-2">
              <FontAwesomeIcon icon={faUsers} className="text-primary" />
              <span className="small text-muted">
                Up to {facility.capacity.maximum} guests
              </span>
            </Stack>
            {facility.rating && (
              <Stack direction="horizontal" gap={1} className="mb-2">
                <FontAwesomeIcon icon={faStar} className="text-warning" />
                <span className="small">{facility.rating.average}</span>
                <span className="small text-muted">
                  ({facility.rating.totalReviews} reviews)
                </span>
              </Stack>
            )}
          </Col>
          <Col md={3} className="text-end">
            <div className="mb-3">
              <div className="h4 fw-bold mb-0">
                {defaultPricing ? `$${defaultPricing.amount}` : 'Contact'}
              </div>
              {defaultPricing && (
                <small className="text-muted">per {defaultPricing.unit}</small>
              )}
            </div>
            <Stack gap={2}>
              <Button
                as="a"
                href={`/facility/${facility.name
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
                variant="primary"
              >
                View Details
              </Button>
              <Button
                as="a"
                href={`/book/${facility.name
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
                variant="outline-primary"
              >
                Book Now
              </Button>
            </Stack>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default FacilitiesPage;
