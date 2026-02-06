"use client";
import { useEffect, useState } from "react";

export default function CommissionAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/analytics?period=${period}`);
    if (res.ok) {
      const data = await res.json();
      setAnalytics(data);
    }
    setLoading(false);
  };

  if (loading || !analytics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Commission Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">Track platform revenue and commission trends</p>
            </div>
            <div className="flex gap-2">
              {['day', 'week', 'month', 'year'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    period === p ? 'bg-red-500 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Total Commission</p>
              <p className="text-3xl font-bold">₹{analytics.totalCommission.toFixed(0)}</p>
              <p className="text-xs opacity-75 mt-2">{analytics.totalOrders} orders</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">₹{analytics.totalRevenue.toFixed(0)}</p>
              <p className="text-xs opacity-75 mt-2">Gross sales</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Commission Rate</p>
              <p className="text-3xl font-bold">{analytics.commissionRate}%</p>
              <p className="text-xs opacity-75 mt-2">Average rate</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Pending Payouts</p>
              <p className="text-3xl font-bold">₹{analytics.payoutStats.pending.toFixed(0)}</p>
              <p className="text-xs opacity-75 mt-2">To be paid</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Payout Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Pending</span>
                  </div>
                  <span className="font-bold text-yellow-700">₹{analytics.payoutStats.pending.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Processing</span>
                  </div>
                  <span className="font-bold text-blue-700">₹{analytics.payoutStats.processing.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Completed</span>
                  </div>
                  <span className="font-bold text-green-700">₹{analytics.payoutStats.completed.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Top Sellers by Commission</h3>
              <div className="space-y-2">
                {analytics.topSellers.slice(0, 5).map((seller: any, idx: number) => (
                  <div key={seller.sellerId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{seller.sellerId.slice(-6)}</p>
                        <p className="text-xs text-gray-500">{seller.orders} orders</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">₹{seller.commission.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Commission Trend</h3>
            <div className="h-64 flex items-end gap-2">
              {analytics.chartData.map((data: any) => {
                const maxCommission = Math.max(...analytics.chartData.map((d: any) => d.commission));
                const height = (data.commission / maxCommission) * 100;
                return (
                  <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-all relative group" style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        ₹{data.commission.toFixed(0)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                      {new Date(data.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
    </>
  );
}
