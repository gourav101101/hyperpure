"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();

  const navItems = [
    { name: "Shop", icon: "🏪", path: "/catalogue" },
    { name: "My list", icon: "❤️", path: "/wishlist" },
    { name: "Orders", icon: "📦", path: "/profile" },
    { name: "Account", icon: "👤", path: "/profile" }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full relative ${
              pathname === item.path ? "text-red-500" : "text-gray-600"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
            {item.name === "Shop" && totalItems > 0 && (
              <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
