"use client";
import { useEffect, useState } from "react";

export default function SellerPerformanceDashboard({ sellerId }: { sellerId: string }) {
  const [performance, setPerformance] = useState<any>(null);
  const [commission, setCommission] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [sellerId]);

  const fetchData = async () => {
    const [perfRes, commRes] = await Promise.all([
      fetch(`/api/seller/performance?sellerId=${sellerId}`),
      fetch("/api/seller/commission")
    ]);

    if (perfRes.ok) setPerformance(await perfRes.json());
    if (commRes.ok) setCommission(await commRes.json());
  };

  if (!performance) return <div className="p-6 text-center">Loading performance...</div>;

  const safeNumber = (value: any, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

  const qualityScore = safeNumber(performance.qualityScore, 0);
  const fulfillmentRate = safeNumber(performance.fulfillmentRate, 0);
  const cancellationRate = safeNumber(performance.cancellationRate, 0);
  const avgDeliveryTime = safeNumber(performance.avgDeliveryTime, 0);
  const stockAccuracy = safeNumber(performance.stockAccuracy, 0);
  const totalOrders = safeNumber(performance.totalOrders, 0);
  const totalRevenue = safeNumber(performance.totalRevenue, 0);
  const totalCommissionPaid = safeNumber(performance.totalCommissionPaid, 0);

  const tierInfo = {
    premium: { color: "from-yellow-400 to-yellow-600", label: "Premium Seller" },
    standard: { color: "from-blue-400 to-blue-600", label: "Standard Seller" },
    new: { color: "from-gray-400 to-gray-600", label: "New Seller" }
  };

  const currentTier = tierInfo[performance.tier as keyof typeof tierInfo];
  const commissionRate = commission?.commissionRate || 10;

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r ${currentTier.color} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h3 className="text-2xl font-bold">{currentTier.label}</h3>
                <p className="text-sm opacity-90">Your current tier status</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <p className="text-xs opacity-80">Commission Rate</p>
                <p className="text-xl font-bold">{commissionRate}%</p>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <p className="text-xs opacity-80">Total Orders</p>
                <p className="text-xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80 mb-1">Quality Score</p>
            <div className="text-4xl font-bold">{qualityScore.toFixed(1)}/5</div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i <= qualityScore ? "text-yellow-300" : "text-white/30"}>*</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${fulfillmentRate >= 95 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
              {fulfillmentRate >= 95 ? "Excellent" : "Good"}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fulfillmentRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">Fulfillment Rate</p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${cancellationRate <= 2 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {cancellationRate <= 2 ? "Low" : "High"}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cancellationRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">Cancellation Rate</p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{avgDeliveryTime}h</p>
          <p className="text-xs text-gray-600">Avg Delivery Time</p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{stockAccuracy.toFixed(0)}%</p>
          <p className="text-xs text-gray-600">Stock Accuracy</p>
        </div>
      </div>

      {performance.tier !== "premium" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-gray-900 mb-3">Path to {performance.tier === "new" ? "Standard" : "Premium"} Tier</h4>
          <div className="space-y-3">
            {performance.tier === "new" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Complete 50 orders</span>
                  <span className="text-sm font-bold">{totalOrders}/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((totalOrders / 50) * 100, 100)}%` }}></div>
                </div>
              </>
            )}
            {performance.tier === "standard" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fulfillment Rate at least 95%</span>
                  <span className={`text-sm font-bold ${fulfillmentRate >= 95 ? "text-green-600" : "text-orange-600"}`}>
                    {fulfillmentRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancellation Rate at most 2%</span>
                  <span className={`text-sm font-bold ${cancellationRate <= 2 ? "text-green-600" : "text-red-600"}`}>
                    {cancellationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quality Score at least 4.5</span>
                  <span className={`text-sm font-bold ${qualityScore >= 4.5 ? "text-green-600" : "text-orange-600"}`}>
                    {qualityScore.toFixed(1)}/5
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4">Financial Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">Rs. {totalRevenue.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Commission Paid ({commissionRate}%)</p>
            <p className="text-2xl font-bold text-orange-600">Rs. {totalCommissionPaid.toFixed(0)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-1">Your Earnings (After Commission)</p>
          <p className="text-3xl font-bold text-blue-600">Rs. {(totalRevenue - totalCommissionPaid).toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}
