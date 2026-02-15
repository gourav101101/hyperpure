import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export function useNotifications(userId: string | null, userType: 'customer' | 'seller' | 'admin') {
  const resolvedUserId = userType === 'admin' ? 'admin' : userId;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!resolvedUserId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${resolvedUserId}&userType=${userType}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [resolvedUserId, userType]);

  useEffect(() => {
    if (!resolvedUserId) return;

    loadNotifications();
    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let socketInstance: ReturnType<typeof io> | null = null;

    const setupRealtime = async () => {
      await fetch('/api/socket');

      socketInstance = io({ path: '/api/socket' });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        socketInstance?.emit('join', { userId: resolvedUserId, userType });
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('notification', (newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo.png'
          });
        }
      });
    };

    setupRealtime();
    pollingTimer = setInterval(loadNotifications, 20000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    };

    window.addEventListener('focus', loadNotifications);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
      socketInstance?.disconnect();
      window.removeEventListener('focus', loadNotifications);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resolvedUserId, userType, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId, isRead: true })
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!resolvedUserId) return;
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true, userId: resolvedUserId, userType })
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission
  };
}
