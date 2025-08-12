import { faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import { Event } from 'data/eventsData';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface EventItemProps {
  event: Event;
}

const EventItem = ({ event }: EventItemProps) => {
  return (
    <div
      key={event.title}
      className="py-3 border-bottom border-translucent border-dashed"
    >
      <div className="d-flex flex-between-center">
        <p className="text-warning fs-10 mb-0 fw-bold mb-1">{event.date}</p>
        <RevealDropdownTrigger>
          <RevealDropdown>
            <Dropdown.Item eventKey="1">Edit</Dropdown.Item>
            <Dropdown.Item eventKey="2" className="text-danger">
              Delete
            </Dropdown.Item>
            <Dropdown.Item eventKey="2">Download</Dropdown.Item>
            <Dropdown.Item eventKey="2">Report abuse</Dropdown.Item>
          </RevealDropdown>
        </RevealDropdownTrigger>
      </div>
      <Link
        to="#!"
        className="hover-primary text-body-highlight fw-bold mb-2 line-clamp-1 me-5 lh-base"
      >
        {event.title}
      </Link>
      <p className="text-body-secondary fs-9 mb-2">
        Organized by <br />{' '}
        <Link to="#!" className="fw-bold">
          {event.organization}
        </Link>
      </p>
      <p className="fs-10 text-body-tertiary text-opacity-85">
        {event.people} people going
      </p>
      <p className="fs-9 text-body-tertiary fw-bold mb-1">
        <FontAwesomeIcon icon={faClock} className="text-body-secondary me-1" />
        {event.time}
      </p>
      <p className="fs-9 text-body-tertiary fw-bold mb-0">
        <FontAwesomeIcon
          icon={faMapMarkerAlt}
          className="text-body-secondary me-1"
        />
        {event.place}
      </p>
    </div>
  );
};

export default EventItem;
