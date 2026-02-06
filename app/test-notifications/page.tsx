"use client";
import { sendNotification } from '@/lib/notifications';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TestNotifications() {
  const [loading, setLoading] = useState(false);

  const testNotification = async (type: 'admin' | 'seller' | 'customer') => {
    setLoading(true);
    try {
      await sendNotification({
        userType: type,
        type: 'system',
        title: `Test ${type} Notification`,
        message: `This is a test notification for ${type}`,
        link: type === 'admin' ? '/admin/dashboard' : type === 'seller' ? '/seller/dashboard' : '/catalogue'
      });
      toast.success(`Notification sent to ${type}!`);
    } catch (error) {
      toast.error('Failed to send notification');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Notifications Test</h1>
          <p className="text-gray-600">Test Socket.IO live notifications</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => testNotification('admin')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            🎯 Send to Admin
          </button>

          <button
            onClick={() => testNotification('seller')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            👤 Send to Seller
          </button>

          <button
            onClick={() => testNotification('customer')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            🛒 Send to Customer
          </button>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-bold text-yellow-800 mb-2">📝 Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Open admin dashboard in another tab</li>
            <li>2. Click "Send to Admin" button</li>
            <li>3. Watch the notification appear in real-time!</li>
            <li>4. Check the bell icon for notification count</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-bold text-blue-800 mb-2">✨ Features:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Real-time Socket.IO notifications</li>
            <li>• Toast notifications with Sonner</li>
            <li>• Notification panel with history</li>
            <li>• Live connection status indicator</li>
            <li>• Unread count badge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
