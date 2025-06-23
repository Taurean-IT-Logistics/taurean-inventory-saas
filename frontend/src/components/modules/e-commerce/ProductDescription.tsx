import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import Rating from 'components/base/Rating';
import ProductColorNav from 'components/navs/ProductColorNav';
import { productColorVariants } from 'data/e-commerce';
import { currencyFormat } from 'helpers/utils';
import ProductGallery from 'components/modules/e-commerce/ProductGallery';
import { useMemo, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import QuantityButtons from 'components/common/QuantityButtons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faShareAlt, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const ProductDescription = () => {
  const [selectedVariantKey, setSelectedVariantKey] = useState('blue');
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(() => {
    return productColorVariants.find(
      variant => variant.id === selectedVariantKey
    );
  }, [selectedVariantKey]);

  return (
    <Row className="g-5 mb-5 mb-lg-8">
      <Col xs={12} lg={6}>
        {selectedVariant && <ProductGallery images={selectedVariant.images} />}
        <div className="d-flex">
          <Button
            variant="outline-warning"
            size="lg"
            className="rounded-pill w-100 me-3 px-2 px-sm-4 fs--1 fs-sm-0"
          >
            <FontAwesomeIcon icon={faHeart} className="me-2" />
            Add to wishlist
          </Button>
          <Button
            variant="warning"
            size="lg"
            className="rounded-pill w-100 px-2 px-sm-4 fs--1 fs-sm-0"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            Add to cart
          </Button>
        </div>
      </Col>
      <Col xs={12} lg={6}>
        <Stack className="justify-content-between h-100">
          <div className="mb-3">
            <div className="d-flex flex-wrap">
              <div className="me-2">
                <Rating readonly initialValue={5} />
              </div>
              <p className="text-primary fw-semibold mb-2">
                6548 People rated and reviewed
              </p>
            </div>
            <h3 className="mb-3 lh-sm">
              24" iMac® with Retina 4.5K display - Apple M1 8GB Memory - 256GB
              SSD - w/Touch ID (Latest Model) - Blue
            </h3>
            <div className="d-flex flex-wrap align-items-start mb-3">
              <span className="badge bg-success fs-9 rounded-pill me-2 fw-semibold">
                #1 Best seller
              </span>
              <Link to="#!" className="fw-semibold">
                in Phoenix sell analytics 2021
              </Link>
            </div>
            <div className="d-flex flex-wrap align-items-center">
              <h1 className="me-3">{currencyFormat(1349.99)}</h1>
              <p className="text-body-quaternary text-decoration-line-through fs-6 mb-0 me-3">
                {currencyFormat(1499.99)}
              </p>
              <p className="text-warning-dark fw-bolder fs-6 mb-0">10% off</p>
            </div>
            <p className="text-success fw-semibold fs-7 mb-2"> In stock</p>
            <p className="mb-2 text-body-secondary">
              <strong className="text-body-highlight">
                Do you want it on Saturday, July 29th?
              </strong>{' '}
              Choose{' '}
              <strong className="text-body-highlight">
                Saturday Delivery{' '}
              </strong>
              at checkout if you want your order delivered within 12 hours 43
              minutes,{' '}
              <Link className="fw-bold" to="#!">
                Details.{' '}
              </Link>
              <strong className="text-body-highlight">
                Gift wrapping is available.
              </strong>
            </p>
            <p className="text-danger-dark fw-bold mb-5 mb-lg-0">
              Special offer ends in 23:00:45 hours
            </p>
          </div>

          <div>
            <div className="mb-3">
              <p className="fw-semibold mb-2 text-body">
                Color :{' '}
                <span className="text-body-emphasis">
                  {selectedVariant?.name}
                </span>
              </p>
              <ProductColorNav
                selectedVariantKey={selectedVariantKey}
                setSelectedVariantKey={setSelectedVariantKey}
              />
            </div>
            <div className="row g-3 g-sm-5 align-items-end">
              <div className="col-12 col-sm-auto">
                <p className="fw-semibold mb-2 text-body">Size : </p>
                <div className="d-flex align-items-center">
                  <select className="form-select w-auto">
                    <option value="44">44</option>
                    <option value="22">22</option>
                    <option value="18">18</option>
                  </select>
                  <a className="ms-2 fs-9 fw-semibold" href="#!">
                    Size chart
                  </a>
                </div>
              </div>
              <div className="col-12 col-sm">
                <p className="fw-semibold mb-2 text-body">Quantity : </p>
                <div className="d-flex justify-content-between align-items-end">
                  <QuantityButtons
                    quantity={quantity}
                    setQuantity={setQuantity}
                  />
                  <Button variant="phoenix-primary" className="px-3 border-0">
                    <FontAwesomeIcon icon={faShareAlt} className="fs-7" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Stack>
      </Col>
    </Row>
  );
};

export default ProductDescription;
