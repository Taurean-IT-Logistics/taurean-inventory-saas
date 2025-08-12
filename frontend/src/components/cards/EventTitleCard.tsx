import { Card, Col, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import Button from 'components/base/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-regular-svg-icons';
import { faHeart, faShareNodes } from '@fortawesome/free-solid-svg-icons';

const EventTitleCard = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <Card.Body>
        <h1 className="lh-sm fs-6 fs-xxl-4 mb-2">
          Brandmyth presents- Shironamhin 25 years celebration with symphony
          orchestra
        </h1>
        <p className="fs-0 mb-4 text-body-tertiary">
          Tavern on the Greend, New York
        </p>
        <Card className="mb-5 mb-xxl-7">
          <Card.Body>
            <Row className="gy-5">
              <Col md={6} className="d-flex justify-content-between">
                <div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center">
                      <div className="px-2 py-1 bg-info-subtle rounded">
                        <FeatherIcon
                          icon="map-pin"
                          className="text-info"
                          size={16}
                        />
                      </div>
                      <h5 className="ms-2 text-body-emphasis mb-0">Location</h5>
                    </div>
                  </div>
                  <p className="lh-sm mb-0 text-body-tertiary">
                    36/4A, James Tiberius Auditorium, <br />
                    Vancouver, British Columbia, Canada
                  </p>
                </div>
                <div className="my-4 mx-3 border-start border-translucent d-none d-md-block" />
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="px-2 py-1 bg-primary-subtle rounded">
                      <FeatherIcon
                        icon="clock"
                        className="text-primary"
                        size={16}
                      />
                    </div>
                    <h5 className="ms-2 mb-0">Date &amp; Time</h5>
                  </div>
                </div>
                <p className="lh-sm mb-0 text-body-tertiary">
                  28th June - 2nd July 2022, <br />
                  10 am - 4 pm Eastern Daylight Time
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Row className="g-2">
          <Col xs={12} md="auto" className="flex-md-grow-1">
            <Button variant="primary" className="w-100">
              Get Tickets
            </Button>
          </Col>
          <Col xs={12} sm="auto" className="flex-sm-grow-1 flex-md-grow-0">
            <Button
              variant="phoenix-primary"
              className="w-100"
              startIcon={
                <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
              }
            >
              Add to Calendar
            </Button>
          </Col>
          <Col xs={6} sm="auto">
            <Button
              variant="phoenix-primary"
              className="w-100"
              startIcon={<FontAwesomeIcon icon={faHeart} className="me-2" />}
            >
              3677
            </Button>
          </Col>
          <Col xs={6} sm="auto">
            <Button
              variant="phoenix-primary"
              className="w-100"
              startIcon={
                <FontAwesomeIcon icon={faShareNodes} className="me-2" />
              }
            >
              4467
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default EventTitleCard;
