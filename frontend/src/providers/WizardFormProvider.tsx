import { UseWizardFormResult } from 'hooks/useWizardForm';
import { Context, PropsWithChildren, createContext, useContext } from 'react';
import { Tab } from 'react-bootstrap';

interface WizardFormContextInterface<T> extends UseWizardFormResult<T> {}
interface WizardFormProviderInterface<T>
  extends WizardFormContextInterface<T> {}

export const WizardFormContext = createContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as WizardFormContextInterface<any>
);

const WizardFormProvider = <T,>({
  children,
  ...rest
}: PropsWithChildren<WizardFormProviderInterface<T>>) => {
  const { selectedStep, goToStep } = rest;
  return (
    <WizardFormContext.Provider value={{ ...rest }}>
      <Tab.Container
        activeKey={selectedStep}
        onSelect={(eventKey: string | null) => {
          if (eventKey) {
            goToStep(Number(eventKey));
          }
        }}
      >
        {children}
      </Tab.Container>
      {/* <WizardAccessDeniedModal /> */}
    </WizardFormContext.Provider>
  );
};

export const useWizardFormContext = <T,>() =>
  useContext(WizardFormContext as Context<WizardFormContextInterface<T>>);

export default WizardFormProvider;
