import { Col, Row } from 'react-bootstrap';
import { StatType } from 'data/crm/stats';
import classNames from 'classnames';
import Unicon from 'components/base/Unicon';

const AnalyticsStats = ({ stats }: { stats: StatType[] }) => {
  return (
    <Row className="justify-content-between">
      {stats.map((stat, index) => (
        <Col
          key={stat.id}
          xs={6}
          md={4}
          xxl={2}
          className={classNames(
            'text-center border-start-xxl border-translucent',
            {
              'border-end-xxl-0 border-bottom-xxl-0 border-end border-bottom pb-4 pb-xxl-0':
                index === 0,
              'border-end-xxl-0 border-bottom-xxl-0 border-end-md border-bottom pb-4 pb-xxl-0':
                index === 1,
              'border-bottom-xxl-0 border-bottom border-end border-end-md-0 pb-4 pb-xxl-0 pt-4 pt-md-0':
                index === 2,
              'border-end-md border-end-xxl-0 border-bottom border-bottom-md-0 pb-4 pb-xxl-0 pt-4 pt-xxl-0':
                index === 3,
              'border-end border-end-xxl-0 pb-md-4 pb-xxl-0 pt-4 pt-xxl-0':
                index === 4,
              'border-end-xxl pb-md-4 pb-xxl-0 pt-4 pt-xxl-0': index === 5
            }
          )}
        >
          <Stat data={stat} />
        </Col>
      ))}
    </Row>
  );
};

const Stat = ({ data }: { data: StatType }) => {
  return (
    <>
      <Unicon
        icon={data.icon}
        className={`text-${data.iconColor} mb-1`}
        size={31.25}
      />
      <h1 className="fs-5 mt-3">{data.emailCount}</h1>
      <p className="fs-9 mb-0">{data.title}</p>
    </>
  );
};

export default AnalyticsStats;
