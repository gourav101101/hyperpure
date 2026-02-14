'use client';

import { useEffect } from 'react';
import { useNotification } from '@/hooks/useNotification';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token } = useNotification();

  useEffect(() => {
    if (token) {
      // Send token to your backend to store
      fetch('/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    }
  }, [token]);

  return <>{children}</>;
}
