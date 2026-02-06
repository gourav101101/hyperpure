"use client";
import { useEffect, useState } from "react";

export default function SellerPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [pendingPayout, setPendingPayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch(`/api/seller/payouts?sellerId=${sellerId}`);
    if (res.ok) {
      const data = await res.json();
      setPayouts(data.payouts || []);
      setPendingPayout(data.pendingPayout);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      on_hold: 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="p-8">Loading payouts...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>
        <p className="text-sm text-gray-600 mt-1">Track your weekly earnings and payment history</p>
      </div>

      {/* Pending Payout Card */}
      {pendingPayout && (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Current Week Earnings</p>
              <p className="text-4xl font-bold mb-2">₹{pendingPayout.amount.toFixed(0)}</p>
              <p className="text-sm opacity-90">
                {pendingPayout.orders} orders • Payout on Monday
              </p>
            </div>
            <div className="text-6xl opacity-20">💰</div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span className="opacity-75">Week started:</span>
              <span>{new Date(pendingPayout.weekStart).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex justify-between text-xs mt-2 opacity-75">
              <span>⚠️ Orders held for 24hrs after delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <h3 className="font-bold text-gray-900">Payout History</h3>
        </div>
        
        {payouts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2">No payouts yet</h3>
            <p className="text-gray-600">Your first payout will appear here after completing orders</p>
          </div>
        ) : (
          <div className="divide-y">
            {payouts.map((payout) => (
              <div key={payout._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900">
                        Week {payout.weekNumber || new Date(payout.periodStart).getWeek()}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(payout.status)}`}>
                        {payout.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(payout.periodStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(payout.periodEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{payout.netPayout.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">{payout.totalOrders} orders</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">You Receive</p>
                    <p className="font-bold text-green-600">₹{payout.grossRevenue.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Platform Fee ({((payout.platformCommission / payout.grossRevenue) * 100).toFixed(1)}%)</p>
                    <p className="font-bold text-orange-600">₹{payout.platformCommission.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Customer Paid</p>
                    <p className="font-bold text-blue-600">₹{(payout.grossRevenue + payout.platformCommission).toFixed(0)}</p>
                  </div>
                </div>

                {payout.status === 'completed' && payout.paidAt && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <span>✅</span>
                    <span>Paid on {new Date(payout.paidAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    {payout.transactionId && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">TXN: {payout.transactionId}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">How Payouts Work</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Payouts are processed every Monday for the previous week</li>
              <li>• Orders are held for 24 hours after delivery before payout</li>
              <li>• Commission is automatically deducted based on your tier</li>
              <li>• Payments are transferred to your registered bank account</li>
              <li>• You'll receive an email notification when payout is processed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to get week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
};
