import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useNotification } from '../../context/NotificationContext';

const GlobalToast = () => {
  const { notification, hideNotification } = useNotification();

  // If there's no message to display, don't render the container (avoids invisible overlays blocking clicks)
  if (!notification.message && !notification.show) return null;

  return (
    <ToastContainer 
      position="top-end" 
      className="p-3" 
      style={{ zIndex: 9999, position: 'fixed' }}
    >
      <Toast 
        show={notification.show} 
        onClose={hideNotification} 
        delay={4000} 
        autohide
        bg={notification.variant}
      >
        <Toast.Header>
          <strong className="me-auto">
            {notification.variant === 'danger' ? 'Error' : 'Notification'}
          </strong>
        </Toast.Header>
        <Toast.Body className={notification.variant === 'light' ? 'text-dark' : 'text-white'}>
          {notification.message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default GlobalToast;