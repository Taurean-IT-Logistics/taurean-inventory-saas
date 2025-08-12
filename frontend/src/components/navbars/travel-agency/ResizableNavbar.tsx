import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { Container, Dropdown, Nav, NavItem, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { ResizableNav } from 'data/travel-agency/resizableNav';

const ResizableNavbar = ({ navItems }: ResizableNav) => {
  const { pathname } = useLocation();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const otherElsRef = useRef<HTMLDivElement | null>(null);
  const moreBtnRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dropdownItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const updateItems = useCallback(() => {
    const otherElsWidth = otherElsRef.current?.clientWidth || 0;
    const containerWidth = containerRef.current?.clientWidth || 0;
    const moreBtnWidth = moreBtnRef.current?.clientWidth || 0;
    let totalItemsWidth = 0;
    if (moreBtnRef.current) {
      moreBtnRef.current.style.display = 'none';
    }
    navItemsRef.current.forEach((item, index) => {
      const dropdownItem = dropdownItemsRef.current[index];
      item?.removeAttribute('style');
      if (item && dropdownItem && moreBtnRef.current) {
        totalItemsWidth = totalItemsWidth + item.clientWidth + 32;
        if (
          otherElsWidth + totalItemsWidth + moreBtnWidth + 50 >
          containerWidth
        ) {
          item.style.display = 'none';
          dropdownItem.style.display = 'block';
          moreBtnRef.current.style.display = 'block';
        } else {
          item.style.display = 'block';
          dropdownItem.style.display = 'none';
        }
      }
    });
  }, []);

  useLayoutEffect(() => {
    updateItems();
  }, []);

  useLayoutEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateItems();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [updateItems]);

  return (
    <Navbar className="resizable-nav bg-body-emphasis border-y bg-body-emphasis border-translucent py-2">
      <Container
        fluid="medium"
        className="d-flex flex-between-center flex-nowrap w-100"
        ref={containerRef}
      >
        <Nav as="ul" className="justify-content-end align-items-center gap-5">
          {navItems.map((item, index) => (
            <Nav.Item
              className="gap-3"
              key={item.id}
              ref={(el: HTMLDivElement) => (navItemsRef.current[index] = el)}
            >
              <Nav.Link
                key={item.id}
                as={Link}
                to={item.url}
                className={classNames({
                  active: pathname === item.url
                })}
              >
                {item.label}
              </Nav.Link>
            </Nav.Item>
          ))}
          <Dropdown align="end" as={NavItem} ref={moreBtnRef}>
            <Dropdown.Toggle
              variant=""
              className="fw-bold nav-link dropdown-caret-none"
            >
              More
              <FontAwesomeIcon icon={faAngleDown} className="ms-2" />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" renderOnMount>
              {navItems.map((item, index) => (
                <Dropdown.Item
                  key={item.id}
                  as={Link}
                  to={item.url}
                  ref={(el: HTMLAnchorElement) =>
                    (dropdownItemsRef.current[index] = el)
                  }
                >
                  {item.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default ResizableNavbar;
