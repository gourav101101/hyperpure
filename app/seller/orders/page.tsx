"use client";
import { useEffect, useState } from "react";

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch(`/api/seller/orders?sellerId=${sellerId}&status=${filter}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch('/api/seller/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sellerId, status })
    });
    if (res.ok) {
      fetchOrders();
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      out_for_delivery: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing' || o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your orders and deliveries</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-red-500 text-white' : 'bg-white border'}`}>
          All ({stats.all})
        </button>
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white border'}`}>
          New ({stats.pending})
        </button>
        <button onClick={() => setFilter('processing')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'processing' ? 'bg-purple-500 text-white' : 'bg-white border'}`}>
          Processing ({stats.processing})
        </button>
        <button onClick={() => setFilter('delivered')} className={`px-4 py-2 rounded-lg font-medium ${filter === 'delivered' ? 'bg-green-500 text-white' : 'bg-white border'}`}>
          Delivered ({stats.delivered})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">Order #{order._id.slice(-6)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString('en-IN', { 
                      dateStyle: 'medium', 
                      timeStyle: 'short' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{order.sellerTotal?.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">You receive</p>
                  {order.totalCommission > 0 && (
                    <p className="text-xs text-blue-600 mt-1">Customer paid: ₹{(order.sellerTotal + order.totalCommission).toFixed(0)}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-2">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">×{item.quantity}</p>
                      <p className="text-sm text-green-600 font-bold">₹{((item.sellerPrice || item.price) * item.quantity).toFixed(0)}</p>
                      {item.commissionAmount > 0 && (
                        <p className="text-xs text-gray-500">Customer: ₹{(((item.sellerPrice || item.price) * item.quantity) + item.commissionAmount).toFixed(0)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-bold text-gray-700 mb-1">DELIVERY ADDRESS</p>
                <p className="text-sm font-medium">{order.deliveryAddress?.name}</p>
                <p className="text-sm text-gray-600">{order.deliveryAddress?.address}</p>
                <p className="text-sm text-gray-600">{order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p>
                <p className="text-sm text-gray-600">📞 {order.deliveryAddress?.phone}</p>
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button onClick={() => updateOrderStatus(order._id, 'processing')} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600">
                    Accept Order
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateOrderStatus(order._id, 'processing')} className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-bold hover:bg-purple-600">
                    Start Processing
                  </button>
                )}
                {order.status === 'processing' && (
                  <button onClick={() => updateOrderStatus(order._id, 'out_for_delivery')} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600">
                    Out for Delivery
                  </button>
                )}
                {order.status === 'out_for_delivery' && (
                  <button onClick={() => updateOrderStatus(order._id, 'delivered')} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600">
                    Mark Delivered
                  </button>
                )}
                <button onClick={() => setSelectedOrder(order)} className="px-6 py-2 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-bold">#{selectedOrder._id}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium uppercase">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3">Items</h3>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.unit} × {item.quantity}</p>
                      {item.commissionRate && (
                        <p className="text-xs text-orange-600 mt-1">Commission: {item.commissionRate}%</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{((item.sellerPrice || item.price) * item.quantity).toFixed(0)}</p>
                      {item.commissionAmount > 0 && (
                        <>
                          <p className="text-xs text-blue-600">Customer: ₹{(((item.sellerPrice || item.price) * item.quantity) + item.commissionAmount).toFixed(0)}</p>
                          <p className="text-xs text-gray-500">Fee: ₹{item.commissionAmount.toFixed(0)}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold mb-2">Delivery Address</h3>
                <p className="font-medium">{selectedOrder.deliveryAddress?.name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress?.address}</p>
                <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</p>
                <p className="text-sm text-gray-600 mt-2">📞 {selectedOrder.deliveryAddress?.phone}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Customer Paid</span>
                  <span className="font-bold text-blue-600">₹{(selectedOrder.sellerTotal + selectedOrder.totalCommission).toFixed(0)}</span>
                </div>
                {selectedOrder.totalCommission > 0 && (
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-orange-600">Platform Fee ({((selectedOrder.totalCommission / selectedOrder.sellerTotal) * 100).toFixed(1)}%)</span>
                    <span className="text-orange-600 font-bold">-₹{selectedOrder.totalCommission.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="font-bold text-gray-900">You Receive</span>
                  <span className="font-bold text-green-600 text-xl">₹{selectedOrder.sellerTotal?.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
