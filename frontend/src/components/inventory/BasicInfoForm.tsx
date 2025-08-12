import { Facility, InventoryItem } from 'types';
import { useEffect, useState } from 'react';
import { FacilityController } from 'controllers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

interface BasicInfoFormProps {
  formData: Partial<InventoryItem>;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFacilityChange: (facilityId: string) => void;
}

const BasicInfoForm = ({
  formData,
  onInputChange,
  onFacilityChange
}: BasicInfoFormProps) => {
  const categories = [
    'AV Equipment',
    'Furniture',
    'IT Equipment',
    'Kitchen Appliances',
    'Cleaning Supplies',
    'Office Supplies',
    'Safety Equipment',
    'Decorative Items',
    'Other'
  ];

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFacilities() {
      try {
        setFacilitiesLoading(true);
        setFacilitiesError(null);

        const data = await FacilityController.getAllFacilites();

        if (data.success && data.data) {
          setFacilities(data.data.facilities);
        } else {
          setFacilitiesError('Failed to load facilities');
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setFacilitiesError(error.message || 'Failed to load facilities');
      } finally {
        setFacilitiesLoading(false);
      }
    }

    fetchFacilities();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Capitalize first letter of each word
    const capitalizedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Create a synthetic event to pass to onInputChange
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'category',
        value: capitalizedValue
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onInputChange(syntheticEvent);
  };

  const renderFacilitySelect = () => {
    if (facilitiesLoading) {
      return (
        <select className="form-select border-secondary" disabled>
          <option>
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            Loading facilities...
          </option>
        </select>
      );
    }

    if (facilitiesError) {
      return (
        <div>
          <select
            className="form-select border-secondary border-warning"
            disabled
          >
            <option>Failed to load facilities</option>
          </select>
          <div className="text-warning small mt-1">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
            {facilitiesError}
          </div>
        </div>
      );
    }

    return (
      <select
        className="form-select border-secondary"
        onChange={e => onFacilityChange(e.target.value)}
        value={formData.associatedFacility || ''}
      >
        <option value="">Select facility (optional)</option>
        {facilities?.map(facility => (
          <option key={facility._id} value={facility._id}>
            {facility.name}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="card border-secondary mb-4">
      <div className="card-header border-secondary">
        <h5 className="mb-0">Basic Information</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8 mb-3">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              className="form-control border-secondary"
              name="name"
              value={formData.name || ''}
              onChange={onInputChange}
              required
              placeholder="Enter item name"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">SKU</label>
            <input
              type="text"
              className="form-control border-secondary"
              name="sku"
              value={formData.sku || ''}
              onChange={onInputChange}
              placeholder="Enter SKU"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control border-secondary"
            name="description"
            value={formData.description || ''}
            onChange={onInputChange}
            rows={3}
            placeholder="Describe the item..."
          />
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Category *</label>
            <input
              type="text"
              className="form-control border-secondary"
              name="category"
              value={formData.category || ''}
              onChange={handleCategoryChange}
              list="category-options"
              placeholder="Select or type a category"
              required
            />
            <datalist id="category-options">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              className="form-control border-secondary"
              name="quantity"
              value={formData.quantity || ''}
              onChange={onInputChange}
              required
              min="0"
              placeholder="Enter quantity"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select border-secondary"
              name="status"
              value={formData.status || ''}
              onChange={onInputChange}
            >
              <option value="in_stock">In Stock</option>
              <option value="rented">Rented</option>
              <option value="unavailable">Unavailable</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Associated Facility</label>
          {renderFacilitySelect()}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
