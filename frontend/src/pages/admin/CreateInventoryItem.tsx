import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InventoryItem } from 'types';
import { mockFacilities } from 'data';
import BasicInfoForm from 'components/inventory/BasicInfoForm';
import PurchaseInfoForm from 'components/inventory/PurchaseInfoForm';
import SpecificationsForm from 'components/inventory/SpecificationsForm';
import ActionsSidebar from 'components/inventory/ActionSidebar';
import ImageUploadForm from 'components/inventory/ImageUploadForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CreateInventory = () => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    sku: '',
    quantity: 1,
    status: 'in_stock',
    category: '',
    images: [],
    purchaseInfo: {
      purchaseDate: undefined,
      purchasePrice: undefined,
      supplier: '',
      warrantyExpiry: undefined
    },
    history: [],
    maintenanceSchedule: [],
    currentBookings: [],
    specifications: new Map(),
    alerts: {
      lowStock: false,
      maintenanceDue: false,
      warrantyExpiring: false
    },
    isDeleted: false
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof InventoryItem] as Partial<InventoryItem>),
          [child]:
            type === 'number'
              ? Number(value)
              : type === 'date'
              ? value
                ? new Date(value)
                : undefined
              : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleFacilityChange = (facilityId: string) => {
    const facility = mockFacilities.find(f => f._id === facilityId);
    setFormData(prev => ({ ...prev, associatedFacility: facility }));
  };

  const handleSpecificationAdd = (key: string, value: string) => {
    const newSpecs = new Map(formData.specifications);
    newSpecs.set(key, value);
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const handleSpecificationRemove = (key: string) => {
    const newSpecs = new Map(formData.specifications);
    newSpecs.delete(key);
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSubmit = () => {
    console.log('Creating inventory item:', formData);
    alert('Inventory item created successfully!');
  };

  return (
    <div className=" min-vh-100">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Add New Inventory Item</h1>
            <p className="text-muted mb-0">
              Add a new item to your inventory system
            </p>
          </div>
          <Link to="/admin/inventory" className="btn btn-outline-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Inventory
          </Link>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <BasicInfoForm
              formData={formData}
              onInputChange={handleInputChange}
              onFacilityChange={handleFacilityChange}
            />

            <ImageUploadForm
              images={formData.images || []}
              onImagesChange={handleImagesChange}
            />

            <PurchaseInfoForm
              formData={formData}
              onInputChange={handleInputChange}
            />

            <SpecificationsForm
              formData={formData}
              onSpecificationAdd={handleSpecificationAdd}
              onSpecificationRemove={handleSpecificationRemove}
            />
          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            <ActionsSidebar formData={formData} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInventory;
