"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import LogoutModal from "../components/LogoutModal";

export default function ProfilePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [userPhone, setUserPhone] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/catalogue');
      return;
    }
    setUserPhone(phone || '');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
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
                <p className="text-sm md:text-base text-gray-600">+91 {userPhone}</p>
              </div>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 md:px-6 py-2 rounded-full font-semibold hover:bg-red-600 text-sm md:text-base">
                Logout
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Order History</h2>
            {orders.length === 0 ? (
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
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userPhone');
        router.push('/');
      }} onLogoutAll={async () => {
        localStorage.clear();
        router.push('/');
      }} />
    </div>
  );
}
