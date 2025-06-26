import { currencyFormat } from 'helpers/utils';
import React from 'react';

const OrderSummaryDetails = () => {
  return (
    <div>
      <div className="d-flex justify-content-between">
        <p className="text-body fw-semibold">Items subtotal :</p>
        <p className="text-body-emphasis fw-semibold">{currencyFormat(691)}</p>
      </div>
      <div className="d-flex justify-content-between">
        <p className="text-body fw-semibold">Discount :</p>
        <p className="text-danger fw-semibold">-{currencyFormat(59)}</p>
      </div>
      <div className="d-flex justify-content-between">
        <p className="text-body fw-semibold">Tax :</p>
        <p className="text-body-emphasis fw-semibold">
          {currencyFormat(126.2)}
        </p>
      </div>
      <div className="d-flex justify-content-between">
        <p className="text-body fw-semibold">Subtotal :</p>
        <p className="text-body-emphasis fw-semibold">{currencyFormat(665)}</p>
      </div>
      <div className="d-flex justify-content-between">
        <p className="text-body fw-semibold">Shipping Cost :</p>
        <p className="text-body-emphasis fw-semibold">{currencyFormat(30)}</p>
      </div>
    </div>
  );
};

export default OrderSummaryDetails;
