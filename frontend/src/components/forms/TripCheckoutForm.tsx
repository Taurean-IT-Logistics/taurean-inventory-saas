import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TripCheckoutFormDatePicker from 'components/modules/travel-agency/trip/checkout/TripCheckoutFormDatePicker';
import TripCheckoutFormTimePicker from 'components/modules/travel-agency/trip/checkout/TripCheckoutFormTimePicker';
import React from 'react';
import { Col, Form, Row, FormControlProps } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PaymentMethodForm from './PaymentMethodForm';

interface TextInputFieldProps extends FormControlProps {
  id: string;
  label: string;
  endIcon?: boolean;
}
const TextInputFiled = ({
  id,
  label,
  endIcon,
  ...rest
}: TextInputFieldProps) => {
  return (
    <>
      <label htmlFor={id} className="fw-bold text-body-highlight mb-1">
        {label}
      </label>
      {endIcon ? (
        <div className="position-relative">
          <Form.Control id={id} className="pe-6" {...rest} />
          <FontAwesomeIcon
            icon={faLocationCrosshairs}
            className="position-absolute top-0 end-0 mt-2 me-3 text-body-quaternary"
            transform="down-3"
          />
        </div>
      ) : (
        <Form.Control id={id} {...rest} />
      )}
    </>
  );
};

const TripCheckoutForm = () => {
  return (
    <>
      <hr className="mt-5 mb-7" />
      <div>
        <h3 className="mb-5">Contact details</h3>
        <Row className="g-3 mb-3">
          <Col sm={6}>
            <TextInputFiled
              id="email"
              label="Email"
              name="email"
              type="email"
              placeholder="Enter email address"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="phone-number"
              label="Phone number"
              name="phoneNumber"
              type="text"
              placeholder="Enter phone number"
            />
          </Col>
        </Row>
        <Form.Check type="checkbox">
          <Form.Check.Input id="receiveUpdate" type="checkbox" />
          <Form.Check.Label
            className="fw-normal fs-8 text-body"
            htmlFor="receiveUpdate"
          >
            Get booking updates via SMS.
          </Form.Check.Label>
          <Link to="#!" className="text-nowrap">
            {' '}
            Terms apply
          </Link>
        </Form.Check>
      </div>
      <hr className="my-7" />
      <div>
        <h3 className="mb-3">Traveler details</h3>
        <Form.Check type="checkbox" className="mb-5">
          <Form.Check.Input id="anotherCountry" type="checkbox" />
          <Form.Check.Label
            className="fw-normal fs-8 text-body"
            htmlFor="anotherCountry"
          >
            I am travelling from another country
          </Form.Check.Label>
        </Form.Check>
        <Row className="gx-3 gy-4">
          <Col sm={6}>
            <TextInputFiled
              id="firstName"
              label="First name"
              name="firstName"
              type="text"
              placeholder="Enter first name"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="lastName"
              label="Last name"
              name="lastName"
              type="text"
              placeholder="Enter last name"
            />
          </Col>
          <Col sm={6}>
            <TripCheckoutFormDatePicker
              id="dateOfBirth"
              label="Date of birth"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="passport-number"
              label="Passport number"
              name="passportNumber"
              type="text"
              placeholder="Enter passport number"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="country"
              label="Country"
              name="country"
              type="text"
              placeholder="Enter country name"
            />
          </Col>
          <Col sm={6}>
            <TripCheckoutFormDatePicker
              id="expirationDate"
              label="Expiration date"
            />
          </Col>
        </Row>
      </div>
      <hr className="my-7" />
      <div>
        <h3 className="mb-5"> Tour specifics</h3>
        <Row className="gx-3 gy-4">
          <Col sm={6}>
            <TextInputFiled
              id="arrivalAirline"
              label="Arrival airline"
              name="arrivalAirline"
              type="text"
              placeholder="Enter arrival airline"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="arrivalFlightNo"
              label="Arrival flight no"
              name="arrivalFlightNo"
              type="text"
              placeholder="Enter flight no"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="arrivalTerminal"
              label="Arrival terminal"
              name="arrivalTerminal"
              type="text"
              placeholder="Enter terminal no"
            />
          </Col>
          <Col sm={6}>
            <TripCheckoutFormTimePicker id="arrivalTime" label="Arrival time" />
          </Col>
          <Col sm={6}>
            <TripCheckoutFormTimePicker id="cruiseTime" label="Cruise time" />
          </Col>
          <Col sm={6}>
            <TripCheckoutFormTimePicker
              id="disembarkationsTime"
              label="Disembarkation time"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="departureFlightNo"
              label="Departure flight no"
              name="departureFlightNo"
              type="text"
              placeholder="Enter flight no"
            />
          </Col>
          <Col sm={6}>
            <TripCheckoutFormDatePicker
              id="departureDate"
              label="Departure date"
            />
          </Col>
          <Col sm={6}>
            <TripCheckoutFormTimePicker
              id="departureTime"
              label="Departure time"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="departureAirline"
              label="Departure airline"
              name="departureAirline"
              type="text"
              placeholder="Enter name"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="pickupLocation"
              label="Pick up location"
              endIcon={true}
              name="pickupLocation"
              type="text"
              placeholder="Enter location"
            />
          </Col>
          <Col sm={6}>
            <TextInputFiled
              id="dropOffLocation"
              label="Drop off location"
              endIcon={true}
              name="dropOffLocation"
              type="text"
              placeholder="Enter location"
            />
          </Col>
        </Row>
      </div>
      <hr className="my-7" />
      <div>
        <h5 className="mb-2">Special requests</h5>
        <p className="text-body-tertiary fs-9">
          Special requests cannot be guaranteed-but the property will do its
          best to meet your needs. You can always make a special request after
          your booking is complete!
        </p>
        <Form.Control
          as="textarea"
          id="request"
          name="request"
          placeholder="Type your request"
          rows={5}
        />
      </div>
      <PaymentMethodForm />
    </>
  );
};

export default TripCheckoutForm;
