import toast, { type ToastOptions } from 'react-hot-toast';

const defaultStyle: React.CSSProperties = {
  background: '#ffffff',
  color: '#1f2937',
  border: '1px solid #f3f4f6',
  padding: '12px 16px',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  maxWidth: '400px',
};

export const showToast = {
  // 1. SUKSES
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...options,
      style: { ...defaultStyle, borderLeft: '4px solid #10B981' },
      iconTheme: { primary: '#10B981', secondary: '#fff' },
    });
  },

  // 2. ERROR
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...options,
      style: { ...defaultStyle, borderLeft: '4px solid #EF4444' },
      iconTheme: { primary: '#EF4444', secondary: '#fff' },
    });
  },

  // 3. LOADING
  loading: (message: string = 'Mohon tunggu...', options?: ToastOptions) => {
    return toast.loading(message, {
      ...options,
      style: { ...defaultStyle, borderLeft: '4px solid #3B82F6' },
    });
  },

  // 4. PROMISE (PENTING: Diperlukan untuk ChatPage)
  promise: async <T>(
    promise: Promise<T>,
    messages = {
      loading: 'Sedang memproses...',
      success: 'Berhasil!',
      error: 'Terjadi kesalahan.',
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: defaultStyle,
        success: {
          style: { ...defaultStyle, borderLeft: '4px solid #10B981' },
          iconTheme: { primary: '#10B981', secondary: '#fff' },
        },
        error: {
          style: { ...defaultStyle, borderLeft: '4px solid #EF4444' },
          iconTheme: { primary: '#EF4444', secondary: '#fff' },
        },
        ...options,
      }
    );
  },

  // 5. DISMISS
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};