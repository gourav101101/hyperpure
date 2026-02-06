"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, [filter]);

  const fetchPayouts = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/payouts?status=${filter}`);
    if (res.ok) {
      const data = await res.json();
      setPayouts(data.payouts || []);
    }
    setLoading(false);
  };

  const generatePayouts = async () => {
    if (!confirm('Generate payouts for last week?')) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Generated ${data.count} payouts`);
        fetchPayouts();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to generate payouts');
    }
    setGenerating(false);
  };

  const updatePayout = async (payoutId: string, status: string, transactionId?: string) => {
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, status, transactionId })
      });
      if (res.ok) {
        toast.success(`Payout ${status}`);
        fetchPayouts();
        setShowModal(false);
      } else {
        toast.error('Failed to update payout');
      }
    } catch (error) {
      toast.error('Update failed');
    }
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

  const stats = {
    pending: payouts.filter(p => p.status === 'pending').length,
    processing: payouts.filter(p => p.status === 'processing').length,
    completed: payouts.filter(p => p.status === 'completed').length,
    totalAmount: payouts.reduce((sum, p) => sum + (p.netPayout || 0), 0)
  };

  return (
    <>
          <div className="flex items-center justify-end mb-6">
            <button 
              onClick={generatePayouts}
              disabled={generating}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold disabled:bg-gray-400"
            >
              {generating ? 'Generating...' : '🔄 Generate Payouts'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-600 mb-1">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border mb-6">
            <div className="px-6 py-4 border-b flex gap-2">
              {['all', 'pending', 'processing', 'completed', 'failed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === status ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-16 text-center text-gray-600">Loading payouts...</div>
            ) : payouts.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-xl font-bold mb-2">No payouts found</h3>
                <p className="text-gray-600">Generate payouts to see them here</p>
              </div>
            ) : (
              <div className="divide-y">
                {payouts.map((payout) => (
                  <div key={payout._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-gray-900">
                            {payout.sellerId?.businessName || 'Unknown Seller'}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(payout.status)}`}>
                            {payout.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Week {payout.weekNumber} • {new Date(payout.periodStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(payout.periodEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{payout.netPayout.toFixed(0)}</p>
                        <p className="text-xs text-gray-500">{payout.totalOrders} orders</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg text-sm mb-3">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Gross Revenue</p>
                        <p className="font-bold">₹{payout.grossRevenue.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Commission</p>
                        <p className="font-bold text-orange-600">-₹{payout.platformCommission.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Net Payout</p>
                        <p className="font-bold text-green-600">₹{payout.netPayout.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {payout.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updatePayout(payout._id, 'processing')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayout(payout);
                              setShowModal(true);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {payout.status === 'processing' && (
                        <button
                          onClick={() => {
                            const txnId = prompt('Enter transaction ID:');
                            if (txnId) updatePayout(payout._id, 'completed', txnId);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                        >
                          Mark as Paid
                        </button>
                      )}
                      {payout.status === 'completed' && payout.paidAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>✅</span>
                          <span>Paid on {new Date(payout.paidAt).toLocaleDateString('en-IN')}</span>
                          {payout.transactionId && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">TXN: {payout.transactionId}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Payout</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject payout for {selectedPayout.sellerId?.businessName}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  updatePayout(selectedPayout._id, 'failed');
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Reject
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
