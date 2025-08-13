import { Card, Button } from 'components/ui';
import { Link } from 'react-router-dom';
import {  } from '';
import {
  faBox,
  faBuilding,
  Users,
  faChartLine,
  faBook,
  faCoins
} from 'lucide-react';

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
      icon: Users,
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
      icon: Users
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
    },
    {
      title: 'Facility Management',
      to: '/admin/facilities',
      icon: faBuilding
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
                < icon={action.icon} className="me-2" />
                <div>
                  <div className="font-semibold">{action.title}</div>
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
                < icon={link.icon} className="me-2" />
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
