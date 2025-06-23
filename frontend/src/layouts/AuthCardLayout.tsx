import { UilCheckCircle } from '@iconscout/react-unicons';
import Unicon from 'components/base/Unicon';
import { Card, Col, Container, Row } from 'react-bootstrap';
import bg37 from 'assets/img/bg/37.png';
import bg38 from 'assets/img/bg/38.png';
import authIllustrations from 'assets/img/spot-illustrations/auth.png';
import authIllustrationsDark from 'assets/img/spot-illustrations/auth-dark.png';
import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import Logo from 'components/common/Logo';
import classNames from 'classnames';

interface AuthCardLayoutProps {
  logo?: boolean;
  className?: string;
}

const AuthCardLayout = ({
  logo = true,
  className,
  children
}: PropsWithChildren<AuthCardLayoutProps>) => {
  return (
    <Container fluid className="bg-body-tertiary dark__bg-gray-1200">
      <div
        className="bg-holder bg-auth-card-overlay"
        style={{ backgroundImage: `url(${bg37})` }}
      />

      <Row className="flex-center position-relative min-vh-100 g-0 py-5">
        <Col xs={11} sm={10} xl={8}>
          <Card className="border border-translucent auth-card">
            <Card.Body className="pe-md-0">
              <Row className="align-items-center gx-0 gy-7">
                <Col
                  xs="auto"
                  className="bg-body-highlight dark__bg-gray-1100 rounded-3 position-relative overflow-hidden auth-title-box"
                >
                  <div
                    className="bg-holder"
                    style={{ backgroundImage: `url(${bg38})` }}
                  />
                  <div
                    className={classNames(
                      className,
                      'position-relative px-4 px-lg-7 py-7 pb-sm-5 text-center text-md-start pb-lg-7'
                    )}
                  >
                    <h3 className="mb-3 text-body-emphasis fs-7">
                      Phoenix Authentication
                    </h3>
                    <p className="text-body-tertiary">
                      Give yourself some hassle-free development process with
                      the uniqueness of Phoenix!
                    </p>
                    <ul className="list-unstyled mb-0 w-max-content w-md-auto mx-auto">
                      <li className="d-flex align-items-center gap-2">
                        <Unicon
                          icon={UilCheckCircle}
                          className="text-success"
                          size={16}
                        />
                        <span className="text-body-tertiary fw-semibold">
                          Fast
                        </span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <Unicon
                          icon={UilCheckCircle}
                          className="text-success"
                          size={16}
                        />
                        <span className="text-body-tertiary fw-semibold">
                          Simple
                        </span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <Unicon
                          icon={UilCheckCircle}
                          className="text-success"
                          size={16}
                        />
                        <span className="text-body-tertiary fw-semibold">
                          Responsive
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="position-relative mb-6 d-none d-md-block text-center mt-md-15 z-n1">
                    <img
                      className="auth-title-box-img d-dark-none"
                      src={authIllustrations}
                      alt=""
                    />
                    <img
                      className="auth-title-box-img d-light-none"
                      src={authIllustrationsDark}
                      alt=""
                    />
                  </div>
                </Col>
                <Col className="mx-auto">
                  {logo && (
                    <div className="text-center">
                      <Link
                        to="/"
                        className="d-inline-block text-decoration-none mb-4"
                      >
                        <Logo
                          text={false}
                          width={58}
                          className="fw-bolder fs-5 d-inline-block"
                        />
                      </Link>
                    </div>
                  )}
                  <div className="auth-form-box">{children}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthCardLayout;
