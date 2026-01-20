"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      fetch(`/api/orders?id=${orderId}`)
        .then(r => r.json())
        .then(data => setOrder(data));
    }
  }, [searchParams]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">Thank you for your order. We'll deliver it soon.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="text-xl font-bold">{order._id}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <div className="font-bold">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
            <p className="text-gray-700">{order.deliveryAddress.name}</p>
            <p className="text-gray-700">{order.deliveryAddress.phone}</p>
            <p className="text-gray-700">{order.deliveryAddress.address}</p>
            <p className="text-gray-700">{order.deliveryAddress.city}, {order.deliveryAddress.pincode}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={() => router.push('/catalogue')} className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600">
              Continue Shopping
            </button>
            <button onClick={() => router.push('/')} className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-50">
              Go to Home
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">Loading...</div>
        </main>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
