import EcomProjectionVsActualChart from 'components/charts/e-charts/EcomProjectionVsActualChart';
import React from 'react';

const EcomProjectionVsActual = () => {
  return (
    <div className="me-xl-4">
      <div>
        <h3>Projection vs actual</h3>
        <p className="mb-1 text-body-tertiary">
          Actual earnings vs projected earnings
        </p>
      </div>
      <EcomProjectionVsActualChart height="300px" width="100%" />
    </div>
  );
};

export default EcomProjectionVsActual;
