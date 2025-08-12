import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Avatar from 'components/base/Avatar';
import RevealDropdown from 'components/base/RevealDropdown';
import { Notification } from 'data/notifications';
import { Dropdown } from 'react-bootstrap';

export interface NotificationItemProps {
  notification: Notification;
  className?: string;
  type: 'dropdownItem' | 'pageItem';
}

const NotificationItem = ({
  notification,
  className,
  type
}: NotificationItemProps) => {
  return (
    <div
      className={classNames(
        className,
        'py-3 notification-card position-relative',
        {
          unread: !notification.read,
          'px-4 px-lg-6': type === 'pageItem',
          'px-2 px-sm-3': type === 'dropdownItem'
        }
      )}
    >
      <div className="d-flex align-items-center justify-content-between position-relative">
        <div className="d-flex">
          <Avatar
            src={notification.avatar}
            placeholder={!notification.avatar}
            size={type === 'pageItem' ? 'xl' : 'm'}
            className="me-3 status-online"
          />
          <div
            className={classNames('flex-1', {
              'me-sm-3': type === 'dropdownItem',
              'mt-2 me-2': type === 'pageItem'
            })}
          >
            <h4 className="fs-9 text-body-emphasis">{notification.name}</h4>
            <p className="fs-9 text-body-highlight mb-2 mb-sm-3 fw-normal">
              <span className="me-1 fw-bold fs-10">
                {notification.interactionIcon}
              </span>
              <span>{notification.interaction}</span>
              {type === 'pageItem' && (
                <span className="fw-bold">{notification.detail}</span>
              )}

              <span className="ms-2 text-body-quaternary text-opactity-75 fw-bold fs-10">
                {notification.ago}
              </span>
            </p>
            <p className="text-body-secondary fs-9 mb-0">
              <FontAwesomeIcon icon={faClock} className="me-1" />
              <span className="fw-bold">{notification.time}</span>
              {notification.date}
            </p>
          </div>
        </div>
        <RevealDropdown
          btnClassName="notification-dropdown-toggle"
          dropdownMenuClassName={classNames(
            'mt-2',
            notification.notificationPosition
          )}
        >
          <Dropdown.Item>
            Mark as {notification.read ? 'unread' : 'read'}
          </Dropdown.Item>
        </RevealDropdown>
      </div>
    </div>
  );
};

export default NotificationItem;
