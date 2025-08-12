import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faReceipt,
  faCheckCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { Transaction } from 'types';
import { currencyFormat } from 'helpers/utils';

interface TransactionStatsCardsProps {
  transactions: Transaction[];
}

const TransactionStatsCards = ({
  transactions
}: TransactionStatsCardsProps) => {
  return (
    <Row className="mb-4">
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-success bg-opacity-10 border-success">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-success mb-1">
                  {currencyFormat(
                    transactions.reduce((sum, t) => sum + t.amount, 0)
                  )}
                </h3>
                <p className="text-muted mb-0 small">Total Revenue</p>
              </div>
              <FontAwesomeIcon
                icon={faDollarSign}
                className="text-success fs-2"
              />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-primary bg-opacity-10 border-primary">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-primary mb-1">{transactions.length}</h3>
                <p className="text-muted mb-0 small">Total Transactions</p>
              </div>
              <FontAwesomeIcon icon={faReceipt} className="text-primary fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-info bg-opacity-10 border-info">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-info mb-1">
                  {transactions.filter(t => t.reconciled).length}
                </h3>
                <p className="text-muted mb-0 small">Reconciled</p>
              </div>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-info fs-2"
              />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-warning bg-opacity-10 border-warning">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-warning mb-1">
                  {transactions.filter(t => !t.reconciled).length}
                </h3>
                <p className="text-muted mb-0 small">Pending</p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-warning fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TransactionStatsCards;
