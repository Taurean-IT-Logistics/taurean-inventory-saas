import FsLightbox, { FsLightboxProps } from 'fslightbox-react';

interface LightBoxProps extends FsLightboxProps {
  toggler: boolean;
  slide?: number;
  sources: Array<string | JSX.Element>;
}

const Lightbox = ({ toggler, slide = 1, sources, ...rest }: LightBoxProps) => {
  return (
    <FsLightbox toggler={toggler} sources={sources} slide={slide} {...rest} />
  );
};

export default Lightbox;
