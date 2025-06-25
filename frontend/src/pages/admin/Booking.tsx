import { useState, useEffect } from 'react';
import {
  faCalendarAlt,
  faUsers,
  faDollarSign,
  faChartLine,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faExclamationTriangle,
  faArrowUp,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Tab,
  Nav,
  Table,
  Container
} from 'react-bootstrap';
import { mockBookings } from 'data';
import { Booking } from 'types';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { currencyFormat } from 'helpers/utils';
import BookingCalendar from 'components/booking/BookingCalendar';
import BookingManagement from 'components/booking/BookingManagement';

interface StatCardProps {
  title: string | number;
  subtitle: string;
  icon: IconProp;
  percentage?: number;
  growth?: number;
  average?: string | number;
}

const StatCard = ({
  title,
  subtitle,
  icon,
  growth,
  percentage,
  average
}: StatCardProps) => {
  let variant = 'primary';
  if (subtitle === 'Confirmed') variant = 'success';
  if (subtitle === 'Pending Review') variant = 'warning';
  if (subtitle === 'Total Revenue') variant = 'info';

  return (
    <Col lg={3} md={6} className="mb-3">
      <Card className={`h-100 border-${variant}`}>
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="mb-1">{title}</h3>
              <p className="text-muted mb-0 small">{subtitle}</p>
            </div>
            <FontAwesomeIcon
              icon={icon}
              className={`text-${variant}`}
              size="2x"
            />
          </div>
          {growth && (
            <div className="mt-2">
              <span className="text-success small">
                <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                {growth}% from last week
              </span>
            </div>
          )}
          {percentage && (
            <div className="mt-2">
              <span className="text-muted small">
                {percentage.toFixed(1)}% of total
              </span>
            </div>
          )}
          {average && (
            <div className="mt-2">
              <span className="text-info small">Avg: {average}</span>
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

const BookingDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<any>({});
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateStats();
      setRecentBookings(mockBookings.slice(0, 5));
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const calculateStats = () => {
    const totalBookings = mockBookings.length;
    const confirmedBookings = mockBookings.filter(
      b => b.status === 'confirmed'
    ).length;
    const pendingBookings = mockBookings.filter(
      b => b.status === 'pending'
    ).length;
    const totalRevenue = mockBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const todayBookings = mockBookings.filter(
      b => b.startDate.toDateString() === new Date().toDateString()
    ).length;
    const averageBookingValue = totalRevenue / totalBookings;

    setStats({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalRevenue,
      todayBookings,
      weeklyGrowth: 12.5,
      monthlyRevenue: totalRevenue * 0.8,
      averageBookingValue
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return faCheckCircle;
      case 'pending':
        return faClock;
      case 'cancelled':
        return faTimesCircle;
      case 'completed':
        return faCheckCircle;
      case 'no_show':
        return faExclamationTriangle;
      default:
        return faClock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'info';
      case 'no_show':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 fw-bold mb-1">Booking Dashboard</h1>
          <p className="text-muted mb-0">
            Overview of all facility bookings and performance metrics
          </p>
        </Col>
        <Col className="d-flex justify-content-end">
          <Button variant="outline-primary">
            <FontAwesomeIcon icon={faEye} className="me-2" />
            View Reports
          </Button>
        </Col>
      </Row>

      <Tab.Container
        activeKey={activeTab}
        onSelect={k => setActiveTab(k || 'overview')}
      >
        <Card
          className="mb-4"
          style={{ position: 'sticky', top: '20px', zIndex: 1020 }}
        >
          <Card.Body className="p-2">
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey="overview">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" />
                  Overview
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="calendar">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Calendar
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="bookings">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  All Bookings
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body>
        </Card>

        <Tab.Content>
          <Tab.Pane eventKey="overview">
            <Row className="mb-4">
              <StatCard
                title={stats.totalBookings}
                subtitle="Total Bookings"
                icon={faCalendarAlt}
                growth={stats.weeklyGrowth}
              />
              <StatCard
                title={stats.confirmedBookings}
                subtitle="Confirmed"
                icon={faCheckCircle}
                percentage={
                  (stats.confirmedBookings / stats.totalBookings) * 100
                }
              />
              <StatCard
                title={currencyFormat(stats.totalRevenue)}
                subtitle="Total Revenue"
                icon={faDollarSign}
                average={currencyFormat(stats.averageBookingValue)}
              />
              <StatCard
                title={stats.pendingBookings}
                subtitle="Pending Review"
                icon={faClock}
              />
            </Row>

            <Row>
              <Col lg={8} className="mb-4">
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">Recent Bookings</h5>
                  </Card.Header>
                  <Card.Body className="px-2">
                    <Table striped hover responsive>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Facility</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking, index) => (
                          <tr key={index}>
                            <td>
                              <div className="fw-semibold">
                                {booking.user.name}
                              </div>
                              <small className="text-muted">
                                {booking.user.email}
                              </small>
                            </td>
                            <td>{booking.facility.name}</td>
                            <td>
                              <div>
                                {booking.startDate.toLocaleDateString()}
                              </div>
                              <small className="text-muted">
                                {booking.duration}
                              </small>
                            </td>
                            <td>
                              <span
                                className={`badge bg-${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                <FontAwesomeIcon
                                  icon={getStatusIcon(booking.status)}
                                  className="me-1"
                                />
                                {booking.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="fw-bold">
                              {currencyFormat(booking.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4} className="mb-4">
                <Card
                  className="h-100"
                  style={{ position: 'sticky', top: '20px' }}
                >
                  <Card.Header>
                    <h5 className="mb-0">Quick Actions</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-3">
                      <Button variant="primary">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="me-2"
                        />
                        Create New Booking
                      </Button>
                      <Button variant="outline-success">
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Manage Customers
                      </Button>
                      <Button variant="outline-info">
                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                        View Analytics
                      </Button>
                      <Button variant="outline-warning">
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        Pending Approvals ({stats.pendingBookings})
                      </Button>
                    </div>

                    <hr className="my-4" />
                    <h6 className="mb-3">Today's Schedule</h6>
                    <div className="text-center">
                      <div className="display-6 text-primary mb-2">
                        {stats.todayBookings}
                      </div>
                      <p className="text-muted mb-0">Bookings Today</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          <Tab.Pane eventKey="calendar">
            <BookingCalendar />
          </Tab.Pane>

          <Tab.Pane eventKey="bookings">
            <BookingManagement />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default BookingDashboard;
