import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { DealsReport, dealsReportData } from 'data/crm/reportsData';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';
import { useMemo, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';

interface ReportsFilterModalProps {
  show: boolean;
  onHide: () => void;
}

const ReportsFilterModal = ({ show, onHide }: ReportsFilterModalProps) => {
  const [formData, setFormData] = useState({
    accountName: 'all',
    stage: 'all'
  });
  const { getColumn, resetColumnFilters } =
    useAdvanceTableContext<DealsReport>();

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
      accountName: 'all',
      stage: 'all'
    });
    resetColumnFilters();
  };

  const accountOptions = useMemo(
    () => Array.from(new Set(dealsReportData.map(item => item.accountName))),
    [dealsReportData]
  );

  const stageOptions = useMemo(
    () => Array.from(new Set(dealsReportData.map(item => item.stage.label))),
    [dealsReportData]
  );

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="p-4">
        <h5 className="modal-title text-body-highlight fs-6 lh-sm">Filter</h5>
        <Button className="p-1 text-body ms-auto" onClick={onHide}>
          <FontAwesomeIcon icon={faTimes} className="fs-9" />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4 pb-3">
        <Form id="addEventForm" autoComplete="off">
          <Form.Group className="mb-3">
            <h5 className="mb-2 lh-lg">Account Name</h5>
            <Form.Select
              value={formData.accountName}
              onChange={e => handleFilter('accountName', e.target.value)}
            >
              <option value="all">Select</option>
              {accountOptions.map(account => (
                <option value={account} key={account}>
                  {account}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <h5 className="mb-2 lh-lg">Stage</h5>
            <Form.Select
              value={formData.stage}
              onChange={e => handleFilter('stage', e.target.value)}
            >
              <option value="all">Select</option>
              {stageOptions.map(stage => (
                <option value={stage} key={stage}>
                  {stage}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 p-4">
        <Button
          variant="phoenix-primary"
          size="sm"
          className="fs-10 px-4"
          startIcon={<FontAwesomeIcon icon={faArrowsRotate} className="me-2" />}
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="px-9 fs-10"
          onClick={onHide}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportsFilterModal;
