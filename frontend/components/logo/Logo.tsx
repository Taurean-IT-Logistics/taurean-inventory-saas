import React from "react";
import { logo as LogoImage } from "@/assets";
import Image, { StaticImageData } from "next/image";

interface LogoProps {
  logo?: string | StaticImageData;
  width?: number;
  height?: number;
  isShown?: boolean;
  className?: string;
}

const Logo = ({
  logo = LogoImage,
  width = 70,
  height = 70,
  className,
  isShown = true,
}: LogoProps) => {
  return (
    <div className={`${className} d-flex align-items-center`}>
      <Image src={logo} alt="taurean logo" width={width} height={height} />
    </div>
  );
};

export default Logo;
