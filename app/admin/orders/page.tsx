"use client";
import { useEffect, useState } from "react";
import { io } from 'socket.io-client';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();

    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let socketInstance: ReturnType<typeof io> | null = null;

    const setupRealtime = async () => {
      await fetch('/api/socket');

      socketInstance = io({
        path: '/api/socket/io',
        addTrailingSlash: false,
      });
      socketInstance.on('connect', () => {
        socketInstance?.emit('join', { userId: 'admin', userType: 'admin' });
      });

      socketInstance.on('notification', (data: any) => {
        if (data.type === 'new_order' || data.type === 'order_status') {
          fetchOrders();
        }
      });

      socketInstance.on('order_updated', () => {
        fetchOrders();
      });
    };

    setupRealtime();
    pollingTimer = setInterval(fetchOrders, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    };

    window.addEventListener('focus', fetchOrders);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
      socketInstance?.disconnect();
      window.removeEventListener('focus', fetchOrders);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <button onClick={fetchOrders} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sellers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4 text-sm">
                  <div>{order.deliveryAddress?.name}</div>
                  <div className="text-gray-500">{order.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {order.items.map((item: any) => item.sellerDetails).filter((s: any) => s).reduce((acc: any[], curr: any) => {
                    if (!acc.find((s: any) => s._id === curr._id)) acc.push(curr);
                    return acc;
                  }, []).map((seller: any, i: number) => (
                    <div key={i} className="text-xs mb-1">
                      <div className="font-medium text-blue-900">{seller.businessName}</div>
                      <div className="text-gray-500">{seller.phone}</div>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-sm">{order.items.length} items</td>
                <td className="px-6 py-4 text-sm font-semibold">₹{order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold mb-2">Customer Details</h3>
                <p><strong>Name:</strong> {selectedOrder.deliveryAddress?.name}</p>
                <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress?.address}, {selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.unit} × {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                      {item.sellerDetails && (
                        <div className="pl-3 border-l-2 border-blue-500 bg-blue-50 p-2 rounded">
                          <p className="text-sm font-semibold text-blue-900">🏪 {item.sellerDetails.businessName}</p>
                          <p className="text-xs text-blue-700">📞 {item.sellerDetails.phone}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Payment Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal:</span><span>₹{selectedOrder.subtotal}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee:</span><span>₹{selectedOrder.deliveryFee}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>₹{selectedOrder.totalAmount}</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Assigned Sellers</h3>
                {selectedOrder.assignedSellers?.map((seller: any, idx: number) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">Seller ID: {seller.sellerId}</p>
                    <p className="text-sm">Status: {seller.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
