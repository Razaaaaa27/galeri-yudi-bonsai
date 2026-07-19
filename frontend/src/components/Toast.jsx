import { useState, useEffect, useCallback } from 'react';

let toastSingleton = null;

/**
 * Hook to use the toast notification
 */
export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return { toast, showToast };
}

/**
 * Toast component — render once in App
 */
export default function Toast({ message, type = 'success', visible }) {
  return (
    <div className={`toast ${visible ? 'active' : ''} ${type === 'error' ? 'toast--error' : ''}`}>
      <span className="toast__icon">{type === 'error' ? '✕' : '✓'}</span>
      <span className="toast__text">{message}</span>
    </div>
  );
}
