import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faBuilding,
  faUsers,
  faBell,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

interface DashboardMetricsProps {
  metrics: {
    totalInventory: number;
    totalFacilities: number;
    totalUsers: number;
    totalAlerts: number;
    lowStockItems: number;
    activeBookings: number;
  };
}

const DashboardMetrics = ({ metrics }: DashboardMetricsProps) => {
  const metricCards = [
    {
      title: 'Total Inventory',
      value: metrics.totalInventory,
      icon: faBox,
      color: 'primary',
      description: 'Items in system'
    },
    {
      title: 'Facilities',
      value: metrics.totalFacilities,
      icon: faBuilding,
      color: 'success',
      description: 'Active facilities'
    },
    {
      title: 'Users',
      value: metrics.totalUsers,
      icon: faUsers,
      color: 'info',
      description: 'Registered users'
    },
    {
      title: 'Active Alerts',
      value: metrics.totalAlerts,
      icon: faBell,
      color: 'warning',
      description: 'System notifications'
    },
    {
      title: 'Low Stock Items',
      value: metrics.lowStockItems,
      icon: faExclamationTriangle,
      color: 'danger',
      description: 'Need attention'
    },
    {
      title: 'Active Bookings',
      value: metrics.activeBookings,
      icon: faCheckCircle,
      color: 'success',
      description: 'Current bookings'
    }
  ];

  return (
    <Row className="mb-4">
      {metricCards.map((metric, index) => (
        <Col key={index} lg={2} md={4} sm={6} className="mb-3">
          <Card
            className={`bg-${metric.color} bg-opacity-10 border-${metric.color} h-100`}
          >
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={metric.icon}
                size="2x"
                className={`text-${metric.color} mb-2`}
              />
              <div className="h3 mb-1">{metric.value}</div>
              <div className="fw-semibold mb-1">{metric.title}</div>
              <small className="text-muted">{metric.description}</small>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardMetrics;
