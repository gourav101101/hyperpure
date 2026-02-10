"use client";
import { usePathname } from "next/navigation";
import LiveNotifications from "@/app/components/LiveNotifications";

export default function AdminHeader() {
  const pathname = usePathname();
  
  const getPageInfo = () => {
    if (pathname?.includes("/dashboard")) return { title: "Dashboard", subtitle: "Welcome back, Admin!" };
    if (pathname?.includes("/notifications")) return { title: "Notifications", subtitle: "Send notifications to users and sellers" };
    if (pathname?.includes("/sellers")) return { title: "Sellers", subtitle: "Manage seller accounts and approvals" };
    if (pathname?.includes("/commission")) return { title: "Commission", subtitle: "Configure commission rates and rules" };
    if (pathname?.includes("/payouts")) return { title: "Payouts", subtitle: "Process and track seller payouts" };
    if (pathname?.includes("/analytics")) return { title: "Analytics", subtitle: "View platform insights and metrics" };
    if (pathname?.includes("/bulk-orders")) return { title: "Bulk Orders", subtitle: "Manage bulk order requests" };
    if (pathname?.includes("/campaigns")) return { title: "Campaigns", subtitle: "Create and manage marketing campaigns" };
    if (pathname?.includes("/products")) return { title: "Products", subtitle: "Manage product catalog" };
    if (pathname?.includes("/categories")) return { title: "Categories", subtitle: "Organize product categories" };
    if (pathname?.includes("/locations")) return { title: "Locations", subtitle: "Manage delivery locations" };
    if (pathname?.includes("/blogs")) return { title: "Blogs", subtitle: "Create and publish blog posts" };
    if (pathname?.includes("/users")) return { title: "Users", subtitle: "Manage customer accounts" };
    if (pathname?.includes("/delivery-slots")) return { title: "Delivery Slots", subtitle: "Configure delivery schedules and vehicle pickups" };
    if (pathname?.includes("/settings")) return { title: "Settings", subtitle: "Configure platform settings" };
    return { title: "Admin Panel", subtitle: "Manage your platform" };
  };
  
  const pageInfo = getPageInfo();

  return (
    <header className="fixed top-0 left-64 right-0 bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between z-50 h-16">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{pageInfo.title}</h1>
        <p className="text-xs text-gray-500">{pageInfo.subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <LiveNotifications userType="admin" />
        <div className="text-sm font-medium">Admin User</div>
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-lg"></span>
        </div>
      </div>
    </header>
  );
}
