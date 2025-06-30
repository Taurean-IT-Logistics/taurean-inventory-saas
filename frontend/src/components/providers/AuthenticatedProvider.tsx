import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { refreshAccessToken } from 'utils/auth';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { tokens, user, isAuthenticated } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken || !user) {
      navigate('/sign-in', {
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, tokens?.accessToken, user, navigate, location.pathname]);

  // Refresh token on mount and set up periodic refresh
  useEffect(() => {
    if (!isAuthenticated || !tokens?.refreshToken || !user) return;

    const handleTokenRefresh = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        navigate('/sign-in', {
          replace: true,
          state: { from: location.pathname, expired: true }
        });
      }
    };

    // Refresh token immediately on mount
    handleTokenRefresh();

    // Set up interval for periodic refresh
    const interval = setInterval(handleTokenRefresh, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [
    isAuthenticated,
    tokens?.refreshToken,
    user,
    navigate,
    location.pathname
  ]);

  // Show nothing while redirecting to prevent flash of protected content
  if (!isAuthenticated || !tokens?.accessToken || !user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthenticatedLayout;
