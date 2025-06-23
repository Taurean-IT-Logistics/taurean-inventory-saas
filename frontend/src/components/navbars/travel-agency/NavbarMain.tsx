import Button from 'components/base/Button';
import Logo from 'components/common/Logo';
import ThemeToggler from 'components/common/ThemeToggler';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import classNames from 'classnames';

interface SubMenuItems {
  id: number;
  label: string;
  url: string;
}
interface NavItem {
  id: number;
  label: string;
  url?: string;
  items?: SubMenuItems[];
}
interface dropdownItemsProps {
  label: string;
  items: SubMenuItems[];
  isActive: boolean;
  pathName: string;
}

const navItems: NavItem[] = [
  {
    id: 1,
    label: 'Hotel',
    items: [
      {
        id: 2,
        label: 'Homepage',
        url: '/apps/travel-agency/hotel/customer/homepage'
      },
      {
        id: 3,
        label: 'Hotel details',
        url: '/apps/travel-agency/hotel/customer/hotel-details'
      },
      {
        id: 4,
        label: 'Hotel compare',
        url: '/apps/travel-agency/hotel/customer/hotel-compare'
      },
      {
        id: 5,
        label: 'Checkout',
        url: '/apps/travel-agency/hotel/customer/checkout'
      },
      {
        id: 6,
        label: 'Payment',
        url: '/apps/travel-agency/hotel/customer/payment'
      },
      {
        id: 7,
        label: 'Gallery',
        url: '/apps/travel-agency/hotel/customer/gallery'
      }
    ]
  },
  {
    id: 8,
    label: 'Flight',
    items: [
      {
        id: 9,
        label: 'Homepage',
        url: '/apps/travel-agency/flight/homepage'
      },
      {
        id: 10,
        label: 'Booking',
        url: '/apps/travel-agency/flight/booking'
      },
      {
        id: 11,
        label: 'Payment',
        url: '/apps/travel-agency/flight/payment'
      }
    ]
  },
  {
    id: 12,
    label: 'Trip',
    items: [
      {
        id: 13,
        label: 'Homepage',
        url: '/apps/travel-agency/trip/homepage'
      },
      {
        id: 14,
        label: 'Trip Details',
        url: '/apps/travel-agency/trip/trip-details'
      },
      {
        id: 15,
        label: 'Checkout',
        url: '/apps/travel-agency/trip/checkout'
      }
    ]
  },
  {
    id: 16,
    label: 'Event',
    url: '#!'
  },
  {
    id: 17,
    label: 'Package',
    url: '#!'
  }
];

const NavDropdownItems = ({
  label,
  items,
  isActive,
  pathName
}: dropdownItemsProps) => {
  const [show, setShow] = useState(false);
  const { breakpoints } = useBreakpoints();

  const handleMouseEnter = () => {
    if (breakpoints.up('lg')) {
      setShow(true);
    }
  };

  const handleMouseLeave = () => {
    if (breakpoints.up('lg')) {
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
      setShow(false);
    }
  }, [pathName]);

  return (
    <Dropdown
      as="li"
      className="nav-item dropdown-hoverable"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      autoClose="outside"
      onToggle={() => setShow(!show)}
      show={show}
    >
      <Dropdown.Toggle
        as={Link}
        className={classNames('nav-link fs-8 fw-bold', {
          active: isActive
        })}
        to="#!"
      >
        {label}
      </Dropdown.Toggle>
      <Dropdown.Menu className="navbar-dropdown-caret mt-lg-3 mb-3 mb-lg-0">
        {items.map(dropdownItem => (
          <Dropdown.Item
            as={Link}
            to={dropdownItem.url}
            key={dropdownItem.id}
            className={classNames({ active: pathName === dropdownItem.url })}
          >
            {dropdownItem.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const NavbarMain = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { pathname } = useLocation();
  const [isNavItemOpen, setNavItemsOpen] = useState(false);
  const pathNameList = useMemo(() => {
    return pathname
      .split('/')
      .filter(Boolean)
      .map(part => part.toLowerCase());
  }, [pathname]);

  useEffect(() => {
    const toggleShadowClass = () => {
      if (window.scrollY > 300) {
        containerRef.current?.classList.add('navbar-shadow');
      } else {
        containerRef.current?.classList.remove('navbar-shadow');
      }
    };

    document.addEventListener('scroll', () => toggleShadowClass());

    return () => document.removeEventListener('scroll', toggleShadowClass);
  }, []);

  useEffect(() => {
    setNavItemsOpen(false);
  }, [pathname]);

  return (
    <div className="bg-body sticky-top" ref={containerRef}>
      <Navbar
        expand="lg"
        className="navbar-landing container-medium border-0 px-3 py-2"
        expanded={isNavItemOpen}
        onToggle={() => setNavItemsOpen(!isNavItemOpen)}
      >
        <Navbar.Toggle className="fs-8 ps-2 me-sm-2 border-0 ms-n2 hover-bg-transparent navbar-toggler-humburger-icon">
          <span className="navbar-toggle-icon">
            <span className="toggle-line" />
          </span>
        </Navbar.Toggle>
        <Navbar.Brand
          as={Link}
          to="/"
          className="flex-1 flex-lg-grow-0 me-lg-8 me-xl-13"
        >
          <Logo textClass="d-none d-sm-block" />
        </Navbar.Brand>
        <div className="d-flex align-items-center gap-3 gap-md-4 my-2 order-lg-1">
          <ThemeToggler />
          <Button
            to="#!"
            as={Link}
            variant="link"
            className="text-body-tertiary p-0"
          >
            <FeatherIcon icon="map-pin" size={18} />
          </Button>
          <Button
            to="#!"
            as={Link}
            variant="link"
            className="text-body-tertiary p-0"
          >
            <FeatherIcon icon="bell" size={20} />
          </Button>
          <Button
            to="#!"
            as={Link}
            variant="link"
            className="text-body-tertiary p-0"
          >
            <FeatherIcon icon="log-in" size={20} />
          </Button>
          <Button
            to="#!"
            as={Link}
            variant="link"
            className="text-body-tertiary p-0"
          >
            <FeatherIcon icon="user" size={20} />
          </Button>
        </div>

        <Navbar.Collapse id="navbarSupportedContent">
          <Nav as="ul" className="me-auto travel-nav-top">
            {navItems.map(item =>
              item.items ? (
                <NavDropdownItems
                  key={item.id}
                  label={item.label}
                  items={item.items}
                  isActive={pathNameList.includes(item.label.toLowerCase())}
                  pathName={pathname}
                />
              ) : (
                <Nav.Item as="li" key={item.id} className="">
                  <Nav.Link
                    as={Link}
                    to="#!"
                    className={classNames('fw-bold', {
                      active: pathNameList.includes(item.label.toLowerCase())
                    })}
                  >
                    {item.label}
                  </Nav.Link>
                </Nav.Item>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default NavbarMain;
