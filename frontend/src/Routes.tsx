import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from 'App';
import SignIn from 'pages/SignIn';
import EcommerceLayout from 'layouts/EcommerceLayout';
import Homepage from 'pages/customer/Homepage';
import FacilitiesPage from 'pages/customer/Facilities';
import FacilityDetailPage from 'pages/customer/FacilityDetailPage';
import Profile from 'pages/customer/Profile';
import BookingPage from 'pages/customer/BookingPage';
import UserInvoicePage from 'pages/customer/Invoice';
import AdminDashboard from 'pages/admin/Dashboard';
import CreateFacility from 'pages/admin/CreateFacility';
import CreateInventory from 'pages/admin/CreateInventoryItem';
import TransactionManagement from 'pages/admin/Transaction';
import UserManagement from 'pages/admin/UserManagement';
import SystemAlerts from 'pages/admin/SystemAlert';
import InventoryManagement from 'pages/admin/InventoryManagement';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'sign-in',
        element: <SignIn />
      },
      {
        path: '/',
        element: <EcommerceLayout />,
        children: [
          {
            index: true,
            element: <Homepage />
          },
          {
            path: 'facilities',
            element: <FacilitiesPage />
          },
          {
            path: 'profile',
            element: <Profile />
          },
          {
            path: 'facility/:facilityId',
            element: <FacilityDetailPage />
          },
          {
            path: 'facility/:facilityId/booking',
            element: <BookingPage />
          },
          {
            path: 'invoice/:transactionId',
            element: <UserInvoicePage />
          }
        ]
      },
      {
        path: 'admin',
        element: <EcommerceLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />
          },
          {
            path: 'dashboard',
            element: <AdminDashboard />
          },
          {
            path: 'create-facility',
            element: <CreateFacility />
          },
          {
            path: 'create-inventory-item',
            element: <CreateInventory />
          },
          {
            path: 'transactions',
            element: <TransactionManagement />
          },
          {
            path: 'users',
            element: <UserManagement />
          },
          {
            path: 'alerts',
            element: <SystemAlerts />
          },
          {
            path: 'inventory',
            element: <InventoryManagement />
          }
        ]
      }
    ]
  }
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_BASENAME || '/'
});

export default routes;
