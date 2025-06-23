import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { Report, reports } from 'data/crm/reportsData';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';
import { useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';

interface ReportFilterModalProps {
  show: boolean;
  handleClose: () => void;
}

const ReportFilterModal = ({ show, handleClose }: ReportFilterModalProps) => {
  const [formData, setFormData] = useState({
    priority: 'all',
    category: 'all'
  });
  const { getColumn, resetColumnFilters } = useAdvanceTableContext<Report>();

  const handleFilter = (columnId: string, value: string) => {
    setFormData({
      ...formData,
      [columnId]: value
    });
    const column = getColumn(columnId);
    column?.setFilterValue(value === 'all' ? '' : value);
  };
  const handleReset = () => {
    setFormData({
      priority: 'all',
      category: 'all'
    });
    resetColumnFilters();
  };

  const priorityOptions = useMemo(
    () => Array.from(new Set(reports.map(item => item.priority.label))),
    [reports]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(reports.map(item => item.category))),
    [reports]
  );

  return (
    <Modal show={show} onHide={handleClose} className="p-0" centered>
      <Modal.Header className="border-translucent p-4">
        <h5 className="modal-title text-body-highlight fs-6 lh-sm">Filter</h5>
        <Button className="p-1 ms-auto" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} className="fs-9 text-danger" />
        </Button>
      </Modal.Header>
      <Modal.Body className="pt-4 pb-2 px-4">
        <div className="mb-3">
          <label className="fw-bold mb-2 text-body-highlight">Priority</label>
          <Form.Select
            value={formData.priority}
            onChange={e => handleFilter('priority', e.target.value)}
          >
            <option value="all">Select</option>
            {priorityOptions.map(priority => (
              <option value={priority} key={priority}>
                {priority}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="mb-3">
          <label className="fw-bold mb-2 text-body-highlight">Category</label>
          <Form.Select
            value={formData.category}
            onChange={e => handleFilter('category', e.target.value)}
          >
            <option value="all">Select</option>
            {categoryOptions.map(category => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end align-items-center px-4 pb-4 border-0 pt-3">
        <Button
          variant="phoenix-primary"
          size="sm"
          className="px-4 fs-10 my-0"
          onClick={handleReset}
          startIcon={
            <FontAwesomeIcon icon={faArrowsRotate} className="me-2 fs-10" />
          }
        >
          Reset
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="px-9 fs-9 my-0"
          onClick={handleClose}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportFilterModal;
