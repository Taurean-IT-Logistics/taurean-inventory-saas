import { Badge, Dropdown } from 'components/ui';
import {  } from '';
import {
  faEdit,
  faTrash,
  faEye,
  faEllipsisV,
  Star,
  MapPin,
  Clock,
  faTrashRestore,
  faComment
} from 'lucide-react';
import { Facility } from 'types';
import SimplePaginatedList from 'booking/PaginatedComponent';

interface FacilityTableProps {
  facilities: Facility[];
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string) => void;
  onToggleStatus: (facilityId: string) => void;
  onViewReviews: (facility: Facility) => void;
}

const FacilityTable = ({
  facilities,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewReviews
}: FacilityTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getStatusVariant = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return 'danger';
    return isActive ? 'success' : 'secondary';
  };

  const getStatusText = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return 'Deleted';
    return isActive ? 'Active' : 'Inactive';
  };

  const tableHeaders = (
    <tr>
      <th>Name</th>
      <th>Location</th>
      <th>Capacity</th>
      <th>Hours</th>
      <th>Price</th>
      <th>Rating</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  );

  const renderRow = (facility: Facility, index: number) => (
    <tr key={facility._id || index}>
      <td>
        <div>
          <strong>{facility.name}</strong>
          {facility.description && (
            <div className="text-gray-600 dark:text-gray-400 small">
              {facility.description.length > 50
                ? `${facility.description.substring(0, 50)}...`
                : facility.description}
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="flex align-items-center">
          < icon={MapPin} className="me-2 text-muted" />
          <span>{facility.location?.address || 'Not specified'}</span>
        </div>
      </td>
      <td>
        <div>
          <strong>{facility.capacity?.maximum || 0}</strong> max
          {facility.capacity?.recommended && (
            <div className="text-gray-600 dark:text-gray-400 small">
              {facility.capacity.recommended} recommended
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="flex align-items-center">
          < icon={Clock} className="me-2 text-muted" />
          <span>
            {facility.operationalHours?.opening || '--'} -{' '}
            {facility.operationalHours?.closing || '--'}
          </span>
        </div>
      </td>
      <td>
        {facility.pricing && facility.pricing.length > 0 ? (
          <div>
            <strong>{formatCurrency(facility.pricing[0].amount)}</strong>
            <div className="text-gray-600 dark:text-gray-400 small">
              per {facility.pricing[0].unit}
            </div>
          </div>
        ) : (
          <span className="text-gray-600 dark:text-gray-400">Not set</span>
        )}
      </td>
      <td>
        <div className="flex align-items-center">
          < icon={Star} className="me-1 text-warning" />
          <span>{facility.rating?.average?.toFixed(1) || '0.0'}</span>
          <small className="text-gray-600 dark:text-gray-400 ms-1">
            ({facility.rating?.totalReviews || 0})
          </small>
        </div>
      </td>
      <td>
        <Badge
          bg={getStatusVariant(facility.isActive, facility.isDeleted || false)}
        >
          {getStatusText(facility.isActive, facility.isDeleted || false)}
        </Badge>
      </td>
      <td>
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-secondary"
            size="sm"
            className="border-0"
          >
            < icon={faEllipsisV} />
          </Dropdown.Toggle>
          <Dropdown.Menu className="border-secondary">
            <Dropdown.Item onClick={() => onEdit(facility)}>
              < icon={faEdit} className="me-2" />
              Edit
            </Dropdown.Item>
            <Dropdown.Item onClick={() => onToggleStatus(facility._id)}>
              < icon={faEye} className="me-2" />
              {facility.isActive ? 'Deactivate' : 'Activate'}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => onViewReviews(facility)}>
              < icon={faComment} className="me-2" />
              View Reviews
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              className={`text-${!facility.isDeleted ? 'danger' : 'success'}`}
              onClick={() => onDelete(facility._id)}
            >
              <
                icon={!facility.isDeleted ? faTrash : faTrashRestore}
                className="me-2"
              />
              {!facility.isDeleted ? 'Delete' : 'Restore'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    </tr>
  );

  return (
    <SimplePaginatedList
      data={facilities}
      itemsPerPage={5}
      renderRow={renderRow}
      tableHeaders={tableHeaders}
      className="my-3"
      emptyMessage="No facilities found"
    />
  );
};

export default FacilityTable;
