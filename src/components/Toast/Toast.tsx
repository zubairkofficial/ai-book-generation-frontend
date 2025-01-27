// src/components/Toast.tsx
import React, { useEffect } from 'react';
import './Toast.css';

type ToastProps = {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {message}
      <button onClick={onClose} className="toast-close-button">
        &times;
      </button>
    </div>
  );
};

export default Toast;