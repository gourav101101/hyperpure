'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">We use cookies to improve your experience.</p>
        <button onClick={accept} className="px-4 py-2 bg-white text-gray-900 rounded">
          Accept
        </button>
      </div>
    </div>
  );
}
