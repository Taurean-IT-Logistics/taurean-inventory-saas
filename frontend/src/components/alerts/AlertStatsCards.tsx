import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFire,
  faBell,
  faClock,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { SystemAlert } from 'types';

interface AlertStatsCardsProps {
  alerts: SystemAlert[];
}

const AlertStatsCards = ({ alerts }: AlertStatsCardsProps) => {
  return (
    <Row className="mb-4">
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-danger bg-opacity-10 border-danger">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-danger mb-1">
                  {alerts.filter(a => a.severity === 'critical').length}
                </h3>
                <p className="text-muted mb-0 small">Critical Alerts</p>
              </div>
              <FontAwesomeIcon icon={faFire} className="text-danger fs-2" />
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
                  {alerts.filter(a => !a.isRead).length}
                </h3>
                <p className="text-muted mb-0 small">Unread Alerts</p>
              </div>
              <FontAwesomeIcon icon={faBell} className="text-warning fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-info bg-opacity-10 border-info">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-info mb-1">
                  {alerts.filter(a => !a.isResolved).length}
                </h3>
                <p className="text-muted mb-0 small">Pending Resolution</p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-info fs-2" />
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
                  {alerts.filter(a => a.isResolved).length}
                </h3>
                <p className="text-muted mb-0 small">Resolved</p>
              </div>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-success fs-2"
              />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AlertStatsCards;
