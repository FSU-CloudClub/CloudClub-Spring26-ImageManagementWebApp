import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useNotification } from './NotificationContext';

/**
 * GlobalToast — renders a single auto-hiding Bootstrap toast in the top-right.
 * Controlled entirely by NotificationContext — no local state here.
 * Drop this once inside your app layout (outside any screen component)
 * and call showNotification() from anywhere in the tree.
 */
const GlobalToast = () => {
    const { notification, hideNotification } = useNotification();

    // Don't render at all when idle — avoids invisible overlay blocking clicks
    if (!notification.show && !notification.message) return null;

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
                <Toast.Body className="text-white">
                    {notification.message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default GlobalToast;