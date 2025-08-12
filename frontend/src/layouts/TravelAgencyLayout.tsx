import { Outlet } from 'react-router-dom';
import useSettingsMountEffect from 'hooks/useSettingsMountEffect';
import ChatWidget from 'components/common/chat-widget/ChatWidget';
import NavbarMain from 'components/navbars/travel-agency/NavbarMain';
import TravelAgencyFooter from 'pages/apps/travel-agency/landing/TravelAgencyFooter';

const TravelAgencyLayout = () => {
  useSettingsMountEffect({
    disableNavigationType: true,
    disableHorizontalNavbarAppearance: true,
    disableVerticalNavbarAppearance: true,
    disableHorizontalNavbarShape: true
  });
  return (
    <>
      <NavbarMain />
      <Outlet />
      <TravelAgencyFooter />
      <ChatWidget />
    </>
  );
};

export default TravelAgencyLayout;
