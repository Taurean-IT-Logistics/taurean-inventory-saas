import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import DashboardMetrics from 'components/dashboard/DashboardMetrics';
import QuickActionsSidebar from 'components/dashboard/QuickActions';
import RecentActivity from 'components/dashboard/RecentActivity';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalInventory: 0,
    totalFacilities: 0,
    totalUsers: 0,
    totalAlerts: 0,
    lowStockItems: 0,
    activeBookings: 0
  });

  const [recentActivities] = useState([
    {
      id: '1',
      type: 'inventory' as const,
      action: 'Added',
      description: 'New projector added to AV equipment',
      timestamp: new Date(),
      user: 'Admin'
    },
    {
      id: '2',
      type: 'user' as const,
      action: 'Created',
      description: 'New user account created',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: 'Manager'
    },
    {
      id: '3',
      type: 'facility' as const,
      action: 'Updated',
      description: 'Conference room capacity updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      user: 'Admin'
    },
    {
      id: '4',
      type: 'alert' as const,
      action: 'Created',
      description: 'Low stock alert for office supplies',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: 'System'
    }
  ]);

  useEffect(() => {
    // Simulate loading metrics
    const timer = setTimeout(() => {
      setMetrics({
        totalInventory: 156,
        totalFacilities: 12,
        totalUsers: 48,
        totalAlerts: 7,
        lowStockItems: 3,
        activeBookings: 15
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="mb-4">
          <h1 className="h3 fw-bold mb-1">Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome to the Facility Management System
          </p>
        </div>

        <DashboardMetrics metrics={metrics} />

        <Row>
          <Col lg={8} className="mb-4">
            <RecentActivity activities={recentActivities} />
          </Col>
          <Col lg={4}>
            <QuickActionsSidebar />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
