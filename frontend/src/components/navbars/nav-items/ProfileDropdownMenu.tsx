import Avatar from 'components/base/Avatar';
import { useState } from 'react';
import { Button, Card, Dropdown, Nav } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import Scrollbar from 'components/base/Scrollbar';
import classNames from 'classnames';
import { useAppSelector, useAppDispatch } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';

const ProfileDropdownMenu = ({ className }: { className?: string }) => {
  const { user, isAuthenticated } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );
  const dispatch = useAppDispatch();

  const [navItems] = useState([
    { label: 'Profile', icon: 'user' },
    { label: 'Cart', icon: 'shopping-cart' },
    { label: 'Wish List', icon: 'heart' },
    { label: 'Invoices', icon: 'file-text' }
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
              <h6 className="text-body-emphasis">
                {user?.firstName} {user?.lastName}
              </h6>
            </div>
            <div style={{ height: '10rem' }}>
              <Scrollbar>
                <Nav className="nav flex-column mb-2 pb-1">
                  {navItems.map(item => (
                    <Nav.Item key={item.label}>
                      <Nav.Link href="#!" className="px-3">
                        <FeatherIcon
                          icon={item.icon}
                          size={16}
                          className="me-2 text-body"
                        />
                        <span className="text-body-highlight">
                          {item.label}
                        </span>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Scrollbar>
            </div>
          </Card.Body>
          <Card.Footer className="p-0 border-top border-translucent">
            <Nav className="nav flex-column my-3">
              <Nav.Item>
                <Nav.Link href="#!" className="px-3">
                  <FeatherIcon
                    icon="user-plus"
                    size={16}
                    className="me-2 text-body"
                  />
                  <span>Add another account</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <hr />
            <div className="px-3">
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
          </div>
        </Card>
      )}
    </Dropdown.Menu>
  );
};

export default ProfileDropdownMenu;
