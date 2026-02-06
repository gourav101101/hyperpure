"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
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
        fetch('/api/products').then(r => r.ok ? r.json() : []),
        fetch('/api/categories').then(r => r.ok ? r.json() : []),
        fetch('/api/blogs').then(r => r.ok ? r.json() : []),
        fetch('/api/users').then(r => r.ok ? r.json() : []),
        fetch('/api/admin/sellers').then(r => r.ok ? r.json() : [])
      ]);
      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
        totalBlogs: Array.isArray(blogs) ? blogs.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalSellers: Array.isArray(sellers) ? sellers.length : 0,
        pendingSellers: Array.isArray(sellers) ? sellers.filter((s: any) => s.status === 'pending').length : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }
    fetchStats();
  }, [router]);

  const statCards = [
    { label: "Total Categories", value: stats.totalCategories, icon: "🗂️", color: "bg-blue-500" },
    { label: "Total Products", value: stats.totalProducts, icon: "📦", color: "bg-purple-500" },
    { label: "Total Sellers", value: stats.totalSellers, icon: "🏪", color: "bg-indigo-500" },
    { label: "Pending Sellers", value: stats.pendingSellers, icon: "⏳", color: "bg-yellow-500" },
    { label: "Total Blogs", value: stats.totalBlogs, icon: "📝", color: "bg-green-500" },
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "bg-orange-500" }
  ];

  return (
    <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Link href="/admin/sellers">
                  <button className="w-full p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left">
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-medium text-sm">Manage Sellers</div>
                  </button>
                </Link>
                <Link href="/admin/products">
                  <button className="w-full p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
                    <div className="text-2xl mb-2">➕</div>
                    <div className="font-medium text-sm">Add Product</div>
                  </button>
                </Link>
                <Link href="/admin/categories">
                  <button className="w-full p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="font-medium text-sm">Manage Categories</div>
                  </button>
                </Link>
                <Link href="/admin/blogs">
                  <button className="w-full p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                    <div className="text-2xl mb-2">📝</div>
                    <div className="font-medium text-sm">Create Blog</div>
                  </button>
                </Link>
                <Link href="/admin/users">
                  <button className="w-full p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-medium text-sm">View Users</div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
    </>
  );
}
