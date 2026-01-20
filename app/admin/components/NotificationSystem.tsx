"use client";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration || 3000);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500 border-green-600';
      case 'error': return 'bg-red-500 border-red-600';
      case 'warning': return 'bg-yellow-500 border-yellow-600';
      case 'info': return 'bg-blue-500 border-blue-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div className="fixed top-24 right-8 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getColors(notification.type)} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 animate-slide-in flex items-center gap-3 min-w-[300px]`}
        >
          <span className="text-lg font-bold">{getIcon(notification.type)}</span>
          <span className="flex-1 font-medium">{notification.message}</span>
          <button
            onClick={() => onRemove(notification.id)}
            className="text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}