import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from 'Routes';
import { CartProvider } from 'hooks/useCart';
import { WishlistProvider } from 'hooks/useWishlist';
import AppProvider from 'providers/AppProvider';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import { Toaster } from 'react-hot-toast';
import AuthProvider from 'components/providers/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BreakpointsProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </BreakpointsProvider>
    </AppProvider>
  </StrictMode>
);
