"use client";
import { useEffect, useState } from "react";

export default function AdminBulkOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [quoteForm, setQuoteForm] = useState<any>({});

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    const status = filter === 'all' ? '' : filter;
    const res = await fetch(`/api/bulk-orders?status=${status}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  };

  const updateStatus = async (id: string, status: string, negotiatedPrices?: any) => {
    const res = await fetch('/api/bulk-orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, negotiatedPrices })
    });
    if (res.ok) {
      fetchOrders();
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-blue-100 text-blue-700',
      quoted: 'bg-purple-100 text-purple-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatAmount = (value: any) => Number(value ?? 0).toFixed(0);

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    under_review: orders.filter(o => o.status === 'under_review').length,
    quoted: orders.filter(o => o.status === 'quoted').length
  };

  return (
    <>
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Orders (B2B)</h2>
          <p className="text-sm text-gray-600 mt-1">Manage restaurant & business orders</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-red-500 text-white' : 'bg-white border'}`}>
          All ({stats.all})
        </button>
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white border'}`}>
          New ({stats.pending})
        </button>
        <button onClick={() => setFilter('under_review')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'under_review' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
          Under Review ({stats.under_review})
        </button>
        <button onClick={() => setFilter('quoted')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'quoted' ? 'bg-purple-500 text-white' : 'bg-white border'}`}>
          Quoted ({stats.quoted})
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border">
          <h3 className="text-xl font-bold mb-2">No bulk orders yet</h3>
          <p className="text-gray-600">Bulk order requests will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const displayAmount = formatAmount(order.finalAmount ?? order.totalAmount);
            return (
              <div key={order._id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{order.businessName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.businessType} - {order.deliveryFrequency}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">Rs. {displayAmount}</p>
                    <p className="text-xs text-gray-500">{items.length} items</p>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  {items.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">+{items.length - 3} more items</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button onClick={() => updateStatus(order._id, 'under_review')} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600">
                      Start Review
                    </button>
                  )}
                  {order.status === 'under_review' && (
                    <button onClick={() => setSelectedOrder(order)} className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-bold hover:bg-purple-600">
                      Send Quote
                    </button>
                  )}
                  <button onClick={() => setSelectedOrder(order)} className="px-6 py-2 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Bulk Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">x</button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-bold mb-3">Business Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Business Name</p>
                    <p className="font-medium">{selectedOrder.businessName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium capitalize">{selectedOrder.businessType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contact</p>
                    <p className="font-medium">{selectedOrder.deliveryAddress?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery Frequency</p>
                    <p className="font-medium capitalize">{selectedOrder.deliveryFrequency}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3">Items Requested</h3>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                        {item.notes && <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>}
                      </div>
                      {selectedOrder.status === 'under_review' && (
                        <input
                          type="number"
                          placeholder="Quote price"
                          className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg"
                          onChange={(e) => setQuoteForm({...quoteForm, [idx]: parseFloat(e.target.value)})}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold mb-2">Delivery Address</h3>
                <p className="text-sm">{selectedOrder.deliveryAddress?.address}</p>
                <p className="text-sm">{selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</p>
              </div>

              {selectedOrder.status === 'under_review' && (
                <button
                  onClick={() => updateStatus(selectedOrder._id, 'quoted', Object.values(quoteForm))}
                  className="w-full bg-purple-500 text-white py-3 rounded-lg font-bold hover:bg-purple-600"
                >
                  Send Quote to Customer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
