import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const WarningMessage = ({ message }: { message: string }) => {
  return (
    <p className="text-warning-dark font-medium">
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="me-2 text-warning"
      />
      {message}
    </p>
  );
};

export default WarningMessage;
