"use client";
import { useEffect, useState } from "react";

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    trigger: { type: 'manual' },
    targetAudience: { userType: 'all' },
    subject: '',
    message: '',
    offer: { type: 'none', value: 0 },
    status: 'draft'
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const res = await fetch('/api/campaigns');
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    }
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      fetchCampaigns();
      setShowCreate(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/campaigns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    fetchCampaigns();
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h2>
          <p className="text-sm text-gray-600 mt-1">Automated email, SMS & push notifications</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
          + Create Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-xl font-bold mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">Create your first marketing campaign</p>
          <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{campaign.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(campaign.status)}`}>
                      {campaign.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {campaign.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{campaign.message.substring(0, 100)}...</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Sent</p>
                  <p className="text-xl font-bold">{campaign.sent || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Delivered</p>
                  <p className="text-xl font-bold text-green-600">{campaign.delivered || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Opened</p>
                  <p className="text-xl font-bold text-blue-600">{campaign.opened || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Converted</p>
                  <p className="text-xl font-bold text-purple-600">{campaign.converted || 0}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'draft' && (
                  <button onClick={() => updateStatus(campaign._id, 'active')} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">
                    Activate
                  </button>
                )}
                {campaign.status === 'active' && (
                  <button onClick={() => updateStatus(campaign._id, 'paused')} className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600">
                    Pause
                  </button>
                )}
                {campaign.status === 'paused' && (
                  <button onClick={() => updateStatus(campaign._id, 'active')} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">
                    Resume
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Create Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={createCampaign} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
                    <select
                      value={formData.targetAudience.userType}
                      onChange={(e) => setFormData({...formData, targetAudience: { userType: e.target.value }})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="all">All Users</option>
                      <option value="customers">Customers Only</option>
                      <option value="sellers">Sellers Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    placeholder="e.g., Special Offer Just for You!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    rows={4}
                    placeholder="Your campaign message..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                    <select
                      value={formData.offer.type}
                      onChange={(e) => setFormData({...formData, offer: {...formData.offer, type: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="none">No Offer</option>
                      <option value="discount">Discount</option>
                      <option value="cashback">Cashback</option>
                      <option value="freebie">Free Item</option>
                    </select>
                  </div>
                  {formData.offer.type !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Offer Value</label>
                      <input
                        type="number"
                        value={formData.offer.value}
                        onChange={(e) => setFormData({...formData, offer: {...formData.offer, value: parseFloat(e.target.value)}})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                        placeholder={formData.offer.type === 'discount' ? '10' : '50'}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
