import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { Container, ContainerProps } from 'components/ui';

export interface PhoenixContainerProps extends ContainerProps {
  small?: boolean;
  className?: string;
}
const PhoenixContainer = ({
  small,
  className,
  children
}: PropsWithChildren<PhoenixContainerProps>) => {
  return (
    <Container
      bsPrefix={small ? 'container-small' : 'container-fluid'}
      className={classNames(className)}
    >
      {children}
    </Container>
  );
};

export default PhoenixContainer;
