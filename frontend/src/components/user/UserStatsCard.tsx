import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUser,
  faUserTie,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import { User } from 'types';

interface UserStatsCardsProps {
  users: User[];
}

const UserStatsCards = ({ users }: UserStatsCardsProps) => {
  return (
    <Row className="mb-4">
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-primary bg-opacity-10 border-primary">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-primary mb-1">
                  {users.filter(u => !u.isDeleted).length}
                </h3>
                <p className="text-muted mb-0 small">Total Users</p>
              </div>
              <FontAwesomeIcon icon={faUsers} className="text-primary fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-success bg-opacity-10 border-success">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-success mb-1">
                  {users.filter(u => u.role === 'user' && !u.isDeleted).length}
                </h3>
                <p className="text-muted mb-0 small">Customers</p>
              </div>
              <FontAwesomeIcon icon={faUser} className="text-success fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-warning bg-opacity-10 border-warning">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-warning mb-1">
                  {users.filter(u => u.role === 'staff' && !u.isDeleted).length}
                </h3>
                <p className="text-muted mb-0 small">Staff</p>
              </div>
              <FontAwesomeIcon icon={faUserTie} className="text-warning fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-danger bg-opacity-10 border-danger">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-danger mb-1">
                  {users.filter(u => u.role === 'admin' && !u.isDeleted).length}
                </h3>
                <p className="text-muted mb-0 small">Admins</p>
              </div>
              <FontAwesomeIcon
                icon={faUserShield}
                className="text-danger fs-2"
              />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default UserStatsCards;
