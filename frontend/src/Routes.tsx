import MainLayout from 'layouts/MainLayout';
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

const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        element: <MainLayout />
      },
      {
        path: '/sign-in',
        element: <SignIn />
      },
      {
        element: <EcommerceLayout />,
        children: [
          { path: '/', index: true, element: <Homepage /> },
          {
            path: '/facilities',
            element: <FacilitiesPage />
          },
          {
            path: '/profile',
            element: <Profile />
          },
          {
            path: '/facility/:facilityId',
            element: <FacilityDetailPage />
          },
          { path: '/facility/:facilityId/booking', element: <BookingPage /> },
          {
            path: 'invoice/:transactionId',
            element: <UserInvoicePage />
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
