import { Card, Col, Dropdown, Row } from 'react-bootstrap';
import coverImage from 'assets/img/generic/cover-photo.png';
import CoverUpload from 'components/common/CoverUpload';
import profileImage from 'assets/img/team/9.webp';
import AvatarUpload from 'components/common/AvatarUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import Button from 'components/base/Button';
import { dropdownData } from 'data/social/dropdownData';
import classNames from 'classnames';
import {
  faChevronDown,
  faLocationDot,
  faMessage,
  faUserCheck,
  faUserGroup,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

const SocialCoverCard = () => {
  return (
    <Card className="mb-5">
      <Card.Header
        className="d-flex justify-content-center align-items-end position-relative mb-7 mb-xxl-0"
        style={{ minHeight: '214px' }}
      >
        <CoverUpload src={coverImage} />
        <AvatarUpload
          size="5xl"
          src={profileImage}
          thumbnail={true}
          className="feed-profile"
          imageClassName="border-0"
        />
      </Card.Header>
      <Card.Body>
        <Row className="justify-content-xl-between">
          <Col xs="auto">
            <div className="d-flex flex-wrap mb-3 align-items-center">
              <h2 className="me-2">Erza Bridgest</h2>
              <span className="fw-semibold fs-7 text-body-emphasis">
                u/hansolo
              </span>
            </div>
            <div className="mb-5">
              <div className="d-md-flex align-items-center">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    className="fs-9 text-body-tertiary me-2 me-lg-1 me-xl-2"
                  />
                  <Link to="#!" className="text-body-emphasis">
                    <span className="fs-7 fw-bold text-body-tertiary text-opacity-85 text-body-emphasis-hover">
                      1297
                      <span className="fw-semibold ms-2 me-4">Followers</span>
                    </span>
                  </Link>
                </div>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className="fs-9 text-body-tertiary me-2 me-lg-1 me-xl-2"
                  />
                  <Link to="#!" className="text-body-emphasis">
                    <span className="fs-7 fw-bold text-body-tertiary text-opacity-85 text-body-emphasis-hover">
                      3971
                      <span className="fw-semibold ms-2 me-4">Following</span>
                    </span>
                  </Link>
                </div>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="fs-9 text-body-tertiary me-2 me-lg-1 me-xl-2"
                  />
                  <Link to="#!" className="text-body-emphasis">
                    <span className="fs-7 fw-semibold text-body-tertiary text-opacity-85 text-body-emphasis-hover">
                      Vancouver, Lothal
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <p className="fs-6 text-body-secondary">
              “Whenever you find yourself on the side of the majority, it is
              time to pause and reflect.”
            </p>
          </Col>
          <Col xs="auto">
            <Row className="g-2">
              <Col xs="auto" className="order-xxl-2">
                <Button
                  variant="primary"
                  className="lh-1"
                  startIcon={
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  }
                >
                  Follow Request
                </Button>
              </Col>
              <Col xs="auto" className="order-xxl-1">
                <Button
                  variant="phoenix-primary"
                  className="lh-1"
                  startIcon={
                    <FontAwesomeIcon icon={faMessage} className="me-2" />
                  }
                >
                  Send Message
                </Button>
              </Col>
              <Col xs="auto">
                <div className="position-static">
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      className="dropdown-caret-none d-flex align-items-center lh-1"
                      variant="phoenix-secondary"
                    >
                      <FontAwesomeIcon icon={faChevronDown} className="me-2" />
                      More
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="py-2">
                      {dropdownData.map((item, index) => (
                        <Dropdown.Item
                          key={item.label}
                          className={classNames({ 'd-xl-none': index < 6 })}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            className="text-body-secondary me-2"
                          />
                          {item.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SocialCoverCard;
