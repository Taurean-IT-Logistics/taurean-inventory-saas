import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TripDetailsModalPricingPlan } from 'data/travel-agency/customer/trip';
import { currencyFormat } from 'helpers/utils';
import React from 'react';
import { Card } from 'react-bootstrap';

const TripDetailsModalPricingPlanCard = ({
  pricingPlan
}: {
  pricingPlan: TripDetailsModalPricingPlan;
}) => {
  return (
    <>
      <input
        type="radio"
        name="availableOption"
        id={pricingPlan.name.split(' ').join('-')}
        className="card-form-check-input d-none"
        defaultChecked={pricingPlan.checked}
      />
      <div className="position-relative">
        <label
          htmlFor={pricingPlan.name.split(' ').join('-')}
          className="stretched-link"
        />
        <Card>
          <Card.Body>
            <h4 className="mb-4">
              <span className="radio-circle me-2" />
              {pricingPlan.name}
            </h4>
            <ul className="list-unstyled mb-0">
              {pricingPlan.facilities.map(item => (
                <li key={item.id} className="d-flex mb-1">
                  <FontAwesomeIcon
                    icon={faCircle}
                    className="text-secondary-light me-3"
                    transform="down-20"
                    style={{
                      width: 6,
                      height: 6
                    }}
                  />
                  {item.facility}
                </li>
              ))}
            </ul>
            <hr className="my-4" />
            <h5 className="fw-normal mb-4">
              1 adult x{' '}
              {currencyFormat(pricingPlan.total, { minimumFractionDigits: 2 })}
            </h5>
            <div className="p-3 rounded-2 bg-body-highlight">
              <h4>
                Total{' '}
                {currencyFormat(pricingPlan.total, {
                  minimumFractionDigits: 2
                })}
              </h4>
              {pricingPlan.additionalCharge === 0 && (
                <p className="fs-9 mb-0">
                  ( No additional taxes or booking fees )
                </p>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default TripDetailsModalPricingPlanCard;
