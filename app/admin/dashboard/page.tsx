"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminSession } from "@/app/admin/utils/session";
import AdminNotificationBell from "../components/AdminNotificationBell";

type Stats = {
  totalProducts: number;
  totalCategories: number;
  totalBlogs: number;
  totalUsers: number;
  totalSellers: number;
  pendingSellers: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [adminId, setAdminId] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBlogs: 0,
    totalUsers: 0,
    totalSellers: 0,
    pendingSellers: 0
  });

  const fetchStats = async () => {
    try {
      const [products, categories, blogs, users, sellers] = await Promise.all([
        fetch("/api/products").then(r => (r.ok ? r.json() : [])),
        fetch("/api/admin/categories").then(r => (r.ok ? r.json() : [])),
        fetch("/api/blogs").then(r => (r.ok ? r.json() : [])),
        fetch("/api/users").then(r => (r.ok ? r.json() : [])),
        fetch("/api/admin/sellers").then(r => (r.ok ? r.json() : []))
      ]);

      const sellerList = Array.isArray(sellers) ? sellers : [];

      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
        totalBlogs: Array.isArray(blogs) ? blogs.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalSellers: sellerList.length,
        pendingSellers: sellerList.filter((s: any) => s.status === "pending").length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const session = getAdminSession();
    if (!session.adminAuth) {
      router.replace("/admin/login");
      return;
    }
    const id = session.adminId || 'admin';
    console.log('👤 Admin ID:', id);
    setAdminId(id);
    fetchStats();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your platform statistics</p>
        </div>
        <div className="flex items-center gap-4">
          {adminId && <AdminNotificationBell adminId={adminId} />}
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Categories</div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalCategories}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Products</div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Total Sellers</div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalSellers}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Pending Sellers</div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.pendingSellers}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Blogs</div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalBlogs}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Users</div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => router.push("/admin/sellers")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <svg className="w-8 h-8 text-indigo-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="font-medium text-sm text-gray-900">Sellers</div>
          </button>

          <button
            onClick={() => router.push("/admin/products")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div className="font-medium text-sm text-gray-900">Products</div>
          </button>

          <button
            onClick={() => router.push("/admin/categories")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <div className="font-medium text-sm text-gray-900">Categories</div>
          </button>

          <button
            onClick={() => router.push("/admin/blogs")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="font-medium text-sm text-gray-900">Blogs</div>
          </button>

          <button
            onClick={() => router.push("/admin/users")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <svg className="w-8 h-8 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="font-medium text-sm text-gray-900">Users</div>
          </button>
        </div>
      </div>
    </div>
  );
}
