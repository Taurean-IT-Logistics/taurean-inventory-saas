import { Search } from 'lucide-react';
import {  } from '';

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  filteredCount: number;
  totalCount: number;
}

const InventoryFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredCount,
  totalCount
}: InventoryFiltersProps) => {
  return (
    <div className="card border-secondary mb-4">
      <div className="card-body">
        <div className="row align-items-center gap-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text border-secondary">
                < icon={Search} />
              </span>
              <input
                type="text"
                className="form-control border-secondary"
                placeholder="Search items by name, category, or SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select border-secondary"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="rented">Rented</option>
              <option value="unavailable">Unavailable</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div className="col-md-3 text-end">
            <span className="text-gray-600 dark:text-gray-400 small">
              Showing {filteredCount} of {totalCount} items
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
