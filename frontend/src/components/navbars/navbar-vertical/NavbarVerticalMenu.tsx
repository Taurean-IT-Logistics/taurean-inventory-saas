import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { Collapse, Nav } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { Route } from 'sitemap';
import { capitalize } from 'helpers/utils';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { useNavbarVerticalCollapse } from './NavbarVerticalCollapseProvider';
import Badge from 'components/base/Badge';
import { useAppContext } from 'providers/AppProvider';

interface NavbarVerticalMenuProps {
  routes: Route[];
  level: number;
}

interface NavItemProps {
  route: Route;
  level: number;
}

const NavItem = ({ route, level }: NavItemProps) => {
  const {
    config: { isNavbarVerticalCollapsed }
  } = useAppContext();
  const { setOpenItems, openItems } = useNavbarVerticalCollapse();
  return (
    <Nav.Item as="li">
      <NavLink
        to={route.path ? route.path : '#!'}
        className={({ isActive }) =>
          classNames('nav-link', {
            'label-1': level === 1,
            active: isActive && route.path !== '#!'
          })
        }
        onClick={() => level === 1 && setOpenItems(openItems.map(() => ''))}
      >
        <div
          className={classNames('d-flex align-items-center', {
            'text-body-quaternary': !route.active
          })}
        >
          {route.icon ? (
            <>
              <span
                className={classNames('nav-link-icon', {
                  new: route.new || route.hasNew
                })}
              >
                {route.iconSet === 'font-awesome' ? (
                  <FontAwesomeIcon
                    icon={route.icon as IconProp}
                    transform={{ size: 16 }}
                  />
                ) : (
                  <FeatherIcon icon={route.icon} size={16} />
                )}
              </span>
              <span className="nav-link-text-wrapper">
                <span className="nav-link-text">{capitalize(route.name)}</span>
                {route.new && !isNavbarVerticalCollapsed && (
                  <Badge variant="phoenix" bg="warning" className="ms-2">
                    New
                  </Badge>
                )}
                {route.isNext && !isNavbarVerticalCollapsed && (
                  <Badge variant="phoenix" bg="primary" className="ms-2">
                    next
                  </Badge>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="nav-link-text">{capitalize(route.name)}</span>
              {route.new && (
                <Badge variant="phoenix" bg="warning" className="ms-2">
                  New
                </Badge>
              )}
              {route.isNext && (
                <Badge variant="phoenix" bg="primary" className="ms-2">
                  next
                </Badge>
              )}
            </>
          )}
        </div>
      </NavLink>
    </Nav.Item>
  );
};

const CollapsableNavItem = ({ route, level }: NavItemProps) => {
  const { pathname } = useLocation();
  const { setOpenItems, openItems } = useNavbarVerticalCollapse();
  const {
    config: { isNavbarVerticalCollapsed }
  } = useAppContext();

  const openCollapse = (childrens: Route[] = []) => {
    const checkLink = (children: Route) => {
      if (`${children.path}` === pathname) {
        return true;
      }
      return children.pages && children.pages.some(checkLink);
    };
    return childrens.some(checkLink);
  };

  const updateOpenItems = (name: string) => {
    const updatedOpenItems = [...openItems];
    updatedOpenItems[level] = name;
    updatedOpenItems.forEach((item, index) => {
      if (index > level) {
        updatedOpenItems[index] = '';
      }
    });
    setOpenItems(updatedOpenItems);
  };

  useEffect(() => {
    if (openCollapse(route.pages)) {
      updateOpenItems(route.name);
    }
  }, []);

  return (
    <>
      <Nav.Link
        onClick={() => {
          if (route.name === openItems[level]) {
            updateOpenItems('');
          } else {
            updateOpenItems(route.name);
          }
        }}
        className={classNames('dropdown-indicator', {
          'label-1': level === 1,
          collapsed: openItems[level] !== route.name,
          'text-body-quaternary': !route.active
        })}
        aria-expanded={openItems[level] === route.name}
      >
        <div className="d-flex align-items-center">
          <div className="dropdown-indicator-icon">
            <FontAwesomeIcon
              icon={faCaretRight}
              className={classNames({
                'text-body-quaternary': !route.active
              })}
            />
          </div>
          {level === 1 && (
            <span
              className={classNames('nav-link-icon', {
                new: route.new || route.hasNew
              })}
            >
              <FeatherIcon icon={route.icon} size={16} />
            </span>
          )}
          <span
            className={classNames('nav-link-text', {
              new: route.hasNew
            })}
          >
            {capitalize(route.name)}
            {(!isNavbarVerticalCollapsed || level !== 1) && route.new && (
              <Badge variant="phoenix" bg="warning" className="ms-2">
                New
              </Badge>
            )}
            {(!isNavbarVerticalCollapsed || level !== 1) && route.isNext && (
              <Badge variant="phoenix" bg="primary" className="ms-2">
                Next
              </Badge>
            )}
          </span>
        </div>
      </Nav.Link>
      <div
        className={classNames('parent-wrapper', {
          'label-1': level === 1
        })}
      >
        <Collapse in={openItems[level] === route.name} className="nav parent">
          <div>
            {level === 1 && (
              <div className="collapsed-nav-item-title d-none">
                {capitalize(route.name)}
                {isNavbarVerticalCollapsed && route.new && (
                  <Badge variant="phoenix" bg="warning" className="ms-2">
                    New
                  </Badge>
                )}
                {isNavbarVerticalCollapsed && route.isNext && (
                  <Badge variant="phoenix" bg="primary" className="ms-2">
                    Next
                  </Badge>
                )}
              </div>
            )}
            <NavbarVerticalMenu routes={route.pages || []} level={level + 1} />
          </div>
        </Collapse>
      </div>
    </>
  );
};

const NavbarVerticalMenu = ({ routes, level }: NavbarVerticalMenuProps) => {
  return (
    <>
      {routes.map(route => (
        <div key={route.name}>
          {level === 1 ? (
            <div className="nav-item-wrapper">
              {route.pages ? (
                <CollapsableNavItem route={route} level={level} />
              ) : (
                <NavItem route={route} level={level} />
              )}
            </div>
          ) : (
            <>
              {route.pages ? (
                <CollapsableNavItem route={route} level={level} />
              ) : (
                <NavItem route={route} level={level} />
              )}
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default NavbarVerticalMenu;
