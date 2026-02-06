"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminSellers() {
  const router = useRouter();
  const [sellers, setSellers] = useState([]);
  const [sellerProducts, setSellerProducts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmAction, setConfirmAction] = useState<{show: boolean; action: string; sellerId: string; message: string}>({show: false, action: '', sellerId: '', message: ''});

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }
    fetchSellers();
  }, [router]);

  const fetchSellers = async () => {
    try {
      const res = await fetch('/api/admin/sellers');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setSellers(data);
      
      // Fetch product counts in parallel
      const productCountPromises = data.map(async (seller: any) => {
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
      results.forEach(r => { productCounts[r.sellerId] = r.count; });
      setSellerProducts(productCounts);
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
    }
    setLoading(false);
  };

  const handleAction = async (sellerId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sellerId,
          action,
          reason: action === 'reject' ? rejectionReason : '',
          adminName: 'Admin'
        })
      });
      
      if (res.ok) {
        fetchSellers();
        setSelectedSeller(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error('Action failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return `px-3 py-1 rounded-full text-xs font-bold ${colors[status as keyof typeof colors]}`;
  };

  const filteredSellers = sellers.filter((s: any) => {
    const matchesStatus = filterStatus === "All" || s.status === filterStatus.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <div className="text-3xl font-bold">{sellers.length}</div>
              <p className="text-sm opacity-90 mt-1">Total Sellers</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-5 text-white shadow-lg">
              <div className="text-3xl font-bold">{sellers.filter((s: any) => s.status === 'pending').length}</div>
              <p className="text-sm opacity-90 mt-1">Pending Approval</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
              <div className="text-3xl font-bold">{sellers.filter((s: any) => s.status === 'approved').length}</div>
              <p className="text-sm opacity-90 mt-1">Active Sellers</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
              <div className="text-3xl font-bold">{(Object.values(sellerProducts) as number[]).reduce((a, b) => a + b, 0)}</div>
              <p className="text-sm opacity-90 mt-1">Total Products</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
              <div className="text-3xl font-bold">{sellers.filter((s: any) => s.status === 'rejected').length}</div>
              <p className="text-sm opacity-90 mt-1">Rejected</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">All Sellers ({filteredSellers.length})</h2>
              <div className="flex gap-3">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border-2 border-gray-300 rounded-lg px-4 py-2 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option>All</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
                <div className="relative">
                  <input 
                    type="search" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                            {seller.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{seller.name}</div>
                            <div className="text-sm text-gray-500">{seller.phone}</div>
                            <div className="text-xs text-gray-400">{seller.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{seller.businessType}</div>
                        <div className="text-xs text-gray-500">{seller.brandNames || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-blue-600">{sellerProducts[seller._id] || 0}</div>
                        <div className="text-xs text-gray-500">products listed</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(seller.status)}>
                          {seller.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(seller.createdAt).toLocaleDateString()}
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
                </tbody>
              </table>
            </div>
          </div>

      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold">{selectedSeller.name}</h2>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${selectedSeller.status === 'approved' ? 'bg-green-400 text-green-900' : selectedSeller.status === 'pending' ? 'bg-yellow-400 text-yellow-900' : 'bg-red-400 text-red-900'}`}>
                  {selectedSeller.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => { setSelectedSeller(null); setRejectionReason(''); }} className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-xl">×</button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Seller Stats */}
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
                  <div className="text-2xl font-bold text-purple-600">₹{selectedSeller.totalRevenue || 0}</div>
                  <div className="text-xs text-purple-700 font-medium mt-1">Revenue</div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Seller Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contact</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.phone}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Business</label>
                    <p className="text-gray-900 font-medium capitalize">{selectedSeller.businessType}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Brands</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.brandNames || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cities</label>
                    <p className="text-gray-900 font-medium">{selectedSeller.cities || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedSeller.status === 'pending' && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Rejection reason (required for rejection)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setConfirmAction({show: true, action: 'approve', sellerId: selectedSeller._id, message: 'Are you sure you want to approve this seller?'})}
                      className="bg-green-500 text-white py-2.5 px-4 rounded-lg hover:bg-green-600 font-semibold text-sm shadow-sm transition-all"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        if (rejectionReason.trim()) {
                          setConfirmAction({show: true, action: 'reject', sellerId: selectedSeller._id, message: 'Are you sure you want to reject this seller?'});
                        } else {
                          toast.error('Please provide rejection reason');
                        }
                      }}
                      className="bg-red-500 text-white py-2.5 px-4 rounded-lg hover:bg-red-600 font-semibold text-sm shadow-sm transition-all"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedSeller.status === 'approved' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfirmAction({show: true, action: 'reject', sellerId: selectedSeller._id, message: 'Are you sure you want to suspend this seller? They will not be able to login.'})}
                    className="bg-orange-500 text-white py-2.5 px-4 rounded-lg hover:bg-orange-600 font-semibold text-sm shadow-sm transition-all"
                  >
                    ⚠ Suspend
                  </button>
                  <button
                    onClick={() => setConfirmAction({show: true, action: 'delete', sellerId: selectedSeller._id, message: 'Are you sure you want to delete this seller? This action cannot be undone.'})}
                    className="bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm shadow-sm transition-all"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}

              {selectedSeller.status === 'rejected' && (
                <>
                  {selectedSeller.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <label className="block text-xs font-bold text-red-700 mb-1">Rejection Reason</label>
                      <p className="text-sm text-red-600">{selectedSeller.rejectionReason}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setConfirmAction({show: true, action: 'approve', sellerId: selectedSeller._id, message: 'Are you sure you want to approve this seller?'})}
                      className="bg-green-500 text-white py-2.5 px-4 rounded-lg hover:bg-green-600 font-semibold text-sm shadow-sm transition-all"
                    >
                      ✓ Approve Now
                    </button>
                    <button
                      onClick={() => setConfirmAction({show: true, action: 'delete', sellerId: selectedSeller._id, message: 'Are you sure you want to delete this seller? This action cannot be undone.'})}
                      className="bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm shadow-sm transition-all"
                    >
                      🗑 Delete
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
                        {new Date(selectedSeller.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction({show: false, action: '', sellerId: '', message: ''})}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction.action === 'delete') {
                    try {
                      const res = await fetch('/api/admin/sellers', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: confirmAction.sellerId })
                      });
                      if (res.ok) {
                        fetchSellers();
                        setSelectedSeller(null);
                      }
                    } catch (error) {
                      toast.error('Failed to delete seller');
                    }
                  } else {
                    handleAction(confirmAction.sellerId, confirmAction.action as 'approve' | 'reject' | 'suspend');
                  }
                  setConfirmAction({show: false, action: '', sellerId: '', message: ''});
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
