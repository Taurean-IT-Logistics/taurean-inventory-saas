import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';

interface WidgetsSectionTitleProps {
  title: string;
  subtitle: string;
  icon: IconProp;
  className?: string;
}

const WidgetsSectionTitle = ({
  title,
  subtitle,
  icon,
  className
}: WidgetsSectionTitleProps) => {
  return (
    <div className={classNames('d-flex', className)}>
      <span className="fa-stack me-2 ms-n1">
        <FontAwesomeIcon icon={faCircle} className="text-primary fa-stack-2x" />
        <FontAwesomeIcon
          icon={icon}
          className="text-primary-subtle fa-inverse fa-stack-1x"
        />
      </span>
      <div className="w-100">
        <h3 className="mb-0 text-primary position-relative fw-bold">
          <span className="bg-body pe-2">{title}</span>
          <span className="border border-primary position-absolute top-50 translate-middle-y w-100 start-0 z-n1"></span>
        </h3>
        <p className="mb-0">{subtitle}</p>
      </div>
    </div>
  );
};

export default WidgetsSectionTitle;
