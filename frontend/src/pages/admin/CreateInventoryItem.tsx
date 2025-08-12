import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InventoryItem } from 'types';
import BasicInfoForm from 'components/inventory/BasicInfoForm';
import PurchaseInfoForm from 'components/inventory/PurchaseInfoForm';
import SpecificationsForm from 'components/inventory/SpecificationsForm';
import ActionsSidebar from 'components/inventory/ActionSidebar';
import ImageUploadForm from 'components/inventory/ImageUploadForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { showToast } from 'components/toaster/toaster';
import { InventoryItemController } from 'controllers';
import PricingForm from 'components/inventory/PricingForm';

// interface imageData {
//   path: string;
//   originalName: string;
//   mimetype: string;
//   size: number;
// }

const CreateInventory = () => {
  const { tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );
  const navigate = useNavigate();
  const accessToken = tokens.accessToken;

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
    pricing: [
      {
        unit: 'day',
        amount: 0,
        isDefault: false
      }
    ],
    associatedFacility: '',
    history: [],
    maintenanceSchedule: [],
    currentBookings: [],
    specifications: new Map(),
    alerts: {
      lowStock: false,
      maintenanceDue: false,
      warrantyExpiring: false
    },
    isDeleted: false,
    isTaxable: true
  });

  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          ...(prev[parent as keyof InventoryItem] as any),
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
    setFormData(prev => ({ ...prev, associatedFacility: facilityId }));
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

  const handleImagesChange = (
    images: InventoryItem['images'],
    files: File[]
  ) => {
    setFormData(prev => ({
      ...prev,
      images
    }));

    setRawFiles(files);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = await InventoryItemController.createInventoryItem(
        formData,
        accessToken,
        rawFiles
      );

      if (data.data && data.success) {
        showToast('success', 'Inventory item created successfully!');
        navigate('/admin/inventory');
      } else {
        showToast('error', 'Failed to create inventory item');
        setIsSubmitting(false);
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to create inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100">
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
              images={formData.images as any}
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

            <PricingForm formData={formData} setFormData={setFormData} />
          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            <ActionsSidebar
              formData={formData}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInventory;
