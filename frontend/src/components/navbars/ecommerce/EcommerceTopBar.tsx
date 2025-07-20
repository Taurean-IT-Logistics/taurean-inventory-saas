import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Dropdown, Nav, Navbar, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import Logo from 'components/common/Logo';
import NotificationDropdownMenu from '../nav-items/NotificationDropdownMenu';
import ProfileDropdownMenu from '../nav-items/ProfileDropdownMenu';
import ThemeToggler from 'components/common/ThemeToggler';

const EcommerceTopbar = () => {
  return (
    <div className="container-fluid">
      <div className="ecommerce-topbar">
        <Navbar className="px-0">
          <Row className="gx-0 gy-2 w-100 flex-between-center">
            <Col xs="auto">
              <Link to="/" className="text-decoration-none">
                <Logo width={100} isShown={false} />
              </Link>
            </Col>
            <Col xs="auto" className="order-md-1">
              <Nav as="ul" className="navbar-nav-icons flex-row me-n2">
                <Nav.Item as="li" className="d-flex align-items-center">
                  <ThemeToggler />
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
