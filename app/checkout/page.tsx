"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/catalogue');
    }
    const error = new URLSearchParams(window.location.search).get('error');
    if (error === 'payment_failed') {
      alert('Payment failed. Please try again.');
    } else if (error === 'payment_error') {
      alert('Payment error occurred. Please try again.');
    }
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = cart.reduce((sum, item: any) => {
    const itemTotal = item.price * item.quantity;
    const gst = (itemTotal * (item.gstRate || 0)) / 100;
    const cess = (itemTotal * (item.cessRate || 0)) / 100;
    return sum + gst + cess;
  }, 0);
  const deliveryFee = 30;
  const total = subtotal + gstAmount + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId') || 'guest';
      const userEmail = localStorage.getItem('userEmail') || '';
      const phoneNumber = localStorage.getItem('userPhone') || formData.phone;
      
      const calculatedGstAmount = cart.reduce((sum, item: any) => {
        const itemTotal = item.price * item.quantity;
        const gst = (itemTotal * (item.gstRate || 0)) / 100;
        const cess = (itemTotal * (item.cessRate || 0)) / 100;
        return sum + gst + cess;
      }, 0);

      const deliveryAddress = {
        ...formData,
        email: userEmail
      };

      if (formData.paymentMethod === 'phonepe') {
        const orderRes = await fetch('/api/payment/phonepe/pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            phoneNumber,
            items: cart,
            deliveryAddress,
            paymentMethod: 'phonepe',
            subtotal,
            gstAmount: calculatedGstAmount,
            deliveryFee,
            totalAmount: total
          })
        });

        const orderData = await orderRes.json();
        if (!orderData.orderId) {
          alert('Failed to create order');
          setLoading(false);
          return;
        }

        const paymentRes = await fetch('/api/payment/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            orderId: orderData.orderId,
            userId,
            phone: phoneNumber
          })
        });

        const paymentData = await paymentRes.json();
        if (paymentData.success) {
          localStorage.setItem('pendingOrderId', orderData.orderId);
          clearCart();
          window.location.href = paymentData.paymentUrl;
          return;
        } else {
          alert('Payment initiation failed');
          setLoading(false);
          return;
        }
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phoneNumber,
          items: cart,
          deliveryAddress,
          paymentMethod: formData.paymentMethod,
          subtotal,
          gstAmount: calculatedGstAmount,
          deliveryFee,
          totalAmount: total
        })
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        router.push(`/order-confirmation?orderId=${data.order._id}`);
      } else {
        alert('Order failed. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="cod">Cash on Delivery</option>
                      <option value="phonepe">PhonePe</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 disabled:bg-gray-400"
                >
                  {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">×{item.quantity}</p>
                      </div>
                      <p className="font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
