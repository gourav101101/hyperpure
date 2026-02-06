"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import LogoutModal from "../components/LogoutModal";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";
import { clearCheckout } from "../store/checkoutSlice";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoggedIn, userPhone } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!isLoggedIn) {
      router.push('/catalogue');
      return;
    }
    fetchOrders();
  }, [isLoggedIn, isMounted]);

  const fetchOrders = async () => {
    setLoading(true);
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const res = await fetch(`/api/orders?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-24 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">My Profile</h1>
                <p className="text-sm md:text-base text-gray-600">
                  +91 {isMounted ? userPhone : ''}
                </p>
              </div>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 md:px-6 py-2 rounded-full font-semibold hover:bg-red-600 text-sm md:text-base">
                Logout
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Order History</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border rounded-lg p-4 md:p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600 mb-4">No orders yet</p>
                <button onClick={() => router.push('/catalogue')} className="bg-red-500 text-white px-4 md:px-6 py-2 rounded-full font-semibold hover:bg-red-600 text-sm md:text-base">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 md:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{order.totalAmount}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
      <Footer />
      <LogoutModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onLogout={() => {
        dispatch(logout());
        router.push('/');
      }} onLogoutAll={async () => {
        dispatch(logout());
        dispatch(clearCart());
        dispatch(clearCheckout());
        router.push('/');
      }} />
    </div>
  );
}
