import {
  faHotel,
  faPlane,
  faSuitcaseRolling,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface Nav {
  label: string;
  icon: IconDefinition;
  path: string;
}
const nav: Nav[] = [
  {
    label: 'Hotel',
    icon: faHotel,
    path: `/apps/travel-agency/hotel/customer/homepage`
  },
  {
    label: 'Flight',
    icon: faPlane,
    path: `/apps/travel-agency/flight/homepage`
  },
  {
    label: 'Trip',
    icon: faSuitcaseRolling,
    path: `/apps/travel-agency/trip/homepage`
  }
];
const NavbarHome = ({ currentPage }: { currentPage: string }) => {
  return (
    <>
      <Nav className="nav-home justify-content-center py-4 gap-2">
        {nav.map((item, index) => (
          <Nav.Item key={index}>
            <Nav.Link
              as={Link}
              className={classNames('fw-bold rounded-3', {
                active: currentPage === item.label
              })}
              to={item.path}
            >
              <FontAwesomeIcon icon={item.icon} className="me-2" />
              {item.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </>
  );
};

export default NavbarHome;
