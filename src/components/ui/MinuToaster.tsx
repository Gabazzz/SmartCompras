import { Toaster } from 'react-hot-toast';

export function MinuToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2800,
        style: {
          background: 'rgba(16, 21, 29, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#F0F4FF',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          fontWeight: '400',
          borderRadius: '14px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          maxWidth: '320px',
        },
      }}
    />
  );
}
