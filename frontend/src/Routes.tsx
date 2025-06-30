import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from 'App';
import SignIn from 'pages/SignIn';
import SignUp from 'pages/SignUp';
import Homepage from 'pages/customer/Homepage';
import FacilitiesPage from 'pages/customer/Facilities';
import FacilityDetailPage from 'pages/customer/FacilityDetailPage';
import Profile from 'pages/customer/Profile';
import BookingPage from 'pages/customer/BookingPage';
import UserInvoicePage from 'pages/customer/Invoice';
import CartPage from 'pages/customer/CartPage';
import RentalPage from 'pages/customer/RentalPage';
import WishlistPage from 'pages/customer/WishListPage';

import AdminDashboard from 'pages/admin/Dashboard';
import CreateFacility from 'pages/admin/CreateFacility';
import CreateInventory from 'pages/admin/CreateInventoryItem';
import TransactionManagement from 'pages/admin/Transaction';
import UserManagement from 'pages/admin/UserManagement';
import SystemAlerts from 'pages/admin/SystemAlert';
import InventoryManagement from 'pages/admin/InventoryManagement';
import CreateAlert from 'pages/admin/CreateAlert';
import BookingDashboard from 'pages/admin/Booking';
import InventoryItemDetailPage from 'pages/customer/ItemDetailPage';

import EcommerceLayout from 'layouts/EcommerceLayout';
import AuthenticatedLayout from 'components/providers/AuthenticatedProvider';
import AdminLayout from 'components/providers/AdminLayout';
import RentDetailPage from 'pages/customer/RentalDetailPage';
import PaymentCallback from 'pages/customer/PaymentCallback';

const withAuth = (element: React.ReactNode) => (
  <AuthenticatedLayout>{element}</AuthenticatedLayout>
);

const customerRoutes: RouteObject = {
  path: '/',
  element: <EcommerceLayout />,
  children: [
    { index: true, element: <Homepage /> },
    { path: 'facilities', element: <FacilitiesPage /> },
    { path: 'facility/:facilityId', element: <FacilityDetailPage /> },
    {
      path: 'facility/:facilityId/booking',
      element: withAuth(<BookingPage />)
    },
    { path: '/rent/:id', element: withAuth(<RentDetailPage />) },
    { path: '/item/:id', element: <InventoryItemDetailPage /> },
    { path: 'invoices', element: withAuth(<UserInvoicePage />) },
    { path: 'invoices/:reference', element: withAuth(<UserInvoicePage />) },
    { path: 'callback', element: withAuth(<PaymentCallback />) },
    { path: 'profile', element: withAuth(<Profile />) },
    { path: 'cart', element: withAuth(<CartPage />) },
    { path: 'wishlist', element: withAuth(<WishlistPage />) },
    { path: 'rental', element: <RentalPage /> }
  ]
};

const adminRoutes: RouteObject = {
  path: 'admin',
  element: (
    <AuthenticatedLayout>
      <AdminLayout />
    </AuthenticatedLayout>
  ),
  children: [
    {
      path: '',
      element: <EcommerceLayout />,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'dashboard', element: <AdminDashboard /> },
        { path: 'create-facility', element: <CreateFacility /> },
        { path: 'create-inventory-item', element: <CreateInventory /> },
        { path: 'transactions', element: <TransactionManagement /> },
        { path: 'users', element: <UserManagement /> },
        { path: 'alerts', element: <SystemAlerts /> },
        { path: 'inventory', element: <InventoryManagement /> },
        { path: 'create-alert', element: <CreateAlert /> },
        { path: 'bookings', element: <BookingDashboard /> }
      ]
    }
  ]
};

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'sign-in', element: <SignIn /> },
      { path: 'sign-up', element: <SignUp /> },
      customerRoutes,
      adminRoutes
    ]
  }
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_BASENAME || '/'
});

export default routes;
