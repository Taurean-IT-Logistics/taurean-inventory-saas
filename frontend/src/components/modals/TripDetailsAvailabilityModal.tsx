import React from 'react';
import { Col, Form, Modal } from 'react-bootstrap';
import Button from 'components/base/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faChevronRight,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { Row } from 'react-bootstrap';
import DatePicker from 'components/base/DatePicker';
import InputGroupCounter from 'components/common/InputGroupCounter';
import { tripDetailsModalPricingPlan } from 'data/travel-agency/customer/trip';
import TripDetailsModalPricingPlanCard from 'components/cards/TripDetailsModalPricingPlanCard';
import { Link } from 'react-router-dom';

interface TripDetailsAvailabilityModalProps {
  show: boolean;
  onHide: () => void;
}

const TripDetailsAvailabilityModal = ({
  show,
  onHide
}: TripDetailsAvailabilityModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="modal-md">
      <Modal.Header className="border-0 justify-content-between align-items-start gap-5 px-4 pt-4 pb-3">
        <div>
          <h2 id="flightFilterModalLabel" className="mb-0">
            Walk where the king walked once in Wakanda
          </h2>
        </div>
        <Button
          className="ms-auto p-0 fs-6 text-body-quaternary"
          onClick={onHide}
        >
          <FontAwesomeIcon icon={faXmark} />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form>
          <Row className="g-5 mb-4">
            <Col md={5}>
              <label
                htmlFor="tripDate"
                className="fw-bold mb-2 fs-7 text-body-emphasis px-0"
              >
                Choose your preferred date
              </label>
              <div className="form-icon-container flatpickr-input-container">
                <DatePicker
                  render={(_, ref) => {
                    return (
                      <>
                        <Form.Control
                          type="text"
                          placeholder="22 May, 2024"
                          ref={ref}
                          id="tripDate"
                          className="form-icon-input"
                        />
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="form-icon text-body fs-9"
                          transform="up-2"
                        />
                      </>
                    );
                  }}
                  hideIcon={true}
                  options={{
                    dateFormat: 'd-m-Y'
                  }}
                />
              </div>
            </Col>
            <Col md={7}>
              <Row className="g-3">
                <Col xs="auto" sm={6}>
                  <label
                    htmlFor="adults"
                    className="fw-bold mb-2 fs-7 text-body-emphasis"
                  >
                    Adults
                  </label>
                  <InputGroupCounter
                    id="adults"
                    inputGap="gap-2"
                    buttonClasses="rounded px-3"
                    iconClasses="px-0"
                  />
                </Col>
                <Col xs="auto" sm={6}>
                  <label
                    htmlFor="children"
                    className="fw-bold mb-2 fs-7 text-body-emphasis"
                  >
                    Children
                  </label>
                  <InputGroupCounter
                    id="children"
                    inputGap="gap-2"
                    buttonClasses="rounded px-3"
                    iconClasses="px-0"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {tripDetailsModalPricingPlan.map(pricingPlan => (
            <TripDetailsModalPricingPlanCard
              key={pricingPlan.id}
              pricingPlan={pricingPlan}
            />
          ))}
          <Link to="/apps/travel-agency/trip/checkout">
            <Button variant="primary" className="w-100 mt-6" size="lg">
              Proceed to booking
              <FontAwesomeIcon icon={faChevronRight} className="fs-9 ms-2" />
            </Button>
          </Link>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TripDetailsAvailabilityModal;
