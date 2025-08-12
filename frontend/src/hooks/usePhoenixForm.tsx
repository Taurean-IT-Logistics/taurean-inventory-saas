import { ChangeEvent, FormEvent, useState } from 'react';

export interface UsePhoenixFormResult<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  setValue: (values: Partial<T>) => void;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const usePhoenixForm = <T,>(
  defaultValues?: Partial<T>
): UsePhoenixFormResult<T> => {
  const [formData, setFormData] = useState<T>({
    ...(defaultValues || {})
  } as T);

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: ['checkbox', 'radio'].includes(e.target.type)
        ? (e.target as HTMLInputElement).checked
        : e.target.value
    });
  };

  const setValue = (values: Partial<T>) => {
    setFormData({
      ...formData,
      ...values
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ formData });
  };
  return { formData, setFormData, setValue, onChange, onSubmit };
};

export default usePhoenixForm;
