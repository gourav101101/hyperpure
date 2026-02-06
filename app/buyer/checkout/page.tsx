"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { setNeedInvoice, setSelectedSlot } from "@/app/store/checkoutSlice";

export default function BuyerCheckout() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const dispatch = useAppDispatch();
  const { selectedSlot, needInvoice: paperInvoice } = useAppSelector((state) => state.checkout);
  const { userId, userPhone, userName } = useAppSelector((state) => state.auth);
  const [receiver, setReceiver] = useState({ name: "", phone: "" });
  const [address, setAddress] = useState("");
  const [useWallet, setUseWallet] = useState(false);
  const [payOnDelivery, setPayOnDelivery] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddNewReceiver, setShowAddNewReceiver] = useState(false);
  const [newReceiver, setNewReceiver] = useState({ name: "", phone: "" });
  const [savedContacts, setSavedContacts] = useState([{ name: "Default", phone: "9827787080" }]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [tempSelectedSlot, setTempSelectedSlot] = useState<any>(null);
  const [showItemsModal, setShowItemsModal] = useState(false);

  useEffect(() => {
    // Load saved contacts from localStorage
    const saved = localStorage.getItem('savedContacts');
    if (saved) {
      setSavedContacts(JSON.parse(saved));
    }
    
    // Load saved receiver from localStorage
    const savedReceiver = localStorage.getItem('selectedReceiver');
    if (savedReceiver) {
      setReceiver(JSON.parse(savedReceiver));
    } else {
      setReceiver({ name: userName || 'Guest', phone: userPhone || '' });
    }
    
    // Load saved address
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      setAddress(savedAddress);
    }

    const storedNeedInvoice = localStorage.getItem('needInvoice');
    if (storedNeedInvoice !== null) {
      dispatch(setNeedInvoice(storedNeedInvoice === 'true'));
    }

    const storedUseWallet = localStorage.getItem('useWallet');
    const storedPayOnDelivery = localStorage.getItem('payOnDelivery');
    if (storedUseWallet !== null) {
      setUseWallet(storedUseWallet === 'true');
    }
    if (storedPayOnDelivery !== null) {
      setPayOnDelivery(storedPayOnDelivery === 'true');
    }
    
    setLoading(false);
    
    // Fetch delivery slots
    fetchDeliverySlots();
    
    setPageLoading(false);
  }, [userName, userPhone]);

  const fetchDeliverySlots = async () => {
    try {
      const res = await fetch('/api/delivery-slots');
      const data = await res.json();
      if (data.slots) {
        const allSlots = data.slots.filter((s: any) => s.active);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterTomorrowDay = dayAfterTomorrow.getDay();

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const processed = allSlots.map((s: any) => {
          const slot = { ...s };
          if (s.orderCutoffTime) {
            const [cutoffH, cutoffM] = s.orderCutoffTime.split(':').map(Number);
            const cutoffTime = cutoffH * 60 + cutoffM;
            const isPastCutoff = currentTime >= cutoffTime;

            if (s.isExpress) {
              slot.disabled = isPastCutoff;
              slot.disabledReason = isPastCutoff ? 'Cutoff time passed' : undefined;
            } else {
              const dayAvailableTomorrow = !s.daysOfWeek || s.daysOfWeek.length === 0 || s.daysOfWeek.includes(tomorrowDay);
              const dayAvailableDayAfter = !s.daysOfWeek || s.daysOfWeek.length === 0 || s.daysOfWeek.includes(dayAfterTomorrowDay);

              if (isPastCutoff) {
                if (dayAvailableDayAfter) {
                  slot.deliveryDay = dayAfterTomorrow.toISOString();
                  slot.deliveryDate = dayAfterTomorrow.toISOString().split('T')[0];
                  slot.deliveryLabel = dayAfterTomorrow.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                } else {
                  slot.disabled = true;
                  slot.disabledReason = 'Not available for next delivery';
                }
              } else {
                if (dayAvailableTomorrow) {
                  slot.deliveryDay = tomorrow.toISOString();
                  slot.deliveryDate = tomorrow.toISOString().split('T')[0];
                  slot.deliveryLabel = 'Tomorrow';
                } else if (dayAvailableDayAfter) {
                  slot.deliveryDay = dayAfterTomorrow.toISOString();
                  slot.deliveryDate = dayAfterTomorrow.toISOString().split('T')[0];
                  slot.deliveryLabel = dayAfterTomorrow.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                } else {
                  slot.disabled = true;
                  slot.disabledReason = 'Not available for next delivery';
                }
              }
            }
          }
          return slot;
        });

        setDeliverySlots(processed);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const convertTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('useWallet', String(useWallet));
  }, [useWallet]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('payOnDelivery', String(payOnDelivery));
  }, [payOnDelivery]);

  useEffect(() => {
    if (!showSlotModal) return;
    fetchDeliverySlots();
    const interval = setInterval(fetchDeliverySlots, 60000);
    return () => clearInterval(interval);
  }, [showSlotModal]);

  useEffect(() => {
    if (!selectedSlot && typeof window !== 'undefined') {
      const storedSlotRaw = localStorage.getItem('selectedSlot');
      if (storedSlotRaw) {
        try {
          const storedSlot = JSON.parse(storedSlotRaw);
          if (storedSlot?._id) {
            dispatch(setSelectedSlot(storedSlot));
          }
        } catch {}
      }
    }
  }, [selectedSlot, dispatch]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstCess = cart.reduce((sum, item: any) => {
    const itemTotal = item.price * item.quantity;
    const gst = (itemTotal * (item.gstRate || 0)) / 100;
    const cess = (itemTotal * (item.cessRate || 0)) / 100;
    return sum + gst + cess;
  }, 0);
  const deliveryFee = selectedSlot?.deliveryCharge || 0;
  const invoiceFee = paperInvoice ? 4 : 0;
  const total = subtotal + gstCess + deliveryFee + invoiceFee;

  const handlePlaceOrder = async () => {
    if (payOnDelivery) {
      setLoading(true);
      try {
        const orderItems = cart.map(item => ({
          ...item,
          _id: item._id.includes('-') ? item._id.split('-')[0] : item._id
        }));
        
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId || 'guest',
            phoneNumber: receiver.phone,
            items: orderItems,
            subtotal,
            gstCess,
            deliveryFee,
            totalAmount: total,
            deliveryAddress: { address, name: receiver.name, phone: receiver.phone, pincode: '452010' },
            deliverySlot: selectedSlot,
            paymentMethod: 'cod',
            paperInvoice
          })
        });
        if (res.ok) {
          const data = await res.json();
          clearCart();
          router.push(`/order-confirmation?orderId=${data.order._id}`);
        } else {
          const error = await res.json();
          alert('Order failed: ' + (error.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Order error:', error);
        alert('Order failed');
      }
      setLoading(false);
    } else {
      router.push(`/buyer/payment?total=${total.toFixed(2)}`);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
              <div className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 text-center">
              <h1 className="text-2xl font-bold mb-1">{receiver.name || 'Guest'}</h1>
              <p className="text-gray-600 text-sm">{address || '127-b vijay nagar, Mumbai - 452010'}</p>
              <div className="mt-4 inline-block bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-sm font-medium">
                {cart.length} Items
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-gray-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Receiver's details</p>
                    <p className="font-bold">{receiver.name || 'Default'}, {receiver.phone || '9827787080'}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(true)} className="text-red-500 font-medium text-sm flex items-center gap-1">
                  Edit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <div className="text-center text-gray-400 text-sm mb-4 flex items-center justify-center gap-2">
                <div className="h-px bg-gray-300 flex-1"></div>
                YOUR PACKAGES
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">{selectedSlot?.isExpress ? 'Express' : 'Standard'} (delivery {selectedSlot?.deliveryLabel || 'tomorrow'})</h3>
                <div className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                  <button
                    onClick={() => {
                      setTempSelectedSlot(selectedSlot);
                      setShowSlotModal(true);
                    }}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1"
                  >
                    <span className="font-bold">{selectedSlot?.name || '8 am - 12 pm'}</span>
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowItemsModal(true)}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1"
                  >
                    <div className="flex -space-x-2">
                      {cart.slice(0, 3).map((item, i) => (
                        <img key={i} src={item.image} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                      ))}
                    </div>
                    <span className="font-medium">{cart.length} items</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-center text-gray-400 text-sm mb-4 flex items-center justify-center gap-2">
                <div className="h-px bg-gray-300 flex-1"></div>
                MORE OPTIONS
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium mb-1">Send me paper invoice with orders.</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        {paperInvoice ? 'Additional ₹4 charge' : "You're saving ₹4 & trees 🌳"}
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">You can also download invoice via Order Section</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !paperInvoice;
                      dispatch(setNeedInvoice(next));
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('needInvoice', String(next));
                      }
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${paperInvoice ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${paperInvoice ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24 space-y-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <div className="text-right">
                  <div>₹{total.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 font-normal">Inc. of taxes</div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Item total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {gstCess > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>GST + Cess</span>
                    <span>₹{gstCess.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  {deliveryFee > 0 ? (
                    <span className="text-orange-600 font-bold">₹{deliveryFee}</span>
                  ) : (
                    <span className="text-green-600 font-medium">FREE</span>
                  )}
                </div>
                {invoiceFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Invoice fee</span>
                    <span>₹{invoiceFee}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="w-4 h-4" />
                      <span className="font-medium">Hyperpure wallet</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">Available: ₹0</p>
                  </div>
                  <span className="font-bold">₹0</span>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={payOnDelivery} onChange={(e) => setPayOnDelivery(e.target.checked)} className="w-4 h-4" />
                      <span className="font-medium">Pay on delivery</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">Available limit: ₹5,000</p>
                  </div>
                  <span className="font-bold">₹0</span>
                </label>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-xl font-bold mb-2">
                  <span>To pay</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-between px-6"
              >
                <span>Pay ₹{total.toFixed(2)}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {showItemsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">{cart.length} items (Package 1)</h2>
              <button onClick={() => setShowItemsModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Select delivery slot</h2>
              <button onClick={() => setShowSlotModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {deliverySlots.filter(s => !s.isExpress).length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-2">Standard</div>
                  <div className="space-y-2">
                    {deliverySlots.filter(s => !s.isExpress).map((slot) => {
                      const isMinBlocked = slot.minOrderValue > 0 && subtotal < slot.minOrderValue;
                      const isDisabled = slot.disabled || isMinBlocked;
                      return (
                      <button
                        key={slot._id}
                        onClick={() => {
                          if (isDisabled) return;
                          setTempSelectedSlot(slot);
                        }}
                        disabled={isDisabled}
                        className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                          tempSelectedSlot?._id === slot._id
                            ? 'border-green-500 bg-green-50'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-bold text-lg">
                            {slot.deliveryStartTime && slot.deliveryEndTime
                              ? `${convertTo12Hour(slot.deliveryStartTime)} - ${convertTo12Hour(slot.deliveryEndTime)}`
                              : slot.name}
                          </div>
                          {slot.deliveryLabel && (
                            <div className="text-xs text-green-600">{slot.deliveryLabel}</div>
                          )}
                          {slot.disabled && slot.disabledReason && (
                            <div className="text-xs text-gray-400">{slot.disabledReason}</div>
                          )}
                          {isMinBlocked && (
                            <div className="text-xs text-red-600">
                              Add ₹{slot.minOrderValue - subtotal} more to unlock
                            </div>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          tempSelectedSlot?._id === slot._id
                            ? 'border-green-500'
                            : 'border-gray-300'
                        }`}>
                          {tempSelectedSlot?._id === slot._id && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    );
                    })}
                  </div>
                </div>
              )}

              {deliverySlots.filter(s => s.isExpress).length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-2">Express</div>
                  <div className="space-y-2">
                    {deliverySlots.filter(s => s.isExpress).map((slot) => {
                      const isMinBlocked = slot.minOrderValue > 0 && subtotal < slot.minOrderValue;
                      const isDisabled = slot.disabled || isMinBlocked;
                      return (
                      <button
                        key={slot._id}
                        onClick={() => {
                          if (isDisabled) return;
                          setTempSelectedSlot(slot);
                        }}
                        disabled={isDisabled}
                        className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                          tempSelectedSlot?._id === slot._id
                            ? 'border-orange-500 bg-orange-50'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-bold text-lg">{slot.name}</div>
                          <div className="text-xs text-orange-600">
                            Delivery in {slot.expressDeliveryHours || 2} hours
                          </div>
                          {slot.disabled && slot.disabledReason && (
                            <div className="text-xs text-gray-400">{slot.disabledReason}</div>
                          )}
                          {isMinBlocked && (
                            <div className="text-xs text-red-600">
                              Add ₹{slot.minOrderValue - subtotal} more to unlock
                            </div>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          tempSelectedSlot?._id === slot._id
                            ? 'border-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {tempSelectedSlot?._id === slot._id && (
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    );
                    })}
                  </div>
                </div>
              )}

              {!deliverySlots.length && (
                <div className="text-center text-gray-500 py-6">No slots available</div>
              )}
            </div>
            
            <div className="p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  if (tempSelectedSlot) {
                    dispatch(setSelectedSlot(tempSelectedSlot));
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('selectedSlotId', tempSelectedSlot._id);
                      localStorage.setItem('selectedSlot', JSON.stringify(tempSelectedSlot));
                    }
                  }
                  setShowSlotModal(false);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Update receiver's details</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {!showAddNewReceiver ? (
              <div className="p-6 space-y-6">
                <button
                  onClick={() => setShowAddNewReceiver(true)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="font-bold text-lg">Add new receiver</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-4">Use existing contacts</h3>
                  <div className="space-y-3">
                    {savedContacts.map((contact, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setReceiver(contact);
                          localStorage.setItem('selectedReceiver', JSON.stringify(contact));
                          setShowEditModal(false);
                        }}
                        className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                          receiver.phone === contact.phone
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-bold">{contact.name}</div>
                            <div className="text-sm text-gray-600">{contact.phone}</div>
                          </div>
                        </div>
                        {receiver.phone === contact.phone && (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <button
                  onClick={() => setShowAddNewReceiver(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Back</span>
                </button>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newReceiver.name}
                    onChange={(e) => setNewReceiver({...newReceiver, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
                    placeholder="Enter receiver name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newReceiver.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setNewReceiver({...newReceiver, phone: value});
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
                    placeholder="Enter 10 digit phone number"
                    maxLength={10}
                  />
                  {newReceiver.phone && newReceiver.phone.length !== 10 && (
                    <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
                    rows={3}
                    placeholder="Enter delivery address"
                  />
                </div>
                
                <button
                  onClick={() => {
                    if (newReceiver.name && newReceiver.phone && newReceiver.phone.length === 10) {
                      const updatedContacts = [...savedContacts, newReceiver];
                      setReceiver(newReceiver);
                      setSavedContacts(updatedContacts);
                      localStorage.setItem('savedContacts', JSON.stringify(updatedContacts));
                      localStorage.setItem('selectedReceiver', JSON.stringify(newReceiver));
                      localStorage.setItem('deliveryAddress', address);
                      setShowEditModal(false);
                      setShowAddNewReceiver(false);
                      setNewReceiver({ name: "", phone: "" });
                    } else {
                      alert('Please enter valid name and 10 digit phone number');
                    }
                  }}
                  className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 mt-6"
                >
                  Save & Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
