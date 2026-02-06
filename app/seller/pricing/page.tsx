"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SellerPricing() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch(`/api/pricing?sellerId=${sellerId}`);
    if (res.ok) {
      const data = await res.json();
      setInsights(data.insights || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    return {
      high: 'bg-red-100 text-red-700 border-red-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      good: 'bg-green-100 text-green-700 border-green-200'
    }[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    return {
      high: '⬆️',
      low: '⬇️',
      good: '✅'
    }[status] || '📊';
  };

  if (loading) {
    return <div className="p-8">Loading pricing insights...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing Intelligence</h2>
          <p className="text-sm text-gray-600 mt-1">Compare your prices with competitors</p>
        </div>
        <button onClick={fetchInsights} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
          🔄 Refresh
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">No pricing data yet</h3>
          <p className="text-gray-600 mb-6">Add products to see competitive pricing insights</p>
          <Link href="/seller/products" className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
            Add Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.productId} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{insight.productName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(insight.status)}`}>
                      {getStatusIcon(insight.status)} {insight.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      Rank #{insight.pricePosition} of {insight.totalSellers} sellers
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Your Price</p>
                  <p className="text-3xl font-bold text-blue-600">₹{insight.myPrice}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Lowest Price</p>
                  <p className="text-lg font-bold text-green-600">₹{insight.minPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Average Price</p>
                  <p className="text-lg font-bold text-gray-900">₹{insight.avgPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Highest Price</p>
                  <p className="text-lg font-bold text-red-600">₹{insight.maxPrice}</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                insight.status === 'high' ? 'bg-red-50 border-red-200' :
                insight.status === 'low' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                <p className="text-sm font-medium text-gray-900">
                  💡 {insight.recommendation}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {insight.competitors} competitors selling this product
                </p>
                <Link 
                  href="/seller/products" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Update Price →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Pricing Tips</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Price within 15% of average for best sales</li>
              <li>• Lower prices = more orders but lower margins</li>
              <li>• Higher prices = fewer orders but better margins</li>
              <li>• Monitor competitors and adjust regularly</li>
              <li>• Premium tier sellers can charge slightly higher</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
