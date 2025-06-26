import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import {
  Rating as ReactRating,
  RatingProps as ReactRatingProps
} from 'react-simple-star-rating';

export interface RatingProps extends ReactRatingProps {
  iconClass?: string;
  fillIconColor?: string;
  emptyIconColor?: string;
}

const Rating = ({
  iconClass,
  fillIconColor = 'warning',
  emptyIconColor = 'warning-light',
  ...rest
}: RatingProps) => {
  return (
    <ReactRating
      allowFraction
      fillIcon={
        <FontAwesomeIcon
          icon={faStar}
          className={classNames(iconClass, `text-${fillIconColor}`)}
        />
      }
      emptyIcon={
        <FontAwesomeIcon
          icon={farStar}
          className={classNames(iconClass, `text-${emptyIconColor}`)}
        />
      }
      {...rest}
    />
  );
};

export default Rating;
