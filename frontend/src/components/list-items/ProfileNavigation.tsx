import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Button from 'components/base/Button';
import { dropdownData } from 'data/social/dropdownData';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProfileNavigation = ({ className }: { className?: string }) => {
  return (
    <Row className={classNames(className, 'g-0')}>
      {dropdownData.slice(0, 6).map((item, index) => (
        <Col
          key={index}
          xs={6}
          className={classNames('py-2 border-translucent', {
            'border-bottom border-end': index === 0 || index === 2,
            'border-bottom': index === 1 || index === 3,
            'border-end': index === 4
          })}
        >
          <Button
            as={Link}
            to="#!"
            variant="link"
            className={classNames(
              'fs-8 text-body-secondary hover-primary fw-semibold d-flex flex-column d-xxl-inline-block align-items-center align-items-xxl-start',
              {
                'ps-2': index % 2 === 0
              }
            )}
            startIcon={
              <FontAwesomeIcon
                icon={item.icon}
                className="me-2 mb-2 mb-xxl-0"
              />
            }
          >
            {item.label}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default ProfileNavigation;
