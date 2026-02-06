"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RegisterBusinessPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    gstNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Business registration submitted! We'll contact you soon.");
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold mb-2">Register as Business</h1>
            <p className="text-gray-600 mb-6">Get exclusive B2B pricing and benefits</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">GST Number</label>
                <input
                  type="text"
                  required
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Contact Person</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Business Address</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>
              
              <button type="submit" className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
