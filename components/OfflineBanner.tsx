'use client';

import { useOnlineStatus } from '@/lib/offline';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
      You are offline. Some features may not work.
    </div>
  );
}
