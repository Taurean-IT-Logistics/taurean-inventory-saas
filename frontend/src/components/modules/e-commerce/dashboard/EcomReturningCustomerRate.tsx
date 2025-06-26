import EcomReturningCustomerRateChart from 'components/charts/e-charts/EcomReturningCustomerRateChart';
import React from 'react';

type DataSeries = {
  name: string;
  data: number[];
  lineType?: 'solid' | 'dashed';
  colorKey: string;
};

interface EcommerceReturningCustomerRateProps {
  dataSeries: DataSeries[];
  months: string[];
}
const EcomReturningCustomerRate = ({
  dataSeries,
  months
}: EcommerceReturningCustomerRateProps) => {
  return (
    <>
      <div>
        <h3>Returning customer rate</h3>
        <p className="mb-1 text-body-tertiary">
          Rate of customers returning to your shop over time
        </p>
      </div>
      <EcomReturningCustomerRateChart dataSeries={dataSeries} months={months} />
    </>
  );
};

export default EcomReturningCustomerRate;
