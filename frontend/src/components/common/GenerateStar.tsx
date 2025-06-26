import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames';

type filledVariant = 'text-warning' | 'text-warning-light';
type emptyVariant = 'text-warning' | 'text-warning-light';

interface GenerateStarProps {
  filledStars: number;
  totalStars?: number;
  className?: string;
  filledVariant?: filledVariant;
  emptyVariant?: emptyVariant;
}

const GenerateStar = ({
  filledStars,
  totalStars = 5,
  className,
  filledVariant = 'text-warning',
  emptyVariant = 'text-warning'
}: GenerateStarProps) => {
  return (
    <>
      {Array.from({ length: filledStars }).map((_, index) => (
        <Fragment key={`filled-${index}`}>
          <FontAwesomeIcon
            icon={faStar}
            className={classNames(filledVariant, className)}
          />
        </Fragment>
      ))}
      {Array.from({ length: totalStars - filledStars }).map((_, index) => (
        <Fragment key={`empty-${index}`}>
          <FontAwesomeIcon
            icon={faStarRegular}
            className={classNames(emptyVariant, className)}
          />
        </Fragment>
      ))}
    </>
  );
};

export default GenerateStar;
