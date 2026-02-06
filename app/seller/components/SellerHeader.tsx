import LiveNotifications from "@/app/components/LiveNotifications";

export default function SellerHeader({ sellerName, sellerId }: { sellerName: string; sellerId: string }) {
  return (
    <header className="bg-white border-b fixed top-0 right-0 left-64 z-40 h-[73px]">
      <div className="px-8 h-full flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-xs text-gray-500">{sellerName}</p>
        </div>
        <div className="flex items-center gap-4">
          <LiveNotifications userType="seller" userId={sellerId} />
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
            {sellerName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

