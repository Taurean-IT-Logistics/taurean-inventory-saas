import { InventoryItem } from 'types';
import { currencyFormat } from 'helpers/utils';
import { Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faTrashRestore
} from '@fortawesome/free-solid-svg-icons';
import { BadgeBg } from 'components/base/Badge';
import SimplePaginatedList from 'booking/PaginatedComponent';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  onRestore: (itemId: string) => void;
}

const InventoryTable = ({
  items,
  onEdit,
  onDelete,
  onRestore
}: InventoryTableProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { bg: 'success', text: 'In Stock' },
      rented: { bg: 'warning', text: 'Rented' },
      unavailable: { bg: 'danger', text: 'Unavailable' },
      maintenance: { bg: 'info', text: 'Maintenance' },
      retired: { bg: 'secondary', text: 'Retired' }
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.unavailable;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getAlerts = (item: InventoryItem) => {
    const alerts = [];
    if (item.quantity <= 2) alerts.push({ type: 'warning', text: 'Low Stock' });
    if (item.alerts.maintenanceDue)
      alerts.push({ type: 'info', text: 'Maintenance Due' });
    if (item.alerts.warrantyExpiring)
      alerts.push({ type: 'danger', text: 'Warranty Expiring' });
    return alerts;
  };

  return (
    <Card className="border-secondary">
      <Card.Body className="px-2">
        <SimplePaginatedList
          data={items}
          itemsPerPage={5}
          emptyMessage="No inventory items found."
          tableHeaders={
            <tr>
              <th>Item Details</th>
              <th>Category</th>
              <th>Status</th>
              <th>Quantity</th>
              <th>Value</th>
              <th>Alerts</th>
              <th>Actions</th>
            </tr>
          }
          renderRow={item => (
            <tr key={item._id}>
              <td>
                <div>
                  <div className="fw-semibold">{item.name}</div>
                  <small className="text-info">{item.sku}</small>
                  {item.description && (
                    <div className="text-muted small mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </td>
              <td>
                <Badge bg="secondary">{item.category}</Badge>
              </td>
              <td>{getStatusBadge(item.status)}</td>
              <td>
                <span
                  className={`fw-bold ${
                    item.quantity <= 2 ? 'text-warning' : ''
                  }`}
                >
                  {item.quantity}
                </span>
              </td>
              <td>
                <div>
                  {item.purchaseInfo.purchasePrice
                    ? currencyFormat(item.purchaseInfo.purchasePrice)
                    : 'N/A'}
                </div>
              </td>
              <td>
                <div className="d-flex flex-column gap-1">
                  {getAlerts(item).map((alert, index) => (
                    <Badge
                      key={index}
                      bg={alert.type as BadgeBg}
                      className="small"
                    >
                      {alert.text}
                    </Badge>
                  ))}
                </div>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  {!item.isDeleted && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(item._id!)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  )}
                  {item.isDeleted && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => onRestore(item._id!)}
                    >
                      <FontAwesomeIcon icon={faTrashRestore} />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      </Card.Body>
    </Card>
  );
};

export default InventoryTable;
