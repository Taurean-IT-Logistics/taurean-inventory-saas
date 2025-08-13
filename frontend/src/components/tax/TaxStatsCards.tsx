import { Card, Row, Col } from 'components/ui';
import {  } from '';
import {
  faPercent,
  faToggleOn,
  faToggleOff,
  faCalculator
} from 'lucide-react';
import { Tax } from 'types';

interface TaxStatsCardsProps {
  taxes: Tax[];
}

const TaxStatsCards = ({ taxes }: TaxStatsCardsProps) => {
  const activeTaxes = taxes.filter(tax => tax.active);
  const averageRate =
    taxes.length > 0
      ? taxes.reduce((sum, tax) => sum + tax.rate, 0) / taxes.length
      : 0;
  //   const inventoryTaxes = taxes.filter(
  //     tax => tax.appliesTo === 'inventory_item' || tax.appliesTo === 'both'
  //   );
  //   const facilityTaxes = taxes.filter(
  //     tax => tax.appliesTo === 'facility' || tax.appliesTo === 'both'
  //   );

  return (
    <Row className="mb-4">
      <Col md={3} className="mb-3">
        <Card className=" border-secondary h-100">
          <Card.Body className="text-center">
            <
              icon={faCalculator}
              size="2x"
              className="text-primary mb-2"
            />
            <h4 className="text-primary">{taxes.length}</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-0">Total Taxes</p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="mb-3">
        <Card className=" border-secondary h-100">
          <Card.Body className="text-center">
            <
              icon={faToggleOn}
              size="2x"
              className="text-success mb-2"
            />
            <h4 className="text-success">{activeTaxes.length}</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-0">Active Taxes</p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="mb-3">
        <Card className=" border-secondary h-100">
          <Card.Body className="text-center">
            <
              icon={faPercent}
              size="2x"
              className="text-warning mb-2"
            />
            <h4 className="text-warning">{averageRate.toFixed(1)}%</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-0">Average Rate</p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="mb-3">
        <Card className=" border-secondary h-100">
          <Card.Body className="text-center">
            <
              icon={faToggleOff}
              size="2x"
              className="text-danger mb-2"
            />
            <h4 className="text-danger">{taxes.length - activeTaxes.length}</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-0">Inactive Taxes</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TaxStatsCards;
