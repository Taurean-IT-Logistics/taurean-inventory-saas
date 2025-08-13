import { Card, Row, Col, Form, InputGroup } from 'components/ui';
import {  } from '';
import { Search } from 'lucide-react';

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  filteredCount: number;
}

const TransactionFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  filteredCount
}: TransactionFiltersProps) => {
  return (
    <Card className="border-secondary mb-4">
      <Card.Body>
        <Row className="items-center gap-2">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="border-secondary ">
                < icon={Search} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                className="border-secondary"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <Form.Select
              className="border-secondary"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="reconciled">Reconciled</option>
              <option value="pending">Pending</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              className="border-secondary"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="booking_payment">Booking Payment</option>
              <option value="refund">Refund</option>
              <option value="deposit">Deposit</option>
            </Form.Select>
          </Col>
          <Col md={3} className="text-end">
            <span className="text-white-50 small">
              Showing {filteredCount} transactions
            </span>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TransactionFilters;
