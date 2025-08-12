import { useState } from 'react';
import { InventoryItem } from 'types';

interface SpecificationsFormProps {
  formData: Partial<InventoryItem>;
  onSpecificationAdd: (key: string, value: string) => void;
  onSpecificationRemove: (key: string) => void;
}

const SpecificationsForm = ({
  formData,
  onSpecificationAdd,
  onSpecificationRemove
}: SpecificationsFormProps) => {
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const handleAdd = () => {
    if (specKey.trim() && specValue.trim()) {
      onSpecificationAdd(specKey.trim(), specValue.trim());
      setSpecKey('');
      setSpecValue('');
    }
  };

  return (
    <div className="card border-secondary">
      <div className="card-header border-secondary">
        <h5 className="mb-0">Specifications</h5>
      </div>
      <div className="card-body">
        <div className="row mb-3 gap-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control border-secondary"
              placeholder="Specification name"
              value={specKey}
              onChange={e => setSpecKey(e.target.value)}
              onKeyPress={e =>
                e.key === 'Enter' && (e.preventDefault(), handleAdd())
              }
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control border-secondary"
              placeholder="Specification value"
              value={specValue}
              onChange={e => setSpecValue(e.target.value)}
              onKeyPress={e =>
                e.key === 'Enter' && (e.preventDefault(), handleAdd())
              }
            />
          </div>
          <div className="col-md-2">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>

        {formData.specifications && formData.specifications.size > 0 && (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(formData.specifications.entries()).map(
                  ([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{String(value)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onSpecificationRemove(key)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecificationsForm;
