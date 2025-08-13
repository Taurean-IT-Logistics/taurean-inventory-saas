import { Link } from 'react-router-dom';
import { Button } from 'components/ui';
import {  } from '';
import { faArrowLeft } from 'lucide-react';

const FacilityFormHeader = () => {
  return (
    <div className="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="h3 fw-bold mb-1">Create New Facility</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-0">
          Add a new facility to your booking system
        </p>
      </div>
      <Button as={Link} to="/admin/dashboard" variant="outline-secondary">
        < icon={faArrowLeft} className="me-2" />
        Back to Dashboard
      </Button>
    </div>
  );
};

export default FacilityFormHeader;
