"use client";
import { useEffect, useState } from "react";
import { getSellerSession } from "@/app/seller/utils/session";

export default function SellerSettings() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    brandNames: '',
    category: '',
    cities: '',
    horecaClients: ''
  });
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branch: '',
    upiId: ''
  });
  const [editBankMode, setEditBankMode] = useState(false);

  useEffect(() => {
    const session = getSellerSession();
    if (!session.sellerId) {
      setError("Seller session not found. Please log in.");
      return;
    }
    fetchDashboardData(session.sellerId);
  }, []);

  const fetchDashboardData = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/seller/dashboard?sellerId=${sellerId}`);
      const data = await res.json();
      if (data.seller) {
        setDashboardData(data);
        setSettingsForm({
          brandNames: data.seller.brandNames || '',
          category: data.seller.category || '',
          cities: data.seller.cities || '',
          horecaClients: data.seller.horecaClients || ''
        });
        setBankForm({
          accountHolderName: data.seller.bankDetails?.accountHolderName || '',
          accountNumber: data.seller.bankDetails?.accountNumber || '',
          ifscCode: data.seller.bankDetails?.ifscCode || '',
          bankName: data.seller.bankDetails?.bankName || '',
          branch: data.seller.bankDetails?.branch || '',
          upiId: data.seller.bankDetails?.upiId || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data');
      setError("Failed to load settings.");
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = getSellerSession();
      const sellerId = session.sellerId;
      if (!sellerId) {
        setError("Seller session not found. Please log in.");
        return;
      }
      const res = await fetch('/api/seller/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, ...settingsForm })
      });
      if (res.ok) {
        setEditMode(false);
        fetchDashboardData(sellerId);
        alert('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update settings');
      alert('Failed to update settings');
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = getSellerSession();
      const sellerId = session.sellerId;
      if (!sellerId) {
        setError("Seller session not found. Please log in.");
        return;
      }
      const res = await fetch('/api/seller/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, bankDetails: bankForm })
      });
      if (res.ok) {
        setEditBankMode(false);
        fetchDashboardData(sellerId);
        alert('Bank details updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update bank details');
      alert('Failed to update bank details');
    }
  };

  if (error) return <div className="p-8">{error}</div>;
  if (!dashboardData) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bank Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Bank Details</h3>
                    <p className="text-sm text-gray-600">For receiving payouts</p>
                  </div>
                  {!editBankMode ? (
                    <button onClick={() => setEditBankMode(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                      {dashboardData.seller.bankDetails?.accountNumber ? 'Edit' : 'Add'}
                    </button>
                  ) : (
                    <button onClick={() => { setEditBankMode(false); setBankForm({
                      accountHolderName: dashboardData.seller.bankDetails?.accountHolderName || '',
                      accountNumber: dashboardData.seller.bankDetails?.accountNumber || '',
                      ifscCode: dashboardData.seller.bankDetails?.ifscCode || '',
                      bankName: dashboardData.seller.bankDetails?.bankName || '',
                      branch: dashboardData.seller.bankDetails?.branch || '',
                      upiId: dashboardData.seller.bankDetails?.upiId || ''
                    }); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateBank} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                    <input 
                      type="text" 
                      value={bankForm.accountHolderName} 
                      onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})}
                      disabled={!editBankMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                      placeholder="As per bank account"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input 
                        type="text" 
                        value={bankForm.accountNumber} 
                        onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                        disabled={!editBankMode}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input 
                        type="text" 
                        value={bankForm.ifscCode} 
                        onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                        disabled={!editBankMode}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                        placeholder="SBIN0001234"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input 
                        type="text" 
                        value={bankForm.bankName} 
                        onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                        disabled={!editBankMode}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                        placeholder="State Bank of India"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                      <input 
                        type="text" 
                        value={bankForm.branch} 
                        onChange={(e) => setBankForm({...bankForm, branch: e.target.value})}
                        disabled={!editBankMode}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                        placeholder="Mumbai Main"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID (Optional)</label>
                    <input 
                      type="text" 
                      value={bankForm.upiId} 
                      onChange={(e) => setBankForm({...bankForm, upiId: e.target.value})}
                      disabled={!editBankMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                      placeholder="yourname@upi"
                    />
                  </div>

                  {editBankMode && (
                    <button type="submit" className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                      Save Bank Details
                    </button>
                  )}
                </form>
              </div>

              {/* Business Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Business Information</h3>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                      Edit
                    </button>
                  ) : (
                    <button onClick={() => { setEditMode(false); setSettingsForm({
                      brandNames: dashboardData.seller.brandNames || '',
                      category: dashboardData.seller.category || '',
                      cities: dashboardData.seller.cities || '',
                      horecaClients: dashboardData.seller.horecaClients || ''
                    }); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  {/* Read-only fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input type="text" value={dashboardData.seller.name} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                    <p className="text-xs text-gray-500 mt-1">Contact support to change</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" value={dashboardData.seller.email} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" value={dashboardData.seller.phone} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <input type="text" value={dashboardData.seller.businessType} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize" />
                  </div>

                  {/* Editable fields */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-4">Editable Information</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Names</label>
                        <input 
                          type="text" 
                          value={settingsForm.brandNames} 
                          onChange={(e) => setSettingsForm({...settingsForm, brandNames: e.target.value})}
                          disabled={!editMode}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                          placeholder="e.g., Brand A, Brand B"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                        <input 
                          type="text" 
                          value={settingsForm.category} 
                          onChange={(e) => setSettingsForm({...settingsForm, category: e.target.value})}
                          disabled={!editMode}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                          placeholder="e.g., Spices, Dairy, Beverages"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cities Serving</label>
                        <input 
                          type="text" 
                          value={settingsForm.cities} 
                          onChange={(e) => setSettingsForm({...settingsForm, cities: e.target.value})}
                          disabled={!editMode}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                          placeholder="e.g., Mumbai, Delhi, Bangalore"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">HoReCa Clients</label>
                        <textarea 
                          value={settingsForm.horecaClients} 
                          onChange={(e) => setSettingsForm({...settingsForm, horecaClients: e.target.value})}
                          disabled={!editMode}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                          rows={3}
                          placeholder="List your major hotel, restaurant, or cafe clients"
                        />
                      </div>
                    </div>
                  </div>

                  {editMode && (
                    <div className="pt-4">
                      <button type="submit" className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Account Status & Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className={`font-semibold capitalize ${dashboardData.seller.status === 'approved' ? 'text-green-600' : dashboardData.seller.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {dashboardData.seller.status}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Member Since</p>
                    <p className="font-semibold text-sm">{new Date(dashboardData.seller.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">Contact our support team for assistance</p>
                <button className="w-full bg-white border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                  Contact Support
                </button>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all data</p>
                <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
    </div>
  );
}
