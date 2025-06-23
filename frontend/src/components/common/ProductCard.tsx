import { faCheck, faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Badge from 'components/base/Badge';
import Button from 'components/base/Button';
import Rating from 'components/base/Rating';
import { Product as ProductType } from 'data/e-commerce/products';
import { currencyFormat } from 'helpers/utils';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }: { product: ProductType }) => {
  return (
    <div className="position-relative text-decoration-none product-card h-100">
      <div className="d-flex flex-column justify-content-between h-100">
        <div>
          <div className="border border-translucent rounded-3 position-relative mb-3">
            <Button
              variant={product.wishListed ? 'primary' : 'outline-primary'}
              className={classNames(
                'rounded-circle p-0 d-flex flex-center btn-wish btn-wish-primary  z-2 d-toggle-container',
                {
                  active: product.wishListed
                }
              )}
            >
              {product.wishListed ? (
                <FontAwesomeIcon icon={faHeart} />
              ) : (
                <>
                  <FontAwesomeIcon icon={faHeart} className="d-block-hover" />
                  <FontAwesomeIcon icon={farHeart} className="d-none-hover" />
                </>
              )}
            </Button>
            <img src={product.image} alt="" className="img-fluid" />
            {product.verified && (
              <Badge bg="success" className="fs-10 product-verified-badge">
                Verified
                <FontAwesomeIcon icon={faCheck} className="ms-1" />
              </Badge>
            )}
          </div>
          <Link
            to="/apps/e-commerce/customer/product-details"
            className="stretched-link"
          >
            <h6 className="mb-2 lh-sm line-clamp-3 product-name">
              {product.name}
            </h6>
          </Link>
          {product.rating && (
            <p className="fs-9">
              <Rating readonly initialValue={product.rating} />
              {product.rated && (
                <span className="text-body-quaternary fw-semibold ms-1">
                  ({product.rated} people rated)
                </span>
              )}
            </p>
          )}
        </div>
        <div>
          {product.extra && (
            <p className={classNames(product.extraClass, 'fs-9')}>
              {product.extra}
            </p>
          )}
          {product.extra2 && (
            <p className={classNames(product.extra2Class, 'fs-9')}>
              {product.extra2}
            </p>
          )}

          {product.salePrice && (
            <>
              {product.price ? (
                <div className="d-flex align-items-center mb-1">
                  <p className="me-2 text-body text-decoration-line-through mb-0">
                    {currencyFormat(product.price)}
                  </p>
                  <h3 className="text-body-emphasis mb-0">
                    {currencyFormat(product.salePrice)}
                  </h3>
                </div>
              ) : (
                <h3 className="text-body-emphasis">
                  {currencyFormat(product.salePrice)}
                </h3>
              )}
            </>
          )}

          {product.colors && (
            <p
              className={classNames(
                'text-body-tertiary fw-semibold fs-9 lh-1',
                {
                  'mb-0': !product.dealEndTime
                }
              )}
            >
              {product.colors} colors
            </p>
          )}

          {product.dealEndTime && (
            <p className="text-success fw-bold fs-9 lh-1 mb-0">
              Deal time ends in {product.dealEndTime}
            </p>
          )}

          {product.offer && (
            <h6 className="text-success lh-1 mb-0">{product.offer} off</h6>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
