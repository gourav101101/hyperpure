"use client";

export type AdminSession = {
  adminAuth: boolean;
};

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map(part => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

export function getAdminSession(): AdminSession {
  if (typeof window === "undefined") return { adminAuth: false };
  const auth = localStorage.getItem("adminAuth") || getCookieValue("adminAuth");
  return { adminAuth: auth === "true" };
}

export function setAdminSessionCookies() {
  if (typeof window === "undefined") return;
  document.cookie = "adminAuth=true; Path=/; SameSite=Lax";
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("adminAuth");
  document.cookie = "adminAuth=; Path=/; Max-Age=0; SameSite=Lax";
}
