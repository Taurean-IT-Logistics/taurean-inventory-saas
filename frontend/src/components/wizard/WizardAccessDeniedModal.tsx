import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import React from 'react';
import { Modal } from 'react-bootstrap';
import stopIcon from 'assets/img/icons/stop.png';
import { useWizardFormContext } from 'providers/WizardFormProvider';

const WizardAccessDeniedModal = () => {
  const { openDeniedModal, setOpenDeniedModal } = useWizardFormContext();
  return (
    <Modal
      show={openDeniedModal}
      centered
      onHide={() => setOpenDeniedModal(false)}
    >
      <Modal.Header className="border-gray-100 p-3">
        <div className="h4 text-body-secondary mb-0">Access Denied!</div>
        <Button
          variant="link"
          className="text-danger px-1 position-absolute top-0 end-0 mt-2 me-2 ms-auto"
          onClick={() => setOpenDeniedModal(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </Modal.Header>
      <Modal.Body className="px-4 py-6">
        <div className="d-flex align-items-center">
          <img className="me-4" src={stopIcon} />
          <div className="flex-1">
            <p className="mb-0 fw-semibold text-body-tertiary">
              You do not have the link to access. Please start <br />
              over to get access for the next session.
              <br />
              Thank You!
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default WizardAccessDeniedModal;
