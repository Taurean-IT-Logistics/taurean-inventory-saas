import React from 'react';
import { Form, Modal, Row, Col } from 'react-bootstrap';
import Button from 'components/base/Button';

import {
  faMagnifyingGlass,
  faRotate,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  FilterFormFlightAirlines,
  FilterFormFlightCabin,
  FilterFormFlightDuration,
  FilterFormFlightPriceCalculator,
  FilterFormFlightStops
} from 'components/modules/travel-agency/flight/homepage/FlightFilterFormContent';
import FilterFormFlightAircraft from 'components/modules/travel-agency/flight/homepage/FilterFormFlightAircraft';
import FilterFormFlightAirports from 'components/modules/travel-agency/flight/homepage/FilterFormFlightAirports';
import FilterFormFlightBaggage from 'components/modules/travel-agency/flight/homepage/FilterFormFlightBaggage';
import FilterFormFlightSchedule from 'components/modules/travel-agency/flight/homepage/FilterFormFlightSchedule';

interface FlightFilterModalProps {
  show: boolean;
  handleModalClose: () => void;
}

const FlightFilterModal = ({
  show,
  handleModalClose
}: FlightFilterModalProps) => {
  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      className="p-0 border-0"
      centered
      fullscreen={'md-down'}
      dialogClassName="modal-53w"
      scrollable={true}
    >
      <Modal.Header className="p-4 pb-3 align-items-start border-0">
        <div>
          <h4 id="flightFilterModalLabel" className="mb-2 text-body-highlight">
            Filter
          </h4>
          <p className="mb-0">
            Search for flights according to your preferences
          </p>
        </div>
        <Button className="p-1 ms-auto" onClick={handleModalClose}>
          <FontAwesomeIcon icon={faTimes} className="fs-10 btn-close" />
        </Button>
      </Modal.Header>
      <Modal.Body className="scrollbar px-4 pt-3 pb-0">
        <Form>
          <Row className="g-5">
            <Col md={6}>
              <Row className="g-0">
                <Col xs={12} className="mb-6">
                  <FilterFormFlightStops />
                </Col>
                <Col xs={12} className="mb-6">
                  <FilterFormFlightSchedule />
                </Col>
                <Col xs={12} className="mb-6">
                  <FilterFormFlightAirlines />
                </Col>
                <Col xs={12}>
                  <FilterFormFlightDuration />
                </Col>
              </Row>
            </Col>
            <Col md={6}>
              <Row className="g-0">
                <Col xs={12} className="mb-6">
                  <FilterFormFlightPriceCalculator />
                </Col>
                <Col xs={12} className="mb-6">
                  <FilterFormFlightAirports />
                </Col>
                <Col xs={12} className="mb-6">
                  <FilterFormFlightBaggage />
                </Col>
                <Col xs={12} className="mb-6">
                  <FilterFormFlightCabin />
                </Col>
                <Col xs={12}>
                  <FilterFormFlightAircraft />
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="modal-footer border-0 px-0 pt-3 pb-4">
            <div className="w-100 d-flex flex-wrap gap-3 border-top border-translucent pt-4">
              <Button
                variant="phoenix-primary"
                className="m-0 text-nowrap"
                size="lg"
              >
                <FontAwesomeIcon icon={faRotate} className="me-sm-2" />
                <span className="d-none d-sm-inline-block">Reset filter</span>
              </Button>
              <Button
                variant="primary"
                className="m-0 text-nowrap flex-1"
                type="submit"
                size="lg"
                startIcon={
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
                }
              >
                Update results
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FlightFilterModal;
