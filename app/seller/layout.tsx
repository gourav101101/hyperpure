"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SellerHeader from "./components/SellerHeader";
import SellerSidebar from "./components/SellerSidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sellerData, setSellerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    const sellerId = localStorage.getItem('sellerId');

    if (!isLoggedIn || userRole !== 'seller' || !sellerId) {
      router.push('/register-seller');
      return;
    }

    fetchSellerData(sellerId);
  }, [router]);

  const fetchSellerData = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/seller/dashboard?sellerId=${sellerId}`);
      const data = await res.json();
      if (data.seller) {
        setSellerData(data);
      }
    } catch (error) {
      console.error('Failed to fetch seller data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600">Error loading data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerSidebar />
      <SellerHeader sellerName={sellerData.seller.name} sellerId={sellerData.seller.id} />
      <main className="ml-64 pt-[73px]">
        {children}
      </main>
    </div>
  );
}
