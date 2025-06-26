import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { InventoryItem } from 'types';
import InventoryItemCard from './InventoryItemCard';
import Swiper from 'components/base/Swiper';
import { SwiperSlide } from 'swiper/react';

interface InventoryHeroSectionProps {
  items: InventoryItem[];
  title: string;
  to: string;
  onAddToCart: (item: InventoryItem) => void;
  onAddToWishlist: (item: InventoryItem) => void;
}

const InventoryHeroSection = ({
  items,
  title,
  to,
  onAddToCart,
  onAddToWishlist
}: InventoryHeroSectionProps) => {
  return (
    <>
      <div className="d-flex flex-between-center mb-3">
        <div className="d-flex">
          <h3 className="mx-2">{title}</h3>
        </div>
        <Link
          to={`/${to}`}
          className="btn btn-link btn-lg p-0 d-none d-md-block"
        >
          Explore more
          <FontAwesomeIcon icon={faChevronRight} className="fs-9 ms-1" />
        </Link>
      </div>
      <Swiper
        className="mb-5"
        slidesPerView={1}
        spaceBetween={16}
        navigationPosition={{ top: '25%' }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 16
          },
          450: {
            slidesPerView: 1,
            spaceBetween: 16
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 16
          },
          1540: {
            slidesPerView: 4,
            spaceBetween: 16
          }
        }}
      >
        {items.map(item => (
          <SwiperSlide key={item._id}>
            <InventoryItemCard
              item={item}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default InventoryHeroSection;
