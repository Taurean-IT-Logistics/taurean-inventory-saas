import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { tokens, user, isAuthenticated } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken || !user) {
      navigate('/sign-in', {
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, tokens, user, navigate, location]);

  if (!isAuthenticated || !tokens?.accessToken || !user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthenticatedLayout;
