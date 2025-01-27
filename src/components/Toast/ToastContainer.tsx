// src/components/ToastContainer.tsx
import React from 'react';
import Toast from './Toast';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/context/ToastContext'; // Import ToastType

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast(); // Use the useToast hook

  return (
    <div className="toast-container">
      {toasts.map((toast: ToastType) => ( // Use ToastType for type safety
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;