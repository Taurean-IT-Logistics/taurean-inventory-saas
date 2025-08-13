import React from 'react';
import { Link } from 'react-router-dom';
import {  } from '';
import FacilityCard from 'components/facilities/FacilityCard';
import { Facility } from 'types';
import Swiper from 'components/base/Swiper';
import { SwiperSlide } from 'swiper/react';
import { faChevronRight } from 'lucide-react';

interface PageHeroSectionProps {
  facilities: Facility[];
  title: string;
  to: string;
}

const PageHeroSections = ({ facilities, title, to }: PageHeroSectionProps) => {
  return (
    <>
      <div className="flex flex-between-center mb-3">
        <div className="flex">
          <h3 className="mx-2">{title}</h3>
        </div>
        <Link
          to={`/${to}`}
          className="btn btn-link btn-lg p-0 d-none d-md-block"
        >
          Explore more
          < icon={faChevronRight} className="fs-9 ms-1" />
        </Link>
      </div>
      <Swiper
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
        {facilities.map(facility => (
          <SwiperSlide key={facility._id}>
            <FacilityCard facility={facility} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default PageHeroSections;
