"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAdminSession } from "@/app/admin/utils/session";

type ConfirmAction = {
  show: boolean;
  action: string;
  sellerId: string;
  message: string;
};

export default function AdminSellers() {
  const router = useRouter();
  const [sellers, setSellers] = useState<any[]>([]);
  const [sellerProducts, setSellerProducts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    show: false,
    action: "",
    sellerId: "",
    message: ""
  });

  useEffect(() => {
    const session = getAdminSession();
    if (!session.adminAuth) {
      router.replace("/admin/login");
      return;
    }
    fetchSellers();
  }, [router]);

  const displayStatus = (seller: any) => {
    if (seller?.isActive === false) return "suspended";
    return seller?.status || "pending";
  };

  const fetchSellers = async () => {
    try {
      const res = await fetch("/api/admin/sellers");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setSellers(data || []);

      const productCountPromises = (data || []).map(async (seller: any) => {
        try {
          const prodRes = await fetch(`/api/seller/products?sellerId=${seller._id}`);
          const prodData = await prodRes.json();
          return { sellerId: seller._id, count: prodData.products?.length || 0 };
        } catch {
          return { sellerId: seller._id, count: 0 };
        }
      });

      const results = await Promise.all(productCountPromises);
      const productCounts: any = {};
      results.forEach(r => {
        productCounts[r.sellerId] = r.count;
      });
      setSellerProducts(productCounts);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    }
    setLoading(false);
  };

  const handleAction = async (sellerId: string, action: "approve" | "reject" | "suspend") => {
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sellerId,
          action,
          reason: action === "reject" ? rejectionReason : "",
          adminName: "Admin"
        })
      });

      if (res.ok) {
        fetchSellers();
        setSelectedSeller(null);
        setRejectionReason("");
      } else {
        toast.error("Update failed. Please try again.");
      }
    } catch (error) {
      console.error("Action failed", error);
      toast.error("Action failed. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-orange-100 text-orange-800"
    };
    return `px-3 py-1 rounded-full text-xs font-bold ${colors[status] || "bg-gray-100 text-gray-700"}`;
  };

  const filteredSellers = sellers.filter((s: any) => {
    const status = displayStatus(s);
    const matchesStatus = filterStatus === "All" || status === filterStatus.toLowerCase();
    const name = String(s?.name || "").toLowerCase();
    const email = String(s?.email || "").toLowerCase();
    const phone = String(s?.phone || "");
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || email.includes(query) || phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const totalSellers = sellers.length;
  const pendingCount = sellers.filter(s => displayStatus(s) === "pending").length;
  const approvedCount = sellers.filter(s => displayStatus(s) === "approved").length;
  const rejectedCount = sellers.filter(s => displayStatus(s) === "rejected").length;
  const suspendedCount = sellers.filter(s => displayStatus(s) === "suspended").length;
  const totalProducts = (Object.values(sellerProducts) as number[]).reduce((a, b) => a + Number(b || 0), 0);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const selectedStatus = selectedSeller ? displayStatus(selectedSeller) : "";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl font-bold">{totalSellers}</div>
          <p className="text-sm opacity-90 mt-1">Total Sellers</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl font-bold">{pendingCount}</div>
          <p className="text-sm opacity-90 mt-1">Pending Approval</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl font-bold">{approvedCount}</div>
          <p className="text-sm opacity-90 mt-1">Active Sellers</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl font-bold">{suspendedCount}</div>
          <p className="text-sm opacity-90 mt-1">Suspended</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl font-bold">{rejectedCount}</div>
          <p className="text-sm opacity-90 mt-1">Rejected</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl font-bold">{totalProducts}</div>
          <p className="text-sm opacity-90 mt-1">Total Products</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">All Sellers ({filteredSellers.length})</h2>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-sm border-2 border-gray-300 rounded-lg px-4 py-2 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Suspended</option>
              <option>Rejected</option>
            </select>
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sellers..."
                className="text-sm border-2 border-gray-300 rounded-lg pl-10 pr-4 py-2 w-64 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSellers.map((seller: any) => (
                <tr key={seller._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 text-white font-bold">
                        {String(seller.name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{seller.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{seller.phone || ""}</div>
                        <div className="text-xs text-gray-400">{seller.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{seller.businessType || ""}</div>
                    <div className="text-xs text-gray-500">{seller.brandNames || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-blue-600">{sellerProducts[seller._id] || 0}</div>
                    <div className="text-xs text-gray-500">products listed</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadge(displayStatus(seller))}>
                      {displayStatus(seller).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : ""}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedSeller(seller)}
                      className="bg-blue-500 text-white hover:bg-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSellers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No sellers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold">{selectedSeller.name || "Seller"}</h2>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${selectedStatus === "approved" ? "bg-green-400 text-green-900" : selectedStatus === "pending" ? "bg-yellow-400 text-yellow-900" : selectedStatus === "suspended" ? "bg-orange-400 text-orange-900" : "bg-red-400 text-red-900"}`}>
                  {selectedStatus.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedSeller(null);
                  setRejectionReason("");
                }}
                className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-xl"
              >
                x
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{sellerProducts[selectedSeller._id] || 0}</div>
                  <div className="text-xs text-blue-700 font-medium mt-1">Products</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{selectedSeller.totalOrders || 0}</div>
                  <div className="text-xs text-green-700 font-medium mt-1">Orders</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">Rs. {selectedSeller.totalRevenue || 0}</div>
                  <div className="text-xs text-purple-700 font-medium mt-1">Revenue</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Seller Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contact</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.name || ""}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.phone || ""}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.email || ""}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Business</label>
                    <p className="text-gray-900 font-medium capitalize">{selectedSeller.businessType || ""}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Brands</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.brandNames || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cities</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.cities || "N/A"}</p>
                  </div>
                </div>
              </div>

              {selectedSeller.bankDetails && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h3 className="text-sm font-bold text-green-900 mb-3">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">Account Holder</label>
                      <p className="text-green-900 font-medium">{selectedSeller.bankDetails.accountHolderName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">Account Number</label>
                      <p className="text-green-900 font-medium">{selectedSeller.bankDetails.accountNumber || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">IFSC Code</label>
                      <p className="text-green-900 font-medium">{selectedSeller.bankDetails.ifscCode || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">Bank Name</label>
                      <p className="text-green-900 font-medium">{selectedSeller.bankDetails.bankName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">Branch</label>
                      <p className="text-green-900 font-medium">{selectedSeller.bankDetails.branch || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">UPI ID</label>
                      <p className="text-green-900 font-medium">{selectedSeller.bankDetails.upiId || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedStatus === "pending" && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Rejection reason (required for rejection)"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setConfirmAction({
                          show: true,
                          action: "approve",
                          sellerId: selectedSeller._id,
                          message: "Approve this seller?"
                        })
                      }
                      className="bg-green-500 text-white py-2.5 px-4 rounded-lg hover:bg-green-600 font-semibold text-sm shadow-sm transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        if (rejectionReason.trim()) {
                          setConfirmAction({
                            show: true,
                            action: "reject",
                            sellerId: selectedSeller._id,
                            message: "Reject this seller?"
                          });
                        } else {
                          toast.error("Please provide rejection reason");
                        }
                      }}
                      className="bg-red-500 text-white py-2.5 px-4 rounded-lg hover:bg-red-600 font-semibold text-sm shadow-sm transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedStatus === "approved" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setConfirmAction({
                        show: true,
                        action: "suspend",
                        sellerId: selectedSeller._id,
                        message: "Suspend this seller? They will not be able to login."
                      })
                    }
                    className="bg-orange-500 text-white py-2.5 px-4 rounded-lg hover:bg-orange-600 font-semibold text-sm shadow-sm transition-all"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        show: true,
                        action: "delete",
                        sellerId: selectedSeller._id,
                        message: "Delete this seller? This action cannot be undone."
                      })
                    }
                    className="bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm shadow-sm transition-all"
                  >
                    Delete
                  </button>
                </div>
              )}

              {selectedStatus === "suspended" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setConfirmAction({
                        show: true,
                        action: "approve",
                        sellerId: selectedSeller._id,
                        message: "Reactivate this seller?"
                      })
                    }
                    className="bg-green-500 text-white py-2.5 px-4 rounded-lg hover:bg-green-600 font-semibold text-sm shadow-sm transition-all"
                  >
                    Reactivate
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        show: true,
                        action: "delete",
                        sellerId: selectedSeller._id,
                        message: "Delete this seller? This action cannot be undone."
                      })
                    }
                    className="bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm shadow-sm transition-all"
                  >
                    Delete
                  </button>
                </div>
              )}

              {selectedStatus === "rejected" && (
                <>
                  {selectedSeller.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <label className="block text-xs font-bold text-red-700 mb-1">Rejection Reason</label>
                      <p className="text-sm text-red-600">{selectedSeller.rejectionReason}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setConfirmAction({
                          show: true,
                          action: "approve",
                          sellerId: selectedSeller._id,
                          message: "Approve this seller?"
                        })
                      }
                      className="bg-green-500 text-white py-2.5 px-4 rounded-lg hover:bg-green-600 font-semibold text-sm shadow-sm transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          show: true,
                          action: "delete",
                          sellerId: selectedSeller._id,
                          message: "Delete this seller? This action cannot be undone."
                        })
                      }
                      className="bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm shadow-sm transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}

              {selectedSeller.verifiedBy && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-blue-600 mb-1">Verified By</label>
                      <p className="text-blue-900 font-medium">{selectedSeller.verifiedBy}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-600 mb-1">Verified At</label>
                      <p className="text-blue-900 font-medium text-xs">
                        {selectedSeller.verifiedAt ? new Date(selectedSeller.verifiedAt).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmAction.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction({ show: false, action: "", sellerId: "", message: "" })}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction.action === "delete") {
                    try {
                      const res = await fetch("/api/admin/sellers", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: confirmAction.sellerId })
                      });
                      if (res.ok) {
                        fetchSellers();
                        setSelectedSeller(null);
                      } else {
                        toast.error("Failed to delete seller");
                      }
                    } catch (error) {
                      toast.error("Failed to delete seller");
                    }
                  } else {
                    handleAction(confirmAction.sellerId, confirmAction.action as "approve" | "reject" | "suspend");
                  }
                  setConfirmAction({ show: false, action: "", sellerId: "", message: "" });
                }}
                className="flex-1 bg-red-500 text-white py-2.5 px-4 rounded-lg hover:bg-red-600 font-semibold transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}