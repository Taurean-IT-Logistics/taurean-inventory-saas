import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { DealColumn } from 'data/crm/deals';
import usePhoenixForm from 'hooks/usePhoenixForm';
import { useDealsContext } from 'providers/CrmDealsProvider';
import { FormEvent, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

interface DealsAddStageModalProps {
  show: boolean;
  handleClose: () => void;
}

const initFormData = {
  id: parseInt(uuid().replace(/-/g, '').slice(0, 12), 16),
  title: '',
  revenue: 0,
  deals: []
};

const DealsAddStageModal = ({ show, handleClose }: DealsAddStageModalProps) => {
  const { onChange, formData, setFormData } = usePhoenixForm<DealColumn>();
  const { handleAddStage, setOpenAddStageModal } = useDealsContext();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAddStage(formData);
    setFormData(initFormData);
    setOpenAddStageModal(false);
  };

  useEffect(() => {
    setFormData(initFormData);
  }, []);

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="border">
      <Form onSubmit={handleSubmit}>
        <Modal.Header className="border-0 p-5">
          <h5 className="modal-title text-body-highlight fs-6 lh-sm">
            Create New Stage
          </h5>
          <Button
            variant="phoenix-secondary"
            className="ms-auto"
            onClick={handleClose}
            size="sm"
          >
            <FontAwesomeIcon icon={faTimes} className="text-danger" />
          </Button>
        </Modal.Header>
        <Modal.Body className="px-5 py-0 mb-2">
          <Form.Group className="mb-4">
            <Form.Label className="form-label-header mb-2">
              Column Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter column name"
              value={formData.title}
              name="title"
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="form-label-header mb-2">
              Expected Revenue
            </Form.Label>

            <Form.Control
              type="number"
              placeholder="$ Enter amount"
              className="flex-1 input-spin-none"
              value={formData.revenue}
              name="revenue"
              required
              onChange={onChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end align-items-center border-0 p-5">
          <Button
            variant="link"
            className="px-4 m-0 text-danger"
            onClick={handleClose}
          >
            Cencel
          </Button>
          <Button variant="primary" type="submit" className="px-4 m-0">
            Create New Stage
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DealsAddStageModal;
