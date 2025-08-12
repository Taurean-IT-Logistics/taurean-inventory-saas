import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Report } from 'data/crm/reportsData';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { faFolder } from '@fortawesome/free-regular-svg-icons';

const ReportCard = ({ report }: { report: Report }) => {
  return (
    <Card>
      <Card.Body>
        <div className="border-bottom border-translucent">
          <div className="d-flex align-items-start mb-1">
            <Form.Check type="checkbox" />
            <div className="d-sm-flex align-items-center ps-3">
              <Link
                to="/apps/crm/report-details"
                className="fw-bold fs-7 lh-sm line-clamp-1 me-sm-4"
              >
                {report.title}
              </Link>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={faCircle}
                  transform="shrink-6 up-1"
                  className={`me-1 text-${report.priority.type}`}
                />
                <span className="fw-bold fs-9 text-body lh-2">
                  {report.priority.label}
                </span>
              </div>
            </div>
          </div>
          <p className="fs-9 fw-semibold text-body ms-4 text mb-4 ps-2">
            {report.subTitle}
          </p>
        </div>
        <Row className="g-1 g-sm-3 mt-2 lh-1">
          <Col sm="auto" className="flex-1 text-truncate">
            <Link to="#!" className="fw-semibold fs-9">
              <FontAwesomeIcon icon={faFolder} className="me-2" />
              {report.reportsby}
            </Link>
          </Col>
          <Col sm="auto">
            <div className="d-flex align-items-center">
              <FeatherIcon
                icon="grid"
                width={16}
                height={16}
                className="me-2"
              />
              <p className="mb-0 fs-9 fw-semibold text-body-tertiary">
                {report.category}
              </p>
            </div>
          </Col>
          <Col sm="auto">
            <div className="d-flex align-items-center">
              <FeatherIcon
                icon="clock"
                className="me-2"
                width={16}
                height={16}
              />
              <p className="mb-0 fs-9 fw-semibold text-body-tertiary">
                {report.date}
              </p>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ReportCard;
