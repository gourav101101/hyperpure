"use client";

export default function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl font-bold">h</span>
        </div>
        <div>
          <div className="text-xl font-bold">hyperpure</div>
          <div className="text-xs text-gray-500">SUPER ADMIN PANEL</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold">Admin User</div>
          <div className="text-xs text-gray-500">admin@hyperpure.com</div>
        </div>
        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
          <span className="text-xl">👤</span>
        </button>
      </div>
    </header>
  );
}
