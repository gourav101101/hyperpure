"use client";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../context/CartContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSelectedSlot, setNeedInvoice } from "../store/checkoutSlice";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const dispatch = useAppDispatch();
  const { selectedSlot, needInvoice } = useAppSelector((state) => state.checkout);
  const [showCheckout, setShowCheckout] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartInitialized, setCartInitialized] = useState(false);

  const [standardSlots, setStandardSlots] = useState<any[]>([]);
  const [expressSlots, setExpressSlots] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<string>('');
  
  type DeliverySlot = {
    _id?: string;
    name?: string;
    isExpress?: boolean;
    express24x7?: boolean;
    expressDeliveryHours?: number;
    deliveryStartTime?: string;
    deliveryEndTime?: string;
    orderCutoffTime?: string;
    deliveryCharge?: number;
    minOrderValue?: number;
    daysOfWeek?: number[];
    deliveryDay?: string;
    deliveryDate?: string;
    deliveryLabel?: string;
    disabled?: boolean;
    disabledReason?: string;
    opensIn?: string;
    popularityScore?: number;
    isPopular?: boolean;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedNeedInvoice = localStorage.getItem('needInvoice');
    if (storedNeedInvoice !== null) {
      dispatch(setNeedInvoice(storedNeedInvoice === 'true'));
    }
    const storedCoupon = localStorage.getItem('appliedCoupon');
    if (storedCoupon) {
      try {
        const parsed = JSON.parse(storedCoupon);
        setAppliedCoupon(parsed);
      } catch {}
    }
  }, [dispatch]);

  const persistSelectedSlot = (slot: any | null) => {
    if (typeof window === 'undefined') return;
    if (!slot) {
      localStorage.removeItem('selectedSlotId');
      localStorage.removeItem('selectedSlot');
      return;
    }
    if (slot._id) {
      localStorage.setItem('selectedSlotId', slot._id);
    }
    localStorage.setItem('selectedSlot', JSON.stringify(slot));
  };

  const convertTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const updateCountdown = () => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const nextCutoff = standardSlots.filter(s => !s.disabled && s.orderCutoffTime).map(s => {
      const [h, m] = s.orderCutoffTime.split(':').map(Number);
      return h * 60 + m;
    }).filter(cutoff => cutoff > currentMins).sort((a, b) => a - b)[0];
    if (nextCutoff) {
      const remaining = nextCutoff - currentMins;
      const hours = Math.floor(remaining / 60);
      const mins = remaining % 60;
      setCountdown(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
    } else {
      setCountdown('');
    }
  };

  useEffect(() => {
    setTimeout(() => setCartInitialized(true), 100);
  }, []);

  useEffect(() => {
    fetch('/api/delivery-slots')
      .then(res => res.json())
      .then(data => {
        const allSlots = data.slots || [];
        const today = new Date().getDay();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterTomorrowDay = dayAfterTomorrow.getDay();
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const processedSlots: DeliverySlot[] = allSlots.map((s: DeliverySlot) => {
          const slot: DeliverySlot = { ...s };
          slot.popularityScore = Math.floor(Math.random() * 40) + 60;
          slot.isPopular = slot.popularityScore >= 75;
          
          // Check cutoff time
          if (s.orderCutoffTime) {
            const [cutoffH, cutoffM] = s.orderCutoffTime.split(':').map(Number);
            const cutoffTime = cutoffH * 60 + cutoffM;
            const isPastCutoff = currentTime >= cutoffTime;
            
            if (s.isExpress) {
              slot.disabled = isPastCutoff;
              slot.disabledReason = 'Cutoff time passed';
              
              // Check delivery window only if NOT 24/7
              if (!s.express24x7 && !isPastCutoff && s.deliveryStartTime && s.deliveryEndTime) {
                const [startH, startM] = s.deliveryStartTime.split(':').map(Number);
                const [endH, endM] = s.deliveryEndTime.split(':').map(Number);
                const startTime = startH * 60 + startM;
                const endTime = endH * 60 + endM;
                
                if (currentTime < startTime) {
                  slot.disabled = true;
                  slot.disabledReason = 'Not yet open';
                  const minsUntilOpen = startTime - currentTime;
                  const hoursUntil = Math.floor(minsUntilOpen / 60);
                  const minsUntil = minsUntilOpen % 60;
                  slot.opensIn = hoursUntil > 0 ? `${hoursUntil}h ${minsUntil}m` : `${minsUntil}m`;
                } else if (currentTime > endTime) {
                  slot.disabled = true;
                  slot.disabledReason = 'Closed for today';
                }
              }
            } else {
              // Standard: check if available for tomorrow or day after
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
        
        const standard = processedSlots.filter((s) => !s.isExpress).sort((a, b) => {
          const [aH, aM] = (a.deliveryStartTime || "00:00").split(':').map(Number);
          const [bH, bM] = (b.deliveryStartTime || "00:00").split(':').map(Number);
          return (aH * 60 + aM) - (bH * 60 + bM);
        });
        const express = processedSlots.filter((s) => s.isExpress);
        setStandardSlots(standard);
        setExpressSlots(express);
        
        // Restore previous selection if possible, otherwise auto-select
        let restored = false;
        if (!selectedSlot && typeof window !== 'undefined') {
          const storedId = localStorage.getItem('selectedSlotId');
          const storedSlotRaw = localStorage.getItem('selectedSlot');
          const storedSlot = storedSlotRaw ? JSON.parse(storedSlotRaw) : null;
          if (storedId) {
            const match = [...standard, ...express].find(s => s._id === storedId);
            if (match && !match.disabled && (!match.minOrderValue || totalAmount >= match.minOrderValue)) {
              dispatch(setSelectedSlot(match));
              restored = true;
            }
          } else if (storedSlot && !storedSlot.disabled) {
            dispatch(setSelectedSlot(storedSlot));
            restored = true;
          }
        }
        if (!selectedSlot && !restored) {
          const firstAvailable = [...standard, ...express].find(s =>
            !s.disabled && (!s.minOrderValue || totalAmount >= s.minOrderValue)
          );
          if (firstAvailable) {
            dispatch(setSelectedSlot(firstAvailable));
            persistSelectedSlot(firstAvailable);
          }
        }
        
        setTimeout(updateCountdown, 100);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-clear slot if minimum order not met
  useEffect(() => {
    if (selectedSlot?.minOrderValue > 0 && totalAmount < selectedSlot.minOrderValue) {
      dispatch(setSelectedSlot(null));
      persistSelectedSlot(null);
    }
  }, [totalAmount, selectedSlot, dispatch]);

  const gstCess = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const gst = (itemTotal * ((item as any).gstRate || 0)) / 100;
    const cess = (itemTotal * ((item as any).cessRate || 0)) / 100;
    return sum + gst + cess;
  }, 0);
  const invoiceFee = needInvoice ? 4 : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const slotCharge = selectedSlot?.deliveryCharge || 0;
  const finalTotal = totalAmount + gstCess + invoiceFee + slotCharge - discount;
  
  // Check if selected slot has minimum order requirement
  const canCheckout = selectedSlot && (!selectedSlot.minOrderValue || totalAmount >= selectedSlot.minOrderValue);

  const groupByCategory = () => {
    const grouped: any = {};
    cart.forEach(item => {
      const category = (item as any).category || "Other";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });
    return grouped;
  };

  if (cartInitialized && cart.length === 0) {
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

  if (!cartInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <main className="pt-24 pb-24 md:pb-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
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
        </main>
        <BottomNav />
        <Footer />
      </div>
    );
  }

  const groupedCart = groupByCategory();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-24 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6 mt-8">
                <h1 className="text-2xl md:text-3xl font-bold">{cart.length} items in cart</h1>
                <button onClick={clearCart} className="text-red-500 hover:text-red-700">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {Object.keys(groupedCart).map((category) => (
                  <div key={category} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <h3 className="font-bold text-gray-600">{category} ({groupedCart[category].length})</h3>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>

                    <div className="space-y-4">
                      {groupedCart[category].map((item: any) => (
                        <div key={item._id} className="flex gap-4">
                          <div className="relative">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div className="absolute -top-1 -left-1 w-4 h-4 border-2 border-green-600 rounded flex items-center justify-center bg-white">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                            <p className="text-sm text-gray-500 mb-2">{item.unit}</p>
                            <p className="font-bold text-gray-900">₹{item.price}</p>
                          </div>

                          <div className="flex flex-col items-end justify-between">
                            <div className="flex items-center gap-3 border-2 border-red-200 rounded-full px-4 py-1">
                              <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="text-red-500 font-bold text-xl w-6 h-6">−</button>
                              <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="text-red-500 font-bold text-xl w-6 h-6">+</button>
                            </div>
                            {(item as any).minOrderQty && (
                              <span className="text-xs text-gray-500 mt-1">Min. Qty {(item as any).minOrderQty}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Item total</span>
                    <span className="font-semibold">₹{totalAmount}</span>
                  </div>
                  {selectedSlot ? (
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">{slotCharge > 0 ? `₹${slotCharge}` : <span className="text-green-600">FREE</span>}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Delivery Fee</span>
                      <span>Select slot below</span>
                    </div>
                  )}
                  {gstCess > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>GST + Cess</span>
                      <span className="font-semibold">₹{gstCess.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Invoice Toggle */}
                  <div className="flex items-center justify-between py-3 border-t border-b">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">I need a printed invoice</span>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {needInvoice && <p className="text-xs text-green-600 mt-1">Great! You're saving ₹4</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">₹4</span>
                      <button
                        onClick={() => {
                          const next = !needInvoice;
                          dispatch(setNeedInvoice(next));
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('needInvoice', String(next));
                          }
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${needInvoice ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${needInvoice ? 'translate-x-6' : ''}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>

                  {selectedSlot?.minOrderValue > 0 && totalAmount < selectedSlot.minOrderValue && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-orange-700">Add ₹{selectedSlot.minOrderValue - totalAmount} more for {selectedSlot.name}</span>
                    </div>
                  )}

                  <button
                    onClick={() => canCheckout && router.push('/buyer/checkout')}
                    disabled={!canCheckout}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-between px-6 ${
                      canCheckout
                        ? 'bg-gradient-to-r from-pink-400 to-pink-300 text-white hover:from-pink-500 hover:to-pink-400'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Checkout</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Delivery Slot Selection */}
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">🚚 Choose Delivery</h3>
                    {countdown && (
                      <span className="text-xs text-orange-600 font-medium">⏰ {countdown}</span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {standardSlots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => {
                          const isDisabled = slot.disabled || (slot.minOrderValue > 0 && totalAmount < slot.minOrderValue);
                          if (!isDisabled) {
                            dispatch(setSelectedSlot(slot));
                            persistSelectedSlot(slot);
                          }
                        }}
                        disabled={slot.disabled || (slot.minOrderValue > 0 && totalAmount < slot.minOrderValue)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                          slot.disabled || (slot.minOrderValue > 0 && totalAmount < slot.minOrderValue)
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                            : selectedSlot?._id === slot._id 
                            ? 'border-green-500 bg-green-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold ${slot.disabled || (slot.minOrderValue > 0 && totalAmount < slot.minOrderValue) ? 'text-gray-400' : 'text-gray-900'}`}>{slot.name}</h4>
                              {slot.isPopular && !slot.disabled && !(slot.minOrderValue > 0 && totalAmount < slot.minOrderValue) && (
                                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">🔥 Popular</span>
                              )}
                              {selectedSlot?._id === slot._id && !(slot.minOrderValue > 0 && totalAmount < slot.minOrderValue) && (
                                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </div>
                            {!slot.disabled && !(slot.minOrderValue > 0 && totalAmount < slot.minOrderValue) && (
                              <p className="text-sm text-gray-600">{convertTo12Hour(slot.deliveryStartTime)} - {convertTo12Hour(slot.deliveryEndTime)}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {slot.disabled ? (
                              <span className="text-xs text-gray-400 font-medium">Closed</span>
                            ) : slot.deliveryCharge > 0 ? (
                              <span className="text-lg font-bold text-blue-600">₹{slot.deliveryCharge}</span>
                            ) : (
                              <span className="text-lg font-bold text-green-600">FREE</span>
                            )}
                          </div>
                        </div>
                        
                        {slot.disabled ? (
                          <div className="text-xs text-gray-400">
                            {standardSlots.find(s => !s.disabled) && (
                              <span>→ Next available: {standardSlots.find(s => !s.disabled)?.deliveryLabel}</span>
                            )}
                          </div>
                        ) : slot.minOrderValue > 0 && totalAmount < slot.minOrderValue ? (
                          <div className="text-xs text-red-600 font-medium">
                            📊 Add ₹{slot.minOrderValue - totalAmount} more to unlock
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Order by {convertTo12Hour(slot.orderCutoffTime)}</span>
                            <span className="text-green-600 font-medium">{slot.deliveryLabel}</span>
                          </div>
                        )}
                      </button>
                    ))}
                    
                    {expressSlots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => {
                          const isDisabled = slot.disabled || (slot.minOrderValue > 0 && totalAmount < slot.minOrderValue);
                          if (!isDisabled) {
                            dispatch(setSelectedSlot(slot));
                            persistSelectedSlot(slot);
                          }
                        }}
                        disabled={slot.disabled || (slot.minOrderValue > 0 && totalAmount < slot.minOrderValue)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                          slot.disabled || (slot.minOrderValue > 0 && totalAmount < slot.minOrderValue)
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : selectedSlot?._id === slot._id 
                            ? 'border-orange-500 bg-orange-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold ${slot.disabled ? 'text-gray-400' : 'text-gray-900'}`}>{slot.name}</h4>
                              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">⚡ Express</span>
                              {selectedSlot?._id === slot._id && (
                                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </div>
                            {!slot.disabled && (
                              <p className="text-sm text-gray-600">Delivery in {slot.expressDeliveryHours || 2} hours</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {slot.disabled ? (
                              <span className="text-xs text-gray-400 font-medium">Closed</span>
                            ) : (
                              <span className="text-lg font-bold text-orange-600">+₹{slot.deliveryCharge}</span>
                            )}
                          </div>
                        </div>
                        
                        {slot.disabled ? (
                          <div className="space-y-1">
                            {slot.opensIn ? (
                              <>
                                <p className="text-xs text-orange-600 font-medium">⏰ Opens in {slot.opensIn}</p>
                                <p className="text-xs text-gray-400">Available from {convertTo12Hour(slot.deliveryStartTime)}</p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400">Opens at {convertTo12Hour(slot.deliveryStartTime)} tomorrow</p>
                            )}
                          </div>
                        ) : slot.minOrderValue > 0 && totalAmount < slot.minOrderValue ? (
                          <div className="text-xs text-red-600 font-medium">
                            📊 Add ₹{slot.minOrderValue - totalAmount} more to unlock
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Available until {convertTo12Hour(slot.orderCutoffTime)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {!standardSlots.length && !expressSlots.length && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="text-4xl mb-2">😴</div>
                      <p className="text-sm font-medium text-gray-700">No slots available</p>
                      <p className="text-xs text-gray-500 mt-1">Check back tomorrow</p>
                    </div>
                  )}
                </div>

                {/* Coupons Corner */}
                <div className="pt-6 border-t">
                  <h3 className="font-bold text-lg mb-4">Coupons corner</h3>
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-900">View deals & save more</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
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
            <CheckoutForm cart={cart} totalAmount={finalTotal} selectedSlot={selectedSlot} onClose={() => setShowCheckout(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

type CheckoutFormProps = {
  cart: CartItem[];
  totalAmount: number;
  selectedSlot: any;
  onClose: () => void;
};

function CheckoutForm({ cart, totalAmount, selectedSlot, onClose }: CheckoutFormProps) {
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

  const convertTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userPhone = localStorage.getItem('userPhone');
    const userId = localStorage.getItem('userId');
    const orderData = {
      userId: userId || "temp_user_id",
      phoneNumber: userPhone || formData.phone,
      items: cart,
      subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      deliveryFee: totalAmount - cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      totalAmount,
      deliveryAddress: formData,
      paymentMethod: "cod",
      deliverySlotId: selectedSlot?._id,
      deliveryDate: selectedSlot?.deliveryDate,
      deliveryTimeWindow: `${selectedSlot?.deliveryStartTime} - ${selectedSlot?.deliveryEndTime}`,
      slotDeliveryCharge: selectedSlot?.deliveryCharge || 0
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/order-confirmation?orderId=${data.order._id}`);
      }
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
          <span className="text-xl font-bold">₹{totalAmount.toFixed(2)}</span>
        </div>
        {selectedSlot && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-sm font-medium text-gray-700">{selectedSlot.name}</p>
            <p className="text-xs text-gray-600">📦 {convertTo12Hour(selectedSlot.deliveryStartTime)} - {convertTo12Hour(selectedSlot.deliveryEndTime)}</p>
            {selectedSlot.deliveryCharge > 0 && (
              <p className="text-xs text-orange-600 mt-1">Express: +₹{selectedSlot.deliveryCharge}</p>
            )}
          </div>
        )}
        <p className="text-sm text-gray-600 mt-2">Payment Method: Cash on Delivery</p>
      </div>
      <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-bold ${loading ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'} text-white`}>
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
}
