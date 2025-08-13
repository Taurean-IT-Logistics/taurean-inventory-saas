import { Card, Row, Col } from 'components/ui';
import {  } from '';
import {
  faDollarSign,
  faReceipt,
  CheckCircle,
  Clock
} from 'lucide-react';
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
            <div className="flex align-items-center justify-content-between">
              <div>
                <h3 className="text-success mb-1">
                  {currencyFormat(
                    transactions.reduce((sum, t) => sum + t.amount, 0)
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-0 small">Total Revenue</p>
              </div>
              <
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
            <div className="flex align-items-center justify-content-between">
              <div>
                <h3 className="text-primary mb-1">{transactions.length}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-0 small">Total Transactions</p>
              </div>
              < icon={faReceipt} className="text-primary fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-info bg-opacity-10 border-info">
          <Card.Body>
            <div className="flex align-items-center justify-content-between">
              <div>
                <h3 className="text-info mb-1">
                  {transactions.filter(t => t.reconciled).length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-0 small">Reconciled</p>
              </div>
              <
                icon={CheckCircle}
                className="text-info fs-2"
              />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3">
        <Card className="bg-warning bg-opacity-10 border-warning">
          <Card.Body>
            <div className="flex align-items-center justify-content-between">
              <div>
                <h3 className="text-warning mb-1">
                  {transactions.filter(t => !t.reconciled).length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-0 small">Pending</p>
              </div>
              < icon={Clock} className="text-warning fs-2" />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TransactionStatsCards;
