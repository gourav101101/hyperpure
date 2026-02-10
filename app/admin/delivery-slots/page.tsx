"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function DeliverySlots() {
  const [slots, setSlots] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, type: 'delete' | 'deactivate' | 'activate', slotId: string, slotName: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slotType: "standard",
    orderCutoffTime: "23:00",
    deliveryStartTime: "12:00",
    deliveryEndTime: "17:00",
    deliveryCharge: 0,
    expressDeliveryHours: 2,
    express24x7: false,
    minOrderValue: 0,
    daysOfWeek: [] as number[],
    active: true
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    const res = await fetch('/api/admin/delivery-slots');
    if (res.ok) {
      const data = await res.json();
      setSlots(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Time validation
    if (formData.slotType === 'standard') {
      const [startH, startM] = formData.deliveryStartTime.split(':').map(Number);
      const [endH, endM] = formData.deliveryEndTime.split(':').map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      
      if (endMins <= startMins) {
        toast.error('Delivery end time must be after start time!');
        return;
      }
    }
    
    const slotData = {
      ...formData,
      isExpress: formData.slotType === 'express',
      sellerCollectionStart: "08:00",
      sellerCollectionEnd: "12:00"
    };
    
    const res = await fetch('/api/admin/delivery-slots', {
      method: editSlot ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editSlot ? { ...slotData, id: editSlot._id } : slotData)
    });
    
    if (res.ok) {
      toast.success('Slot saved!');
      fetchSlots();
      setShowModal(false);
    }
  };

  const openModal = (slot?: any) => {
    if (slot) {
      setEditSlot(slot);
      const date = slot.deliveryDate ? new Date(slot.deliveryDate) : new Date();
      setFormData({
        name: slot.name,
        slotType: slot.isExpress ? 'express' : 'standard',
        orderCutoffTime: slot.orderCutoffTime || "23:00",
        deliveryStartTime: slot.deliveryStartTime || "12:00",
        deliveryEndTime: slot.deliveryEndTime || "17:00",
        deliveryCharge: slot.deliveryCharge || 0,
        expressDeliveryHours: slot.expressDeliveryHours || 2,
        express24x7: slot.express24x7 || false,
        minOrderValue: slot.minOrderValue || 0,
        daysOfWeek: slot.daysOfWeek || [],
        active: slot.active !== false
      });
    } else {
      setEditSlot(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        name: "",
        slotType: "standard",
        orderCutoffTime: "23:00",
        deliveryStartTime: "12:00",
        deliveryEndTime: "17:00",
        deliveryCharge: 0,
        expressDeliveryHours: 2,
        express24x7: false,
        minOrderValue: 0,
        daysOfWeek: [],
        active: true
      });
    }
    setShowModal(true);
  };

  const archiveSlot = async (id: string) => {
    if (!confirm('Archive this slot?')) return;
    const res = await fetch('/api/admin/delivery-slots', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, archived: true })
    });
    if (res.ok) {
      toast.success('Slot archived!');
      fetchSlots();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const res = await fetch('/api/admin/delivery-slots', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !currentStatus })
    });
    if (res.ok) {
      toast.success(`Slot ${!currentStatus ? 'activated' : 'deactivated'}!`);
      fetchSlots();
    }
    setConfirmModal(null);
  };

  const deleteSlot = async (id: string) => {
    const res = await fetch(`/api/admin/delivery-slots?id=${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      toast.success('Slot deleted!');
      fetchSlots();
    }
    setConfirmModal(null);
  };

  const convertTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <button onClick={() => openModal()} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
          + Add Delivery Slot
        </button>
      </div>

      <div className="grid gap-4">
        {slots.filter(s => !s.archived).map((slot) => {
          const charge = Number(slot.deliveryCharge ?? 0);
          const badgeLabel = slot.archived
            ? 'Archived'
            : slot.isExpress
            ? `Express Rs. ${charge}`
            : charge > 0
            ? `Rs. ${charge}`
            : 'FREE';
          return (
            <div key={slot._id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{slot.name}</h3>
                    {!slot.active && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600">INACTIVE</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      slot.archived ? 'bg-gray-100 text-gray-700' : slot.isExpress ? 'bg-orange-100 text-orange-700' : charge > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {badgeLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(slot.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {!slot.archived && (
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmModal({show: true, type: slot.active ? 'deactivate' : 'activate', slotId: slot._id, slotName: slot.name})} className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      slot.active ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                      {slot.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => openModal(slot)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => setConfirmModal({show: true, type: 'delete', slotId: slot._id, slotName: slot.name})} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                {slot.isExpress ? (
                  <p className="text-sm font-medium text-orange-700">Delivery within {slot.expressDeliveryHours || 2} hours</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-green-700">Order by {convertTo12Hour(slot.orderCutoffTime)} for next day delivery</p>
                    <p className="text-sm font-medium text-green-700">Delivery: {convertTo12Hour(slot.deliveryStartTime)} - {convertTo12Hour(slot.deliveryEndTime)}</p>
                  </>
                )}
                {slot.daysOfWeek && slot.daysOfWeek.length > 0 && (
                  <p className="text-xs text-gray-600">Available: {slot.daysOfWeek.map((d: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {slots.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <h3 className="text-xl font-bold mb-2">No delivery slots</h3>
          <p className="text-gray-600 mb-6">Create your first delivery slot</p>
          <button onClick={() => openModal()} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold">
            + Add Delivery Slot
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editSlot ? 'Edit' : 'Add'} Delivery Slot</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Slot Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Morning Delivery" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Slot Type</label>
                  <select value={formData.slotType} onChange={(e) => setFormData({...formData, slotType: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="standard">Standard (FREE)</option>
                    <option value="express">Express (PAID)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Available Days</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['S','M','T','W','T','F','S'].map((day, idx) => {
                      const isSelected = formData.daysOfWeek.includes(idx);
                      const fullDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][idx];
                      return (
                        <button
                          key={idx}
                          type="button"
                          title={fullDay}
                          onClick={() => {
                            const days = isSelected
                              ? formData.daysOfWeek.filter(d => d !== idx)
                              : [...formData.daysOfWeek, idx].sort();
                            setFormData({...formData, daysOfWeek: days});
                          }}
                          className={`px-2 py-3 rounded-lg text-sm font-bold transition-all ${
                            isSelected ? 'bg-green-500 text-white shadow-md' : 'bg-red-100 text-red-600 border border-red-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.daysOfWeek.length === 0 
                      ? 'Available all days' 
                      : `Available: ${formData.daysOfWeek.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}`
                    }
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  {formData.slotType === 'express' ? (
                    <div className="space-y-3">
                      <h3 className="font-bold text-orange-600">Express Delivery Settings</h3>
                      <div className="flex items-center gap-2 bg-orange-100 rounded-lg p-3">
                        <input type="checkbox" checked={formData.express24x7} onChange={(e) => setFormData({...formData, express24x7: e.target.checked})} className="w-5 h-5" />
                        <label className="font-medium text-sm">Available 24/7 (ignore delivery window)</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Order Cutoff Time</label>
                        <input type="time" required value={formData.orderCutoffTime} onChange={(e) => setFormData({...formData, orderCutoffTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                        <p className="text-xs text-gray-500 mt-1">Last time to accept express orders</p>
                      </div>
                      {!formData.express24x7 && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Delivery Start</label>
                            <input type="time" required value={formData.deliveryStartTime} onChange={(e) => setFormData({...formData, deliveryStartTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Delivery End</label>
                            <input type="time" required value={formData.deliveryEndTime} onChange={(e) => setFormData({...formData, deliveryEndTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-2">Delivery Within (Hours)</label>
                        <input type="number" min="1" max="24" value={formData.expressDeliveryHours} onChange={(e) => setFormData({...formData, expressDeliveryHours: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Delivery Charge (Rs.)</label>
                        <input type="number" min="0" value={formData.deliveryCharge} onChange={(e) => setFormData({...formData, deliveryCharge: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input type="checkbox" checked={formData.minOrderValue > 0} onChange={(e) => setFormData({...formData, minOrderValue: e.target.checked ? 999 : 0})} className="w-4 h-4" />
                          <label className="font-medium text-sm">Minimum Order Value</label>
                        </div>
                        {formData.minOrderValue > 0 && (
                          <input type="number" min="0" value={formData.minOrderValue} onChange={(e) => setFormData({...formData, minOrderValue: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Min cart value" />
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {formData.slotType === 'standard' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-green-600">Standard Delivery Settings</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order Cutoff Time (for next day delivery)</label>
                      <input type="time" required value={formData.orderCutoffTime} onChange={(e) => setFormData({...formData, orderCutoffTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                      <p className="text-xs text-gray-500 mt-1">Orders placed before this time will be delivered next day</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Delivery Start</label>
                        <input type="time" required value={formData.deliveryStartTime} onChange={(e) => setFormData({...formData, deliveryStartTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Delivery End</label>
                        <input type="time" required value={formData.deliveryEndTime} onChange={(e) => setFormData({...formData, deliveryEndTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input type="checkbox" checked={formData.deliveryCharge > 0} onChange={(e) => setFormData({...formData, deliveryCharge: e.target.checked ? 50 : 0})} className="w-5 h-5" />
                        <label className="font-medium">Add Delivery Charge (Optional)</label>
                      </div>
                      {formData.deliveryCharge > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Delivery Charge (Rs.)</label>
                          <input type="number" min="0" value={formData.deliveryCharge} onChange={(e) => setFormData({...formData, deliveryCharge: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                          <p className="text-xs text-gray-500 mt-1">Leave at 0 for FREE delivery</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input type="checkbox" checked={formData.minOrderValue > 0} onChange={(e) => setFormData({...formData, minOrderValue: e.target.checked ? 499 : 0})} className="w-5 h-5" />
                        <label className="font-medium">Minimum Order Value (Optional)</label>
                      </div>
                      {formData.minOrderValue > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Min Cart Value (Rs.)</label>
                          <input type="number" min="0" value={formData.minOrderValue} onChange={(e) => setFormData({...formData, minOrderValue: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg" />
                          <p className="text-xs text-gray-500 mt-1">Customers must have this amount in cart to use this slot</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold">
                  {editSlot ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {confirmModal.type === 'delete' ? 'Delete Slot' : confirmModal.type === 'deactivate' ? 'Deactivate Slot' : 'Activate Slot'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmModal.type === 'delete' 
                ? `Permanently delete "${confirmModal.slotName}"? This cannot be undone.`
                : confirmModal.type === 'deactivate'
                ? `Deactivate "${confirmModal.slotName}"? Customers won't see this slot.`
                : `Activate "${confirmModal.slotName}"? Customers will see this slot.`
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={() => confirmModal.type === 'delete' ? deleteSlot(confirmModal.slotId) : toggleActive(confirmModal.slotId, confirmModal.type === 'deactivate')}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                  confirmModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : confirmModal.type === 'deactivate' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'deactivate' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
