import classNames from 'classnames';
import { Nav, NavProps } from 'react-bootstrap';

export interface IsotopeNavItem {
  eventKey: string | number;
  label: string;
  defaultActiveKey?: string | number;
}

interface IsotopeNavProps extends NavProps {
  navItems: IsotopeNavItem[];
}

const IsotopeNav = ({
  navItems,
  className,
  defaultActiveKey,
  onSelect
}: IsotopeNavProps) => {
  return (
    <Nav
      className={classNames(className)}
      defaultActiveKey={defaultActiveKey || navItems[0].eventKey}
      onSelect={onSelect}
    >
      {navItems.map((navItem: IsotopeNavItem) => (
        <Nav.Item key={navItem.eventKey}>
          <Nav.Link className="isotope-nav" eventKey={navItem.eventKey}>
            {navItem.label}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default IsotopeNav;
