import { Outlet } from 'react-router-dom';
import useSettingsMountEffect from 'hooks/useSettingsMountEffect';
import NavbarMain from 'components/navbars/travel-agency/NavbarMain';
import Footer from 'pages/apps/travel-agency/landing/Footer';
import TopNav from 'pages/apps/travel-agency/landing/TopNav copy';

const TravelLandingLayout = () => {
  useSettingsMountEffect({
    disableNavigationType: true,
    disableHorizontalNavbarAppearance: true,
    disableVerticalNavbarAppearance: true,
    disableHorizontalNavbarShape: true
  });
  return (
    <>
      <TopNav />
      <NavbarMain />
      <Outlet />
      <Footer />
    </>
  );
};

export default TravelLandingLayout;
