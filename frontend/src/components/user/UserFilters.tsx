import { Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  filteredCount: number;
  totalCount: number;
}

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  filteredCount,
  totalCount
}: UserFiltersProps) => {
  return (
    <Card className="border-secondary mb-4">
      <Card.Body>
        <Row className="align-items-center gap-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="border-secondary">
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                className="border-secondary text-white"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              className="bborder-secondary"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
            </Form.Select>
          </Col>
          <Col md={3} className="text-end">
            <span className="text-muted small">
              Showing {filteredCount} of {totalCount} users
            </span>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default UserFilters;
