import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {  } from '';
import classNames from 'classnames';
import Button from 'components/base/Button';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'components/ui';

const TooltipIconButton = ({
  title,
  icon,
  iconClass
}: {
  title: string;
  icon: IconProp;
  iconClass?: string;
}) => {
  return (
    <OverlayTrigger
      overlay={<Tooltip style={{ position: 'fixed' }}>{title}</Tooltip>}
    >
      <div>
        <Button className="p-0 text-body-quaternary text-body-tertiary-hover">
          < icon={icon} className={classNames(iconClass)} />
        </Button>
      </div>
    </OverlayTrigger>
  );
};

export default TooltipIconButton;
