"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminSession } from "@/app/admin/utils/session";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("");
  const [mounted, setMounted] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!pathname) return;
    if (pathname.includes("/dashboard")) setActiveMenu("dashboard");
    else if (pathname.includes("/products")) setActiveMenu("products");
    else if (pathname === "/admin/categories") setActiveMenu("categories");
    else if (pathname.includes("/categories/subcategories")) setActiveMenu("subcategories");
    else if (pathname.includes("/blogs")) setActiveMenu("blogs");
    else if (pathname.includes("/locations")) setActiveMenu("locations");
    else if (pathname.includes("/sellers")) setActiveMenu("sellers");
    else if (pathname.includes("/notifications")) setActiveMenu("notifications");
    else if (pathname.includes("/users")) setActiveMenu("users");
    else if (pathname.includes("/commission")) setActiveMenu("commission");
    else if (pathname.includes("/payouts")) setActiveMenu("payouts");
    else if (pathname.includes("/analytics")) setActiveMenu("analytics");
    else if (pathname.includes("/bulk-orders")) setActiveMenu("bulk-orders");
    else if (pathname.includes("/campaigns")) setActiveMenu("campaigns");
    else if (pathname.includes("/delivery-slots")) setActiveMenu("delivery-slots");
    else if (pathname.includes("/orders")) setActiveMenu("orders");
    else setActiveMenu("");

    if (pathname.includes("/categories")) {
      setCategoriesOpen(true);
    }
  }, [mounted, pathname]);

  const handleLogout = () => {
    clearAdminSession();
    window.location.href = "/admin/login";
  };

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <aside className="fixed left-0 top-0 w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-sm">
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white text-xl font-bold">H</span>
        </div>
        <span className="ml-3 text-xl font-bold text-gray-900">Hyperpure</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {/* Dashboard */}
          <a
            href="/admin/dashboard"
            onClick={(e) => handleNavigation(e, "/admin/dashboard")}
            ref={mounted && activeMenu === "dashboard" ? activeRef : null}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              mounted && activeMenu === "dashboard"
                ? "bg-red-50 text-red-600 shadow-sm"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </a>

          {/* Categories Dropdown */}
          <div>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                mounted && (activeMenu === "categories" || activeMenu === "subcategories")
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🏷️</span>
                <span>Categories</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {categoriesOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                <a
                  href="/admin/categories"
                  onClick={(e) => handleNavigation(e, "/admin/categories")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    mounted && activeMenu === "categories"
                      ? "bg-red-50 text-red-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">📂</span>
                  <span>Categories</span>
                </a>
                <a
                  href="/admin/categories/subcategories"
                  onClick={(e) => handleNavigation(e, "/admin/categories/subcategories")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    mounted && activeMenu === "subcategories"
                      ? "bg-red-50 text-red-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">📑</span>
                  <span>Subcategories</span>
                </a>
              </div>
            )}
          </div>

          {/* Rest of menu items */}
          <a href="/admin/orders" onClick={(e) => handleNavigation(e, "/admin/orders")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "orders" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">🛒</span><span>Orders</span>
          </a>
          <a href="/admin/products" onClick={(e) => handleNavigation(e, "/admin/products")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "products" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">🛍️</span><span>Products</span>
          </a>
          <a href="/admin/users" onClick={(e) => handleNavigation(e, "/admin/users")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "users" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">👤</span><span>Users</span>
          </a>
          <a href="/admin/sellers" onClick={(e) => handleNavigation(e, "/admin/sellers")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "sellers" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">👥</span><span>Sellers</span>
          </a>
          <a href="/admin/commission" onClick={(e) => handleNavigation(e, "/admin/commission")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "commission" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">💰</span><span>Commission</span>
          </a>
          <a href="/admin/payouts" onClick={(e) => handleNavigation(e, "/admin/payouts")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "payouts" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">💳</span><span>Payouts</span>
          </a>
          <a href="/admin/delivery-slots" onClick={(e) => handleNavigation(e, "/admin/delivery-slots")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "delivery-slots" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">🚚</span><span>Delivery Slots</span>
          </a>
          <a href="/admin/analytics" onClick={(e) => handleNavigation(e, "/admin/analytics")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "analytics" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">📈</span><span>Analytics</span>
          </a>
          <a href="/admin/bulk-orders" onClick={(e) => handleNavigation(e, "/admin/bulk-orders")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "bulk-orders" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">📦</span><span>Bulk Orders</span>
          </a>
          <a href="/admin/campaigns" onClick={(e) => handleNavigation(e, "/admin/campaigns")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "campaigns" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">🎯</span><span>Campaigns</span>
          </a>
          <a href="/admin/locations" onClick={(e) => handleNavigation(e, "/admin/locations")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "locations" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">📍</span><span>Locations</span>
          </a>
          <a href="/admin/blogs" onClick={(e) => handleNavigation(e, "/admin/blogs")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "blogs" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">📝</span><span>Blogs</span>
          </a>
          <a href="/admin/notifications" onClick={(e) => handleNavigation(e, "/admin/notifications")} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${mounted && activeMenu === "notifications" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
            <span className="text-lg">🔔</span><span>Notifications</span>
          </a>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
