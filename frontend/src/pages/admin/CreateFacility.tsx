import { useState } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { Facility } from 'types';
import FacilityFormHeader from 'components/facilities/FacilityFormHeader';
import FacilityProgressSteps from 'components/facilities/FacilityProgressSteps';
import BasicInfoStep from 'components/facilities/BasicInfoStep';
import DetailsAmenitiesStep from 'components/facilities/DetailsAmenitiesStep';
import AvailabilityPricingStep from 'components/facilities/AvailabilityPricingStep';
import { FacilityController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { useNavigate } from 'react-router-dom';
import { showToast } from 'components/toaster/toaster';
const CreateFacility = () => {
  const { tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Facility>>({
    name: '',
    description: '',
    capacity: { maximum: 0, recommended: 0 },
    operationalHours: { opening: '', closing: '' },
    location: { address: '', coordinates: { latitude: 0, longitude: 0 } },
    amenities: [],
    pricing: [{ unit: 'hour', amount: 0, isDefault: true }],
    availability: [],
    images: [],
    isActive: true,
    isTaxable: true
  });

  const setNestedValue = (obj, path: string[], value) => {
    if (path.length === 1) {
      return { ...obj, [path[0]]: value };
    }
    const [key, ...rest] = path;
    return {
      ...obj,
      [key]: setNestedValue(obj?.[key] || {}, rest, value)
    };
  };

  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'number' ? Number(value) : value;
    const path = name.split('.');

    setFormData(prev => setNestedValue(prev, path, inputValue));
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const previewImages = Array.from(files).map(file => ({
        path: URL.createObjectURL(file),
        originalName: file.name,
        mimetype: file.type,
        size: file.size
      }));

      setRawFiles(prev => [...prev, ...Array.from(files)]);

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...previewImages]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
    setRawFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index) || []
    }));
  };

  const addAvailabilityDay = () => {
    const newDay = {
      day: 'monday' as const,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    };

    setFormData(prev => ({
      ...prev,
      availability: [...(prev.availability || []), newDay]
    }));
  };

  const updateAvailability = (index: number, field: string, value) => {
    setFormData(prev => ({
      ...prev,
      availability:
        prev.availability?.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ) || []
    }));
  };

  const removeAvailabilityDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.images || formData.images.length === 0) {
      alert('At least one image is required for the facility.');
      return;
    }

    setIsSubmitting(true);
    const accessToken = tokens.accessToken;
    try {
      const data = await FacilityController.createFacility(
        formData,
        accessToken,
        rawFiles
      );

      if (data.success && data.data) {
        showToast('success', 'Facility created successfully!');
        navigate('/admin/dashboard');
      } else {
        showToast('error', data.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      showToast('error', 'Error creating facility. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          formData.name &&
          formData.capacity?.maximum &&
          formData.images &&
          formData.images.length > 0
        );
      case 2:
        return (
          formData.operationalHours?.opening &&
          formData.operationalHours?.closing
        );
      case 3:
        return formData.pricing && formData.pricing[0]?.amount > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <FacilityFormHeader />

        <FacilityProgressSteps currentStep={step} />

        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <BasicInfoStep
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleImageUpload={handleImageUpload}
                  removeImage={removeImage}
                  uploadingImages={uploadingImages}
                />
              )}

              {step === 2 && (
                <DetailsAmenitiesStep
                  formData={formData}
                  handleInputChange={handleInputChange}
                  newAmenity={newAmenity}
                  setNewAmenity={setNewAmenity}
                  addAmenity={addAmenity}
                  removeAmenity={removeAmenity}
                />
              )}

              {step === 3 && (
                <AvailabilityPricingStep
                  formData={formData}
                  setFormData={setFormData}
                  addAvailabilityDay={addAvailabilityDay}
                  updateAvailability={updateAvailability}
                  removeAvailabilityDay={removeAvailabilityDay}
                />
              )}

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between mt-4">
                <div>
                  {step > 1 && (
                    <Button
                      variant="outline-secondary"
                      onClick={prevStep}
                      disabled={isSubmitting}
                    >
                      Previous
                    </Button>
                  )}
                </div>
                <div>
                  {step < 3 ? (
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={!isStepValid(step)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="success"
                      disabled={!isStepValid(step) || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Creating Facility...
                        </>
                      ) : (
                        'Create Facility'
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {!isStepValid(step) && (
                <Alert variant="warning" className="mt-3">
                  Please complete all required fields before proceeding.
                </Alert>
              )}
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateFacility;
