"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark mounted to ensure server and client markup match on first paint
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
    else if (pathname.includes("/users")) setActiveMenu("users");
    else setActiveMenu("");
  }, [mounted, pathname]);

  const menuItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard", href: "/admin/dashboard" },
    { id: "sellers", icon: "🏪", label: "Sellers", href: "/admin/sellers" },
    { id: "products", icon: "📦", label: "Products", href: "/admin/products" },
    { id: "categories", icon: "🗂️", label: "Categories", href: "/admin/categories" },
    { id: "locations", icon: "📍", label: "Locations", href: "/admin/locations" },
    { id: "blogs", icon: "📝", label: "Blogs", href: "/admin/blogs" },
    { id: "users", icon: "👥", label: "Users", href: "/admin/users" }
  ];

  return (
    <aside className="fixed left-0 top-[73px] w-64 bg-gray-900 text-white h-[calc(100vh-73px)] p-4 overflow-y-auto">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              mounted && activeMenu === item.id
                ? "bg-red-500 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
