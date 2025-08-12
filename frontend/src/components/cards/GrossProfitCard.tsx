import React from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import GrossProfitChart from 'components/charts/e-charts/GrossProfitChart';
import { profitData, profitInterface } from 'data/travel-agency/travelAgency';

const GrossProfitTable = ({
  profit,
  index
}: {
  profit: profitInterface;
  index: number;
}) => {
  const { bgColor, title, percent, icon, color } = profit;
  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex gap-2">
          <div className={`bg-${bgColor} bullet-item`} />
          <div>
            <h6 className="mb-0 text-body fw-semibold mb-2">{title}</h6>
            <h5 className="mb-0 text-body">${profit.profit}</h5>
          </div>
        </div>
        <div className={`d-flex align-items-center gap-2 text-${color}`}>
          <FeatherIcon icon={icon} width={24} height={24} />
          <p className="mb-0 fw-bold">{percent}%</p>
        </div>
      </div>
      <hr className={index === profitData.length - 1 ? 'd-none' : ''} />
    </>
  );
};

const GrossProfitCard = () => {
  return (
    <Card className="h-xxl-100">
      <Card.Header className="pb-3">
        <Row className="justify-content-between g-3">
          <Col xs="auto">
            <h3 className="text-body-highlight">Gross Profit</h3>
            <p className="mb-0">Annual income according to the board</p>
          </Col>
          <Col xs="auto">
            <Form.Select size="sm">
              <option>Last Fiscal Year</option>
              <option>Last Calendar year</option>
              <option>Last Quarter</option>
            </Form.Select>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row className="align-items-center h-100 gy-5">
          <Col
            xs={12}
            md={{ span: 'auto', order: 1 }}
            xl={{ span: 12, order: 0 }}
            xxl={{ span: 'auto', order: 1 }}
            className="px-md-8 px-xl-6"
          >
            {/* echart gross profit */}
            <GrossProfitChart style={{ height: 250, width: 250 }} />
          </Col>
          <Col xx={12} md="auto" xl={12} xxl="auto" className="flex-1 h-md-100">
            <div className="d-flex flex-column justify-content-between h-md-100 h-xl-auto h-xxl-100">
              {profitData.map((data, index) => (
                <GrossProfitTable profit={data} key={index} index={index} />
              ))}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GrossProfitCard;
