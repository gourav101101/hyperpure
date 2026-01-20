"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminSellers() {
  const router = useRouter();
  const [sellers, setSellers] = useState([]);
  const [sellerProducts, setSellerProducts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
      const data = await res.json();
      setSellers(data);
      
      // Fetch product counts for each seller
      const productCounts: any = {};
      for (const seller of data) {
        const prodRes = await fetch(`/api/seller/products?sellerId=${seller._id}`);
        const prodData = await prodRes.json();
        productCounts[seller._id] = prodData.products?.length || 0;
      }
      setSellerProducts(productCounts);
    } catch (error) {
      console.error('Failed to fetch sellers');
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-[73px]">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">
          <div className="flex items-center justify-center h-64">Loading...</div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-[73px]">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage marketplace sellers and their products</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl font-bold">{sellers.length}</div>
              <p className="text-xs text-gray-500">Total Sellers</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{sellers.filter((s: any) => s.status === 'pending').length}</div>
              <p className="text-xs text-yellow-600">Pending Approval</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{sellers.filter((s: any) => s.status === 'approved').length}</div>
              <p className="text-xs text-green-600">Active Sellers</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{Object.values(sellerProducts).reduce((a: any, b: any) => a + b, 0)}</div>
              <p className="text-xs text-blue-600">Total Products</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{sellers.filter((s: any) => s.status === 'rejected').length}</div>
              <p className="text-xs text-red-600">Rejected</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Sellers ({filteredSellers.length})</h2>
              <div className="flex gap-2">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border rounded-lg px-3 py-2">
                  <option>All</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
                <input 
                  type="search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sellers..." 
                  className="text-sm border rounded-lg px-3 py-2 w-64"
                />
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
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
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
        </main>
      </div>

      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedSeller.name}</h2>
                <span className={getStatusBadge(selectedSeller.status)}>{selectedSeller.status.toUpperCase()}</span>
              </div>
              <button onClick={() => setSelectedSeller(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Seller Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{sellerProducts[selectedSeller._id] || 0}</div>
                  <div className="text-xs text-blue-600">Products</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedSeller.totalOrders || 0}</div>
                  <div className="text-xs text-green-600">Orders</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">₹{selectedSeller.totalRevenue || 0}</div>
                  <div className="text-xs text-purple-600">Revenue</div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSeller.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSeller.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSeller.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedSeller.businessType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand Names</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSeller.brandNames || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Active Cities</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSeller.cities || 'N/A'}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedSeller.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-bold">Approval Actions</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAction(selectedSeller._id, 'approve')}
                      className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 font-medium"
                    >
                      ✓ Approve Seller
                    </button>
                    <button
                      onClick={() => {
                        if (rejectionReason.trim()) {
                          handleAction(selectedSeller._id, 'reject');
                        } else {
                          alert('Please provide rejection reason');
                        }
                      }}
                      className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 font-medium"
                    >
                      ✗ Reject Seller
                    </button>
                  </div>
                  <textarea
                    placeholder="Rejection reason (required for rejection)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3"
                    rows={3}
                  />
                </div>
              )}

              {selectedSeller.status === 'approved' && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => handleAction(selectedSeller._id, 'suspend')}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 font-medium"
                  >
                    Suspend Seller
                  </button>
                </div>
              )}

              {selectedSeller.status === 'rejected' && selectedSeller.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-red-700">Rejection Reason</label>
                  <p className="mt-1 text-sm text-red-600">{selectedSeller.rejectionReason}</p>
                </div>
              )}

              {selectedSeller.verifiedBy && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verified By</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSeller.verifiedBy}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verified At</label>
                      <p className="mt-1 text-sm text-gray-900">
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
    </div>
  );
}
