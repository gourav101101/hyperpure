"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export default function LiveNotifications({
  userType,
  userId,
  trigger = 'bell',
  buttonClassName = ''
}: {
  userType: 'admin' | 'seller' | 'customer';
  userId?: string;
  trigger?: 'bell' | 'chevron';
  buttonClassName?: string;
}) {
  const router = useRouter();
  const resolvedUserId = userType === 'admin' ? 'admin' : userId;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!resolvedUserId) return;
    
    fetchNotifications();

    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let socketInstance: ReturnType<typeof io> | null = null;

    const setupRealtime = async () => {
      await fetch('/api/socket');

      socketInstance = io({
        path: '/api/socket/io',
        addTrailingSlash: false,
      });

      socketInstance.on('connect', () => {
        socketInstance?.emit('join', { userId: resolvedUserId, userType });
      });

      socketInstance.on('notification', (data: Notification) => {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    };

    setupRealtime();
    pollingTimer = setInterval(fetchNotifications, 20000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    window.addEventListener('focus', fetchNotifications);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
      socketInstance?.disconnect();
      window.removeEventListener('focus', fetchNotifications);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resolvedUserId, userType]);

  const fetchNotifications = async () => {
    try {
      if (!resolvedUserId) return;
      const res = await fetch(`/api/notifications?userId=${resolvedUserId}&userType=${userType}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_order': case 'order_status': return '🛒';
      case 'payout': return '💰';
      case 'low_stock': return '📦';
      case 'price_alert': return '💲';
      case 'review': return '⭐';
      case 'performance': return '📈';
      case 'bulk_order': return '📋';
      default: return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${buttonClassName}`}
        aria-expanded={showPanel}
        aria-label="Toggle notifications"
      >
        {trigger === 'chevron' ? (
          <svg
            viewBox="0 0 20 20"
            className={`h-4 w-4 text-gray-400 transition-transform ${showPanel ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path
              d="M5.5 7.5l4.5 4.5 4.5-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)}></div>
          <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border z-50 max-h-[600px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-xl">
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                <p className="text-xs opacity-90">{unreadCount} unread</p>
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">
                  Mark all read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-5xl mb-3">🔔</div>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      markAsRead(notif._id);
                      if (notif.actionUrl) router.push(notif.actionUrl);
                      setShowPanel(false);
                    }}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
                          {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        {notif.imageUrl && (
                          <img
                            src={notif.imageUrl}
                            alt="Notification"
                            className="mt-2 w-full h-24 object-cover rounded-lg border"
                          />
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
