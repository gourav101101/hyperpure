"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/app/admin/utils/session";

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
        fetch("/api/categories").then(r => (r.ok ? r.json() : [])),
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
    fetchStats();
  }, [router]);

  const statCards = [
    { label: "Total Categories", value: stats.totalCategories, icon: "C", color: "bg-blue-500" },
    { label: "Total Products", value: stats.totalProducts, icon: "P", color: "bg-purple-500" },
    { label: "Total Sellers", value: stats.totalSellers, icon: "S", color: "bg-indigo-500" },
    { label: "Pending Sellers", value: stats.pendingSellers, icon: "Q", color: "bg-yellow-500" },
    { label: "Total Blogs", value: stats.totalBlogs, icon: "B", color: "bg-green-500" },
    { label: "Total Users", value: stats.totalUsers, icon: "U", color: "bg-orange-500" }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-lg font-bold" aria-hidden>
                  {stat.icon}
                </span>
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
                <div className="w-9 h-9 rounded-md bg-indigo-200 text-indigo-900 flex items-center justify-center text-sm font-bold mb-2">
                  S
                </div>
                <div className="font-medium text-sm">Manage Sellers</div>
              </button>
            </Link>
            <Link href="/admin/products">
              <button className="w-full p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
                <div className="w-9 h-9 rounded-md bg-red-200 text-red-900 flex items-center justify-center text-sm font-bold mb-2">
                  P
                </div>
                <div className="font-medium text-sm">Add Product</div>
              </button>
            </Link>
            <Link href="/admin/categories">
              <button className="w-full p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                <div className="w-9 h-9 rounded-md bg-blue-200 text-blue-900 flex items-center justify-center text-sm font-bold mb-2">
                  C
                </div>
                <div className="font-medium text-sm">Manage Categories</div>
              </button>
            </Link>
            <Link href="/admin/blogs">
              <button className="w-full p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                <div className="w-9 h-9 rounded-md bg-green-200 text-green-900 flex items-center justify-center text-sm font-bold mb-2">
                  B
                </div>
                <div className="font-medium text-sm">Create Blog</div>
              </button>
            </Link>
            <Link href="/admin/users">
              <button className="w-full p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
                <div className="w-9 h-9 rounded-md bg-orange-200 text-orange-900 flex items-center justify-center text-sm font-bold mb-2">
                  U
                </div>
                <div className="font-medium text-sm">View Users</div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}