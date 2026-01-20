"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, lowStock: 0, totalRevenue: 0, totalOrders: 0 });

  useEffect(() => {
    const sellerId = localStorage.getItem('sellerId');
    if (sellerId) {
      fetchDashboardData(sellerId);
      fetchProducts(sellerId);
    }
  }, []);

  const fetchDashboardData = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/seller/dashboard?sellerId=${sellerId}`);
      const data = await res.json();
      if (data.seller) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const fetchProducts = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/seller/products?sellerId=${sellerId}`);
      const data = await res.json();
      const prods = data.products || [];
      setProducts(prods);
      
      // Calculate real stats
      const totalProducts = prods.length;
      const activeProducts = prods.filter((p: any) => p.isActive).length;
      const lowStock = prods.filter((p: any) => p.stock < 10).length;
      const totalRevenue = prods.reduce((sum: number, p: any) => sum + (p.sellerPrice * (p.stock || 0)), 0);
      
      setStats({ totalProducts, activeProducts, lowStock, totalRevenue, totalOrders: 0 });
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  if (!dashboardData) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
          {/* Status Banner */}
          <div className={`mb-6 p-4 rounded-xl ${
            dashboardData.seller.status === 'approved' ? 'bg-green-50 border border-green-200' :
            dashboardData.seller.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {dashboardData.seller.status === 'approved' ? '✅' : 
                 dashboardData.seller.status === 'pending' ? '⏳' : '❌'}
              </span>
              <div>
                <p className="font-semibold">
                  {dashboardData.seller.status === 'approved' ? 'Account Approved' :
                   dashboardData.seller.status === 'pending' ? 'Account Pending Approval' :
                   'Account Rejected'}
                </p>
                <p className="text-sm text-gray-600">
                  {dashboardData.seller.status === 'approved' ? 'You can now add and manage products' :
                   dashboardData.seller.status === 'pending' ? 'Your account is under review. You will be notified once approved.' :
                   dashboardData.seller.rejectionReason || 'Please contact support for more information'}
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
              <p className="text-sm opacity-90 mt-1">Total Products</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-3xl font-bold">{stats.activeProducts}</p>
              <p className="text-sm opacity-90 mt-1">Active Products</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-3xl font-bold">{stats.lowStock}</p>
              <p className="text-sm opacity-90 mt-1">Low Stock</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(0)}</p>
              <p className="text-sm opacity-90 mt-1">Inventory Value</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
              <p className="text-sm opacity-90 mt-1">Total Orders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/seller/products" className="w-full text-left p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg hover:shadow-md transition-all flex items-center gap-3 border border-red-100">
                  <span className="text-2xl">➕</span>
                  <div>
                    <p className="font-semibold">Add New Product</p>
                    <p className="text-xs text-gray-600">List a new product for sale</p>
                  </div>
                </Link>
                <Link href="/seller/products" className="w-full text-left p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-semibold">Manage Products</p>
                    <p className="text-xs text-gray-600">Edit or remove products</p>
                  </div>
                </Link>
                <Link href="/seller/orders" className="w-full text-left p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-semibold">View Orders</p>
                    <p className="text-xs text-gray-600">Check order status</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Business Name</span>
                  <span className="font-semibold">{dashboardData.seller.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Business Type</span>
                  <span className="font-semibold capitalize">{dashboardData.seller.businessType}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold text-xs">{dashboardData.seller.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-semibold">{dashboardData.seller.phone}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold">{dashboardData.seller.category || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          {products.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Products</h3>
                <Link href="/seller/products" className="text-red-600 hover:text-red-700 text-sm font-medium">View All →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.slice(0, 3).map((product) => {
                  const prod = product.productId;
                  if (!prod) return null;
                  return (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <img src={prod.images?.[0]} alt={prod.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{prod.name}</h4>
                      <p className="text-lg font-bold text-green-600 mb-1">₹{product.sellerPrice}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock} • MOQ: {product.minOrderQty}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
    </div>
  );
}
