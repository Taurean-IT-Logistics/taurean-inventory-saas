import WidgetsSectionTitle from './WidgetsSectionTitle';
import { faPercentage } from '@fortawesome/free-solid-svg-icons';
import AnalyticsStats from 'components/stats/AnalyticsStats';
import { stats } from 'data/crm/stats';
import { Col, Row } from 'react-bootstrap';
import EcomTotalOrdersCard from 'components/cards/EcomTotalOrdersCard';
import EcomNewCustomersCard from 'components/cards/EcomNewCustomersCard';
import EcomTopCouponsCard from 'components/cards/EcomTopCouponsCard';
import EcomPayingVsNonPayingCard from 'components/cards/EcomPayingVsNonPayingCard';
import NewUsersAndLeads from '../crm/NewUsersAndLeads';
import ContactsBySource from '../crm/ContactsBySource';
import EcomProjectionVsActual from '../e-commerce/dashboard/EcomProjectionVsActual';
import EcomReturningCustomerRate from '../e-commerce/dashboard/EcomReturningCustomerRate';
import EcomTotalSells from '../e-commerce/dashboard/EcomTotalSells';
import ZeroRoadMap from '../project-management/dashboard/ZeroRoadMap';
import IssuesDiscovered from '../project-management/dashboard/IssuesDiscovered';
import ProjectElevenProgress from '../project-management/dashboard/ProjectElevenProgress';
import LeadConversion from '../crm/LeadConversion';
import RevenueTarget from '../crm/RevenueTarget';
import EmailCampaign from '../crm/analytics/EmailCampaign';
import MarketingCampaign from '../crm/analytics/MarketingCampaign';
import SalesTrends from '../crm/analytics/SalesTrends';
import CallCampaignReport from '../crm/analytics/CallCampaignReport';

const WidgetStats = () => {
  return (
    <div>
      <WidgetsSectionTitle
        title="Number Stats & Charts"
        subtitle="You can easily show your stats content by using these cards."
        icon={faPercentage}
        className="my-5"
      />
      <div className="px-3 mb-5">
        <AnalyticsStats stats={stats} />
      </div>
      <Row className="g-3 mb-5">
        <Col md={6} xxl={3}>
          <EcomTotalOrdersCard />
        </Col>
        <Col md={6} xxl={3}>
          <EcomNewCustomersCard />
        </Col>
        <Col md={6} xxl={3}>
          <EcomTopCouponsCard />
        </Col>
        <Col md={6} xxl={3}>
          <EcomPayingVsNonPayingCard />
        </Col>
      </Row>
      <Row className="gx-4 gy-6 pb-5">
        <Col xxl={6}>
          <NewUsersAndLeads />
        </Col>
        <Col xxl={6}>
          <ContactsBySource />
        </Col>
      </Row>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis py-5">
        <Row className="g-6">
          <Col xl={6}>
            <EcomProjectionVsActual />
          </Col>
          <Col xl={6}>
            <EcomReturningCustomerRate />
          </Col>
        </Row>
      </div>
      <Row className="g-6 pt-6 align-items-center">
        <Col xxl={6}>
          <EcomTotalSells />
        </Col>
        <Col xxl={6}>
          <ZeroRoadMap />
        </Col>
      </Row>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis pt-6 pb-3 mt-6">
        <Row>
          <Col xl={7} xxl={6}>
            <IssuesDiscovered />
          </Col>
          <Col xl={7} xxl={6}>
            <ProjectElevenProgress />
          </Col>
        </Row>
      </div>
      <div className="mx-lg-n4">
        <Row className="g-3 pt-3">
          <Col xl={5}>
            <LeadConversion />
          </Col>
          <Col xl={7}>
            <RevenueTarget />
          </Col>
        </Row>
      </div>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis pt-6 pb-3 mt-3">
        <Row className="gx-6">
          <Col
            md={6}
            lg={12}
            xl={6}
            className="mb-5 mb-md-3 mb-lg-5 mb-xl-2 mb-xxl-3"
          >
            <EmailCampaign />
          </Col>
          <Col md={6} lg={12} xl={6} className="mb-1 mb-sm-0">
            <MarketingCampaign />
          </Col>
        </Row>
      </div>
      <Row className="g-6 mt-0">
        <Col md={6}>
          <SalesTrends />
        </Col>
        <Col md={6}>
          <CallCampaignReport />
        </Col>
      </Row>
    </div>
  );
};

export default WidgetStats;
