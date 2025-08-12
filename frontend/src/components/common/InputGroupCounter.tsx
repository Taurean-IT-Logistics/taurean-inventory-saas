import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Button from 'components/base/Button';
import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

interface InputGroupCounterProps {
  id?: string;
  inputGap?: string;
  buttonClasses?: string;
  iconClasses?: string;
}

const InputGroupCounter = ({
  id,
  inputGap = 'gap-1',
  buttonClasses = 'px-2 rounded',
  iconClasses = 'px-1'
}: InputGroupCounterProps) => {
  const [value, setValue] = useState(2);

  const handleCount = (type: string) => {
    type === 'increase' && setValue(value + 1);
    type === 'decrease' && value >= 1 && setValue(value - 1);
  };

  return (
    <InputGroup className={classNames(inputGap)}>
      <Button
        variant="phoenix-primary"
        className={classNames(buttonClasses)}
        onClick={() => handleCount('decrease')}
      >
        <FontAwesomeIcon icon={faMinus} className={classNames(iconClasses)} />
      </Button>

      <Form.Control
        type="number"
        value={value}
        id={id && id}
        onChange={e => setValue(parseInt(e.target.value))}
        className="border-translucent input-spin-none text-center rounded"
      />
      <Button
        variant="phoenix-primary"
        className={classNames(buttonClasses)}
        onClick={() => handleCount('increase')}
      >
        <FontAwesomeIcon icon={faPlus} className={classNames(iconClasses)} />
      </Button>
    </InputGroup>
  );
};

export default InputGroupCounter;
