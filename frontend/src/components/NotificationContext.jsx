import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    variant: 'success', // 'success', 'danger', 'warning', 'info'
  });

  const showNotification = useCallback((message, variant = 'success') => {
    setNotification({
      show: true,
      message,
      variant,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  const value = {
    notification,
    showNotification,
    hideNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};