import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Dropdown, Nav, Navbar, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import Logo from 'components/common/Logo';
import NotificationDropdownMenu from '../nav-items/NotificationDropdownMenu';
import ProfileDropdownMenu from '../nav-items/ProfileDropdownMenu';
import ThemeToggler from 'components/common/ThemeToggler';
import { useCart } from 'hooks/useCart';
import { useWishlist } from 'hooks/useWishlist';

const EcommerceTopbar = () => {
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  return (
    <div className="container-fluid px-7">
      <div className="ecommerce-topbar">
        <Navbar className="px-0">
          <Row className="gx-0 gy-2 w-100 flex-between-center">
            <Col xs="auto">
              <Link to="/" className="text-decoration-none">
                <Logo />
              </Link>
            </Col>
            <Col xs="auto" className="order-md-1">
              <Nav as="ul" className="navbar-nav-icons flex-row me-n2">
                <Nav.Item as="li" className="d-flex align-items-center">
                  <ThemeToggler />
                </Nav.Item>

                {/* Wishlist */}
                <Nav.Item as="li">
                  <Nav.Link as={Link} to="/wishlist" className="px-2 ">
                    <FeatherIcon icon="heart" size={20} />
                    {wishlistItems > 0 && (
                      <span className="icon-indicator-number icon-indicator icon-indicator-primary">
                        {wishlistItems}
                      </span>
                    )}
                  </Nav.Link>
                </Nav.Item>

                {/* Shopping Cart */}
                <Nav.Item as="li">
                  <Nav.Link
                    as={Link}
                    to="/cart"
                    className="px-2 icon-indicator icon-indicator-primary"
                  >
                    <FeatherIcon icon="shopping-cart" size={20} />
                    {cartItems > 0 && (
                      <span className="icon-indicator-number">{cartItems}</span>
                    )}
                  </Nav.Link>
                </Nav.Item>

                {/* Notifications */}
                <Nav.Item as="li">
                  <Dropdown autoClose="outside">
                    <Dropdown.Toggle
                      as={Link}
                      to="#!"
                      className="dropdown-caret-none nav-link icon-indicator icon-indicator-sm icon-indicator-danger"
                      variant=""
                    >
                      <FeatherIcon icon="bell" size={20} />
                    </Dropdown.Toggle>
                    <NotificationDropdownMenu className="mt-2" />
                  </Dropdown>
                </Nav.Item>

                {/* User Profile */}
                <Nav.Item as="li">
                  <Dropdown autoClose="outside">
                    <Dropdown.Toggle
                      as={Link}
                      to="#!"
                      className="dropdown-caret-none nav-link lh-1"
                      variant=""
                    >
                      <FeatherIcon icon="user" size={20} />
                    </Dropdown.Toggle>
                    <ProfileDropdownMenu className="mt-2" />
                  </Dropdown>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Navbar>
      </div>
    </div>
  );
};

export default EcommerceTopbar;
