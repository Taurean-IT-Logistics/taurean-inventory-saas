import React from 'react';
import WidgetsSectionTitle from './WidgetsSectionTitle';
import { faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { Col, Row } from 'react-bootstrap';
import EarlyBirdCard from 'components/cards/EarlyBirdCard';
import FeedTextarea from 'components/forms/FeedTextarea';
import CustomerNotesCard from 'components/cards/CustomerNotesCard';
import DealProfileCard from 'components/cards/DealProfileCard';
import CustomerProfileCard from 'components/cards/CustomerProfileCard';
import LeadAddressCard from 'components/cards/LeadAddressCard';
import OrderDetailsSummaryCard from 'components/cards/OrderDetailsSummaryCard';
import AboutLeadCard from 'components/cards/AboutLeadCard';
import LeadProfileCard from 'components/cards/LeadProfileCard';

const WidgetOthers = () => {
  return (
    <div>
      <WidgetsSectionTitle
        title="Others"
        subtitle="Get more awesome cards for showing your different types of content.."
        icon={faFolderPlus}
        className="mb-4 mt-7"
      />
      <Row className="g-3 mb-3">
        <Col xl={6} xxl={5}>
          <EarlyBirdCard />
        </Col>
        <Col xl={6} xxl={7}>
          <FeedTextarea className="h-100" />
        </Col>
      </Row>
      <Row className="g-3">
        <Col xl={4} className="d-flex flex-column gap-y-3">
          <CustomerNotesCard className="h-100" />
          <DealProfileCard />
        </Col>
        <Col xl={4} className="d-flex flex-column gap-y-3">
          <CustomerProfileCard />
          <LeadAddressCard />
          <OrderDetailsSummaryCard />
        </Col>
        <Col xl={4} className="d-flex flex-column gap-y-3">
          <AboutLeadCard className="h-100" />
          <LeadProfileCard />
        </Col>
      </Row>
    </div>
  );
};

export default WidgetOthers;
