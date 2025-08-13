import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Button,
  Card,
  Form,
  Row,
  Col,
  Badge
} from 'components/ui';
import {  } from '';
import {
  faArrowLeft,
  faPlus,
  faInfoCircle,
  AlertTriangle,
  faExclamationCircle,
  faFire,
  faCalendarTimes,
  faTools,
  faBoxes,
  faCreditCard,
  faUserTimes,
  faEye,
  Check
} from 'lucide-react';
import { SystemAlert } from 'types';
import AlertStatsCards from 'components/alerts/AlertStatsCards';

const SystemAlerts = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      type: 'low_inventory',
      severity: 'medium',
      title: 'Low Inventory Alert',
      message: 'Projector - Epson EB-X41 is running low on stock (2 remaining)',
      relatedEntity: {
        type: 'inventory',
        id: '1'
      },
      isRead: false,
      isResolved: false,
      createdAt: new Date('2024-12-21T10:30:00')
    },
    {
      type: 'maintenance_due',
      severity: 'high',
      title: 'Maintenance Due',
      message: 'Conference Room A requires scheduled maintenance',
      relatedEntity: {
        type: 'facility',
        id: '1'
      },
      isRead: true,
      isResolved: false,
      createdAt: new Date('2024-12-20T15:45:00')
    }
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSeverity =
      filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesResolved = showResolved || !alert.isResolved;
    return matchesType && matchesSeverity && matchesResolved;
  });

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { bg: 'info', text: 'Low', icon: faInfoCircle },
      medium: { bg: 'warning', text: 'Medium', icon: AlertTriangle },
      high: { bg: 'danger', text: 'High', icon: faExclamationCircle },
      critical: { bg: 'danger', text: 'Critical', icon: faFire }
    };

    const config =
      severityConfig[severity as keyof typeof severityConfig] ||
      severityConfig.low;
    return (
      <Badge
        bg={config.bg}
        className="flex align-items-center"
        style={{ width: 'fit-content' }}
      >
        < icon={config.icon} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      overbooking: faCalendarTimes,
      maintenance_due: faTools,
      low_inventory: faBoxes,
      payment_failed: faCreditCard,
      high_churn_risk: faUserTimes
    };

    return typeIcons[type as keyof typeof typeIcons] || faInfoCircle;
  };

  const markAsRead = (index: number) => {
    setAlerts(prev =>
      prev.map((alert, i) => (i === index ? { ...alert, isRead: true } : alert))
    );
  };

  const markAsResolved = (index: number) => {
    setAlerts(prev =>
      prev.map((alert, i) =>
        i === index
          ? {
              ...alert,
              isResolved: true,
              resolvedBy: null,
              resolvedAt: new Date()
            }
          : alert
      )
    );
  };

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">System Alerts</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              Monitor and manage system notifications
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/create-alert" className="btn btn-primary">
              < icon={faPlus} className="me-2" />
              Create Alert
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              < icon={faArrowLeft} className="me-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <AlertStatsCards alerts={alerts} />

        {/* Filters */}
        <Card className="border-secondary mb-4">
          <Card.Body>
            <Row className="items-center gap-3">
              <Col md={3}>
                <Form.Select
                  className="border-secondary"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="overbooking">Overbooking</option>
                  <option value="maintenance_due">Maintenance Due</option>
                  <option value="low_inventory">Low Inventory</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="high_churn_risk">High Churn Risk</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  className="border-secondary"
                  value={filterSeverity}
                  onChange={e => setFilterSeverity(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  checked={showResolved}
                  onChange={e => setShowResolved(e.target.checked)}
                  label="Show Resolved"
                />
              </Col>
              <Col md={3} className="text-end">
                <span className="text-gray-600 dark:text-gray-400 small">
                  Showing {filteredAlerts.length} alerts
                </span>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Alerts List */}
        <Row>
          {filteredAlerts.map((alert, index) => (
            <Col xs={12} key={index} className="mb-3">
              <Card
                className={`border-secondary ${
                  !alert.isRead ? 'border-warning' : ''
                } ${alert.isResolved ? 'opacity-75' : ''}`}
              >
                <Card.Body>
                  <div className="flex align-items-start justify-content-between">
                    <div className="flex align-items-start">
                      <div className="me-3">
                        <
                          icon={getTypeIcon(alert.type)}
                          className="fs-4 text-primary"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="flex align-items-center mb-2">
                          <h6 className="mb-0 me-3">{alert.title}</h6>
                          {getSeverityBadge(alert.severity)}
                          {!alert.isRead && (
                            <Badge bg="warning" className="ms-2">
                              New
                            </Badge>
                          )}
                          {alert.isResolved && (
                            <Badge bg="success" className="ms-2">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{alert.message}</p>
                        <div className="flex align-items-center text-muted small">
                          <span className="me-3">
                            <
                              icon={faInfoCircle}
                              className="me-1"
                            />
                            {alert.createdAt.toLocaleString()}
                          </span>
                          <span className="me-3">
                            Type: {alert.relatedEntity.type}
                          </span>
                          {alert.resolvedBy && (
                            <span>Resolved by {alert.resolvedBy.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!alert.isRead && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => markAsRead(index)}
                        >
                          < icon={faEye} className="me-1" />
                          Mark Read
                        </Button>
                      )}
                      {!alert.isResolved && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => markAsResolved(index)}
                        >
                          < icon={Check} className="me-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-5">
            <
              icon={faInfoCircle}
              className="fs-1 text-muted mb-3"
            />
            <h5 className="text-gray-600 dark:text-gray-400">No alerts found</h5>
            <p className="text-gray-600 dark:text-gray-400">All systems are running smoothly.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SystemAlerts;
