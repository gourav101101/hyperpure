"use client";

export type SellerSession = {
  sellerId: string | null;
  userRole: string | null;
  isLoggedIn: boolean;
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

export function getSellerSession(): SellerSession {
  if (typeof window === "undefined") {
    return { sellerId: null, userRole: null, isLoggedIn: false };
  }

  const sellerId = localStorage.getItem("sellerId") || getCookieValue("sellerId");
  const userRole = localStorage.getItem("userRole") || getCookieValue("userRole");
  const isLoggedInValue = localStorage.getItem("isLoggedIn") || getCookieValue("isLoggedIn");
  const isLoggedIn = isLoggedInValue === "true";

  return { sellerId, userRole, isLoggedIn };
}

export function clearSellerSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("sellerId");
  localStorage.removeItem("userPhone");

  document.cookie = "sellerId=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "userRole=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax";
}

export function setSellerSessionCookies(sellerId: string) {
  if (typeof window === "undefined") return;
  document.cookie = `sellerId=${encodeURIComponent(sellerId)}; Path=/; SameSite=Lax`;
  document.cookie = "userRole=seller; Path=/; SameSite=Lax";
  document.cookie = "isLoggedIn=true; Path=/; SameSite=Lax";
}
