"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotifications } from '../hooks/useNotifications';
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import LogoutModal from "../components/LogoutModal";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";
import { clearCheckout } from "../store/checkoutSlice";

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  panCard: string;
  legalEntity: string;
  address: string;
  city: string;
  pincode: string;
  whatsappUpdates: boolean;
  showTax: boolean;
  paperInvoice: boolean;
}

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { isLoggedIn, userPhone, userName } = useAppSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phoneNumber: '',
    panCard: '',
    legalEntity: 'Guest Account',
    address: '',
    city: '',
    pincode: '',
    whatsappUpdates: false,
    showTax: false,
    paperInvoice: false
  });

  useEffect(() => {
    setIsMounted(true);
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }));
      }
    loadProfile();
  }, [session]);

  const loadProfile = async () => {
    try {
      const userId = session?.user?.email || localStorage.getItem('userId');
      if (!userId) return;
      
      const res = await fetch(`/api/users/profile?id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = session?.user?.email || localStorage.getItem('userId');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          phoneNumber: userPhone,
          ...profile
        })
      });
      
      if (res.ok) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to update profile');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const userId = session?.user?.email || userPhone || '';
  const { notifications, unreadCount, isConnected, markAsRead } = useNotifications(userId, 'customer');

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_order': case 'order_status': return '🛒';
      case 'payout': return '💰';
      case 'low_stock': return '📦';
      case 'price_alert': return '💲';
      case 'review': return '⭐';
      case 'performance': return '📈';
      case 'bulk_order': return '📋';
      default: return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-24 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile settings</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Account Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                {profile.name && (
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">User name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-base font-medium">{profile.name}</p>
                    )}
                  </div>
                )}

                {(profile.phoneNumber || isEditing) && (
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Phone number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-base font-medium">{profile.phoneNumber}</p>
                    )}
                  </div>
                )}

                {profile.email && (
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Email address</label>
                    <p className="text-base font-medium">{profile.email}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-500 block mb-1">PAN card number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.panCard}
                      onChange={(e) => setProfile({...profile, panCard: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter PAN card"
                      maxLength={10}
                    />
                  ) : profile.panCard ? (
                    <p className="text-base font-medium">{profile.panCard}</p>
                  ) : (
                    <p className="text-sm text-orange-600 flex items-center gap-1">
                      <span className="inline-block w-4 h-4 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center">!</span>
                      Unverified
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 block mb-1">Legal entity name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.legalEntity}
                      onChange={(e) => setProfile({...profile, legalEntity: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-base font-medium">{profile.legalEntity}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                      Edit Details
                    </button>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">📱</span>
                      <span className="text-sm">Send me order updates on WhatsApp</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={profile.whatsappUpdates}
                        onChange={(e) => setProfile({...profile, whatsappUpdates: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">ℹ️</span>
                      <span className="text-sm">Show prices including tax</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={profile.showTax}
                        onChange={(e) => setProfile({...profile, showTax: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">📄</span>
                      <span className="text-sm">Send me paper invoice with orders.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={profile.paperInvoice}
                        onChange={(e) => setProfile({...profile, paperInvoice: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Delivery Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold">Delivery Address</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-red-500 text-sm font-semibold flex items-center gap-1"
                    >
                      <span>✏️</span> edit
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Street address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={profile.pincode}
                        onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                ) : profile.address ? (
                  <p className="text-sm text-gray-600">{profile.address}, {profile.city} - {profile.pincode}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No address added</p>
                )}
              </div>

              {(profile.phoneNumber || profile.email) && (
                <div className="space-y-3 pt-4 border-t">
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">📞</span>
                      <span className="text-sm">{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">✉️</span>
                      <span className="text-sm">{profile.email}</span>
                    </div>
                  )}
                </div>
              )}

              {session?.user && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Google Account Connected</p>
                  <div className="flex items-center gap-3">
                    {session.user.image && (
                      <img src={session.user.image} alt={session.user.name || ''} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-gray-600">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogout}
                className="w-full mt-6 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">🔔 Notifications</h2>
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">🔔</div>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      markAsRead(notif._id);
                      if (notif.actionUrl) router.push(notif.actionUrl);
                    }}
                    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition ${
                      !notif.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl">{getIcon(notif.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
                          {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleString('en-IN', { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </p>
                      </div>
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
