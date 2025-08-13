import { Card, Row, Col } from 'components/ui';
import {  } from '';
import {
  faBox,
  faBuilding,
  Users,
  CheckCircle
} from 'lucide-react';

interface DashboardMetricsProps {
  metrics: {
    totalInventory: number;
    totalFacilities: number;
    totalUsers: number;
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
      color: 'warning',
      description: 'Active facilities'
    },
    {
      title: 'Users',
      value: metrics.totalUsers,
      icon: Users,
      color: 'info',
      description: 'Registered users'
    },
    {
      title: 'Active Bookings',
      value: metrics.activeBookings,
      icon: CheckCircle,
      color: 'success',
      description: 'Current bookings'
    }
  ];

  return (
    <Row className="mb-4 justify-content-between">
      {metricCards.map((metric, index) => (
        <Col key={index} lg={3} md={3} sm={6} className="mb-3">
          <Card
            className={`bg-${metric.color} bg-opacity-10 border-${metric.color} h-100`}
          >
            <Card.Body className="text-center">
              <
                icon={metric.icon}
                size="2x"
                className={`text-${metric.color} mb-2`}
              />
              <div className="h3 mb-1">{metric.value}</div>
              <div className="font-semibold mb-1">{metric.title}</div>
              <small className="text-gray-600 dark:text-gray-400">{metric.description}</small>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardMetrics;
