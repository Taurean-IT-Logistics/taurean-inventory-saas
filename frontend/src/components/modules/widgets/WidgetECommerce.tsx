import WidgetsSectionTitle from './WidgetsSectionTitle';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import EcomCartTable from 'components/tables/EcomCartTable';
import { cartItems } from 'data/e-commerce/products';
import { Col, Row } from 'react-bootstrap';
import { PaymentMethod } from '../e-commerce/checkout/PaymentMethod';
import EcomCartSummaryCard from 'components/cards/EcomCartSummaryCard';
import DeliveryType from '../e-commerce/checkout/DeliveryType';
import EcomAddressTable from 'components/tables/EcomAddressTable';
import { shippingDetailsAddress } from 'data/e-commerce';
import EcomInvoiceTable from 'components/tables/EcomInvoiceTable';
import OrderDetailsSummaryCard from 'components/cards/OrderDetailsSummaryCard';

const WidgetECommerce = () => {
  return (
    <div>
      <WidgetsSectionTitle
        title="E-commerce"
        subtitle="Find more cards which are dedicatedly made for E-commerce."
        icon={faCartPlus}
        className="mb-5 mt-7"
      />
      <EcomCartTable products={cartItems} />
      <div className="my-6">
        <Row className="g-5">
          <Col xl={8}>
            <PaymentMethod />
            <EcomAddressTable data={shippingDetailsAddress} />
          </Col>
          <Col xl={4}>
            <EcomCartSummaryCard />
          </Col>
        </Row>
      </div>
      <Row className="g-6 mb-4">
        <Col xl={6}>
          <OrderDetailsSummaryCard />
        </Col>
        <Col xl={6}>
          <DeliveryType />
        </Col>
      </Row>
      <EcomInvoiceTable />
    </div>
  );
};

export default WidgetECommerce;
