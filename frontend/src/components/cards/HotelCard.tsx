import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { MapPin, Star } from 'lucide-react';
import {  } from '';
import Badge from 'components/base/Badge';
import { hotelInterFace } from 'data/travel-agency/customer/hotel';
import { currencyFormat } from 'helpers/utils';
import React from 'react';
import { Link } from 'react-router-dom';

const HotelCard = ({ hotelInfo }: { hotelInfo: hotelInterFace }) => {
  const { name, location, img, price, rating } = hotelInfo;
  return (
    <div className="hover-actions-trigger mx-auto rounded-3 overflow-hidden">
      <img src={img} alt="" height={220} className="img-fluid" />
      <div className="hover-actions top-0 end-0 mt-4 me-4 z-5">
        <button className="btn btn-wish">
          < icon={faHeart} transform="down-1" />
        </button>
      </div>
      <div className="backdrop-faded backdrop-secondary-dark h-100 d-flex flex-column justify-content-end">
        <Link
          className="stretched-link fs-7 text-white fw-bold"
          to="/apps/travel-agency/hotel/customer/hotel-details"
        >
          {name}
        </Link>
        <p className="mb-2 text-secondary-lighter">
          < icon={MapPin} className="me-2" />
          {location}
        </p>
        <div className="flex align-items-center gap-3">
          <Badge variant="phoenix" bg="warning" className="fs-8 fw-normal">
            <
              icon={Star}
              className="text-warning-emphasis me-1 fs-9"
              transform="up-1"
            />
            {rating}
          </Badge>
          <h4 className="mb-0 text-white fw-bold text-nowrap">
            {currencyFormat(parseFloat(price), {
              minimumFractionDigits: 2
            })}
            <span className="text-secondary-lighter fs-8 fw-normal">
              {' '}
              / night
            </span>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
