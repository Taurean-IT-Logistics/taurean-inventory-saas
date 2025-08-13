import { Card, Dropdown } from 'components/ui';
import Scrollbar from 'components/base/Scrollbar';
import Button from 'components/base/Button';
import classNames from 'classnames';

const NotificationDropdownMenu = ({ className }: { className?: string }) => {
  // No data import, notifications is empty
  const notifications: unknown[] = [];

  return (
    <Dropdown.Menu
      align="end"
      style={{ zIndex: 2000 }}
      className={classNames(
        className,
        'navbar-dropdown-caret py-0 notification-dropdown-menu shadow border'
      )}
    >
      <Card className="position-relative border-0">
        <Card.Header className="p-2">
          <div className="flex justify-content-between align-items-center">
            <h5 className="text-body-emphasis mb-0">Notifications</h5>
            <Button variant="link" className="p-0 fs-9 fw-normal">
              Mark all as read
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0" style={{ height: '27rem' }}>
          <Scrollbar>
            {notifications.length === 0 ? (
              <div className="text-center py-5 text-body-tertiary">
                <div className="mb-2">
                  <i className="bi bi-bell-slash fs-1" />
                </div>
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map((notification, index) => (
                // This block won't render since notifications is empty
                <div key={index} />
              ))
            )}
          </Scrollbar>
        </Card.Body>
      </Card>
    </Dropdown.Menu>
  );
};

export default NotificationDropdownMenu;
