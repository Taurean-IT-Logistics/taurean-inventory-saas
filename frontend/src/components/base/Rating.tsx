import { Star } from 'lucide-react';
import { Star as farStar } from '@fortawesome/free-regular-svg-icons';
import {  } from '';
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
        <
          icon={Star}
          className={classNames(iconClass, `text-${fillIconColor}`)}
        />
      }
      emptyIcon={
        <
          icon={farStar}
          className={classNames(iconClass, `text-${emptyIconColor}`)}
        />
      }
      {...rest}
    />
  );
};

export default Rating;
