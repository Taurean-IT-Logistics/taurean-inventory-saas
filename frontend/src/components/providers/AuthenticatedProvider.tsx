import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { refreshAccessToken } from 'utils/auth';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const REFRESH_INTERVAL = 14 * 60 * 1000;

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
  }, [isAuthenticated, tokens, user, navigate, location]);

  // Refresh token every 14 minutes
  useEffect(() => {
    if (!isAuthenticated || !tokens?.refreshToken || !user) return;

    const interval = setInterval(() => {
      refreshAccessToken();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, tokens?.refreshToken, user]);

  if (!isAuthenticated || !tokens?.accessToken || !user) {
    return null; // Prevents flash of protected content before redirect
  }

  return <>{children}</>;
};

export default AuthenticatedLayout;
