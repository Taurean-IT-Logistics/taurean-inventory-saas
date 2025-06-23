import { Form, Modal } from 'react-bootstrap';
import spotIllustration44 from 'assets/img/spot-illustrations/44.png';
import spotIllustrationDark44 from 'assets/img/spot-illustrations/44-dark.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/base/Button';

interface FlightPromoModalProps {
  show: boolean;
  handleClose: () => void;
}

const FlightPromoModal = ({ show, handleClose }: FlightPromoModalProps) => {
  return (
    <Modal
      show={show}
      dialogClassName="modal-38w"
      onHide={handleClose}
      centered
    >
      <Modal.Body className="position-relative p-6">
        <div className="position-absolute end-0 top-0">
          <Button
            variant="phoenix-secondary"
            className="px-3 border-0 bg-transparent"
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faTimes} className="fs-9" />
          </Button>
        </div>
        <div className="text-center">
          <img
            className="d-dark-none img-fluid mb-4"
            src={spotIllustration44}
            width={130}
            alt=""
          />
          <img
            className="d-light-none img-fluid mb-4"
            src={spotIllustrationDark44}
            width={130}
            alt=""
          />
          <h1 className="text-success">Save 20%</h1>
          <h3 className="mb-2 text-body">on your next flight - Join now!</h3>
          <p className="mb-4 fs-9">
            Sign up now to save up to 20% on flights with our free membership
            program!
          </p>
          <div className="d-flex gap-2 align-items-center mb-4 justify-content-center">
            <Form.Control
              type="email"
              placeholder="Your email address"
              style={{ maxWidth: 248 }}
            />
            <Button variant="primary" className="rounded text-nowrap px-sm-6">
              Sign-up
            </Button>
          </div>
          <p className="mb-1 fs-9 text-body-quaternary">
            Subscribe for exclusive offers. <a href="#!">Privacy Policy</a>
          </p>
          <Button
            onClick={handleClose}
            aria-label="Close"
            variant="link"
            className=" p-0 fs-10 text-decoration-underline text-body-tertiary"
          >
            Don’t show it again
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FlightPromoModal;
