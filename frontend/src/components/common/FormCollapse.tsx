import { faAngleUp } from 'lucide-react';
import {  } from '';
import classNames from 'classnames';
import Button from 'components/base/Button';
import { PropsWithChildren, useState } from 'react';
import { Collapse } from 'components/ui';

interface FormCollapseProps {
  title: string;
  defaultOpen?: boolean;
}

const FormCollapse = ({
  title,
  defaultOpen = true,
  children
}: PropsWithChildren<FormCollapseProps>) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        className={classNames('px-0 d-block collapse-indicator w-100 mt-3', {
          collapsed: !open
        })}
      >
        <div className="flex align-items-center justify-content-between w-100">
          <div className="fs-8 text-body-highlight">{title}</div>
          <
            icon={faAngleUp}
            className="toggle-icon text-body-quaternary"
          />
        </div>
      </Button>
      <Collapse in={open}>
        <div>{children}</div>
      </Collapse>
    </>
  );
};

export default FormCollapse;
