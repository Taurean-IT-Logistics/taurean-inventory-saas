import EcomTopRegionsTable from 'components/tables/EcomTopRegionsTable';
import React from 'react';

const EcomTopRegions = () => {
  return (
    <>
      <div className="mb-5 mt-7">
        <h3> Top regions by revenue</h3>
        <p className="text-body-tertiary">
          {' '}
          Where you generated most of the revenue
        </p>
      </div>
      <EcomTopRegionsTable />
    </>
  );
};

export default EcomTopRegions;
