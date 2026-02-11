"use client";
import { usePathname } from "next/navigation";
import LiveNotifications from "@/app/components/LiveNotifications";

export default function AdminHeader() {
  const pathname = usePathname();
  
  const getPageInfo = () => {
    if (pathname?.includes("/dashboard")) return { title: "Dashboard", subtitle: "Overview of your platform" };
    if (pathname?.includes("/notifications")) return { title: "Notifications", subtitle: "Send notifications to users" };
    if (pathname?.includes("/sellers")) return { title: "Sellers", subtitle: "Manage seller accounts" };
    if (pathname?.includes("/commission")) return { title: "Commission", subtitle: "Configure commission rates" };
    if (pathname?.includes("/payouts")) return { title: "Payouts", subtitle: "Process seller payouts" };
    if (pathname?.includes("/analytics")) return { title: "Analytics", subtitle: "Platform insights" };
    if (pathname?.includes("/bulk-orders")) return { title: "Bulk Orders", subtitle: "Manage bulk requests" };
    if (pathname?.includes("/campaigns")) return { title: "Campaigns", subtitle: "Marketing campaigns" };
    if (pathname?.includes("/products")) return { title: "Products", subtitle: "Manage product catalog" };
    if (pathname?.includes("/categories")) return { title: "Categories", subtitle: "Organize categories" };
    if (pathname?.includes("/locations")) return { title: "Locations", subtitle: "Delivery locations" };
    if (pathname?.includes("/blogs")) return { title: "Blogs", subtitle: "Create blog posts" };
    if (pathname?.includes("/users")) return { title: "Users", subtitle: "Manage customers" };
    if (pathname?.includes("/delivery-slots")) return { title: "Delivery Slots", subtitle: "Configure schedules" };
    return { title: "Admin Panel", subtitle: "Manage platform" };
  };
  
  const pageInfo = getPageInfo();

  return (
    <header className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-50 h-16">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{pageInfo.title}</h1>
        <p className="text-xs text-gray-500">{pageInfo.subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <LiveNotifications userType="admin" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}
