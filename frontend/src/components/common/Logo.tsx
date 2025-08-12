import React from 'react';
import logo from 'assets/img/logo.png';
import classNames from 'classnames';

interface LogoProps {
  width?: number;
  text?: boolean;
  isShown?: boolean;
  textClass?: string;
  className?: string;
}

const Logo = ({
  width = 70,
  text = true,
  textClass,
  className,
  isShown = true
}: LogoProps) => {
  return (
    <div className={classNames(className, 'd-flex align-items-center')}>
      <img src={logo} alt="phoenix" width={width} />
      {text && isShown && (
        <p className={classNames(textClass, 'logo-text ms-2')}>taurean i.t</p>
      )}
    </div>
  );
};

export default Logo;
