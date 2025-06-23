import EcommerceFooter from 'components/footers/EcommerceFooter';
import Footer from 'components/footers/Footer';
import EcommerceTopbar from 'components/navbars/ecommerce/EcommerceTopBar';
import { Outlet } from 'react-router-dom';

const EcommerceLayout = () => {
  return (
    <div>
      <EcommerceTopbar />
      <div className="position-relative px-6">
        <Outlet />
      </div>
      <EcommerceFooter />
      <Footer className="bg-body-emphasis" />
    </div>
  );
};

export default EcommerceLayout;
