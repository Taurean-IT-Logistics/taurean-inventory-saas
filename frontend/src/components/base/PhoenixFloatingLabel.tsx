import classNames from 'classnames';
import React, { PropsWithChildren, ReactElement } from 'react';
import { FloatingLabelProps, Form } from 'react-bootstrap';

export interface PhoenixFloatingLabelProps extends FloatingLabelProps {
  startComponent?: ReactElement;
  endComponent?: ReactElement;
}
const PhoenixFloatingLabel = ({
  children,
  startComponent,
  endComponent,
  className,
  label,
  ...rest
}: PropsWithChildren<PhoenixFloatingLabelProps>) => {
  return (
    <Form.Floating
      className={classNames(className, 'phoenix-form-floating')}
      {...rest}
    >
      {startComponent &&
        React.cloneElement(startComponent as ReactElement, {
          className: classNames(
            startComponent.props.className,
            'form-floating-icon form-floating-start-icon'
          )
        })}

      {React.Children.map(children, child =>
        React.cloneElement(child as ReactElement, {
          className: classNames((child as ReactElement).props.className),
          style: {
            paddingLeft: startComponent && '2.25rem'
          }
        })
      )}

      {endComponent &&
        React.cloneElement(endComponent as ReactElement, {
          className: classNames(
            endComponent.props.className,
            'form-floating-icon form-floating-end-icon'
          )
        })}
      <label
        className={classNames({
          'ps-6': startComponent
        })}
      >
        {label}
      </label>
    </Form.Floating>
  );
};

export default PhoenixFloatingLabel;
