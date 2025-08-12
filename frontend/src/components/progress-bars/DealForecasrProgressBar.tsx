import { ProgressBar } from 'react-bootstrap';

const DealForecasrProgressBar = () => {
  return (
    <div className="w-100">
      <div className="d-flex flex-start">
        <div style={{ width: '20.72%' }}>
          <p className="mb-2 text-body-tertiary fw-semibold fs-9">$21.0k</p>
        </div>
        <div style={{ width: '35.76%' }}>
          <p className="mb-2 text-body-tertiary fw-semibold fs-9">$3.4k</p>
        </div>
        <div style={{ width: '25.38%' }}>
          <p className="mb-2 text-body-tertiary fw-semibold fs-9">$15.1k</p>
        </div>
        <div style={{ width: '25.14%' }}>
          <p className="mb-2 text-body-tertiary fw-semibold fs-9">$4.6k</p>
        </div>
      </div>

      <ProgressBar className="mb-3 rounded-3" style={{ height: '10px' }}>
        <ProgressBar
          className="border-end bg-primary-dark border-2"
          now={20.72}
          key={1}
        />
        <ProgressBar
          className="bg-primary-light border-end border-2"
          now={35.76}
          key={2}
        />
        <ProgressBar
          className="bg-success border-end border-2"
          now={25.38}
          key={3}
        />
        <ProgressBar className="bg-info" now={25.14} key={4} />
      </ProgressBar>
    </div>
  );
};

export default DealForecasrProgressBar;
