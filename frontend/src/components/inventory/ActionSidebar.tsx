import { Link } from 'react-router-dom';
import { Card, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { InventoryItem } from 'types';

interface ActionsSidebarProps {
  formData: Partial<InventoryItem>;
  onSubmit: () => void;
  isLoading: boolean;
}

const ActionsSidebar = ({
  formData,
  onSubmit,
  isLoading
}: ActionsSidebarProps) => {
  return (
    <Card className="sticky-top" style={{ top: '20px' }}>
      <Card.Header>
        <h5 className="mb-0">Actions</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-grid gap-3">
          <Button variant="success" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Create Item
              </>
            )}
          </Button>

          <Button
            as={Link}
            to="/admin/inventory"
            variant="outline-secondary"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Cancel
          </Button>
        </div>

        <hr className="my-4" />

        <h6 className="mb-3">Quick Info</h6>
        <div className="small text-muted">
          <p>
            <strong>Category:</strong> {formData.category || 'Not selected'}
          </p>
          <p>
            <strong>Status:</strong> {formData.status}
          </p>
          <p>
            <strong>Quantity:</strong> {formData.quantity}
          </p>
          {formData.purchaseInfo?.purchasePrice !== undefined && (
            <p>
              <strong>Value:</strong> $
              {formData.purchaseInfo.purchasePrice.toFixed(2)}
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ActionsSidebar;
