import { toast } from 'react-hot-toast';

export const showToast = (
  type: 'success' | 'error' | 'info' | 'loading' = 'success',
  message: string,
  duration: number = 3000
) => {
  const toastMap = {
    success: () => toast.success(message, { duration }),
    error: () => toast.error(message, { duration }),
    info: () => toast(message, { duration, icon: 'ℹ️' }),
    loading: () => toast.loading(message, { duration })
  };

  toastMap[type]?.();
};
