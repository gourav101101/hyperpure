"use client";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function BulkOrder() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'restaurant',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    deliveryFrequency: 'one-time',
    paymentTerms: 'cod'
  });

  const [items, setItems] = useState([{ productName: '', quantity: '', unit: 'kg', notes: '' }]);
  const [submitted, setSubmitted] = useState(false);

  const addItem = () => {
    setItems([...items, { productName: '', quantity: '', unit: 'kg', notes: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bulkOrder = {
      ...formData,
      items: items.map(item => ({
        name: item.productName,
        quantity: parseInt(item.quantity),
        unit: item.unit,
        notes: item.notes
      })),
      deliveryAddress: {
        name: formData.contactPerson,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode
      }
    };

    const res = await fetch('/api/bulk-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bulkOrder)
    });

    if (res.ok) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header isLoggedIn={false} />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your bulk order request. Our team will review it and get back to you within 24 hours with a customized quote.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-700 space-y-2 text-left">
                <li>✓ Our team reviews your requirements</li>
                <li>✓ We source the best prices from our sellers</li>
                <li>✓ You receive a detailed quote via email</li>
                <li>✓ Accept the quote and we'll process your order</li>
              </ul>
            </div>
            <a href="/" className="inline-block px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
              Back to Home
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={false} />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bulk Order Request</h1>
            <p className="text-lg text-gray-600">For restaurants, cafes, hotels & catering businesses</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="hotel">Hotel</option>
                    <option value="catering">Catering</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Products Required</h2>
                <button type="button" onClick={addItem} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm">
                  + Add Item
                </button>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={item.productName}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                          placeholder="e.g., Tomatoes, Chicken, Rice"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                        <input
                          type="number"
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="L">L</option>
                          <option value="ml">ml</option>
                          <option value="pc">pc</option>
                          <option value="pack">pack</option>
                        </select>
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateItem(index, 'notes', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                          placeholder="Any specific requirements"
                        />
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove Item
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Frequency</label>
                  <select
                    value={formData.deliveryFrequency}
                    onChange={(e) => setFormData({...formData, deliveryFrequency: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="advance">Advance Payment</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="credit_7">7 Days Credit</option>
                    <option value="credit_15">15 Days Credit</option>
                    <option value="credit_30">30 Days Credit</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
            >
              Submit Bulk Order Request
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
