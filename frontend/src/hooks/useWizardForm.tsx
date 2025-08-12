import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState
} from 'react';
import usePhoenixForm, { UsePhoenixFormResult } from './usePhoenixForm';

export interface UseWizardFormResult<T> extends UsePhoenixFormResult<T> {
  selectedStep: number;
  setSelectedStep: Dispatch<SetStateAction<number>>;
  formRefs: MutableRefObject<(HTMLFormElement | null)[]>;
  goToStep: (targetStep: number) => void;
  validation?: boolean;
  totalStep: number;
  startOver: () => void;
  getCanNextPage: boolean;
  getCanPreviousPage: boolean;
  openDeniedModal: boolean;
  setOpenDeniedModal: Dispatch<SetStateAction<boolean>>;
}

const submitEvent = new Event('submit', {
  bubbles: true,
  cancelable: true
});

const useWizardForm = <T,>(
  {
    validation,
    totalStep
  }: {
    validation?: boolean;
    totalStep: number;
  },
  defaultValues?: Partial<T>
): UseWizardFormResult<T> => {
  const [selectedStep, setSelectedStep] = useState(1);
  const [openDeniedModal, setOpenDeniedModal] = useState(false);
  const formRefs = useRef<HTMLFormElement[]>([]);
  const methods = usePhoenixForm<T>(defaultValues);

  const goToStep = (targetStep: number) => {
    // if (selectedStep === totalStep && targetStep < selectedStep) {
    //   setOpenDeniedModal(true);
    //   return;
    // }
    if (targetStep <= totalStep && targetStep > 0) {
      if (selectedStep > targetStep) {
        setSelectedStep(Number(targetStep));
      } else {
        const form = formRefs.current[selectedStep - 1];

        if (form) {
          form.dispatchEvent(submitEvent);
          if (form.checkValidity() || !validation) {
            setSelectedStep(Number(targetStep));
          } else {
            form.classList.add('was-validated');
          }
        }
      }
    }
  };

  const startOver = () => {
    setSelectedStep(1);
    methods.setFormData({} as T);
  };

  const getCanNextPage = selectedStep < totalStep;

  const getCanPreviousPage = selectedStep > 1;

  return {
    selectedStep,
    setSelectedStep,
    ...methods,
    formRefs,
    startOver,
    goToStep,
    validation: !!validation,
    totalStep,
    getCanNextPage,
    getCanPreviousPage,
    openDeniedModal,
    setOpenDeniedModal
  };
};

export default useWizardForm;
