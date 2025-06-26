import ScrollSpy from 'components/base/ScrollSpy';
import Scrollbar from 'components/base/Scrollbar';
import { Nav } from 'react-bootstrap';

const WidgetsScrollspyNav = () => {
  return (
    <div className="widgets-scrollspy-nav mt-n5 bg-body-emphasis mx-n4 mx-lg-n6 border-bottom">
      <Scrollbar autoHeight>
        <Nav className="px-4 flex-nowrap">
          <Nav.Item>
            <ScrollSpy.NavLink
              className="text-body-tertiary fw-bold p-3 lh-1 text-nowrap fs-8"
              href="#stats"
            >
              Number Stats and Charts
            </ScrollSpy.NavLink>
          </Nav.Item>
          <Nav.Item>
            <ScrollSpy.NavLink
              className="text-body-tertiary fw-bold p-3 lh-1 text-nowrap fs-8"
              href="#tables"
            >
              Tables, Files, and Lists
            </ScrollSpy.NavLink>
          </Nav.Item>
          <Nav.Item>
            <ScrollSpy.NavLink
              className="text-body-tertiary fw-bold p-3 lh-1 text-nowrap fs-8"
              href="#e-commerce"
            >
              E-commerce
            </ScrollSpy.NavLink>
          </Nav.Item>
          <Nav.Item>
            <ScrollSpy.NavLink
              className="text-body-tertiary fw-bold p-3 lh-1 text-nowrap fs-8"
              href="#users-and-feed"
            >
              Users & Feed
            </ScrollSpy.NavLink>
          </Nav.Item>
          <Nav.Item>
            <ScrollSpy.NavLink
              className="text-body-tertiary fw-bold p-3 lh-1 text-nowrap fs-8"
              href="#forms"
            >
              Forms
            </ScrollSpy.NavLink>
          </Nav.Item>
          <Nav.Item>
            <ScrollSpy.NavLink
              className="text-body-tertiary fw-bold p-3 lh-1 text-nowrap fs-8"
              href="#others"
            >
              Others
            </ScrollSpy.NavLink>
          </Nav.Item>
        </Nav>
      </Scrollbar>
    </div>
  );
};

export default WidgetsScrollspyNav;
