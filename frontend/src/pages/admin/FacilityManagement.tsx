import { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'components/ui';
import {  } from '';
import {
  faPlus,
  faBuilding,
  faArrowLeft
} from 'lucide-react';
import { Facility } from 'types';
import FacilityStatsCards from 'components/facilities/FacilityStatsCard';
import FacilityTable from 'components/facilities/FacilityTable';
import FacilityModal from 'components/facilities/FacilityModal';
import FacilityFilters from 'components/facilities/FacilityFilters';
import { FacilityController } from 'controllers';
import { showToast } from 'components/toaster/toaster';
import { useAppSelector } from 'hooks/useAppDispatch';
import { RootState } from 'lib/store';
import { Link } from 'react-router-dom';
import QuickActionsSidebar from 'components/dashboard/QuickActions';
import ReviewModal from 'components/facilities/ReviewModal';

const FacilityManagement = () => {
  const { tokens } = useAppSelector((state: RootState) => state.auth);
  const accessToken = tokens.accessToken;
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await FacilityController.getAllFacilites();

      setFacilities(response.data.facilities as Facility[]);
    }
    fetchData();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      const matchesSearch =
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' &&
          facility.isActive &&
          !facility.isDeleted) ||
        (statusFilter === 'inactive' &&
          (!facility.isActive || facility.isDeleted));

      return matchesSearch && matchesStatus;
    });
  }, [facilities, searchTerm, statusFilter]);

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleEditFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSaveFacility = async (
    facilityData: Partial<Facility>,
    rawFiles: File[],
    removedImageIds: string[]
  ) => {
    try {
      const response = await FacilityController.updateFacility(
        facilityData._id,
        facilityData,
        accessToken,
        rawFiles,
        removedImageIds
      );
      if (response.success) {
        // Update your local state
        setFacilities(prev =>
          prev.map(item =>
            item._id === facilityData._id ? response.data : item
          )
        );
        showAlert('success', 'Facility updated successfully!');
        showToast('success', 'Facility updated successfully!');
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to update facility');
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    try {
      const facility = facilities.find(f => f._id === facilityId);
      if (!facility.isDeleted) {
        if (!window.confirm('Are you sure you want to delete this facility?')) {
          return;
        }
      }
      const response = await FacilityController.deleteFacility(
        facilityId,
        accessToken
      );
      if (response.success) {
        showToast(
          'success',
          `Facility ${facility.isDeleted ? 'retored' : 'deleted'} successfully!`
        );
        showAlert(
          'success',
          `Facility ${facility.isDeleted ? 'retored' : 'deleted'} successfully!`
        );
        setFacilities(prev =>
          prev.map(f =>
            f._id === facilityId
              ? { ...f, isDeleted: !f.isDeleted, updatedAt: new Date() }
              : f
          )
        );
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to delete facility');
    }
  };

  const handleToggleStatus = (facilityId: string) => {
    setFacilities(prev =>
      prev.map(f =>
        f._id === facilityId
          ? { ...f, isActive: !f.isActive, updatedAt: new Date() }
          : f
      )
    );
    showAlert('success', 'Facility status updated successfully!');
  };

  const handleReviews = (facility: Facility) => {
    if (facility) {
      setSelectedFacility(facility);
      setShowReviewModal(true);
      // Clear any existing alerts
      setAlert(null);
    }
  };

  // const handleReviewsUpdate = async () => {
  //   try {
  //     if (selectedFacility) {
  //       // If your facility has review count or average rating fields
  //       const updatedFacility = await FacilityController.getFacilityById(
  //         selectedFacility._id
  //       );
  //       setFacilities(prev =>
  //         prev.map(f =>
  //           f._id === selectedFacility._id ? updatedFacility.data : f
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     showAlert('danger', 'Failed to refresh reviews');
  //     showToast('error', 'Failed to refresh reviews');
  //   }
  // };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 fw-bold mb-1">
                  < icon={faBuilding} className="me-3" />
                  Facility Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-0">Manage your rental facilities</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  as={Link}
                  to="/admin/create-facility"
                  className="flex align-items-center"
                >
                  < icon={faPlus} className="me-2" />
                  Create Facility
                </Button>
                <Button
                  variant="border-secondary border"
                  as={Link}
                  to="/admin"
                  className="flex align-items-center"
                >
                  < icon={faArrowLeft} className="me-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alert */}
        {alert && (
          <Row className="mb-4">
            <Col>
              <Alert
                variant={alert.type}
                dismissible
                onClose={() => setAlert(null)}
              >
                {alert.message}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Stats Cards */}
        <FacilityStatsCards facilities={facilities} />

        {/* Main Content */}
        <Row>
          <Col>
            <Card className=" border-secondary">
              <Card.Header className=" border-secondary">
                <Card.Title className="mb-0">Facilities</Card.Title>
              </Card.Header>
              <Card.Body>
                {/* Filters */}
                <FacilityFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onClearFilters={handleClearFilters}
                />

                {/* Table */}
                <FacilityTable
                  onViewReviews={handleReviews}
                  facilities={filteredFacilities}
                  onEdit={handleEditFacility}
                  onDelete={handleDeleteFacility}
                  onToggleStatus={handleToggleStatus}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col className="mt-6">
            <QuickActionsSidebar />
          </Col>
        </Row>

        {/* Modal */}
        <FacilityModal
          show={showModal}
          onHide={() => setShowModal(false)}
          facility={selectedFacility}
          onSave={handleSaveFacility}
          isEdit={isEdit}
        />
        <ReviewModal
          show={showReviewModal}
          onHide={() => setShowReviewModal(false)}
          facility={selectedFacility}
        />
      </Container>
    </div>
  );
};

export default FacilityManagement;
