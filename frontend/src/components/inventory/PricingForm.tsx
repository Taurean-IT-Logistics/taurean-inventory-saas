import { InventoryItem } from 'types';

interface PricingFormProps {
  formData: Partial<InventoryItem>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<InventoryItem>>>;
}

const PricingForm = ({ formData, setFormData }: PricingFormProps) => {
  const pricing = formData.pricing || [];

  const handlePricingChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedPricing = [...pricing];
    if (field === 'amount') {
      updatedPricing[index] = {
        ...updatedPricing[index],
        amount: value === '' ? 0 : Number(value)
      };
    } else if (field === 'unit') {
      updatedPricing[index] = {
        ...updatedPricing[index],
        unit: value as 'hour' | 'day' | 'week' | 'month'
      };
    } else {
      updatedPricing[index] = {
        ...updatedPricing[index],
        [field]: value
      };
    }
    setFormData(prev => ({ ...prev, pricing: updatedPricing }));
  };

  const handleAddPricing = () => {
    const newPricing = {
      unit: 'hour' as 'hour' | 'day' | 'week' | 'month',
      amount: 0,
      isDefault: false
    };
    setFormData(prev => ({
      ...prev,
      pricing: [...pricing, newPricing]
    }));
  };

  const handleRemovePricing = (index: number) => {
    const updatedPricing = pricing.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, pricing: updatedPricing }));
  };

  return (
    <div className="card border-secondary mb-4 mt-4">
      <div className="card-header border-secondary d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Pricing Information</h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={handleAddPricing}
        >
          Add Pricing
        </button>
      </div>
      <div className="card-body">
        {pricing.length === 0 ? (
          <p className="text-muted mb-0">No pricing information added yet.</p>
        ) : (
          pricing.map((price, index) => (
            <div key={index} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Pricing Option {index + 1}</h6>
                {pricing.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemovePricing(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select border-secondary"
                    value={price.unit || ''}
                    onChange={e =>
                      handlePricingChange(index, 'unit', e.target.value)
                    }
                  >
                    <option value="">Select unit</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control border-secondary"
                    value={price.amount || ''}
                    onChange={e =>
                      handlePricingChange(index, 'amount', e.target.value)
                    }
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <div className="form-check mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`isDefault-${index}`}
                      checked={price.isDefault || false}
                      onChange={e =>
                        handlePricingChange(
                          index,
                          'isDefault',
                          e.target.checked
                        )
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`isDefault-${index}`}
                    >
                      Default Pricing
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PricingForm;
