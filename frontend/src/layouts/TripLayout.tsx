import { Outlet } from 'react-router-dom';
import useSettingsMountEffect from 'hooks/useSettingsMountEffect';
import ChatWidget from 'components/common/chat-widget/ChatWidget';
import NavbarMain from 'components/navbars/travel-agency/NavbarMain';
import TravelAgencyFooter from 'pages/apps/travel-agency/landing/TravelAgencyFooter';
import TripCommonCTASection from 'components/modules/travel-agency/trip/homepage/TripCommonCTASection';

const TripLayout = () => {
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
      <TripCommonCTASection />
      <TravelAgencyFooter />
      <ChatWidget />
    </>
  );
};

export default TripLayout;
