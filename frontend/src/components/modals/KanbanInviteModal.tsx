import { Col, Form, Modal, Row } from 'react-bootstrap';
import boardIcon from 'assets/img/kanban/board.png';
import Button from 'components/base/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLink, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const KanbanInviteModal = ({
  show,
  handleClose
}: {
  show: boolean;
  handleClose: () => void;
}) => {
  return (
    <Modal show={show} centered onHide={handleClose}>
      <Modal.Header className="p-4 d-flex gap-2 border-0">
        <img src={boardIcon} height={24} width={18} />
        <h3 className="mb-0 text-body-emphasis fw-semibold flex-1">
          Phoenix Kanban
        </h3>
        <Button className="p-0 ms-auto" onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} className="fs-7" />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4 pt-0">
        <p className="text-body-tertiary fw-semibold fs-9">
          Add the <strong className="fw-bolder">Members</strong> or{' '}
          <strong className="fw-bolder">Guests</strong> to your Kanban board.
          They can add, edit, or move tasks in your board. Tasks can also be
          assigned to them.{' '}
          <Link to="#!" className="fw-semibold">
            Learn more
          </Link>
        </p>
        <Row className="g-2 mb-2">
          <Col xs={6}>
            <Form.Control
              type="text"
              placeholder="Phoenix id or email address"
              name="email"
            />
          </Col>
          <Col xs="auto" sm={3} className="flex-1">
            <Form.Select>
              <option value="guest">Guest</option>
              <option value="member">Member</option>
            </Form.Select>
          </Col>
          <Col xs="auto" sm={3}>
            <Button variant="primary">
              <FontAwesomeIcon icon={faEnvelope} className="fs-10 me-sm-2" />
              <span className="d-none d-sm-inline-block">Invite</span>
            </Button>
          </Col>
        </Row>
        <div className="py-2 border-bottom border-translucent border-dashed position-relative mb-4">
          <span className="bg-body-emphasis px-1 position-absolute top-50 start-50 translate-x-50 fs-9 fw-semibold">
            Or,
          </span>
        </div>
        <Row className="g-2">
          <Col xs="auto" sm={9} className="flex-1">
            <Button
              variant="phoenix-secondary"
              startIcon={
                <FontAwesomeIcon icon={faLink} className="ms-2 fs-9" />
              }
              className="w-100"
            >
              <span className="d-none d-sm-inline">Create & Copy</span>{' '}
              <span>Shareable link</span>
            </Button>
          </Col>
          <Col xs="auto" sm={3}>
            <Form.Select>
              <option value="guest">Guest</option>
              <option value="member">Member</option>
            </Form.Select>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default KanbanInviteModal;
