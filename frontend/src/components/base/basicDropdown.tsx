import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

interface BasicDropdownProps {
  className?: string;
  btnClassName?: string;
  dropdownMenuClassName?: string;
  icon?: IconProp;
}

const BasicDropdown = ({
  children,
  className,
  btnClassName,
  dropdownMenuClassName,
  icon = faEllipsis
}: PropsWithChildren<BasicDropdownProps>) => {
  return (
    <Dropdown className={classNames(className)} align="end">
      <Dropdown.Toggle
        variant="phoenix-secondary"
        size="sm"
        className={classNames(
          btnClassName,
          'bg-body-emphasis bg-body-hover dropdown-caret-none'
        )}
      >
        <FontAwesomeIcon icon={icon} className="fs-10" />
      </Dropdown.Toggle>
      <Dropdown.Menu
        align="end"
        className={classNames(dropdownMenuClassName, '')}
      >
        {children}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default BasicDropdown;
