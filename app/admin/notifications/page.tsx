"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNotifications } from "@/app/hooks/useNotifications";

export default function NotificationsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [listFilter, setListFilter] = useState<"all" | "unread" | "with_image">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { notifications, unreadCount, markAsRead, markAllAsRead, loadNotifications } = useNotifications("admin", "admin", { limit: "all" });
  const [formData, setFormData] = useState({
    recipientType: "all_customers",
    recipientId: "",
    type: "new_order",
    title: "",
    message: "",
    actionUrl: "",
    imageUrl: ""
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
    const res = await fetch('/api/admin/sellers');
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
      actionUrl: formData.actionUrl || undefined,
      imageUrl: formData.imageUrl || undefined
    };

    if (formData.recipientType === "all_customers") {
      payload.userType = "customer";
      payload.broadcast = true;
    } else if (formData.recipientType === "all_sellers") {
      payload.userType = "seller";
      payload.broadcast = true;
    } else if (formData.recipientType === "admin_self") {
      payload.userId = "admin";
      payload.userType = "admin";
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
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const createdCount = typeof data?.createdCount === 'number' ? data.createdCount : 1;
      toast.success(`Notification sent to ${createdCount} recipient${createdCount === 1 ? '' : 's'}`);
      loadNotifications();
      setShowModal(false);
      setFormData({
        recipientType: "all_customers",
        recipientId: "",
        type: "new_order",
        title: "",
        message: "",
        actionUrl: "",
        imageUrl: ""
      });
    } else {
      toast.error(data?.error || 'Failed to send notification');
    }
  };

  const notificationTypes = Array.from(new Set(notifications.map((n: any) => n.type))).sort();
  const filteredNotifications = notifications.filter((notif: any) => {
    const passListFilter =
      listFilter === "all" ||
      (listFilter === "unread" && !notif.isRead) ||
      (listFilter === "with_image" && !!notif.imageUrl);
    const passTypeFilter = typeFilter === "all" || notif.type === typeFilter;
    return passListFilter && passTypeFilter;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin Notifications</h2>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Mark all read
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
            Send Notification
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setListFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm border ${listFilter === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"}`}
          >
            All
          </button>
          <button
            onClick={() => setListFilter("unread")}
            className={`px-3 py-1.5 rounded-full text-sm border ${listFilter === "unread" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}
          >
            Unread
          </button>
          <button
            onClick={() => setListFilter("with_image")}
            className={`px-3 py-1.5 rounded-full text-sm border ${listFilter === "with_image" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white hover:bg-gray-50"}`}
          >
            With Image
          </button>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="ml-auto px-3 py-1.5 rounded-lg border text-sm"
          >
            <option value="all">All Types</option>
            {notificationTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Showing {filteredNotifications.length} of {notifications.length}
        </p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden mb-6">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching notifications</h3>
            <p className="text-sm">Try changing filters or send one using the button above.</p>
          </div>
        ) : (
          filteredNotifications.map((notif: any) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.isRead) markAsRead(notif._id);
                if (notif.actionUrl) router.push(notif.actionUrl);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!notif.isRead) markAsRead(notif._id);
                  if (notif.actionUrl) router.push(notif.actionUrl);
                }
              }}
              className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                !notif.isRead ? "bg-blue-50" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  {notif.imageUrl && (
                    <img
                      src={notif.imageUrl}
                      alt="Notification"
                      className="mt-2 w-full max-w-sm h-28 object-cover rounded-lg border"
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notif._id);
                    }}
                    className="text-xs px-3 py-1 rounded-full border hover:bg-white"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
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
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value, recipientId: "" })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="admin_self">Admin (Self)</option>
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
                    onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Notification title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="/orders or /products/123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://example.com/image.jpg"
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
