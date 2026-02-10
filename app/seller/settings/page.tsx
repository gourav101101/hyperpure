"use client";
import { useEffect, useState } from "react";
import { getSellerSession } from "@/app/seller/utils/session";

export default function SellerSettings() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
    setLoading(true);
    setError(null);
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
        const data = await res.json();
        setDashboardData(prev => ({ ...prev, seller: data.seller }));
        setEditMode(false);
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update settings');
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const validateIFSC = (code: string) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code);
  };

  const validateAccountNumber = (num: string) => {
    return /^\d{9,18}$/.test(num);
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.ifscCode || !bankForm.bankName) {
      setError('Please fill all required bank fields');
      return;
    }
    if (!validateIFSC(bankForm.ifscCode)) {
      setError('Invalid IFSC code format (e.g., SBIN0001234)');
      return;
    }
    if (!validateAccountNumber(bankForm.accountNumber)) {
      setError('Account number must be 9-18 digits');
      return;
    }
    setLoading(true);
    setError(null);
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
        const data = await res.json();
        setDashboardData(prev => ({ ...prev, seller: data.seller }));
        setEditBankMode(false);
        setSuccessMessage('Bank details updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to update bank details');
      }
    } catch (error) {
      console.error('Failed to update bank details');
      setError('Failed to update bank details');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="p-8">{error}</div>;
  if (!dashboardData) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
          
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
                        onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value.replace(/\D/g, '')})}
                        disabled={!editBankMode}
                        maxLength={18}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                        placeholder="1234567890"
                        aria-label="Account Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input 
                        type="text" 
                        value={bankForm.ifscCode} 
                        onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                        disabled={!editBankMode}
                        maxLength={11}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editBankMode ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
                        placeholder="SBIN0001234"
                        aria-label="IFSC Code"
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
                    <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Saving...' : 'Save Bank Details'}
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
                      <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Saving...' : 'Save Changes'}
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
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dashboardData.seller.status === 'approved' ? 'bg-green-500' : dashboardData.seller.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                      <p className={`font-semibold capitalize ${dashboardData.seller.status === 'approved' ? 'text-green-600' : dashboardData.seller.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {dashboardData.seller.status}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Member Since</p>
                    <p className="font-semibold text-sm">{new Date(dashboardData.seller.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                  </div>
                  {dashboardData.seller.bankDetails?.accountNumber && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 mb-1">Bank Linked</p>
                      <p className="font-semibold text-sm text-green-700">****{dashboardData.seller.bankDetails.accountNumber.slice(-4)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Need Help?</h3>
                    <p className="text-sm text-gray-600 mt-1">Contact our support team</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p>📧 support@hyperpure.com</p>
                  <p>📞 +91 1800-XXX-XXXX</p>
                </div>
                <button className="w-full bg-white border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                  Contact Support
                </button>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all data</p>
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  aria-label="Delete Account"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteDialog(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Account?</h3>
            </div>
            <p className="text-gray-600 mb-6">This action cannot be undone. All your data, products, and order history will be permanently deleted.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setError('Account deletion is currently disabled. Contact support.');
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
