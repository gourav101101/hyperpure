"use client";
import { useEffect, useState } from "react";

export default function SellerOrders() {
  return (
    <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>
          <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Orders Coming Soon</h3>
            <p className="text-gray-600">Order management feature will be available soon</p>
          </div>
    </div>
  );
}
