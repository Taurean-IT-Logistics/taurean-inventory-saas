import { UilCheckCircle } from '@iconscout/react-unicons';
import classNames from 'classnames';
import Badge from 'components/base/Badge';
import Unicon from 'components/base/Unicon';
import { PricingGrid } from 'data/pricing';
import { currencyFormat } from 'helpers/utils';
import { Card, Col, Form, Row } from 'react-bootstrap';

interface PricingGridItemProps {
  item: PricingGrid;
  pricingType: string;
}

const PricingGridItem = ({ item, pricingType }: PricingGridItemProps) => {
  return (
    <div className="h-100">
      <Form.Control
        type="radio"
        name={pricingType}
        className={classNames('pricing-plan-radio d-none', {
          'pricing-plan-recommended': item.badge?.label === 'recommended'
        })}
        defaultChecked={item.selected}
        id={`${item.title.split(' ')[0]}-${pricingType}`}
      />
      <div className="position-relative h-100">
        <Form.Label
          htmlFor={`${item.title.split(' ')[0]}-${pricingType}`}
          className="stretched-link"
        />
        <Card
          className={classNames('h-100 overflow-hidden cursor-pointer', {
            'bg-warning-subtle border-warning warning-boxshadow pricing-business-plus':
              item.badge?.label === 'recommended'
          })}
        >
          <div
            className="bg-holder d-dark-none"
            style={{
              backgroundImage: `url(${item.bg})`,
              backgroundPosition: 'left bottom',
              backgroundSize: 'auto'
            }}
          />
          <div
            className="bg-holder d-light-none"
            style={{
              backgroundImage: `url(${item.darkBg})`,
              backgroundPosition: 'left bottom',
              backgroundSize: 'auto'
            }}
          />
          <Card.Body className="d-flex flex-column justify-content-between position-relative">
            <div className="d-flex justify-content-between">
              <div className="mb-5 mb-md-0 mb-lg-5 me-3">
                <div className="d-sm-flex align-items-center mb-3">
                  <h3 className="mb-0">{item.title}</h3>
                  {item.badge && (
                    <Badge
                      variant="default"
                      bg={item.badge.badgeBg}
                      className="ms-sm-3 fs-10 text-uppercase"
                    >
                      {item.badge.label}
                    </Badge>
                  )}
                </div>
                <p
                  className="fs-9 text-body-tertiary"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
                <div className="d-flex align-items-end mb-md-5 mb-lg-0">
                  {item.monthlyPrice === 0 || item.yearlyPrice === 0 ? (
                    <h4 className="fw-bolder me-1">Free</h4>
                  ) : (
                    <h4 className="fw-bolder me-1">{`${
                      pricingType === 'monthly'
                        ? currencyFormat(item.monthlyPrice)
                        : currencyFormat(item.yearlyPrice)
                    }`}</h4>
                  )}
                  {item.monthlyPrice === 0 || item.yearlyPrice === 0 ? (
                    <h5 className="fs-9 fw-normal text-body-tertiary ms-1">
                      Forever
                    </h5>
                  ) : (
                    <h5 className="fs-9 fw-normal text-body-tertiary ms-1">
                      {pricingType === 'monthly' ? 'Per month' : 'Per year'}
                    </h5>
                  )}
                </div>
              </div>
              <img
                src={item.img}
                className="d-dark-none"
                width={54}
                height={54}
                alt=""
              />
              <img
                src={item.imgDark}
                className="d-light-none"
                width={54}
                height={54}
                alt=""
              />
            </div>
            <Row className="flex-1 justify-content-end">
              <Col sm={8} md={12}>
                <div className="d-sm-flex d-md-block d-lg-flex justify-content-end align-items-end h-100">
                  <ul
                    className={classNames(
                      'list-unstyled mb-0 border-start-sm border-start-md-0 border-start-lg ps-sm-5 ps-md-0 ps-lg-5',
                      {
                        'border-warning-subtle':
                          item.badge?.label === 'recommended',
                        'border-translucent':
                          item.badge?.label !== 'recommended'
                      }
                    )}
                  >
                    {item.features.map((feature, index) => (
                      <li
                        key={feature}
                        className={classNames('d-flex align-items-center', {
                          'mb-2': index !== item.features.length - 1
                        })}
                      >
                        <Unicon
                          icon={UilCheckCircle}
                          className="text-success me-2"
                          size={16}
                        />
                        <span
                          className="text-body-tertiary fw-semibold lh-1"
                          dangerouslySetInnerHTML={{ __html: feature }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default PricingGridItem;
