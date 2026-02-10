"use client";
import { useState, useEffect } from "react";
import { getSellerSession } from "@/app/seller/utils/session";

export default function CollectionSchedule() {
  const [slots, setSlots] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const session = getSellerSession();
      if (!session.sellerId) {
        setError("Seller session not found. Please log in.");
        setLoading(false);
        return;
      }
      const [slotsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/delivery-slots'),
        fetch(`/api/seller/orders?sellerId=${session.sellerId}&status=pending`)
      ]);
      
      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setSlots(slotsData);
      }
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch data');
      setError("Failed to load collection schedule.");
    }
    setLoading(false);
  };

  const getTimeUntilCollection = (collectionTime: string) => {
    if (!collectionTime) return 'No time set';
    const now = new Date();
    const [hours, minutes] = collectionTime.split(':');
    const collection = new Date();
    collection.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diff = collection.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Collection time passed';
    if (hoursLeft === 0) return `${minutesLeft} minutes left`;
    return `${hoursLeft}h ${minutesLeft}m left`;
  };

  const getOrdersBySlot = (slotId: string) => {
    return orders.filter(order => order.deliverySlotId === slotId && order.status === 'pending');
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Collection Schedule</h1>
        <p className="text-gray-600 mt-1">Vehicle pickup times and order preparation</p>
      </div>

      <div className="grid gap-4">
        {slots.map((slot) => {
          const slotOrders = getOrdersBySlot(slot._id);
          const timeLeft = getTimeUntilCollection(slot.sellerCollectionTime);
          const isPastCutoff = timeLeft === 'Collection time passed';
          
          return (
            <div key={slot._id} className={`bg-white rounded-xl border-2 p-6 ${
              !isPastCutoff ? 'border-orange-200' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{slot.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Delivery Window: {slot.deliveryStartTime} - {slot.deliveryEndTime}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  !isPastCutoff ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  <p className="text-xs font-medium">Vehicle Pickup</p>
                  <p className="text-lg font-bold">{slot.sellerCollectionTime}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Orders to Prepare</p>
                  <p className="text-2xl font-bold text-blue-700">{slotOrders.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">Preparation Time</p>
                  <p className="text-2xl font-bold text-green-700">{slot.preparationBuffer}min</p>
                </div>
                <div className={`rounded-lg p-4 ${
                  !isPastCutoff ? 'bg-orange-50' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    !isPastCutoff ? 'text-orange-600' : 'text-gray-600'
                  }`}>Time Until Pickup</p>
                  <p className={`text-2xl font-bold ${
                    !isPastCutoff ? 'text-orange-700' : 'text-gray-700'
                  }`}>{timeLeft}</p>
                </div>
              </div>

              {slotOrders.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold mb-3">Orders for this slot:</h4>
                  <div className="space-y-2">
                    {slotOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rs. {order.totalAmount}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isPastCutoff && slotOrders.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-bold">Action Required:</span> Prepare {slotOrders.length} order(s) before {slot.sellerCollectionTime}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {slots.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <h3 className="text-xl font-bold mb-2">No delivery slots configured</h3>
          <p className="text-gray-600">Contact admin to set up delivery schedules</p>
        </div>
      )}
    </div>
  );
}
