import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../hooks/useCart';
import { WishlistProvider } from '../hooks/useWishlist';
import AppProvider from '../providers/AppProvider';
import BreakpointsProvider from '../providers/BreakpointsProvider';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '../components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Phoenix App',
  description: 'Next.js Phoenix Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <BreakpointsProvider>
            <CartProvider>
              <WishlistProvider>
                <Toaster />
                <AuthProvider>
                  {children}
                </AuthProvider>
              </WishlistProvider>
            </CartProvider>
          </BreakpointsProvider>
        </AppProvider>
      </body>
    </html>
  );
}