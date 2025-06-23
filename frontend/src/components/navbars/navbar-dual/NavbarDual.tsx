import { Navbar } from 'react-bootstrap';
import NavbarBrand from '../nav-items/NavbarBrand';
import DropdownSearchBox from 'components/common/DropdownSearchBox';
import SearchResult from 'components/common/SearchResult';
import NavItems from '../nav-items/NavItems';
import NavbarTopNav from '../navbar-horizontal/NavbarTopNav';
import { useAppContext } from 'providers/AppProvider';

const NavbarDual = () => {
  const {
    config: { navbarTopAppearance }
  } = useAppContext();

  return (
    <Navbar
      className="navbar-top fixed-top"
      expand="lg"
      variant=""
      data-navbar-appearance={navbarTopAppearance === 'darker' ? 'darker' : ''}
    >
      <div className="w-100">
        <div className="d-flex flex-between-center dual-nav-first-layer">
          <NavbarBrand />
          <DropdownSearchBox
            className="navbar-top-search-box"
            inputClassName="rounded-pill"
            searchBoxClassName=" d-none d-lg-block"
            size="sm"
            style={{ width: '25rem' }}
          >
            <SearchResult />
          </DropdownSearchBox>
          <NavItems />
        </div>
        <Navbar.Collapse
          className="navbar-top-collapse justify-content-center"
          id="basic-navbar-nav"
        >
          <NavbarTopNav />
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default NavbarDual;
