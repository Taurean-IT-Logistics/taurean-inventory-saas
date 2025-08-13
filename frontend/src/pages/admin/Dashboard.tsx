import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'components/ui';
import DashboardMetrics from 'components/dashboard/DashboardMetrics';
import QuickActionsSidebar from 'components/dashboard/QuickActions';
import { Booking, Facility } from 'types';
import {
  BookingController,
  FacilityController,
  InventoryItemController,
  TransactionController,
  UserController
} from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import BookingCalendar from 'components/booking/BookingCalendar';
import { showToast } from 'components/toaster/toaster';

const Dashboard = () => {
  const { tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilites] = useState<Facility[]>([]);
  const accessToken = tokens.accessToken;
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalInventory: 0,
    totalFacilities: 0,
    totalUsers: 0,
    activeBookings: 0
  });

  async function fetchData() {
    const [
      transactionData,
      facilitiesData,
      usersData,
      inventoryData,
      stockData,
      bookingsData
    ] = await Promise.all([
      TransactionController.getAllTransactions(accessToken),
      FacilityController.getAllFacilites(),
      UserController.getAllusers(accessToken),
      InventoryItemController.getAllInventoryItems(),
      InventoryItemController.getLowStockItems(accessToken),
      BookingController.getAllBookings(accessToken)
    ]);

    if (
      transactionData &&
      facilitiesData &&
      usersData &&
      inventoryData &&
      stockData &&
      bookingsData
    ) {
      setIsLoading(false);
      const metricsData = {
        totalInventory: inventoryData.data.length,
        totalFacilities: facilitiesData.data.facilities.length,
        totalUsers: (usersData.data as any).users.length,
        activeBookings: (bookingsData.data as Booking[]).length
      };

      setBookings(bookingsData.data as Booking[]);
      setFacilites(facilitiesData.data.facilities as Facility[]);

      setMetrics(metricsData);
    } else {
      setIsLoading(false);
      const metricsData = {
        totalInventory: 0,
        totalFacilities: 0,
        totalUsers: 0,
        activeBookings: 0
      };

      setMetrics(metricsData);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="mb-4">
          <h1 className="h3 fw-bold mb-1">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-0">
            Welcome to the Facility Management System
          </p>
        </div>

        <DashboardMetrics metrics={metrics} />
        <Row>
          <Col lg={8} className="mb-4">
            <BookingCalendar
              onRefresh={fetchData}
              facilities={facilities}
              bookings={bookings}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
              onCreateBooking={handleCreateBooking}
            />
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
