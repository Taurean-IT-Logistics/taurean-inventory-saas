import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { Activity } from 'data/crm/dealDetailsData';
import { Link } from 'react-router-dom';

const DealDetailsTimeline = ({ activities }: { activities: Activity[] }) => {
  return (
    <>
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className={classNames('border-bottom border-translucent py-4', {
            'pb-0 border-bottom-0': index === activities.length - 1
          })}
        >
          <div className="d-flex">
            <div
              className={`d-flex bg-${activity.variant}-subtle rounded-circle flex-center me-3`}
              style={{ width: '25px', height: '25px' }}
            >
              <FontAwesomeIcon
                icon={activity.icon}
                className={`text-${activity.variant}-dark fs-9`}
              />
            </div>
            <div className="flex-1">
              <div className="d-flex justify-content-between flex-column flex-xl-row mb-2 mb-sm-0">
                <div className="flex-1 me-2">
                  <h5 className="text-body-highlight lh-sm">
                    {activity.title}
                  </h5>
                  <p className="fs-9 mb-0">
                    by <Link to="#!">{activity.name}</Link>
                  </p>
                </div>
                <div className="fs-9">
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="text-primary me-2"
                  />
                  <span className="fw-semibold">{activity.date}</span>
                </div>
              </div>
              {activity.description && (
                <p className="fs-9 mb-0">{activity.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default DealDetailsTimeline;
