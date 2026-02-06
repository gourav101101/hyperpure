"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState("");
  const [mounted, setMounted] = useState(false);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!pathname) return;
    if (pathname.includes("/dashboard")) setActiveMenu("dashboard");
    else if (pathname.includes("/products")) setActiveMenu("products");
    else if (pathname.includes("/categories")) setActiveMenu("categories");
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
    else setActiveMenu("");
  }, [mounted, pathname]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeMenu]);

  const menuItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard", href: "/admin/dashboard" },
    { id: "notifications", icon: "🔔", label: "Notifications", href: "/admin/notifications" },
    { id: "sellers", icon: "🏪", label: "Sellers", href: "/admin/sellers" },
    { id: "commission", icon: "💰", label: "Commission", href: "/admin/commission" },
    { id: "payouts", icon: "💳", label: "Payouts", href: "/admin/payouts" },
    { id: "delivery-slots", icon: "🚚", label: "Delivery Slots", href: "/admin/delivery-slots" },
    { id: "analytics", icon: "📈", label: "Analytics", href: "/admin/analytics" },
    { id: "bulk-orders", icon: "📦", label: "Bulk Orders", href: "/admin/bulk-orders" },
    { id: "campaigns", icon: "📧", label: "Campaigns", href: "/admin/campaigns" },
    { id: "products", icon: "🍽️", label: "Products", href: "/admin/products" },
    { id: "categories", icon: "🗂️", label: "Categories", href: "/admin/categories" },
    { id: "locations", icon: "📍", label: "Locations", href: "/admin/locations" },
    { id: "blogs", icon: "📝", label: "Blogs", href: "/admin/blogs" },
    { id: "users", icon: "👥", label: "Users", href: "/admin/users" }
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin/login";
  };

  return (
    <aside className="fixed left-0 top-0 w-64 bg-slate-800 text-white flex flex-col h-screen">
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-bold">h</span>
        </div>
        <span className="ml-3 text-lg font-bold text-gray-900">hyperpure</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            ref={mounted && activeMenu === item.id ? activeRef : null}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              mounted && activeMenu === item.id
                ? "bg-red-500 text-white shadow-lg"
                : "text-slate-200 hover:bg-slate-700"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-200 hover:bg-red-500 hover:text-white transition-colors font-medium"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
