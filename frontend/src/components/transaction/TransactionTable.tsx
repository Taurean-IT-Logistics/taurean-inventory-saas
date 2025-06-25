import { Card, Table, Button, Badge, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCheck,
  faPrint,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { Transaction } from 'types';
import { currencyFormat } from 'helpers/utils';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onReconcile: (transactionId: string) => void;
  onPrint: (transactionId: string, type: 'receipt' | 'report') => void;
}

const TransactionTable = ({
  transactions,
  onView,
  onReconcile,
  onPrint
}: TransactionTableProps) => {
  const getStatusBadge = (reconciled: boolean) =>
    reconciled ? (
      <Badge bg="success">Reconciled</Badge>
    ) : (
      <Badge bg="warning">Pending</Badge>
    );

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

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    if (!transactions || transactions.length === 0) return;

    const exportData = transactions.map(txn => ({
      Reference: txn.ref,
      Description: txn.description || '',
      User: `${txn.user.name} (${txn.user.email})`,
      Type: txn.type,
      Amount: currencyFormat(txn.amount),
      Method: txn.method,
      Status: txn.reconciled ? 'Reconciled' : 'Pending',
      Date: new Date(txn.createdAt).toLocaleDateString()
    }));

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Transaction Report', 14, 16);
      autoTable(doc, {
        startY: 20,
        head: [Object.keys(exportData[0])],
        body: exportData.map(row => Object.values(row)) as RowInput[],
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 144, 255], textColor: 255 }
      });
      doc.save('transactions.pdf');
    } else {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      if (format === 'csv') {
        const csvData = XLSX.write(workbook, {
          bookType: 'csv',
          type: 'array'
        });
        saveAs(new Blob([csvData], { type: 'text/csv' }), 'transactions.csv');
      } else {
        const excelData = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array'
        });
        saveAs(
          new Blob([excelData], { type: 'application/octet-stream' }),
          'transactions.xlsx'
        );
      }
    }
  };

  return (
    <Card className="border-secondary">
      <Card.Header className="border-secondary d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Transactions</h5>
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary" size="sm">
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Export
          </Dropdown.Toggle>
          <Dropdown.Menu className="border-secondary">
            <Dropdown.Item onClick={() => handleExport('pdf')}>
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Export as PDF
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleExport('csv')}>
              Export as CSV
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleExport('excel')}>
              Export as Excel
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Card.Header>
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
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onView(txn)}
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      {!txn.reconciled && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => onReconcile(txn.ref || '')}
                          title="Reconcile"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </Button>
                      )}
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <FontAwesomeIcon icon={faPrint} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="border-secondary">
                          <Dropdown.Item
                            onClick={() => onPrint(txn.ref || '', 'receipt')}
                          >
                            Print Receipt
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => onPrint(txn.ref || '', 'report')}
                          >
                            Print Report
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
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
