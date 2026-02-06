"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CommissionSettings() {
  const [commission, setCommission] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCommission();
    fetchTiers();
  }, []);

  const fetchCommission = async () => {
    const res = await fetch('/api/admin/commission');
    if (res.ok) {
      const data = await res.json();
      setCommission(data);
    }
  };

  const fetchTiers = async () => {
    const res = await fetch('/api/admin/tiers');
    if (res.ok) {
      const data = await res.json();
      setTiers(data.tiers || []);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate: commission.commissionRate,
          deliveryFee: commission.deliveryFee,
          useTierCommission: commission.useTierCommission,
          isActive: true
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success('Commission settings updated successfully!');
        fetchCommission();
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('Network error');
    }
    setSaving(false);
  };

  const saveTier = async (tier: any) => {
    try {
      const res = await fetch('/api/admin/tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tier)
      });
      
      if (res.ok) {
        toast.success('Tier updated!');
        fetchTiers();
      }
    } catch (error) {
      toast.error('Failed to update tier');
    }
  };

  if (!commission) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Mode */}
        <div className="bg-white rounded-xl border p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ Commission Mode</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!commission.useTierCommission}
                onChange={() => setCommission({...commission, useTierCommission: false})}
                className="w-4 h-4"
              />
              <span className="font-medium">Flat Rate (All Sellers)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={commission.useTierCommission}
                onChange={() => setCommission({...commission, useTierCommission: true})}
                className="w-4 h-4"
              />
              <span className="font-medium">Tier-Based (Performance)</span>
            </label>
          </div>
        </div>

        {/* Flat Rate Settings */}
        {!commission.useTierCommission && (
          <>
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Platform Commission Rate</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={commission.commissionRate}
                    onChange={(e) => setCommission({...commission, commissionRate: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg font-bold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Applied to all sellers on every order</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🚚 Delivery Fee</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={commission.deliveryFee}
                  onChange={(e) => setCommission({...commission, deliveryFee: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">Charged to customers per order</p>
              </div>
            </div>
          </>
        )}

        {/* Tier-Based Settings */}
        {commission.useTierCommission && (
          <div className="lg:col-span-2 space-y-4">
            {tiers.map((tier) => (
              <div key={tier.tier} className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                    {tier.tier === 'new' && '🆕'}
                    {tier.tier === 'standard' && '⭐'}
                    {tier.tier === 'premium' && '👑'}
                    {' '}{tier.tier} Tier
                  </h3>
                  <button
                    onClick={() => saveTier(tier)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tier.commissionRate}
                      onChange={(e) => {
                        const updated = tiers.map(t => 
                          t.tier === tier.tier ? {...t, commissionRate: parseFloat(e.target.value)} : t
                        );
                        setTiers(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Orders</label>
                    <input
                      type="number"
                      value={tier.minOrders}
                      onChange={(e) => {
                        const updated = tiers.map(t => 
                          t.tier === tier.tier ? {...t, minOrders: parseInt(e.target.value)} : t
                        );
                        setTiers(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Revenue (₹)</label>
                    <input
                      type="number"
                      value={tier.minRevenue}
                      onChange={(e) => {
                        const updated = tiers.map(t => 
                          t.tier === tier.tier ? {...t, minRevenue: parseInt(e.target.value)} : t
                        );
                        setTiers(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-600">Benefits: {tier.benefits?.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Fee (always shown) */}
        {commission.useTierCommission && (
          <div className="bg-white rounded-xl border p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚚 Delivery Fee</h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={commission.deliveryFee}
                onChange={(e) => setCommission({...commission, deliveryFee: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg font-bold"
              />
              <p className="text-xs text-gray-500 mt-1">Charged to customers per order</p>
            </div>
          </div>
        )}

        {/* Commission Calculator */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Commission Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Order Value: ₹1000</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Seller Receives</span>
                  <span className="font-bold text-green-600">₹{(1000 * (100 - commission.commissionRate) / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission ({commission.commissionRate}%)</span>
                  <span className="font-bold text-orange-600">₹{(1000 * commission.commissionRate / 100).toFixed(0)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Order Value: ₹2500</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Seller Receives</span>
                  <span className="font-bold text-green-600">₹{(2500 * (100 - commission.commissionRate) / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission ({commission.commissionRate}%)</span>
                  <span className="font-bold text-orange-600">₹{(2500 * commission.commissionRate / 100).toFixed(0)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Order Value: ₹5000</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Seller Receives</span>
                  <span className="font-bold text-green-600">₹{(5000 * (100 - commission.commissionRate) / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission ({commission.commissionRate}%)</span>
                  <span className="font-bold text-orange-600">₹{(5000 * commission.commissionRate / 100).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Delivery Fee</span>
              <span className="font-bold text-blue-600">₹{commission.deliveryFee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">How Commission Works</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Commission is automatically deducted from seller's earnings on each order</li>
              <li>• Single commission rate applies to all sellers equally</li>
              <li>• Delivery fee is added to customer's total bill</li>
              <li>• Changes apply to new orders immediately</li>
              <li>• Sellers see net earnings after commission in their dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
