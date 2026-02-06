"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LoyaltyPage() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState("Bronze");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) router.push('/catalogue');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-8 text-white mb-6">
            <h1 className="text-3xl font-bold mb-2">Loyalty Rewards</h1>
            <p className="text-lg mb-6">Earn points on every purchase</p>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-4xl font-bold">{points}</div>
                <div className="text-sm opacity-90">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{tier}</div>
                <div className="text-sm opacity-90">Current Tier</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
            <h2 className="text-2xl font-bold mb-4">How it Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">🛒</div>
                <div>
                  <h3 className="font-bold">Shop & Earn</h3>
                  <p className="text-gray-600">Earn 1 point for every ₹100 spent</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">🎁</div>
                <div>
                  <h3 className="font-bold">Redeem Rewards</h3>
                  <p className="text-gray-600">Use points for discounts on future orders</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">⭐</div>
                <div>
                  <h3 className="font-bold">Tier Benefits</h3>
                  <p className="text-gray-600">Unlock exclusive perks as you level up</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Membership Tiers</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border-2 border-orange-300 rounded-lg p-4">
                <div className="text-3xl mb-2">🥉</div>
                <h3 className="font-bold text-lg">Bronze</h3>
                <p className="text-sm text-gray-600">0-999 points</p>
              </div>
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <div className="text-3xl mb-2">🥈</div>
                <h3 className="font-bold text-lg">Silver</h3>
                <p className="text-sm text-gray-600">1000-4999 points</p>
              </div>
              <div className="border-2 border-yellow-300 rounded-lg p-4">
                <div className="text-3xl mb-2">🥇</div>
                <h3 className="font-bold text-lg">Gold</h3>
                <p className="text-sm text-gray-600">5000+ points</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
