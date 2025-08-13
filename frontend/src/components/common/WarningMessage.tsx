import { faTriangleExclamation } from 'lucide-react';
import {  } from '';
import React from 'react';

const WarningMessage = ({ message }: { message: string }) => {
  return (
    <p className="text-warning-dark font-medium">
      <
        icon={faTriangleExclamation}
        className="me-2 text-warning"
      />
      {message}
    </p>
  );
};

export default WarningMessage;
