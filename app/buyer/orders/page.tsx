"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAppSelector } from "../../store/hooks";

export default function BuyerOrdersPage() {
  const router = useRouter();
  const { userId, userPhone } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const id = userId || userPhone || localStorage.getItem("userId");
    if (!id) {
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/orders?userId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
    setLoading(false);
  }, [userId, userPhone]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleFocus = () => fetchOrders();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button 
              onClick={() => router.push('/catalogue')} 
              className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-bold text-lg">#{order._id.slice(-8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-xl text-red-500">₹{order.totalAmount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item: any, i: number) => (
                        <img 
                          key={i} 
                          src={item.image} 
                          alt="" 
                          className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{order.deliveryAddress?.name}</p>
                    <p>{order.deliveryAddress?.address}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push(`/order-confirmation?orderId=${order._id}`)}
                    className="flex-1 py-3 border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => router.push('/catalogue')}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600"
                  >
                    Order Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
