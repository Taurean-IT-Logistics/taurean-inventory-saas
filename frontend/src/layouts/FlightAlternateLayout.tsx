import { Outlet } from 'react-router-dom';
import useSettingsMountEffect from 'hooks/useSettingsMountEffect';
import ChatWidget from 'components/common/chat-widget/ChatWidget';
import NavbarMain from 'components/navbars/travel-agency/NavbarMain';

const FlightAlternateLayout = () => {
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
      <ChatWidget />
    </>
  );
};

export default FlightAlternateLayout;
