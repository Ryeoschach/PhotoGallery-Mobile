/**
 * Toast 管理器
 * 全局管理Toast通知的显示和隐藏
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastProps } from '../components/Toast';

interface ToastConfig {
  message: string;
  type?: ToastProps['type'];
  duration?: number;
  position?: ToastProps['position'];
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<(ToastConfig & { visible: boolean }) | null>(null);

  const showToast = useCallback((config: ToastConfig) => {
    setToastConfig({
      ...config,
      visible: true,
    });
  }, []);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    showToast({ message, type: 'success', duration });
  }, [showToast]);

  const showError = useCallback((message: string, duration = 5000) => {
    showToast({ message, type: 'error', duration });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration = 4000) => {
    showToast({ message, type: 'warning', duration });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showToast({ message, type: 'info', duration });
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToastConfig(prev => prev ? { ...prev, visible: false } : null);
  }, []);

  const handleToastHide = useCallback(() => {
    setToastConfig(null);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          visible={toastConfig.visible}
          duration={toastConfig.duration}
          position={toastConfig.position}
          onHide={handleToastHide}
        />
      )}
    </ToastContext.Provider>
  );
};
