import EcomTopCouponsChart from 'components/charts/e-charts/EcomTopCouponsChart';
import { Card } from 'react-bootstrap';

const EcomTopCouponsCard = () => {
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <h5 className="mb-2">Top coupons</h5>
            <h6 className="text-body-tertiary">Last 7 days</h6>
          </div>
        </div>
        <div className="pb-4 pt-3">
          <EcomTopCouponsChart />
        </div>
        <div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              Percentage discount
            </h6>
            <h6 className="text-body fw-semibold mb-0">72%</h6>
          </div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary-lighter me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              Fixed card discount
            </h6>
            <h6 className="text-body fw-semibold mb-0">18%</h6>
          </div>
          <div className="d-flex align-items-center">
            <div className="bullet-item bg-info-dark me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              Fixed product discount
            </h6>
            <h6 className="text-body fw-semibold mb-0">10%</h6>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EcomTopCouponsCard;
