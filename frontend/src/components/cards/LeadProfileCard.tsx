import Avatar from 'components/base/Avatar';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import team33 from 'assets/img/team/33.webp';
import classNames from 'classnames';

const LeadProfileCard = ({ className }: { className?: string }) => {
  return (
    <Card className={classNames(className)}>
      <Card.Body>
        <Row className="align-items-center g-3 text-center text-xxl-start">
          <Col xs={12} xxl="auto">
            <Avatar size="5xl" src={team33} className="d-inline-block" />
          </Col>
          <Col xs={12} sm="auto" className="flex-1">
            <h3 className="fw-bolder mb-2">Ansolo Lazinatov</h3>
            <p className="mb-0">Chief tech officer,</p>
            <Link to="#!" className="fw-bold">
              Blue Beetles
            </Link>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default LeadProfileCard;
