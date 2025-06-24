import { Card, Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Transaction } from 'types';
import { currencyFormat } from 'helpers/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onReconcile: (transactionId: string) => void;
}

const TransactionTable = ({
  transactions,
  onView,
  onReconcile
}: TransactionTableProps) => {
  const getStatusBadge = (reconciled: boolean) => {
    return reconciled ? (
      <Badge bg="success">Reconciled</Badge>
    ) : (
      <Badge bg="warning">Pending</Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      card: { bg: 'primary', text: 'Card' },
      mobile_money: { bg: 'info', text: 'Mobile Money' },
      bank: { bg: 'secondary', text: 'Bank Transfer' },
      cash: { bg: 'success', text: 'Cash' }
    };

    const config = methodConfig[method as keyof typeof methodConfig] || {
      bg: 'secondary',
      text: method
    };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  return (
    <Card className="border-secondary">
      <Card.Body className="px-2">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Reference</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <div className="fw-semibold">{txn.ref}</div>
                      <small className="text-muted">{txn.description}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{txn.user.name}</div>
                      <small className="text-muted">{txn.user.email}</small>
                    </div>
                  </td>
                  <td>
                    <Badge bg="secondary">{txn.type}</Badge>
                  </td>
                  <td>
                    <span className="fw-bold">
                      {currencyFormat(txn.amount)}
                    </span>
                  </td>
                  <td>{getMethodBadge(txn.method)}</td>
                  <td>{getStatusBadge(txn.reconciled)}</td>
                  <td>
                    <span className="text-muted">
                      {txn.createdAt.toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onView(txn)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      {!txn.reconciled && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => onReconcile(txn.ref || '')}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TransactionTable;
