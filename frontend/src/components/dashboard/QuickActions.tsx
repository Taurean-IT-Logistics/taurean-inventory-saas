import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faBuilding,
  faUsers,
  faBell,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

const QuickActionsSidebar = () => {
  const quickActions = [
    {
      title: 'Add Inventory Item',
      description: 'Create new inventory item',
      icon: faBox,
      to: '/admin/create-inventory-item',
      variant: 'primary'
    },
    {
      title: 'New Facility',
      description: 'Add facility to system',
      icon: faBuilding,
      to: '/admin/create-facility',
      variant: 'success'
    },
    {
      title: 'Create User',
      description: 'Add new user account',
      icon: faUsers,
      to: '/admin/create-user',
      variant: 'info'
    },
    {
      title: 'New Alert',
      description: 'Create system alert',
      icon: faBell,
      to: '/admin/create-alert',
      variant: 'warning'
    }
  ];

  const managementLinks = [
    {
      title: 'Inventory Management',
      to: '/admin/inventory',
      icon: faBox
    },
    {
      title: 'User Management',
      to: '/admin/users',
      icon: faUsers
    },
    {
      title: 'Transaction Management',
      to: '/admin/transactions',
      icon: faChartLine
    },
    {
      title: 'System Alerts',
      to: '/admin/alerts',
      icon: faBell
    }
  ];

  return (
    <div>
      <Card
        className="border-secondary mb-4"
        style={{
          position: 'sticky',
          top: '20px',
          zIndex: 1020,
          alignSelf: 'flex-start'
        }}
      >
        <Card.Header className="border-secondary">
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-grid gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                as={Link}
                to={action.to}
                variant={action.variant}
                className="text-start opacity-75"
              >
                <FontAwesomeIcon icon={action.icon} className="me-2" />
                <div>
                  <div className="fw-semibold">{action.title}</div>
                  <small className="opacity-75">{action.description}</small>
                </div>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card className="border-secondary">
        <Card.Header className="border-secondary">
          <h5 className="mb-0">Management</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-grid gap-2">
            {managementLinks.map((link, index) => (
              <Button
                key={index}
                as={Link}
                to={link.to}
                variant="outline-secondary"
                className="text-start"
              >
                <FontAwesomeIcon icon={link.icon} className="me-2" />
                {link.title}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default QuickActionsSidebar;
