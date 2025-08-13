import EcommerceFooter from 'components/footers/EcommerceFooter';
import EcommerceTopbar from 'components/navbars/ecommerce/EcommerceTopBar';

interface EcommerceLayoutProps {
  children: React.ReactNode;
}

const EcommerceLayout = ({ children }: EcommerceLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <EcommerceTopbar />
      <main className="relative flex-1">
        {children}
      </main>
      <EcommerceFooter />
    </div>
  );
};

export default EcommerceLayout;
