import { Card, Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import { Tax } from 'types';

interface TaxTableProps {
  taxes: Tax[];
  onEdit: (tax: Tax) => void;
  onDelete: (taxId: string) => void;
  onToggleStatus: (tax: Tax) => void;
}

const TaxTable = ({
  taxes,
  onEdit,
  onDelete,
  onToggleStatus
}: TaxTableProps) => {
  const getAppliesToBadge = (appliesTo: string) => {
    const config = {
      inventory_item: { bg: 'primary', text: 'Inventory' },
      facility: { bg: 'success', text: 'Facility' },
      both: { bg: 'warning', text: 'Both' }
    };

    const badgeConfig = config[appliesTo as keyof typeof config] || config.both;
    return <Badge bg={badgeConfig.bg}>{badgeConfig.text}</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <Badge bg={active ? 'success' : 'danger'}>
        {active ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <Card className="border-secondary">
      <Card.Header className="border-secondary">
        <h5 className="mb-0">Tax Configuration</h5>
      </Card.Header>
      <Card.Body className="p-2">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Tax Name</th>
                <th>Rate (%)</th>
                <th>Type</th>
                <th>Applies To</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax, index) => (
                <tr key={tax._id || index}>
                  <td>
                    <div className=" fw-semibold">{tax.name}</div>
                  </td>
                  <td>
                    <span>{tax.rate.toFixed(2)}%</span>
                  </td>
                  <td>
                    <span>{tax.type}</span>
                  </td>
                  <td>{getAppliesToBadge(tax.appliesTo)}</td>
                  <td>{getStatusBadge(tax.active)}</td>
                  <td>
                    <span className="-50">
                      {new Date(tax.createdAt).toLocaleDateString() || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(tax)}
                        title="Edit Tax"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant={
                          tax.active ? 'outline-warning' : 'outline-success'
                        }
                        size="sm"
                        onClick={() => onToggleStatus(tax)}
                        title={tax.active ? 'Deactivate' : 'Activate'}
                      >
                        <FontAwesomeIcon
                          icon={tax.active ? faToggleOff : faToggleOn}
                        />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(tax._id || tax.name)}
                        title="Delete Tax"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
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

export default TaxTable;
