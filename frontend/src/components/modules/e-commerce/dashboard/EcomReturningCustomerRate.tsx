import EcomReturningCustomerRateChart from 'components/charts/e-charts/EcomReturningCustomerRateChart';
import React from 'react';

const EcomReturningCustomerRate = () => {
  return (
    <>
      <div>
        <h3>Returning customer rate</h3>
        <p className="mb-1 text-body-tertiary">
          Rate of customers returning to your shop over time
        </p>
      </div>
      <EcomReturningCustomerRateChart />
    </>
  );
};

export default EcomReturningCustomerRate;
