"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";

export default function RequestProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [productName, setProductName] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!productName.trim()) {
      alert('Please enter product name');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/product-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          productName,
          productDetails
        })
      });
      
      if (res.ok) {
        alert('Product request submitted successfully!');
        router.back();
      }
    } catch (error) {
      alert('Failed to submit request');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Request a product</h1>
          <p className="text-gray-600 mb-8">Tell us if you can't find a product and we will add it to the shop as soon as possible.</p>
          
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6 max-w-2xl">
            <div className="mb-6">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-700 mb-2 block">Tell us more about the product <span className="text-gray-400">(optional)</span></label>
              <textarea
                value={productDetails}
                onChange={(e) => setProductDetails(e.target.value)}
                placeholder="Add brand name, pack size, expected price..."
                className="w-full px-4 py-3 border rounded-lg h-32 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={() => router.back()}
                className="flex-1 border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
      <Footer />
    </div>
  );
}
