"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SellerPerformanceDashboard from "../components/SellerPerformanceDashboard";
import { getSellerSession } from "@/app/seller/utils/session";

import SellerNotificationBell from "../components/SellerNotificationBell";

export default function SellerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [commission, setCommission] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    totalRevenue: 0,
    totalOrders: 0
  });
  const [sellerId, setSellerId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSellerSession();
    if (!session.sellerId) {
      setError("Seller session not found. Please log in.");
      return;
    }
    setSellerId(session.sellerId);
    fetchDashboardData(session.sellerId);
    fetchProducts(session.sellerId);
    fetchCommission();
  }, []);

  const fetchCommission = async () => {
    const res = await fetch("/api/seller/commission");
    if (res.ok) {
      const data = await res.json();
      setCommission(data);
    }
  };

  const fetchDashboardData = async (id: string) => {
    try {
      const res = await fetch(`/api/seller/dashboard?sellerId=${id}`);
      if (!res.ok) {
        setError("Failed to load dashboard data.");
        return;
      }
      const data = await res.json();
      if (data.seller) {
        setDashboardData(data);
        setStats(prev => ({
          ...prev,
          totalOrders: data.stats?.orders || 0,
          totalRevenue: data.stats?.revenue || 0,
          totalProducts: data.stats?.totalProducts || 0,
          activeProducts: data.stats?.activeProducts || 0
        }));
      }
    } catch (err) {
      setError("Failed to load dashboard data.");
    }
  };

  const fetchProducts = async (id: string) => {
    try {
      const res = await fetch(`/api/seller/products?sellerId=${id}`);
      const data = await res.json();
      const prods = data.products || [];

      const validProducts = prods.filter((p: any) => p.productId && p.productId._id);
      setProducts(validProducts);

      const totalProducts = validProducts.length;
      const activeProducts = validProducts.filter((p: any) => p.isActive).length;
      const lowStock = validProducts.filter((p: any) => p.stock < 10).length;

      setStats(prev => ({
        ...prev,
        totalProducts,
        activeProducts,
        lowStock
      }));
    } catch (error) {
      setProducts([]);
      setStats(prev => ({
        ...prev,
        totalProducts: 0,
        activeProducts: 0,
        lowStock: 0
      }));
    }
  };

  if (error) return <div className="p-8">{error}</div>;
  if (!dashboardData) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        {sellerId && <SellerNotificationBell sellerId={sellerId} />}
      </div>

      {commission && dashboardData?.performance && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your Commission Rate</h3>
              <p className="text-3xl font-bold text-green-600">
                {commission.useTierCommission ? (
                  <>
                    {dashboardData.performance.tier === "premium" && "5%"}
                    {dashboardData.performance.tier === "standard" && "10%"}
                    {dashboardData.performance.tier === "new" && "15%"}
                    <span className="text-sm ml-2 text-gray-600">({dashboardData.performance.tier} tier)</span>
                  </>
                ) : (
                  `${commission.commissionRate}%`
                )}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Platform fee is added to customer price. You receive your full amount.
              </p>
            </div>
            {commission.useTierCommission && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Upgrade to lower fee:</p>
                {dashboardData.performance.tier === "new" && (
                  <p className="text-xs text-gray-700">
                    <span className="font-bold">Standard (10%):</span> Complete 50 orders and Rs. 50K revenue
                    <br />
                    <span className="font-bold">Premium (5%):</span> Complete 200 orders and Rs. 200K revenue
                  </p>
                )}
                {dashboardData.performance.tier === "standard" && (
                  <p className="text-xs text-gray-700">
                    <span className="font-bold">Premium (5%):</span> Complete 200 orders and Rs. 200K revenue
                  </p>
                )}
                {dashboardData.performance.tier === "premium" && (
                  <p className="text-xs text-green-700 font-bold">You already have the lowest platform fee.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`mb-6 p-4 rounded-xl ${
          dashboardData.seller.status === "approved"
            ? "bg-green-50 border border-green-200"
            : dashboardData.seller.status === "pending"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-red-50 border border-red-200"
        }`}
      >
        <div>
          <p className="font-semibold">
            {dashboardData.seller.status === "approved"
              ? "Account Approved"
              : dashboardData.seller.status === "pending"
                ? "Account Pending Approval"
                : "Account Rejected"}
          </p>
          <p className="text-sm text-gray-600">
            {dashboardData.seller.status === "approved"
              ? "You can now add and manage products."
              : dashboardData.seller.status === "pending"
                ? "Your account is under review. You will be notified once approved."
                : dashboardData.seller.rejectionReason || "Please contact support for more information."}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

      {sellerId && <SellerPerformanceDashboard sellerId={sellerId} />}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
          <p className="text-sm opacity-90 mt-1">Total Products</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
          <p className="text-3xl font-bold">{stats.activeProducts}</p>
          <p className="text-sm opacity-90 mt-1">Active Products</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
          <p className="text-3xl font-bold">{stats.lowStock}</p>
          <p className="text-sm opacity-90 mt-1">Low Stock</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
          <p className="text-3xl font-bold">Rs. {stats.totalRevenue.toFixed(0)}</p>
          <p className="text-sm opacity-90 mt-1">Total Revenue</p>
          {commission && (
            <p className="text-xs opacity-75 mt-2">
              Commission:{" "}
              {commission.useTierCommission
                ? dashboardData?.performance?.tier === "premium"
                  ? "5%"
                  : dashboardData?.performance?.tier === "standard"
                    ? "10%"
                    : "15%"
                : `${commission.commissionRate}%`}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white">
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-sm opacity-90 mt-1">Total Orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/seller/products" className="w-full text-left p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg hover:shadow-md transition-all flex items-center gap-3 border border-red-100">
              <div>
                <p className="font-semibold">Add New Product</p>
                <p className="text-xs text-gray-600">List a new product for sale</p>
              </div>
            </Link>
            <Link href="/seller/products" className="w-full text-left p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all flex items-center gap-3">
              <div>
                <p className="font-semibold">Manage Products</p>
                <p className="text-xs text-gray-600">Edit or remove products</p>
              </div>
            </Link>
            <Link href="/seller/orders" className="w-full text-left p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all flex items-center gap-3">
              <div>
                <p className="font-semibold">View Orders</p>
                <p className="text-xs text-gray-600">Check order status</p>
              </div>
            </Link>
          </div>
        </div>

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
              <span className="font-semibold">{dashboardData.seller.category || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Products</h3>
            <Link href="/seller/products" className="text-red-600 hover:text-red-700 text-sm font-medium">View All</Link>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{prod.name}</h4>
                  <p className="text-lg font-bold text-green-600 mb-1">Rs. {product.sellerPrice}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock} | MOQ: {product.minOrderQty}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
          <p className="text-gray-600 mb-6">Start by adding products to your catalog</p>
          <Link href="/seller/products" className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}
