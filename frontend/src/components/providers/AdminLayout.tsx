import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';

const AdminLayout = () => {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const isAuthChecked = user !== null || isAuthenticated !== undefined;

  useEffect(() => {
    if (isAuthChecked) {
      const isAdminOrStaff =
        isAuthenticated && (user?.role === 'admin' || user?.role === 'staff');

      if (!isAdminOrStaff) {
        navigate('/sign-in', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isAuthChecked]);

  // Avoid rendering anything until auth check is complete
  if (!isAuthChecked) return null;

  const isAdminOrStaff =
    isAuthenticated && (user?.role === 'admin' || user?.role === 'staff');

  return isAdminOrStaff ? <Outlet /> : null;
};

export default AdminLayout;
