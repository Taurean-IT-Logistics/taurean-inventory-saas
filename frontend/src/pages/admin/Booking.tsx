import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Booking, Facility } from 'types';
import { currencyFormat } from 'helpers/utils';
import { StateManagement } from 'lib';
import { useAppSelector } from 'hooks/useAppDispatch';
import { BookingController, FacilityController } from 'controllers';
import { Container, Nav } from 'react-bootstrap';
import BookingManagement from 'components/booking/BookingManagement';
import BookingCalendar from 'components/booking/BookingCalendar';
import QuickActionsSidebar from 'components/dashboard/QuickActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCalendar,
  faCalendarAlt,
  faChartBar,
  faChartLine,
  faCheckCircle,
  faClock,
  faDollarSign,
  faList,
  faPlus,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';
import Button from 'components/base/Button';
import { showToast } from 'components/toaster/toaster';
import SimplePaginatedList from 'booking/PaginatedComponent';

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  todayBookings: number;
  weeklyGrowth: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  averageBookingValue: number;
}

const BookingDashboard = () => {
  const { tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const accessToken = tokens?.accessToken;
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
      return isValidDate(dateValue) ? dateValue : null;
    }

    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const parsed = new Date(dateValue);
      return isValidDate(parsed) ? parsed : null;
    }

    return null;
  };

  const getDateRange = (days: number): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const calculateStats = (data: Booking[]): void => {
    if (!Array.isArray(data) || data.length === 0) {
      setStats({
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
        todayBookings: 0,
        weeklyGrowth: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        averageBookingValue: 0
      });
      return;
    }

    // Filter out deleted bookings and validate data
    const validBookings = data.filter(
      booking =>
        booking &&
        !booking.isDeleted &&
        typeof booking.totalPrice === 'number' &&
        !isNaN(booking.totalPrice) &&
        booking.totalPrice >= 0
    );

    const totalBookings = validBookings.length;
    const confirmedBookings = validBookings.filter(
      b => b.status === 'confirmed' || b.status === 'completed'
    ).length;
    const pendingBookings = validBookings.filter(
      b => b.status === 'pending'
    ).length;

    // Calculate total revenue (only from confirmed and completed bookings)
    const revenueGeneratingStatuses = ['confirmed', 'completed'];
    const totalRevenue = validBookings
      .filter(b => revenueGeneratingStatuses.includes(b.status))
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = validBookings.filter(b => {
      const startDate = parseDate(b.startDate);
      return startDate && startDate >= today && startDate < tomorrow;
    }).length;

    // Weekly revenue (last 7 days)
    const { start: weekStart, end: weekEnd } = getDateRange(7);
    const weeklyRevenue = validBookings
      .filter(b => {
        const startDate = parseDate(b.startDate);
        return (
          startDate &&
          startDate >= weekStart &&
          startDate <= weekEnd &&
          revenueGeneratingStatuses.includes(b.status)
        );
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Monthly revenue (last 30 days)
    const { start: monthStart, end: monthEnd } = getDateRange(30);
    const monthlyRevenue = validBookings
      .filter(b => {
        const startDate = parseDate(b.startDate);
        return (
          startDate &&
          startDate >= monthStart &&
          startDate <= monthEnd &&
          revenueGeneratingStatuses.includes(b.status)
        );
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const { start: prevWeekStart } = getDateRange(14);
    const prevWeekRevenue = validBookings
      .filter(b => {
        const startDate = parseDate(b.startDate);
        return (
          startDate &&
          startDate >= prevWeekStart &&
          startDate < weekStart &&
          revenueGeneratingStatuses.includes(b.status)
        );
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const weeklyGrowth =
      prevWeekRevenue > 0
        ? ((weeklyRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
        : weeklyRevenue > 0
        ? 100
        : 0;

    const averageBookingValue =
      totalRevenue > 0 && totalBookings > 0 ? totalRevenue / totalBookings : 0;

    setStats({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalRevenue,
      todayBookings,
      weeklyGrowth: Math.round(weeklyGrowth * 100) / 100, // Round to 2 decimal places
      monthlyRevenue,
      weeklyRevenue,
      averageBookingValue
    });
  };

  const fetchData = async (): Promise<void> => {
    if (!accessToken) {
      setError('No access token available. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [bookingResponse, facilitiesResponse] = await Promise.all([
        BookingController.getAllBookings(accessToken),
        FacilityController.getAllFacilites()
      ]);

      // Validate responses
      if (!bookingResponse?.data) {
        throw new Error('Invalid booking data received');
      }

      if (!facilitiesResponse?.data?.facilities) {
        throw new Error('Invalid facilities data received');
      }

      const fetchedBookings = Array.isArray(bookingResponse.data)
        ? bookingResponse.data
        : [];

      const fetchedFacilities = Array.isArray(
        facilitiesResponse.data.facilities
      )
        ? facilitiesResponse.data.facilities
        : [];

      // Process bookings - convert date strings to Date objects
      const processedBookings = fetchedBookings.map(booking => ({
        ...booking,
        startDate: parseDate(booking.startDate) || new Date(),
        endDate: parseDate(booking.endDate) || new Date(),
        createdAt: parseDate(booking.createdAt) || new Date(),
        updatedAt: parseDate(booking.updatedAt) || new Date()
      }));

      setFacilities(fetchedFacilities);
      setBookings(processedBookings);

      // Set recent bookings (sorted by creation date, most recent first)
      const sortedBookings = [...processedBookings]
        .sort((a, b) => {
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 6);

      setRecentBookings(sortedBookings);
      calculateStats(processedBookings);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load dashboard data: ${errorMessage}`);

      // Set empty states on error
      setBookings([]);
      setFacilities([]);
      setRecentBookings([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await BookingController.deleteBooking(
        bookingId,
        accessToken
      );

      if (response.success) {
        showToast('success', 'Booking created successfully');
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to delete booking');
    }
  };

  const handleUpdateBooking = async (booking: Partial<Booking>) => {
    try {
      const response = await BookingController.updateBooking(
        booking._id,
        booking,
        accessToken
      );

      if (response.success) {
        showToast('success', 'Booking updated successfully');
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to delete booking');
    }
  };

  const handleCreateBooking = async (booking: Partial<Booking>) => {
    try {
      if (booking.facility) {
        booking.facility = booking.facility._id as any;
      }

      if (booking.user) {
        booking.user = booking.user._id as any;
      }

      const response = await BookingController.bookFacility(
        booking,
        accessToken
      );

      if (response.success) {
        showToast('success', 'Booking created successfully');
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to delete booking');
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✗';
      case 'no_show':
        return '⚠';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: string): string => {
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

  const formatDate = (date: Date | string | null): string => {
    const parsedDate = parseDate(date);
    return parsedDate ? parsedDate.toLocaleDateString() : 'Invalid Date';
  };

  const safeGetUserName = (booking: Booking): string => {
    return booking?.user?.name || 'Unknown User';
  };

  const safeGetUserEmail = (booking: Booking): string => {
    return booking?.user?.email || 'No email';
  };

  const safeGetFacilityName = (booking: Booking): string => {
    return booking?.facility?.name || 'Unknown Facility';
  };

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

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error Loading Dashboard</h4>
            <p>{error}</p>
            <hr />
            <Button
              className="btn btn-outline-danger"
              onClick={fetchData}
              disabled={isLoading}
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold  mb-1">Booking Dashboard</h1>
          <p className="text-muted mb-0">
            Overview of all facility bookings and performance metrics
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/create-facility" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Facility
          </Link>

          <Link to="/admin" className="btn btn-outline-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-4 py-1 rounded border border-secondary">
        <Nav className="nav nav-tabs">
          <Nav.Link className="nav-item">
            <Button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
              Overview
            </Button>
          </Nav.Link>
          <Nav.Link className="nav-item">
            <Button
              className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              <FontAwesomeIcon icon={faCalendar} className="me-2" />
              Calendar
            </Button>
          </Nav.Link>
          <Nav.Link className="nav-item">
            <Button
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FontAwesomeIcon icon={faList} className="me-2" />
              All Bookings
            </Button>
          </Nav.Link>
        </Nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            {stats && (
              <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-primary bg-opacity-10 border-primary h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h3 className="text-primary mb-1">
                            {stats.totalBookings}
                          </h3>
                          <p className="text-muted mb-0 small">
                            Total Bookings
                          </p>
                        </div>
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="text-primary fs-2"
                        />
                      </div>
                      <div className="mt-2">
                        <span
                          className={`small ${
                            stats.weeklyGrowth >= 0
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
                          <i
                            className={`fas ${
                              stats.weeklyGrowth >= 0
                                ? 'fa-arrow-up'
                                : 'fa-arrow-down'
                            } me-1`}
                          ></i>
                          {Math.abs(stats.weeklyGrowth)}% from last week
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-success bg-opacity-10 border-success h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h3 className="text-success mb-1">
                            {stats.confirmedBookings}
                          </h3>
                          <p className="text-muted mb-0 small">Confirmed</p>
                        </div>
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-success fs-2"
                        />
                      </div>
                      <div className="mt-2">
                        <span className="-50 small">
                          {stats.totalBookings > 0
                            ? (
                                (stats.confirmedBookings /
                                  stats.totalBookings) *
                                100
                              ).toFixed(1)
                            : '0'}
                          % of total
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-info bg-opacity-10 border-info h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h3 className="text-info mb-1">
                            {currencyFormat(stats.totalRevenue)}
                          </h3>
                          <p className="text-muted mb-0 small">Total Revenue</p>
                        </div>
                        <FontAwesomeIcon
                          icon={faDollarSign}
                          className="text-info fs-2"
                        />
                      </div>
                      <div className="mt-2">
                        <span className="text-info small">
                          Avg: {currencyFormat(stats.averageBookingValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-warning bg-opacity-10 border-warning h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h3 className="text-warning mb-1">
                            {stats.pendingBookings}
                          </h3>
                          <p className="text-muted mb-0 small">
                            Pending Review
                          </p>
                        </div>
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-warning fs-2"
                        />
                      </div>
                      <div className="mt-2">
                        <span className="text-warning small">
                          {stats.pendingBookings > 0
                            ? 'Requires attention'
                            : 'All caught up!'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Revenue Cards */}
            {stats && (
              <div className="row mb-4">
                <div className="col-lg-6 col-md-6 mb-3">
                  <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h3 className=" mb-1">
                            {currencyFormat(stats.weeklyRevenue)}
                          </h3>
                          <p className="-50 mb-0 small">Weekly Revenue</p>
                        </div>
                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 mb-3">
                  <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h3 className=" mb-1">
                            {currencyFormat(stats.monthlyRevenue)}
                          </h3>
                          <p className="-50 mb-0 small">Monthly Revenue</p>
                        </div>
                        <FontAwesomeIcon icon={faChartBar} className="me-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Bookings */}
            <SimplePaginatedList
              data={recentBookings}
              itemsPerPage={5}
              emptyMessage="No recent bookings found"
              className="mt-3"
              tableHeaders={
                <tr>
                  <th>Customer</th>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              }
              renderRow={(booking, index) => (
                <tr key={booking._id || index}>
                  <td>
                    <div>
                      <div className="fw-semibold">
                        {safeGetUserName(booking)}
                      </div>
                      <small className="-50">{safeGetUserEmail(booking)}</small>
                    </div>
                  </td>
                  <td>{safeGetFacilityName(booking)}</td>
                  <td>
                    <div>
                      <div>{formatDate(booking.startDate)}</div>
                      <small className="-50">{booking.duration || 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${getStatusColor(
                        booking.status
                      )} d-flex align-items-center`}
                      style={{ width: 'fit-content' }}
                    >
                      <span className="me-1">
                        {getStatusIcon(booking.status)}
                      </span>
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold">
                      {currencyFormat(booking.totalPrice || 0)}
                    </span>
                  </td>
                </tr>
              )}
            />
            <div className="mt-6">
              <QuickActionsSidebar />
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <BookingCalendar
            onRefresh={fetchData}
            facilities={facilities}
            bookings={bookings}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onCreateBooking={handleCreateBooking}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingManagement
            bookings={bookings}
            facilities={facilities}
            onRefresh={fetchData}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onCreateBooking={handleCreateBooking}
          />
        )}
      </div>
    </Container>
  );
};

export default BookingDashboard;
