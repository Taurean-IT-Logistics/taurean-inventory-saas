import { Col, Form, Row } from 'react-bootstrap';
import bgLeft32 from 'assets/img/bg/bg-left-32.png';
import bgRight32 from 'assets/img/bg/bg-right-32.png';
import spotIllustration40 from 'assets/img/spot-illustrations/42.png';
import spotIllustrationDark40 from 'assets/img/spot-illustrations/dark_42.png';
import Button from 'components/base/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const TravelCta = () => {
  return (
    <section className="pb-10 pt-3">
      <div
        className="bg-holder d-none d-xl-block"
        style={{
          backgroundImage: `url(${bgLeft32})`,
          backgroundPosition: 'left 115px',
          backgroundSize: '26%'
        }}
      />
      <div
        className="bg-holder d-none d-xl-block"
        style={{
          backgroundImage: `url(${bgRight32})`,
          backgroundPosition: 'right -25px',
          backgroundSize: '28%'
        }}
      />
      <div className="container-medium position-relative">
        <Row className="g-0 justify-content-center">
          <Col lg={10} xl={7}>
            <div className="d-md-flex align-items-center gap-7 text-center text-md-start">
              <img
                src={spotIllustration40}
                width="260"
                className="mb-4 mb-md-0 d-dark-none"
                alt=""
              />
              <img
                src={spotIllustrationDark40}
                width="260"
                className="mb-4 mb-md-0 d-light-none"
                alt=""
              />
              <div className="flex-1">
                <h3 className="mb-0">Get Updates & More</h3>
                <p className="mb-4 text-body-tertiary">
                  Subscribe to our newsletter to stay updated.
                </p>
                <Form className="d-flex justify-content-center">
                  <Form.Control
                    className="me-3"
                    id="ctaEmail"
                    placeholder="Email"
                  />
                  <Button
                    variant="primary"
                    className="d-flex align-items-center"
                    type="submit"
                  >
                    Subscribe
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="ms-2 fs-9"
                    />
                  </Button>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default TravelCta;
