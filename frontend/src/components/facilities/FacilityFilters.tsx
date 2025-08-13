import { Row, Col, Form, InputGroup, Button } from 'components/ui';
import {  } from '';
import { Search, Filter } from 'lucide-react';

interface FacilityFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onClearFilters: () => void;
}

const FacilityFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onClearFilters
}: FacilityFiltersProps) => {
  return (
    <Row className="mb-4">
      <Col md={6} className="mb-3">
        <InputGroup>
          <InputGroup.Text className="border-secondary">
            < icon={Search} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border-secondary"
          />
        </InputGroup>
      </Col>
      <Col md={4} className="mb-3">
        <Form.Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border-secondary"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Form.Select>
      </Col>
      <Col md={2} className="mb-3">
        <Button
          variant="outline-secondary"
          onClick={onClearFilters}
          className="w-100"
        >
          < icon={Filter} className="me-2" />
          Clear
        </Button>
      </Col>
    </Row>
  );
};

export default FacilityFilters;
