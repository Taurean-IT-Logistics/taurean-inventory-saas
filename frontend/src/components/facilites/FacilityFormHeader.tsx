import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const FacilityFormHeader = () => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="h3 fw-bold mb-1">Create New Facility</h1>
        <p className="text-muted mb-0">
          Add a new facility to your booking system
        </p>
      </div>
      <Button as={Link} to="/admin/dashboard" variant="outline-secondary">
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to Dashboard
      </Button>
    </div>
  );
};

export default FacilityFormHeader;
