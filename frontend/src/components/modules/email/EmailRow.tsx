import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Avatar from 'components/base/Avatar';
import Button from 'components/base/Button';
import IndeterminateCheckbox from 'components/base/IndeterminateCheckbox';
import StarCheckbox from 'components/base/StarCheckbox';
import { Email } from 'data/email';
import { getFileIcon } from 'helpers/utils';
import { useBulkSelect } from 'providers/BulkSelectProvider';
import { Col, Dropdown, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface EmailRowProps {
  email: Email;
  index: number;
}

const EmailRow = ({ email, index }: EmailRowProps) => {
  const { getRowCheckboxProps } = useBulkSelect();
  return (
    <div className="border-bottom border-translucent hover-actions-trigger py-3">
      <Row className="gx-2">
        <Col xs="auto">
          <div className="d-flex flex-column flex-sm-row">
            <IndeterminateCheckbox
              {...getRowCheckboxProps(String(index))}
              className="mb-2 m-sm-0 me-sm-2"
            />
            <Button className="btn p-0">
              <StarCheckbox defaultChecked={email.starred} iconClass="fs-9" />
            </Button>
          </div>
        </Col>
        <Col className="col-auto">
          {email.sender.avatar ? (
            <Avatar src={email.sender.avatar} size="s" />
          ) : (
            <Avatar size="s" variant="name">
              {email.sender.name.charAt(0)}
            </Avatar>
          )}
        </Col>
        <Col className="col-auto">
          <Link
            to="#!"
            className={classNames('fs-9 inbox-link', {
              'text-body fw-semibold': email.read_at,
              'text-body-emphasis fw-bold': !email.read_at
            })}
          >
            {email.sender.name}
          </Link>
        </Col>
        <Col className="col-auto ms-auto">
          <div className="hover-actions end-0">
            <Dropdown>
              <Dropdown.Toggle
                variant="phoenix-secondary"
                className="dropdown-caret-none btn-icon"
              >
                <FontAwesomeIcon icon={faEllipsis} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#!">Mark Unread</Dropdown.Item>
                <Dropdown.Item href="#!">Mark Important</Dropdown.Item>
                <Dropdown.Item href="#!">Archive</Dropdown.Item>
                <Dropdown.Item href="#!">Download</Dropdown.Item>
                <Dropdown.Item href="#!">Print</Dropdown.Item>
                <Dropdown.Item href="#!">Report Spam</Dropdown.Item>
                <Dropdown.Item href="#!">Report Phishing</Dropdown.Item>
                <Dropdown.Item href="#!">
                  Mute {email.sender.name}
                </Dropdown.Item>
                <Dropdown.Item href="#!">
                  Block {email.sender.name}
                </Dropdown.Item>
                <Dropdown.Item href="#!" className="text-danger">
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <span
            className={classNames('fs-10', {
              'fw-bold': email.read_at
            })}
          >
            {email.time}
          </span>
        </Col>
      </Row>
      <div className="ms-4 mt-n3 mt-sm-0 ms-sm-11">
        <Link to="/apps/email/email-detail" className="d-block inbox-link">
          <span
            className={classNames('fs-9 line-clamp-1', {
              'text-body-highlight': email.read_at,
              'text-body-emphasis': !email.read_at
            })}
          >
            {email.subject}
          </span>
          <p className="fs-9 ps-0 text-body-tertiary mb-0 line-clamp-2">
            {email.details}
          </p>
        </Link>

        {email.attachments?.map(attachment => (
          <a
            href="#!"
            className="d-inline-flex align-items-center border border-translucent rounded-pill px-3 py-1 me-2 mt-2 inbox-link"
            key={attachment.id}
          >
            <FontAwesomeIcon
              icon={getFileIcon(attachment.format)}
              className={classNames('fs-9', {
                'text-warning': ['pdf', 'zip'].includes(attachment.format),
                'text-primary': ['music'].includes(attachment.format)
              })}
            />
            <span className="ms-2 fw-bold fs-10 text-body">
              {attachment.fileName}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default EmailRow;
