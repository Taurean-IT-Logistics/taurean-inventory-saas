import { useWizardFormContext } from 'providers/WizardFormProvider';
import React, { PropsWithChildren } from 'react';

export const WizardForm = ({
  children,
  step
}: PropsWithChildren<{ step: number }>) => {
  const { formRefs } = useWizardFormContext();
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
      }}
      ref={el => (formRefs.current[step - 1] = el)}
      noValidate
    >
      {children}
    </form>
  );
};

export default WizardForm;
