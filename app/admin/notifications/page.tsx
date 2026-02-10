"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: "all",
    recipientId: "",
    type: "info",
    title: "",
    message: "",
    actionUrl: ""
  });

  useEffect(() => {
    fetchUsers();
    fetchSellers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const fetchSellers = async () => {
    const res = await fetch('/api/seller');
    if (res.ok) {
      const data = await res.json();
      setSellers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      type: formData.type,
      title: formData.title,
      message: formData.message,
      actionUrl: formData.actionUrl || undefined
    };

    if (formData.recipientType === "all_customers") {
      payload.userType = "customer";
      payload.broadcast = true;
    } else if (formData.recipientType === "all_sellers") {
      payload.userType = "seller";
      payload.broadcast = true;
    } else if (formData.recipientType === "specific_customer") {
      payload.userId = formData.recipientId;
      payload.userType = "customer";
    } else if (formData.recipientType === "specific_seller") {
      payload.userId = formData.recipientId;
      payload.userType = "seller";
    }

    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      toast.success('Notification sent!');
      setShowModal(false);
      setFormData({
        recipientType: "all",
        recipientId: "",
        type: "info",
        title: "",
        message: "",
        actionUrl: ""
      });
    } else {
      toast.error('Failed to send notification');
    }
  };

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
           Send Notification
        </button>
      </div>

      <div className="bg-white rounded-xl p-8 text-center">
        <div className="text-6xl mb-4"></div>
        <h3 className="text-xl font-bold mb-2">Send Notifications</h3>
        <p className="text-gray-600">Click the button above to send notifications to users or sellers</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Send Notification</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Send To</label>
                <select 
                  value={formData.recipientType} 
                  onChange={(e) => setFormData({...formData, recipientType: e.target.value, recipientId: ""})} 
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="all_customers">All Customers</option>
                  <option value="all_sellers">All Sellers</option>
                  <option value="specific_customer">Specific Customer</option>
                  <option value="specific_seller">Specific Seller</option>
                </select>
              </div>

              {formData.recipientType === "specific_customer" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Customer</label>
                  <select 
                    value={formData.recipientId} 
                    onChange={(e) => setFormData({...formData, recipientId: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Choose customer...</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.name || user.phone}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.recipientType === "specific_seller" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Seller</label>
                  <select 
                    value={formData.recipientId} 
                    onChange={(e) => setFormData({...formData, recipientId: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Choose seller...</option>
                    {sellers.map(seller => (
                      <option key={seller._id} value={seller._id}>{seller.businessName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Notification Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="info"> Info</option>
                  <option value="new_order"> New Order</option>
                  <option value="order_status"> Order Status</option>
                  <option value="payout"> Payout</option>
                  <option value="low_stock"> Low Stock</option>
                  <option value="price_alert"> Price Alert</option>
                  <option value="review"> Review</option>
                  <option value="performance"> Performance</option>
                  <option value="bulk_order"> Bulk Order</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  placeholder="Notification title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea 
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  rows={4}
                  placeholder="Notification message"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Action URL (Optional)</label>
                <input 
                  type="text" 
                  value={formData.actionUrl} 
                  onChange={(e) => setFormData({...formData, actionUrl: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  placeholder="/orders or /products/123"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold">
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
