"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, totalAmount } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <main className="pt-32 pb-24 md:pb-20 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add items to get started</p>
            <button onClick={() => router.push('/catalogue')} className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600">
              Browse Products
            </button>
          </div>
        </main>
        <BottomNav />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-24 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="bg-white rounded-xl p-4 md:p-6 flex gap-4 md:gap-6 shadow-sm">
                  <img src={item.image} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-bold text-base md:text-lg mb-1">{item.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mb-3">{item.unit}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3 bg-gray-100 rounded-full px-3 md:px-4 py-1.5 md:py-2">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="text-red-500 font-bold text-lg md:text-xl w-5 h-5 md:w-6 md:h-6">-</button>
                        <span className="font-bold min-w-[25px] md:min-w-[30px] text-center text-sm md:text-base">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="text-red-500 font-bold text-lg md:text-xl w-5 h-5 md:w-6 md:h-6">+</button>
                      </div>
                      <div className="text-right">
                        <div className="text-lg md:text-xl font-bold">₹{item.price * item.quantity}</div>
                        <div className="text-xs md:text-sm text-gray-500">₹{item.price} each</div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
                <button onClick={() => setShowCheckout(true)} className="w-full bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600 mb-3">
                  Proceed to Checkout
                </button>
                <button onClick={() => router.push('/catalogue')} className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-50">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
      <Footer />

      {showCheckout && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <CheckoutForm cart={cart} totalAmount={totalAmount} onClose={() => setShowCheckout(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutForm({ cart, totalAmount, onClose }: any) {
  const router = useRouter();
  const { clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userPhone = localStorage.getItem('userPhone');
    const orderData = {
      userId: "temp_user_id",
      phoneNumber: userPhone || formData.phone,
      items: cart.map((item: any) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        unit: item.unit
      })),
      totalAmount,
      deliveryAddress: formData,
      paymentMethod: "cod",
      paymentStatus: "pending"
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const order = await res.json();
      clearCart();
      router.push(`/order-confirmation?orderId=${order._id}`);
    } catch (error) {
      alert('Order failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Phone Number</label>
        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Delivery Address</label>
        <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 border rounded-lg" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Pincode</label>
          <input type="text" required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Total Amount:</span>
          <span className="text-xl font-bold">₹{totalAmount}</span>
        </div>
        <p className="text-sm text-gray-600">Payment Method: Cash on Delivery</p>
      </div>
      <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-bold ${loading ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'} text-white`}>
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
}
