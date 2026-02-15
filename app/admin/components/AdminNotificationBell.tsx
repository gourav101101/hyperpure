"use client";
import { useNotifications } from '@/app/hooks/useNotifications';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNotificationBell({ adminId }: { adminId: string }) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotifications(adminId, 'admin');

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_seller': return '👤';
      case 'new_order': return '🛒';
      case 'payout_request': return '💰';
      case 'low_stock': return '⚠️';
      case 'bulk_order': return '📋';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {isConnected && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold">Admin Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      markAsRead(notif._id);
                      if (notif.actionUrl) router.push(notif.actionUrl);
                      setShowDropdown(false);
                    }}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex gap-2">
                      <span className="text-xl">{getIcon(notif.type)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold text-sm">{notif.title}</p>
                          {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
