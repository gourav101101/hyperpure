'use client';

import { useEffect } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { getSellerSession } from '@/app/seller/utils/session';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token } = useNotification();
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (token) {
      const payload: Record<string, string> = { token };

      if (pathname?.startsWith('/seller')) {
        const sellerSession = getSellerSession();
        if (sellerSession.sellerId) {
          payload.userType = 'seller';
          payload.userId = sellerSession.sellerId;
        }
      } else {
        payload.userType = 'customer';
        const sessionUserId = (session?.user as any)?.id as string | undefined;
        const isObjectId = !!sessionUserId && /^[a-fA-F0-9]{24}$/.test(sessionUserId);
        if (isObjectId) {
          payload.userId = sessionUserId;
        } else if (session?.user?.email) {
          payload.email = session.user.email;
        } else if (typeof window !== 'undefined') {
          const userPhone = localStorage.getItem('userPhone');
          if (userPhone) payload.phoneNumber = userPhone;
        }
      }

      if (!payload.userId && !payload.email && !payload.phoneNumber) return;

      fetch('/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            console.error('FCM token registration failed:', data?.error || res.statusText);
          }
        })
        .catch((error) => {
          console.error('FCM token registration error:', error);
        });
    }
  }, [token, session, pathname]);

  return <>{children}</>;
}
