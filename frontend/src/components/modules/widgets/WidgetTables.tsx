import WidgetsSectionTitle from './WidgetsSectionTitle';
import { faList } from '@fortawesome/free-solid-svg-icons';
import DealsReportTable, {
  dealsReportColumns
} from 'components/tables/DealsReportTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { dealsReportData } from 'data/crm/reportsData';
import { Col, Row } from 'react-bootstrap';
import EcomTopRegions from '../e-commerce/dashboard/EcomTopRegions';
import DealForecast from '../crm/DealForecast';
import ProjectDashboard from '../project-management/dashboard/ProjectDashboard';
import TodoList from '../project-management/todo-list/TodoList';
import ProjectActivityCard from 'components/cards/ProjectActivityCard';
import EcomLatestReviewsTable from 'components/tables/EcomLatestReviewsTable';

const WidgetTables = () => {
  const table = useAdvanceTable({
    data: dealsReportData,
    columns: dealsReportColumns,
    pageSize: 10,
    selection: true,
    pagination: true,
    sortable: true
  });
  return (
    <div>
      <WidgetsSectionTitle
        title="Tables, Files, and Lists"
        subtitle="Phoenix's styled components are dedicatedly made for displaying your contents and lists."
        icon={faList}
        className="mb-5 mt-7"
      />
      <AdvanceTableProvider {...table}>
        <DealsReportTable />
      </AdvanceTableProvider>
      <Row className="gx-6 mt-n3 pb-5">
        <Col xl={6}>
          <EcomTopRegions />
        </Col>
        <Col xl={6} className="mt-7">
          <DealForecast />
        </Col>
      </Row>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis py-5 border-y">
        <ProjectDashboard />
      </div>
      <div className="mt-3 mx-lg-n4">
        <Row className="g-3">
          <Col xl={6} xxl={7}>
            <TodoList />
          </Col>
          <Col xl={6} xxl={5}>
            <ProjectActivityCard />
          </Col>
        </Row>
      </div>
      <div className="mx-n4 px-4 mx-lg-n6 px-lg-6 bg-body-emphasis pt-7 mt-3 border-y">
        <EcomLatestReviewsTable />
      </div>
    </div>
  );
};

export default WidgetTables;
