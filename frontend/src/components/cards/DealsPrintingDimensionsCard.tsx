import classNames from 'classnames';
import { Card, Col, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { Stat } from 'data/crm/dealDetailsInfo';

interface DimensionsCardProps {
  stats: Stat[];
  className?: string;
}

const DealsPrintingDimensionsCard = ({
  stats,
  className
}: DimensionsCardProps) => {
  return (
    <Card className={className}>
      <Card.Body>
        <Row className="g-4 g-xl-1 g-xxl-3 justify-content-between">
          {stats.map((stat, index) => (
            <Col key={stat.id} sm="auto">
              <div
                className={classNames(
                  'd-sm-block d-inline-flex d-md-flex flex-xl-column flex-xxl-row align-items-center align-items-xl-start align-items-xxl-center',
                  { 'border-start-sm border-translucent ps-sm-5': index !== 0 }
                )}
              >
                <div
                  className={`d-flex bg-${stat.color}-subtle rounded flex-center me-3 mb-sm-3 mb-md-0 mb-xl-3 mb-xxl-0`}
                  style={{ width: '32px', height: '32px' }}
                >
                  <FeatherIcon
                    icon={stat.icon}
                    className={`text-${stat.color}-dark`}
                  />
                </div>
                <div>
                  <p className="fw-bold mb-1">{stat.title}</p>
                  <h4 className="fw-bolder text-nowrap">{stat.value}</h4>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DealsPrintingDimensionsCard;
