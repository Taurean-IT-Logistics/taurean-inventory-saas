import EcomProjectionVsActualChart from 'components/charts/e-charts/EcomProjectionVsActualChart';
import React from 'react';
import { Transaction } from 'types';

interface EcomProjectionVisualProps {
  transactions: Transaction[];
}

const EcomProjectionVsActual = ({
  transactions
}: EcomProjectionVisualProps) => {
  return (
    <div className="me-xl-4">
      <div>
        <h3>Projection vs actual</h3>
        <p className="mb-1 text-body-tertiary">
          Actual earnings vs projected earnings
        </p>
      </div>
      <EcomProjectionVsActualChart
        height="300px"
        width="100%"
        transactions={transactions}
      />
    </div>
  );
};

export default EcomProjectionVsActual;
