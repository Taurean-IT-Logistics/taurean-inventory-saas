import { InventoryItem } from 'types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxes,
  faCheckCircle,
  faExclamationTriangle,
  faTools
} from '@fortawesome/free-solid-svg-icons';

interface InventoryStatsCardsProps {
  items: InventoryItem[];
}

const InventoryStatsCards = ({ items }: InventoryStatsCardsProps) => {
  const activeItems = items.filter(i => !i.isDeleted);
  const inStockItems = items.filter(
    i => i.status === 'in_stock' && !i.isDeleted
  );
  const lowStockItems = items.filter(i => i.quantity <= 2 && !i.isDeleted);
  const maintenanceItems = items.filter(
    i => i.status === 'maintenance' && !i.isDeleted
  );

  return (
    <div className="row mb-4">
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card bg-primary bg-opacity-10 border-primary">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-primary mb-1">{activeItems.length}</h3>
                <p className="text-muted mb-0 small">Total Items</p>
              </div>
              <FontAwesomeIcon icon={faBoxes} className="text-primary fs-2" />
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card bg-success bg-opacity-10 border-success">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-success mb-1">{inStockItems.length}</h3>
                <p className="text-muted mb-0 small">In Stock</p>
              </div>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-success fs-2"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card bg-warning bg-opacity-10 border-warning">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-warning mb-1">{lowStockItems.length}</h3>
                <p className="text-muted mb-0 small">Low Stock</p>
              </div>
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-warning fs-2"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card bg-info bg-opacity-10 border-info">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="text-info mb-1">{maintenanceItems.length}</h3>
                <p className="text-muted mb-0 small">Under Maintenance</p>
              </div>
              <FontAwesomeIcon icon={faTools} className="text-info fs-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatsCards;
