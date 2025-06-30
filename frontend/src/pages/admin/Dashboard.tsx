import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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

  useEffect(() => {
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

    fetchData();
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
            <BookingCalendar facilities={facilities} bookings={bookings} />
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
