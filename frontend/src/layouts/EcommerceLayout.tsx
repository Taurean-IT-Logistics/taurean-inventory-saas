import EcommerceFooter from 'components/footers/EcommerceFooter';
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
    </div>
  );
};

export default EcommerceLayout;
