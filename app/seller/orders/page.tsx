"use client";
import { useEffect, useState } from "react";
import { getSellerSession } from "@/app/seller/utils/session";
import { io } from 'socket.io-client';

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string>("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    const session = getSellerSession();
    if (session.sellerId) {
      setSellerId(session.sellerId);
    }
  }, []);

  useEffect(() => {
    if (sellerId) {
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
          socketInstance?.emit('join', { userId: sellerId, userType: 'seller' });
        });

        socketInstance.on('notification', (data: any) => {
          if (data.type === 'new_order' || data.type === 'order_status') {
            fetchOrders();
          }
        });

        socketInstance.on('order_updated', (data: any) => {
          if (!data?.sellerId || data.sellerId === sellerId) {
            fetchOrders();
          }
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
    }
  }, [sellerId]);

  const fetchOrders = async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seller/orders?sellerId=${sellerId}&status=all`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLastSyncedAt(new Date());
      } else {
        setError("Failed to load orders.");
      }
    } catch {
      setError("Network error while loading orders.");
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!sellerId) return;
    setError(null);
    setUpdating(orderId);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, sellerId, status })
      });
      if (res.ok) {
        await fetchOrders();
        setSelectedOrder(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Unable to update order status.");
      }
    } catch {
      setError("Network error while updating order.");
    }
    setUpdating(null);
  };

  const formatStatus = (status: string) => status.replace(/_/g, " ").toUpperCase();

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-50 text-blue-800 border-blue-200",
      processing: "bg-purple-50 text-purple-800 border-purple-200",
      out_for_delivery: "bg-orange-50 text-orange-800 border-orange-200",
      delivered: "bg-green-50 text-green-800 border-green-200",
      cancelled: "bg-red-50 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-50 text-gray-800 border-gray-200";
  };

  const stats = {
    all: orders.length,
    actionRequired: orders.filter(o =>
      o.status === "pending" ||
      o.status === "confirmed" ||
      o.status === "processing" ||
      o.status === "out_for_delivery"
    ).length,
    pending: orders.filter(o => o.status === "pending" || o.status === "confirmed").length,
    processing: orders.filter(o => o.status === "processing" || o.status === "out_for_delivery").length,
    delivered: orders.filter(o => o.status === "delivered").length
  };

  const filteredOrders = orders.filter((order) => {
    const status = order.status;
    const matchesStatus =
      filter === "all" ||
      (filter === "action_required" && status !== "delivered" && status !== "cancelled") ||
      (filter === "pending" && (status === "pending" || status === "confirmed")) ||
      (filter === "processing" && (status === "processing" || status === "out_for_delivery")) ||
      (filter === "delivered" && status === "delivered");
    if (!matchesStatus) return false;
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    const idMatch = order._id?.toString().slice(-6).toLowerCase().includes(term);
    const nameMatch = order.deliveryAddress?.name?.toLowerCase().includes(term);
    const phoneMatch = order.deliveryAddress?.phone?.toLowerCase().includes(term);
    return idMatch || nameMatch || phoneMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 sm:mb-8 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage all your orders</p>
            {lastSyncedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Last synced: {lastSyncedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5 mb-5 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.all}</p>
          </div>
          <div className="bg-white border-l-4 border-l-yellow-500 border-t border-r border-b border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white border-l-4 border-l-purple-500 border-t border-r border-b border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Processing</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1 sm:mt-2">{stats.processing}</p>
          </div>
          <div className="bg-white border-l-4 border-l-green-500 border-t border-r border-b border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivered</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{stats.delivered}</p>
          </div>
          <div className="bg-white border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action Required</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1 sm:mt-2">{stats.actionRequired}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 sm:mb-6">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 mb-5 sm:mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All", count: stats.all },
                { id: "action_required", label: "Action Required", count: stats.actionRequired },
                { id: "pending", label: "Pending", count: stats.pending },
                { id: "processing", label: "Processing", count: stats.processing },
                { id: "delivered", label: "Delivered", count: stats.delivered }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                    filter === tab.id 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </p>
            <p className="text-sm text-gray-600">
              {orders.length === 0 
                ? "Orders will appear here when customers place them" 
                : "Try adjusting your filters or search term"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-100 gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</h3>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold border rounded-full ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{order.items.length} item(s)</p>
                  </div>
                  <div className="text-right bg-green-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 uppercase">You Earn</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">₹{(order.sellerTotal || 0).toFixed(0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-12 sm:w-14 h-12 sm:h-14 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.unit} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">₹{((item.sellerPrice || item.price) * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg mb-4 sm:mb-5">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">{order.deliveryAddress?.name}</p>
                    <p className="text-xs sm:text-sm text-gray-700">{order.deliveryAddress?.address}</p>
                    <p className="text-xs sm:text-sm text-gray-700">{order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p>
                    <p className="text-xs sm:text-sm text-gray-700 mt-1">📞 {order.deliveryAddress?.phone}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {order.status === "pending" && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, "processing")} 
                      disabled={updating === order._id}
                      className="w-full sm:flex-1 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Accept Order
                    </button>
                  )}
                  {order.status === "confirmed" && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, "processing")} 
                      disabled={updating === order._id}
                      className="w-full sm:flex-1 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Processing
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, "out_for_delivery")} 
                      disabled={updating === order._id}
                      className="w-full sm:flex-1 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Out for Delivery
                    </button>
                  )}
                  {order.status === "out_for_delivery" && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, "delivered")} 
                      disabled={updating === order._id}
                      className="w-full sm:flex-1 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark Delivered
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedOrder(order)} 
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(90vh-85px)] p-8">
                <div className="flex items-center justify-between pb-5 border-b border-gray-200 mb-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Order ID</p>
                    <p className="text-xl font-bold text-gray-900">#{selectedOrder._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(selectedOrder.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 text-xs font-semibold border rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.unit} × {item.quantity}</p>
                          {item.commissionRate > 0 && (
                            <p className="text-xs text-orange-600 mt-1">Commission: {item.commissionRate}%</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">₹{((item.sellerPrice || item.price) * item.quantity).toFixed(0)}</p>
                          {item.commissionAmount > 0 && (
                            <p className="text-xs text-gray-500">Fee: ₹{item.commissionAmount.toFixed(0)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-5 bg-blue-50 rounded-xl">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Delivery Address</h3>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.deliveryAddress?.name}</p>
                  <p className="text-sm text-gray-700">{selectedOrder.deliveryAddress?.address}</p>
                  <p className="text-sm text-gray-700">{selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</p>
                  <p className="text-sm text-gray-700 mt-2">{selectedOrder.deliveryAddress?.phone}</p>
                </div>

                <div className="p-5 bg-green-50 rounded-xl">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Customer Paid</span>
                      <span className="font-semibold text-gray-900">₹{((selectedOrder.sellerTotal || 0) + (selectedOrder.totalCommission || 0)).toFixed(0)}</span>
                    </div>
                    {selectedOrder.totalCommission > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Platform Fee</span>
                        <span className="font-semibold text-gray-900">-₹{(selectedOrder.totalCommission || 0).toFixed(0)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-green-300 flex justify-between">
                      <span className="text-base font-bold text-gray-900">You Receive</span>
                      <span className="text-2xl font-bold text-green-600">₹{(selectedOrder.sellerTotal || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
