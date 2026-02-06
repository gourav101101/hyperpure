"use client";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, removeFromCart, clearCart } from '@/store/slices/cartSlice';
import { login, logout } from '@/store/slices/authSlice';
import { addNotification, markAllAsRead } from '@/store/slices/notificationSlice';
import { toast } from 'sonner';

export default function ReduxDemo() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const auth = useAppSelector(state => state.auth);
  const notifications = useAppSelector(state => state.notification);

  const testCart = () => {
    dispatch(addToCart({
      _id: '1',
      name: 'Fresh Tomatoes',
      price: 50,
      quantity: 2,
      image: '/placeholder.jpg',
      unit: '1kg',
      sellerId: 'seller1'
    }));
    toast.success('Added to cart!');
  };

  const testAuth = () => {
    if (auth.isLoggedIn) {
      dispatch(logout());
      toast.success('Logged out!');
    } else {
      dispatch(login({ userType: 'customer', userId: 'user123', phone: '9876543210' }));
      toast.success('Logged in!');
    }
  };

  const testNotification = () => {
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'order',
      title: 'New Order',
      message: 'Your order has been placed',
      timestamp: new Date(),
      read: false,
      link: '/orders'
    }));
    toast.success('Notification added!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-4xl font-bold text-white mb-2">Redux Toolkit Demo</h1>
          <p className="text-white/80">Global State Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart State */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🛒 Cart</h2>
            <div className="space-y-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Items</div>
                <div className="text-2xl font-bold text-blue-600">{cart.totalItems}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-green-600">₹{cart.totalAmount}</div>
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={testCart} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold">
                Add Item
              </button>
              <button onClick={() => dispatch(clearCart())} className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold">
                Clear Cart
              </button>
            </div>
            {cart.items.length > 0 && (
              <div className="mt-4 space-y-2">
                {cart.items.map(item => (
                  <div key={item._id} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-gray-600">Qty: {item.quantity} × ₹{item.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auth State */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🔐 Auth</h2>
            <div className="space-y-3 mb-4">
              <div className={`p-3 rounded-lg ${auth.isLoggedIn ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-xl font-bold">
                  {auth.isLoggedIn ? '✅ Logged In' : '❌ Logged Out'}
                </div>
              </div>
              {auth.isLoggedIn && (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Type</div>
                    <div className="text-lg font-bold text-blue-600 capitalize">{auth.userType}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="text-lg font-bold text-purple-600">{auth.phone}</div>
                  </div>
                </>
              )}
            </div>
            <button onClick={testAuth} className={`w-full py-2 rounded-lg font-semibold ${auth.isLoggedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
              {auth.isLoggedIn ? 'Logout' : 'Login'}
            </button>
          </div>

          {/* Notification State */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🔔 Notifications</h2>
            <div className="space-y-3 mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Unread</div>
                <div className="text-2xl font-bold text-orange-600">{notifications?.unreadCount || 0}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-blue-600">{notifications?.notifications?.length || 0}</div>
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={testNotification} className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-semibold">
                Add Notification
              </button>
              <button onClick={() => dispatch(markAllAsRead())} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold">
                Mark All Read
              </button>
            </div>
            {notifications?.notifications && notifications.notifications.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {notifications.notifications.map(notif => (
                  <div key={notif.id} className={`p-2 rounded text-sm ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                    <div className="font-semibold">{notif.title}</div>
                    <div className="text-gray-600 text-xs">{notif.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-4">✨ Redux Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold">Fast</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold">Type-Safe</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-semibold">Predictable</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold">Scalable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
