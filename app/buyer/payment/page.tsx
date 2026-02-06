"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import { useCart } from "@/app/context/CartContext";
import { useAppSelector } from "@/app/store/hooks";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const total = searchParams?.get("total") || "0";
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const { cart, clearCart } = useCart();
  const { userId, userPhone, userName } = useAppSelector((state) => state.auth);
  const { selectedSlot, needInvoice } = useAppSelector((state) => state.checkout);

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setLoading(true);
    try {
      const receiver = JSON.parse(localStorage.getItem('selectedReceiver') || '{}');
      const address = localStorage.getItem('deliveryAddress') || '';
      
      const orderItems = cart.map(item => ({
        ...item,
        _id: item._id.includes('-') ? item._id.split('-')[0] : item._id
      }));

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gstCess = cart.reduce((sum, item: any) => {
        const itemTotal = item.price * item.quantity;
        const gst = (itemTotal * (item.gstRate || 0)) / 100;
        const cess = (itemTotal * (item.cessRate || 0)) / 100;
        return sum + gst + cess;
      }, 0);
      const deliveryFee = selectedSlot?.deliveryCharge || 0;
      const invoiceFee = needInvoice ? 4 : 0;
      const totalAmount = subtotal + gstCess + deliveryFee + invoiceFee;

      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'guest',
          phoneNumber: receiver.phone || userPhone,
          items: orderItems,
          subtotal,
          gstCess,
          deliveryFee,
          totalAmount,
          deliveryAddress: { address, name: receiver.name || userName, phone: receiver.phone || userPhone, pincode: '452010' },
          deliverySlot: selectedSlot,
          paymentMethod: 'online',
          paperInvoice: needInvoice,
          paymentId: `demo_${Date.now()}`
        })
      });

      if (orderRes.ok) {
        const data = await orderRes.json();
        clearCart();
        router.push(`/order-confirmation?orderId=${data.order._id}`);
      } else {
        alert('Order failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <div className="w-full bg-yellow-100 text-center py-3 mt-16">
        <p className="text-black font-medium">Please do not refresh the page</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8">
              <h1 className="text-3xl font-bold mb-2">Payment</h1>
              <p className="text-gray-600 mb-8">Please select a payment method to complete your purchase</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedMethod("card")}
                  className={`w-full flex items-center justify-between p-5 border-2 rounded-xl transition-all ${
                    selectedMethod === "card" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-lg">Add credit or debit cards</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setSelectedMethod("netbanking")}
                  className={`w-full flex items-center justify-between p-5 border-2 rounded-xl transition-all ${
                    selectedMethod === "netbanking" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-lg">Netbanking</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setSelectedMethod("upi")}
                  className={`w-full flex items-center justify-between p-5 border-2 rounded-xl transition-all ${
                    selectedMethod === "upi" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-lg">UPI</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">Total</span>
                <div className="text-right">
                  <div className="text-xl font-bold">₹{total}</div>
                  <div className="text-xs text-gray-500">Inc. of taxes</div>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-bold">To Pay</span>
                  <span className="text-xl font-bold">₹{total}</span>
                </div>
                {!selectedMethod && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm mt-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Choose a payment method to proceed</span>
                  </div>
                )}
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedMethod || loading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4 hover:from-red-600 hover:to-pink-600"
              >
                {loading ? 'Processing Payment...' : `Pay ₹${total} and Place Order`}
              </button>

              <button
                onClick={() => router.back()}
                className="w-full border-2 border-red-500 text-red-500 py-4 rounded-xl font-bold text-lg hover:bg-red-50"
              >
                Back to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
