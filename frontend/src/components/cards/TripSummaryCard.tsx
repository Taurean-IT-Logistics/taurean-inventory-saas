import React from 'react';
import { SelectedTrip } from 'data/travel-agency/customer/trip';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faUser } from '@fortawesome/free-solid-svg-icons';
import { numberFormat } from 'helpers/utils';

interface TripSummaryCardProps {
  selectedTrip: SelectedTrip;
}
const TripSummaryCard = ({ selectedTrip }: TripSummaryCardProps) => {
  return (
    <Card>
      <Card.Body>
        <img
          src={selectedTrip.image}
          alt=""
          className="w-100 object-fit-cover rounded-2"
          height={220}
        />
        <h3 className="mb-4 mt-5">{selectedTrip.title}</h3>
        <h5 className="fw-normal mb-3">
          <FontAwesomeIcon
            icon={faCalendar}
            className="text-body-quaternary me-2"
          />
          {selectedTrip.date}
        </h5>
        <h5 className="fw-normal mb-3">
          <FontAwesomeIcon
            icon={faUser}
            className="text-body-quaternary me-2"
          />
          {selectedTrip.people}
        </h5>
        <h5 className="fw-normal mb-3">
          <FontAwesomeIcon
            icon={faClock}
            className="text-body-quaternary me-2"
          />
          Pickup time: <span className="ms-3">{selectedTrip.pickupTime}</span>
        </h5>
        <h5 className="fw-normal mb-5">
          <FontAwesomeIcon
            icon={faClock}
            className="text-body-quaternary me-2"
          />
          Drop off time:{' '}
          <span className="ms-2">{selectedTrip.dropOffTime}</span>
        </h5>
        <div className="p-3 rounded-2 bg-body-highlight">
          <div className="d-flex flex-between-center mb-2">
            <h5 className="mb-0 fw-normal">Booking Fee</h5>
            <h5 className="mb-0 fw-normal">
              USD{' '}
              {numberFormat(selectedTrip.bookingFee, 'standard', {
                minimumFractionDigits: 2
              })}
            </h5>
          </div>
          <div className="d-flex flex-between-center mb-3">
            <h5 className="mb-0 fw-normal">Subtotal</h5>
            <h5 className="mb-0 fw-normal">
              USD{' '}
              {numberFormat(selectedTrip.subTotal, 'standard', {
                minimumFractionDigits: 2
              })}
            </h5>
          </div>
          <div className="d-flex flex-between-center">
            <h4 className="mb-0">Total</h4>
            <h4 className="mb-0">
              USD{' '}
              {numberFormat(
                selectedTrip.bookingFee + selectedTrip.subTotal,
                'standard',
                {
                  minimumFractionDigits: 2
                }
              )}
            </h4>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TripSummaryCard;
