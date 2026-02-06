"use client";
import { useEffect, useState } from "react";

export default function SellerAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch(`/api/seller/analytics?sellerId=${sellerId}&period=${period}`);
    if (res.ok) {
      const data = await res.json();
      setAnalytics(data);
    }
    setLoading(false);
  };

  if (loading || !analytics) {
    return <div className="p-8">Loading analytics...</div>;
  }

  const maxRevenue = Math.max(...analytics.revenueChart.map((d: any) => d.revenue), 1);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Track your sales and performance</p>
        </div>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{analytics.summary.totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">₹{analytics.summary.totalRevenue.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold">₹{analytics.summary.avgOrderValue.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Active Products</p>
          <p className="text-3xl font-bold">{analytics.summary.totalProducts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
          {analytics.revenueChart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No data available</div>
          ) : (
            <div className="space-y-2">
              {analytics.revenueChart.map((item: any) => (
                <div key={item.date} className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 w-20">
                    {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">₹{item.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
          {analytics.topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No sales yet</div>
          ) : (
            <div className="space-y-3">
              {analytics.topProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{product.revenue.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📈</span>
            <h4 className="font-bold text-gray-900">Growth Tip</h4>
          </div>
          <p className="text-sm text-gray-700">
            {analytics.summary.totalOrders < 10 
              ? "Add more products to increase visibility"
              : "Keep your stock updated for better sales"}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💰</span>
            <h4 className="font-bold text-gray-900">Revenue Insight</h4>
          </div>
          <p className="text-sm text-gray-700">
            Your average order value is ₹{analytics.summary.avgOrderValue.toFixed(0)}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎯</span>
            <h4 className="font-bold text-gray-900">Performance</h4>
          </div>
          <p className="text-sm text-gray-700">
            {analytics.summary.totalOrders} orders in last {period} days
          </p>
        </div>
      </div>
    </div>
  );
}
