import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faExclamationTriangle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Tax } from 'types';
import TaxStatsCards from 'components/tax/TaxStatsCards';
import TaxTable from 'components/tax/TaxTable';
import TaxModal from 'components/tax/TaxModal';
import TaxFilters from 'components/tax/TaxFilters';
import QuickActionsSidebar from 'components/dashboard/QuickActions';
import { TaxController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { RootState } from 'lib/store';
import { showToast } from 'components/toaster/toaster';

const TaxManagement = () => {
  const { tokens } = useAppSelector((state: RootState) => state.auth);
  const accessToken = tokens.accessToken;
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [filteredTaxes, setFilteredTaxes] = useState<Tax[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const [filters, setFilters] = useState({
    search: '',
    appliesTo: '',
    status: '',
    type: ''
  });

  useEffect(() => {
    async function fetchData() {
      const response = await TaxController.getAllTaxes(accessToken);
      setTaxes((response.data as Tax[]) || []);
      setFilteredTaxes((response.data as Tax[]) || []);
    }
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = taxes;

    if (filters.search) {
      filtered = filtered.filter(
        tax =>
          tax.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          tax.type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.appliesTo) {
      filtered = filtered.filter(tax => tax.appliesTo === filters.appliesTo);
    }

    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(tax => tax.active === isActive);
    }

    if (filters.type) {
      filtered = filtered.filter(tax =>
        tax.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    setFilteredTaxes(filtered);
  }, [taxes, filters]);

  const showAlert = (type: string, message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCreateTax = () => {
    setSelectedTax(null);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEditTax = (tax: Tax) => {
    setSelectedTax(tax);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSaveTax = async (taxData: Tax) => {
    try {
      if (isEdit && selectedTax) {
        const response = await TaxController.updateTax(
          taxData._id,
          taxData,
          accessToken
        );

        if (response.success) {
          setTaxes(prevTaxes =>
            prevTaxes.map(tax =>
              tax._id === selectedTax._id
                ? { ...taxData, _id: selectedTax._id }
                : tax
            )
          );
          showAlert('success', 'Tax updated successfully!');
          showToast('success', 'Tax updated successfully!');
        }
      } else {
        const response = await TaxController.createTax(taxData, accessToken);
        if (response.success) {
          const newTax = response.data as Tax;
          setTaxes(prevTaxes => [...prevTaxes, newTax]);
          showAlert('success', 'Tax created successfully!');
          showToast('success', 'Tax created successfully!');
        }
      }
    } catch (error) {
      showToast('error', error || "Couldn't create/update tax");
      showAlert('error', error || "Couldn't create/update tax");
    } finally {
      setShowModal(false);
    }
  };

  const handleDeleteTax = async (taxId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this tax? This action cannot be undone.'
      )
    ) {
      try {
        const response = await TaxController.deleteTax(taxId, accessToken);

        if (response.success) {
          setTaxes(prevTaxes => prevTaxes.filter(tax => tax._id !== taxId));
          showAlert('success', 'Tax deleted successfully!');
          showToast('success', 'Tax deleted successfully!');
        }
      } catch (error) {
        showAlert('error', 'Tax not deleted');
        showToast('error', 'Tax not deleted');
      }
    }
  };

  const handleToggleStatus = async (tax: Tax) => {
    try {
      const updatedTax = {
        ...tax,
        active: !tax.active,
        updatedAt: new Date()
      };

      const response = await TaxController.updateTax(
        updatedTax._id,
        updatedTax,
        accessToken
      );

      if (response.success) {
        setTaxes(prevTaxes =>
          prevTaxes.map(t => (t._id === tax._id ? updatedTax : t))
        );
        showAlert(
          'success',
          `Tax ${updatedTax.active ? 'activated' : 'deactivated'} successfully!`
        );
        showToast(
          'success',
          `Tax ${updatedTax.active ? 'activated' : 'deactivated'} successfully!`
        );
      }
    } catch (error) {
      showAlert('error', `Tax not updated`);
      showToast('error', `Tax not updated`);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      appliesTo: '',
      status: '',
      type: ''
    });
  };

  return (
    <div className="min-vh-100  ">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3  mb-1">Tax Management</h1>
                <p className="text-muted mb-0">
                  Configure and manage tax rates for your system
                </p>
              </div>
              <div className="d-flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleCreateTax}
                  className="d-flex align-items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Tax
                </Button>
                <Button
                  variant="border-secondary border"
                  as={Link}
                  to="/admin"
                  className="d-flex align-items-center"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alert */}
        {alert && (
          <Alert
            variant={alert.type}
            className="mb-4"
            dismissible
            onClose={() => setAlert(null)}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {alert.message}
          </Alert>
        )}

        {/* Stats Cards */}
        <TaxStatsCards taxes={taxes} />

        {/* Filters */}
        <TaxFilters
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Tax Table */}
        <Row>
          <Col>
            <TaxTable
              taxes={filteredTaxes}
              onEdit={handleEditTax}
              onDelete={handleDeleteTax}
              onToggleStatus={handleToggleStatus}
            />
          </Col>
        </Row>

        <div className="mt-6">
          <QuickActionsSidebar />
        </div>

        {/* Tax Modal */}
        <TaxModal
          tax={selectedTax}
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSaveTax}
          isEdit={isEdit}
        />
      </Container>
    </div>
  );
};

export default TaxManagement;
