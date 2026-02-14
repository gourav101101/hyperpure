import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "sonner";
import { SocketProvider } from "./context/SocketContext";
import { ReduxProvider } from "./store/ReduxProvider";
import { ReactQueryProvider } from "@/lib/ReactQueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import NotificationProvider from "./components/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hyperpure - Quality Ingredients for Restaurants",
  description: "Fresh produce, meats, and supplies delivered to your doorstep",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ReduxProvider>
            <ReactQueryProvider>
              <SocketProvider>
                <CartProvider>
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
                </CartProvider>
                <Toaster position="top-right" richColors />
              </SocketProvider>
            </ReactQueryProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
