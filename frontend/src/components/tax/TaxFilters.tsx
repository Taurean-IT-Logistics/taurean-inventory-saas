import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';

interface TaxFiltersProps {
  filters: {
    search: string;
    appliesTo: string;
    status: string;
    type: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const TaxFilters = ({
  filters,
  onFilterChange,
  onClearFilters
}: TaxFiltersProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <Card className=" border-secondary mb-4">
      <Card.Header className=" border-secondary d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faFilter} className="text-primary me-2" />
          <h6 className=" mb-0">Filters</h6>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={onClearFilters}>
          <FontAwesomeIcon icon={faTimes} className="me-1" />
          Clear
        </Button>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={3} className="mb-3">
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              className=" border-secondary "
              placeholder="Search by name or type..."
              name="search"
              value={filters.search}
              onChange={handleInputChange}
            />
          </Col>

          <Col md={3} className="mb-3">
            <Form.Label>Applies To</Form.Label>
            <Form.Select
              className=" border-secondary "
              name="appliesTo"
              value={filters.appliesTo}
              onChange={handleSelectChange}
            >
              <option value="">All</option>
              <option value="inventory_item">Inventory Items</option>
              <option value="facility">Facilities</option>
              <option value="both">Both</option>
            </Form.Select>
          </Col>

          <Col md={3} className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              className=" border-secondary "
              name="status"
              value={filters.status}
              onChange={handleSelectChange}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Col>

          <Col md={3} className="mb-3">
            <Form.Label>Tax Type</Form.Label>
            <Form.Control
              type="text"
              className=" border-secondary "
              placeholder="Filter by type..."
              name="type"
              value={filters.type}
              onChange={handleInputChange}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TaxFilters;
