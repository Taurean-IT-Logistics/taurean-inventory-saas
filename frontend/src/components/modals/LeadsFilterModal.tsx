import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { LeadDataType, leadsTableData } from 'data/crm/leadsTableData';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';
import { useState, useMemo } from 'react';
import { Form, Modal } from 'react-bootstrap';

interface LeadsFilterModalProps {
  show: boolean;
  handleClose: () => void;
}

const LeadsFilterModal = ({ show, handleClose }: LeadsFilterModalProps) => {
  const [formData, setFormData] = useState({
    status: 'all',
    designation: 'all',
    company: 'all'
  });
  const { getColumn, resetColumnFilters } =
    useAdvanceTableContext<LeadDataType>();

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
      status: 'all',
      designation: 'all',
      company: 'all'
    });
    resetColumnFilters();
  };

  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(leadsTableData.map(item => item.customer.status.label))
      ),
    [leadsTableData]
  );
  const designationOptions = useMemo(
    () =>
      Array.from(
        new Set(leadsTableData.map(item => item.customer.designation))
      ),
    [leadsTableData]
  );
  const companyOptions = useMemo(
    () => Array.from(new Set(leadsTableData.map(item => item.company))),
    [leadsTableData]
  );
  return (
    <Modal show={show} onHide={handleClose} className="p-0" centered>
      <Modal.Header className="border-translucent p-4">
        <h5 className="modal-title text-body-highlight fs-6 lh-sm">Filter</h5>
        <Button className="p-1 ms-auto" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} className="fs-9" />
        </Button>
      </Modal.Header>
      <Modal.Body className="pt-4 pb-2 px-4">
        <div className="mb-3">
          <label className="fw-bold mb-2 text-body-highlight">
            Lead Status
          </label>
          <Form.Select
            value={formData.status}
            onChange={e => handleFilter('status', e.target.value)}
          >
            <option value="all">Select</option>
            {statusOptions.map(status => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="mb-3">
          <label className="fw-bold mb-2 text-body-highlight">
            Company name
          </label>
          <Form.Select
            value={formData.company}
            onChange={e => handleFilter('company', e.target.value)}
          >
            <option value="all">Select</option>
            {companyOptions.map(company => (
              <option value={company} key={company}>
                {company}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="mb-3">
          <label className="fw-bold mb-2 text-body-highlight">
            Designation
          </label>
          <Form.Select
            value={formData.designation}
            onChange={e => handleFilter('designation', e.target.value)}
          >
            <option value="all">Select</option>
            {designationOptions.map(designation => (
              <option value={designation} key={designation}>
                {designation}
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
          startIcon={
            <FontAwesomeIcon icon={faArrowsRotate} className="me-2 fs-10" />
          }
          onClick={handleReset}
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

export default LeadsFilterModal;
