import { InventoryItem } from 'types';

interface PurchaseInfoFormProps {
  formData: Partial<InventoryItem>;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const PurchaseInfoForm = ({
  formData,
  onInputChange
}: PurchaseInfoFormProps) => {
  return (
    <div className="card border-secondary mb-4">
      <div className="card-header border-secondary">
        <h5 className="mb-0">Purchase Information</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              className="form-control border-secondary"
              name="purchaseInfo.purchaseDate"
              value={
                formData.purchaseInfo?.purchaseDate
                  ? formData.purchaseInfo.purchaseDate
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              onChange={onInputChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Purchase Price</label>
            <input
              type="number"
              className="form-control border-secondary"
              name="purchaseInfo.purchasePrice"
              value={formData.purchaseInfo?.purchasePrice || ''}
              onChange={onInputChange}
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Supplier</label>
            <input
              type="text"
              className="form-control border-secondary"
              name="purchaseInfo.supplier"
              value={formData.purchaseInfo?.supplier || ''}
              onChange={onInputChange}
              placeholder="Enter supplier name"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Warranty Expiry</label>
            <input
              type="date"
              className="form-control border-secondary"
              name="purchaseInfo.warrantyExpiry"
              value={
                formData.purchaseInfo?.warrantyExpiry
                  ? formData.purchaseInfo.warrantyExpiry
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              onChange={onInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInfoForm;
