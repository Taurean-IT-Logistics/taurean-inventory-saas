import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useWizardFormContext } from 'providers/WizardFormProvider';
import { Nav } from 'react-bootstrap';

interface WizardNavItemProps {
  icon: IconProp;
  label: string;
  step: number;
  isHorizontal?: boolean;
}

const WizardNavItem = ({
  icon,
  label,
  step,
  isHorizontal
}: WizardNavItemProps) => {
  const { selectedStep, totalStep } = useWizardFormContext();
  return (
    <Nav.Item as="li" className="nav-item">
      <Nav.Link
        className={classNames('fw-semibold', {
          done: selectedStep > step && step !== totalStep,
          complete: selectedStep > step && step !== totalStep - 1,
          'py-0 py-xl-3': isHorizontal
        })}
        eventKey={step}
      >
        <div
          className={classNames('text-center d-inline-block', {
            'd-xl-flex align-items-center gap-3': isHorizontal
          })}
        >
          <span className="nav-item-circle-parent">
            <span className="nav-item-circle">
              <FontAwesomeIcon
                icon={icon}
                className={`${isHorizontal ? 'nav-item-icon' : null}`}
              />
              {isHorizontal && (
                <FontAwesomeIcon className="check-icon" icon={faCheck} />
              )}
            </span>
          </span>
          <span
            className={classNames('fs-9 text-center', {
              'd-none d-md-block mt-1': !isHorizontal,
              'nav-item-title fs-xl-8': isHorizontal
            })}
          >
            {label}
          </span>
        </div>
      </Nav.Link>
    </Nav.Item>
  );
};

export default WizardNavItem;
