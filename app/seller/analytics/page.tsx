"use client";
import { useEffect, useState } from "react";

export default function SellerAnalytics() {
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sellerId = localStorage.getItem('sellerId');
    if (sellerId) fetchAnalytics(sellerId);
  }, []);

  const fetchAnalytics = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/seller/products?sellerId=${sellerId}`);
      const data = await res.json();
      const prods = data.products || [];
      setProducts(prods);

      // Fetch market prices for each product
      const marketData = await Promise.all(
        prods.map(async (p: any) => {
          const sellerRes = await fetch(`/api/products/sellers?productId=${p.productId._id}`);
          const sellerData = await sellerRes.json();
          return {
            productId: p.productId._id,
            productName: p.productId.name,
            myPrice: p.sellerPrice,
            sellers: sellerData.sellers || [],
            lowestPrice: sellerData.sellers?.[0]?.sellerPrice || p.sellerPrice,
            avgPrice: sellerData.sellers?.length > 0 
              ? sellerData.sellers.reduce((sum: number, s: any) => sum + s.sellerPrice, 0) / sellerData.sellers.length 
              : p.sellerPrice,
            myRank: sellerData.sellers?.findIndex((s: any) => s._id === p._id) + 1 || 1,
            totalSellers: sellerData.sellers?.length || 1
          };
        })
      );

      const cheapest = marketData.filter(m => m.myRank === 1).length;
      const competitive = marketData.filter(m => m.myPrice <= m.avgPrice).length;
      const expensive = marketData.filter(m => m.myPrice > m.avgPrice).length;

      setAnalytics({ marketData, cheapest, competitive, expensive });
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Price Analytics</h2>
      <p className="text-gray-600 mb-6">See how your prices compare to other sellers</p>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold">{analytics?.cheapest || 0}</div>
          <div className="text-sm opacity-90">Cheapest Price</div>
          <div className="text-xs opacity-75 mt-1">You have the best price</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-bold">{analytics?.competitive || 0}</div>
          <div className="text-sm opacity-90">Competitive</div>
          <div className="text-xs opacity-75 mt-1">Below average price</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-3xl font-bold">{analytics?.expensive || 0}</div>
          <div className="text-sm opacity-90">Above Average</div>
          <div className="text-xs opacity-75 mt-1">Consider reducing price</div>
        </div>
      </div>

      {/* Price Comparison Table */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <h3 className="font-bold text-lg">Product Price Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lowest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics?.marketData.map((item: any) => (
                <tr key={item.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.productName}</div>
                    <div className="text-xs text-gray-500">{item.totalSellers} sellers</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold">₹{item.myPrice}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-green-600">₹{item.lowestPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">₹{item.avgPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">#{item.myRank} of {item.totalSellers}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.myRank === 1 ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">🏆 Best Price</span>
                    ) : item.myPrice <= item.avgPrice ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">💰 Competitive</span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">⚠️ High</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 Pricing Suggestions</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {analytics?.marketData.filter((m: any) => m.myPrice > m.avgPrice).slice(0, 3).map((item: any) => (
            <li key={item.productId}>
              • <strong>{item.productName}</strong>: Consider reducing from ₹{item.myPrice} to ₹{item.avgPrice.toFixed(2)} (market average)
            </li>
          ))}
          {analytics?.marketData.filter((m: any) => m.myPrice > m.avgPrice).length === 0 && (
            <li>✅ Your prices are competitive! Keep up the good work.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
