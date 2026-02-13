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
    const orderId = searchParams?.get('orderId');
    if (orderId) {
      localStorage.removeItem('pendingOrderId');
      fetch(`/api/orders?id=${orderId}`)
        .then(r => r.json())
        .then(data => setOrder(data));
    }
  }, [searchParams]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm text-center mb-4 md:mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-4 md:mb-6">Thank you for your order. We'll deliver it soon.</p>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="text-lg md:text-xl font-bold break-all">{order._id}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-3 md:space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 md:gap-4">
                  <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base truncate">{item.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <div className="font-bold text-sm md:text-base flex-shrink-0">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between text-lg md:text-xl font-bold">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Delivery Address</h2>
            <div className="text-sm md:text-base text-gray-700 space-y-1">
              <p className="font-medium">{order.deliveryAddress?.name}</p>
              <p>{order.deliveryAddress?.phone}</p>
              <p>{order.deliveryAddress?.address}</p>
              <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <button onClick={() => router.push('/catalogue')} className="w-full bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600 text-sm md:text-base">
              Continue Shopping
            </button>
            <button onClick={() => router.push('/')} className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-50 text-sm md:text-base">
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
        <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">Loading...</div>
        </main>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
