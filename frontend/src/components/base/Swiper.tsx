import { Navigation } from 'swiper/modules';
import {
  Swiper as ReactSwiper,
  SwiperProps as ReactSwiperProps
} from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import { CSSProperties, PropsWithChildren, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavigationOptions } from 'swiper/types';
import {
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

interface SwiperProps extends ReactSwiperProps {
  navigationPosition?: CSSProperties;
  centeredSlide?: boolean;
}

const Swiper = ({
  children,
  navigation = true,
  navigationPosition,
  ...rest
}: PropsWithChildren<SwiperProps>) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  return (
    <div className="swiper-theme-container">
      {navigation && (
        <>
          <button
            className="swiper-button-next"
            style={navigationPosition}
            ref={navigationNextRef}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <button
            className="swiper-button-prev"
            style={navigationPosition}
            ref={navigationPrevRef}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </>
      )}
      <ReactSwiper
        modules={[Navigation]}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
          disabledClass: 'swiper-button-disabled'
        }}
        onBeforeInit={swiper => {
          if (swiper.params.navigation) {
            const navigation = swiper.params.navigation as NavigationOptions;
            navigation.prevEl = navigationPrevRef.current;
            navigation.nextEl = navigationNextRef.current;
          }
        }}
        {...rest}
      >
        {children}
      </ReactSwiper>
    </div>
  );
};

export default Swiper;
