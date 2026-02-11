"use client";
import { SessionProvider } from "next-auth/react";
import GoogleOneTap from "../components/GoogleOneTap";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GoogleOneTap />
      {children}
    </SessionProvider>
  );
}
