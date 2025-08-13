import React, { useState } from 'react';
import {  } from '';
import { ChevronDown } from 'lucide-react';
import Button from 'components/base/Button';
import { Collapse } from 'components/ui';
import classNames from 'classnames';

type ContainerSize = 'sm' | 'base' | 'large' | 'trip';
interface CollapsibleContainerProps {
  collapseTitle: string;
  titleClass?: string;
  id: string;
  children: React.ReactElement;
  className?: string;
  containerSize?: ContainerSize;
  defaultOpen?: boolean;
}

const CollapsibleContainer = ({
  collapseTitle,
  titleClass,
  children,
  id,
  className,
  containerSize = 'large',
  defaultOpen = true
}: CollapsibleContainerProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button
        variant=""
        className={classNames(
          className,
          'd-flex flex-between-center collapse-indicator text-body-highlight bg-body-highlight w-100 position-sticky start-0',
          {
            collapsed: open,
            'py-2 px-3': containerSize === 'sm',
            'p-3': containerSize === 'base',
            'p-4': containerSize === 'large',
            'px-4 py-3 py-sm-4': containerSize === 'trip'
          }
        )}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <h4 className={classNames('mb-0', titleClass)}>{collapseTitle}</h4>
        <
          icon={ChevronDown}
          className="toggle-icon text-body"
        />
      </Button>
      <Collapse in={open}>
        <div id={id}>{children}</div>
      </Collapse>
    </>
  );
};

export default CollapsibleContainer;
