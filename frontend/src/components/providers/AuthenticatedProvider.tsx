import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { refreshAccessToken } from 'utils/auth';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes
const MAX_RETRIES = 3;

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { tokens, user, isAuthenticated } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const retryCountRef = useRef(0);
  const refreshingRef = useRef(false);
  const [showContent, setShowContent] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken || !user) {
      setShowContent(false);
      navigate('/sign-in', {
        replace: true,
        state: { from: location.pathname }
      });
    } else {
      setShowContent(true);
    }
  }, [isAuthenticated, tokens?.accessToken, user, navigate, location.pathname]);

  // Token refresh logic with exponential backoff
  const handleTokenRefresh = async () => {
    if (refreshingRef.current) return;

    try {
      refreshingRef.current = true;
      await refreshAccessToken();
      retryCountRef.current = 0; // reset on success
    } catch (error: any) {
      retryCountRef.current += 1;

      if (retryCountRef.current >= MAX_RETRIES) {
        navigate('/sign-in', {
          replace: true,
          state: { from: location.pathname, expired: true }
        });
        return;
      }

      // If rate limited, use exponential backoff
      const delay = Math.pow(2, retryCountRef.current) * 1000; // e.g., 1s, 2s, 4s
      setTimeout(handleTokenRefresh, delay);
    } finally {
      refreshingRef.current = false;
    }
  };

  // Refresh token on mount and every 14 minutes
  useEffect(() => {
    if (!isAuthenticated || !tokens?.refreshToken || !user) return;

    // Refresh immediately after mount
    handleTokenRefresh();

    const interval = setInterval(() => {
      handleTokenRefresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, tokens?.refreshToken, user]);

  if (!showContent) return null;

  return <>{children}</>;
};

export default AuthenticatedLayout;
