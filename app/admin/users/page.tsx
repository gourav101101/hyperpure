"use client";
import { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterActive, setFilterActive] = useState('all');

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

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.phoneNumber.includes(searchTerm);
      if (filterActive === 'active') return matchesSearch && user.orderCount > 0;
      if (filterActive === 'inactive') return matchesSearch && user.orderCount === 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'totalSpent') return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortBy === 'orderCount') return b.orderCount - a.orderCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total: users.length,
    active: users.filter(u => u.orderCount > 0).length,
    totalRevenue: users.reduce((sum, u) => sum + (u.totalSpent || 0), 0)
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-1">Manage and monitor all registered users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Sort by: Newest</option>
            <option value="totalSpent">Sort by: Spending</option>
            <option value="orderCount">Sort by: Orders</option>
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">{user.phoneNumber}</td>
                  <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">{new Date(user.lastLogin).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.orderCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900 whitespace-nowrap">₹{(user.totalSpent || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.orderCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.orderCount > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">{selectedUser.phoneNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">User ID</p>
                    <p className="font-mono text-sm text-gray-900">{selectedUser._id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Joined Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Last Login</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedUser.orderCount}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-green-900">₹{(selectedUser.totalSpent || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 mb-1">Cart Items</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedUser.cartItemsCount}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-600 mb-1">Wishlist Items</p>
                    <p className="text-2xl font-bold text-orange-900">{selectedUser.wishlistCount}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-3">
                  {selectedUser.lastOrderDate && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Last Order Date</span>
                      <span className="font-semibold text-gray-900">{new Date(selectedUser.lastOrderDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Average Order Value</span>
                    <span className="font-semibold text-gray-900">
                      ₹{selectedUser.orderCount > 0 ? Math.round((selectedUser.totalSpent || 0) / selectedUser.orderCount).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.orderCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.orderCount > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
