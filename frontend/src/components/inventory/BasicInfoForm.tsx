import { InventoryItem } from 'types';
import { mockFacilities } from 'data';

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
              value={formData.name}
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
              value={formData.sku}
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
            value={formData.description}
            onChange={onInputChange}
            rows={3}
            placeholder="Describe the item..."
          />
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Category *</label>
            <select
              className="form-select border-secondary"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              className="form-control border-secondary"
              name="quantity"
              value={formData.quantity}
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
              value={formData.status}
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
          <select
            className="form-select border-secondary"
            onChange={e => onFacilityChange(e.target.value)}
          >
            <option value="">Select facility (optional)</option>
            {mockFacilities.map(facility => (
              <option key={facility._id} value={facility._id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
