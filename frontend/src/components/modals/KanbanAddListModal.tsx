import { Col, FloatingLabel, Form, Modal, Row } from 'react-bootstrap';
import boardIcon from 'assets/img/kanban/board.png';
import Button from 'components/base/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faCircleXmark,
  faPlus,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { useKanbanContext } from 'providers/KanbanProvider';
import PhoenixFloatingLabel from 'components/base/PhoenixFloatingLabel';
import usePhoenixForm from 'hooks/usePhoenixForm';
import { FormEvent } from 'react';
import { ADD_NEW_LIST, TOGGLE_ADD_LIST_MODAL } from 'reducers/KanbanReducer';
import { getRandomNumber } from 'helpers/utils';

interface AddColumnFormData {
  name: string;
  columnNo: number;
  color: string;
}

const initialFormData = {
  name: '',
  columnNo: 1,
  color: '#000000'
};

const KanbanAddListModal = () => {
  const { boardLists, openAddListModal, kanbanDispatch } = useKanbanContext();

  const { formData, setFormData, onChange } =
    usePhoenixForm<AddColumnFormData>(initialFormData);

  const handleClose = () => {
    kanbanDispatch({
      type: TOGGLE_ADD_LIST_MODAL,
      payload: false
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const list = {
      id: getRandomNumber(20, 100),
      title: formData.name,
      borderColor: formData.color,
      tasks: []
    };

    kanbanDispatch({
      type: ADD_NEW_LIST,
      payload: {
        list,
        columnNo: formData.columnNo
      }
    });
    setFormData(initialFormData);
  };

  return (
    <Modal show={openAddListModal} centered onHide={handleClose}>
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
        <form onSubmit={handleSubmit}>
          <Row className="g-3 mb-4">
            <Col xs={12}>
              <PhoenixFloatingLabel
                label="Column Name"
                className="flex-1"
                startComponent={<FontAwesomeIcon icon={faBars} />}
                endComponent={
                  <button className="btn p-0 lh-1">
                    <FontAwesomeIcon
                      className="text-light"
                      icon={faCircleXmark}
                    />
                  </button>
                }
              >
                <Form.Control
                  type="text"
                  placeholder="Board Name"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                />
              </PhoenixFloatingLabel>
            </Col>
            <Col sm={6}>
              <FloatingLabel label="Column No.">
                <Form.Select
                  name="columnNo"
                  value={formData.columnNo}
                  onChange={onChange}
                >
                  {boardLists.map((list, index) => (
                    <option key={list.id} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                  <option value={boardLists.length + 1}>
                    {boardLists.length + 1}
                  </option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col sm={6}>
              <FloatingLabel label="Color">
                <Form.Control
                  type="color"
                  className="kanban-color-picker"
                  name="color"
                  value={formData.color}
                  onChange={onChange}
                />
              </FloatingLabel>
            </Col>
          </Row>
          <div className="d-flex gap-3 flex-between-center">
            <Button variant="link" className="p-0" type="button">
              Edit Columns
            </Button>
            <Button
              variant="primary"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              type="submit"
            >
              Add Column
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default KanbanAddListModal;
