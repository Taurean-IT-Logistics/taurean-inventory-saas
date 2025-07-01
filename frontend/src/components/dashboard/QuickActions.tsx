import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faBuilding,
  faUsers,
  faChartLine,
  faBook,
  faCoins
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
      title: 'Manage Users',
      description: 'Manage users and roles',
      icon: faUsers,
      to: '/admin/users',
      variant: 'info'
    },
    {
      title: 'Manage Bookings',
      description: 'Manage pending and completed bookings',
      icon: faBook,
      to: '/admin/bookings',
      variant: 'warning'
    },
    {
      title: 'Create Tax',
      description: 'Create new service charges and taxes',
      icon: faCoins,
      to: '/admin/create-tax',
      variant: 'secondary'
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
      title: 'Booking Management',
      to: '/admin/bookings',
      icon: faBook
    },
    {
      title: 'Tax management',
      to: '/admin/tax',
      icon: faCoins
    }
  ];

  return (
    <div>
      <Card className="border-secondary mb-4">
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
