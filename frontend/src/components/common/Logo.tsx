import React from 'react';
import logo from 'assets/img/logo.png';
import classNames from 'classnames';

interface LogoProps {
  width?: number;
  text?: boolean;
  textClass?: string;
  className?: string;
}

const Logo = ({ width = 70, text = true, textClass, className }: LogoProps) => {
  return (
    <div className={classNames(className, 'd-flex align-items-center')}>
      <img src={logo} alt="phoenix" width={width} />
      {text && (
        <p className={classNames(textClass, 'logo-text ms-2')}>taurean i.t</p>
      )}
    </div>
  );
};

export default Logo;
