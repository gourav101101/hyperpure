"use client";
import { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    const users = Array.isArray(data) ? data : [];
    setUsers(users);
    setLoading(false);
  };

  return (
    <>

          
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.phoneNumber}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(user.lastLogin).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{user.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
                  <p className="text-gray-500">Users will appear here once they sign up</p>
                </div>
              )}
            </div>
          )}
    </>
  );
}
