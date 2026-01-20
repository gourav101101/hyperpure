"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onLogoutAll?: () => void;
}

export default function LogoutModal({ open, onClose, onLogout, onLogoutAll }: Props) {
  const router = useRouter();

  if (!open) return null;

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userPhone');
      router.push('/');
    }
    onClose();
  };

  const handleLogoutAll = async () => {
    if (onLogoutAll) {
      await onLogoutAll();
    } else {
      // default: clear and redirect
      localStorage.clear();
      router.push('/');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl z-70 max-w-lg w-[90%] p-6 md:p-10 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 4h.01M12 3v4" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Logout of your account?</h2>
          <p className="text-gray-500 mb-6">You can logout from just this device or all devices where you’re signed in</p>

          <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold mb-4">Logout from this device</button>

          <button onClick={handleLogoutAll} className="text-red-500 font-semibold">Logout from all devices</button>
        </div>
      </div>
    </div>
  );
}
