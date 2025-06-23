import classNames from 'classnames';
import Logo from 'components/common/Logo';
import { PropsWithChildren } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface AuthSimpleLayoutProps {
  logo?: boolean;
  className?: string;
}

const AuthSimpleLayout = ({
  logo = true,
  className = 'col-xl-5 col-xxl-3',
  children
}: PropsWithChildren<AuthSimpleLayoutProps>) => {
  return (
    <div className="container">
      <Row className="flex-center min-vh-100 py-5">
        <Col sm={10} md={8} lg={5} className={classNames(className)}>
          {logo && (
            <Link
              to="/"
              className="d-flex flex-center text-decoration-none mb-4"
            >
              <Logo
                text={false}
                width={58}
                className="fw-bolder fs-5 d-inline-block"
              />
            </Link>
          )}
          {children}
        </Col>
      </Row>
    </div>
  );
};

export default AuthSimpleLayout;
