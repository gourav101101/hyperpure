'use client';

import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import toast from 'react-hot-toast';

export const useNotification = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
          const messagingInstance = await messaging();
          if (messagingInstance) {
            const fcmToken = await getToken(messagingInstance, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });
            setToken(fcmToken);
            
            // Listen for foreground messages
            onMessage(messagingInstance, (payload) => {
              toast.success(payload.notification?.title || 'New notification', {
                description: payload.notification?.body
              });
            });
          }
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    };

    requestPermission();
  }, []);

  return { token, notificationPermission };
};
