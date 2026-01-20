import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    message: string,
    duration: number = 3000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    return addNotification('success', message, duration);
  }, [addNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    return addNotification('error', message, duration);
  }, [addNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    return addNotification('warning', message, duration);
  }, [addNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return addNotification('info', message, duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}