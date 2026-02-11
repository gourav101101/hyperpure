"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function GoogleOneTap() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) return; // Don't show if already logged in

    const initializeGoogleOneTap = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: false,
        });

        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          }
        });
      }
    };

    const handleCredentialResponse = async (response: any) => {
      try {
        const res = await fetch("/api/auth/google-one-tap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        
        if (res.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error("One Tap sign-in failed:", error);
      }
    };

    // Wait for Google script to load
    const checkGoogleLoaded = setInterval(() => {
      if ((window as any).google) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleOneTap();
      }
    }, 100);

    return () => clearInterval(checkGoogleLoaded);
  }, [session]);

  return null;
}
