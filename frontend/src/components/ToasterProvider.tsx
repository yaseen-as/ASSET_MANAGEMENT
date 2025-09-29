import React from 'react';
import { Toaster } from 'sonner';

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        closeButton
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(224 71.4% 4.1%)',
            border: '1px solid hsl(215 27.9% 16.9%)',
            color: 'hsl(210 20% 98%)',
          },
          className: 'my-toast',
          duration: 4000,
        }}
        icons={{
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️',
          loading: '⏳',
        }}
      />
    </>
  );
};

export default ToasterProvider;