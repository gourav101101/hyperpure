"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function SellerSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/register-seller');
  };

  const menuItems = [
    { id: "overview", icon: "📊", label: "Overview", path: "/seller/dashboard" },
    { id: "products", icon: "📦", label: "Products", path: "/seller/products" },
    { id: "orders", icon: "📋", label: "Orders", path: "/seller/orders" },
    { id: "collection", icon: "🚚", label: "Collection Schedule", path: "/seller/collection-schedule" },
    { id: "analytics", icon: "📈", label: "Analytics", path: "/seller/analytics" },
    { id: "pricing", icon: "💰", label: "Pricing", path: "/seller/pricing" },
    { id: "forecast", icon: "🔮", label: "Forecast", path: "/seller/forecast" },
    { id: "payouts", icon: "💳", label: "Payouts", path: "/seller/payouts" },
    { id: "settings", icon: "⚙️", label: "Settings", path: "/seller/settings" }
  ];

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/seller/dashboard") {
      return pathname === "/seller" || pathname.startsWith("/seller/dashboard");
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="bg-white border-r fixed left-0 top-0 bottom-0 w-64 z-50">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
          <div>
            <h2 className="font-bold text-gray-900">Hyperpure</h2>
            <p className="text-xs text-gray-500">Seller Portal</p>
          </div>
        </Link>
      </div>

      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}



