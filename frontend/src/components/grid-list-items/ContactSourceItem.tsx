import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

export interface ContactSourceItem {
  value: number;
  label: string;
  color: string;
  className?: string;
}

const ContactSourceItem = ({
  value,
  label,
  color,
  className
}: ContactSourceItem) => {
  return (
    <div
      className={classNames(
        className,
        'd-flex flex-column flex-center align-items-sm-start flex-md-row justify-content-md-between flex-xxl-column p-3 ps-sm-3 ps-md-4 p-md-3 h-100'
      )}
    >
      <div className="d-flex align-items-center mb-1">
        <FontAwesomeIcon
          icon={faSquare}
          className={`fs-11 me-2 text-${color}`}
          transform="up-2"
        />
        <span className="mb-0 fs-9 text-body">{label}</span>
      </div>
      <h3 className="fw-semibold ms-xl-3 ms-xxl-0 pe-md-2 pe-xxl-0 mb-0 mb-sm-3">
        {value}
      </h3>
    </div>
  );
};

export default ContactSourceItem;
