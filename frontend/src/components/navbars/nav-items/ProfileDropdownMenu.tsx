import Avatar from 'components/base/Avatar';
import { useState } from 'react';
import { Button, Card, Dropdown, Nav } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { useAppSelector, useAppDispatch } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';

const ProfileDropdownMenu = ({ className }: { className?: string }) => {
  const { user, isAuthenticated } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );
  const dispatch = useAppDispatch();

  const [navItems] = useState([
    { label: 'Profile', icon: 'user', link: '/profile' },
    { label: 'Cart', icon: 'shopping-cart', link: '/cart' },
    { label: 'Wish List', icon: 'heart', link: '/wishlist' },
    { label: 'Invoices', icon: 'file-text', link: '/invoices' }
  ]);

  return (
    <Dropdown.Menu
      align="end"
      style={{ zIndex: 2000 }}
      className={classNames(
        className,
        'navbar-top-dropdown-menu navbar-dropdown-caret py-0 dropdown-profile shadow border'
      )}
    >
      {isAuthenticated && user ? (
        <Card className="position-relative border-0">
          <Card.Body className="p-0">
            <div className="d-flex flex-column align-items-center justify-content-center gap-2 pt-4 pb-3">
              <Avatar variant="name" size="xl">
                {user?.name?.[0] || 'U'}
              </Avatar>
              <h6 className="text-body-emphasis">{user?.name}</h6>
            </div>
            <div style={{ height: '10rem' }} className="mb-3">
              <Nav className="nav flex-column pb-1">
                {navItems.map(item => (
                  <Nav.Item key={item.label}>
                    <Nav.Link href={item.link} className="px-3">
                      <FeatherIcon
                        icon={item.icon}
                        size={16}
                        className="me-2 text-body"
                      />
                      <span className="text-body-highlight">{item.label}</span>
                    </Nav.Link>
                  </Nav.Item>
                ))}

                {(user.role === 'admin' || user.role === 'staff') && (
                  <Nav.Item>
                    <Nav.Link as={Link} to="/admin" className="px-3">
                      <FeatherIcon
                        icon="settings"
                        size={16}
                        className="me-2 text-body"
                      />
                      <span className="text-body-highlight">Admin Panel</span>
                    </Nav.Link>
                  </Nav.Item>
                )}
              </Nav>
            </div>
          </Card.Body>
          <Card.Footer className="p-0 border-top border-translucent">
            <div className="px-3 mt-3">
              <Button
                onClick={() => dispatch(StateManagement.AuthReducer.logout())}
                className="btn btn-phoenix-secondary d-flex flex-center w-100"
              >
                <FeatherIcon icon="log-out" className="me-2" size={16} />
                Sign out
              </Button>
            </div>
            <div className="my-2 text-center fw-bold fs-10 text-body-quaternary">
              <Link className="text-body-quaternary me-1" to="#!">
                Privacy policy
              </Link>{' '}
              •
              <Link className="text-body-quaternary mx-1" to="#!">
                Terms
              </Link>{' '}
              •
              <Link className="text-body-quaternary ms-1" to="#!">
                Cookies
              </Link>
            </div>
          </Card.Footer>
        </Card>
      ) : (
        <Card className="border-0 text-center py-4 px-3">
          <h6 className="mb-3">Welcome!</h6>
          <p className="text-muted mb-4 fs-9">
            Sign in or create an account to access personalized features.
          </p>
          <div className="d-grid gap-2">
            <Link to="/sign-in" className="btn btn-primary">
              Login
            </Link>
            <Link to="/sign-up" className="btn btn-outline-primary">
              Sign Up
            </Link>
            <Link to="/admin" className="btn btn-outline-primary">
              Dashboard
            </Link>
          </div>
        </Card>
      )}
    </Dropdown.Menu>
  );
};

export default ProfileDropdownMenu;
