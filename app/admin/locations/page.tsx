"use client";
import { useState, useEffect } from "react";
import ConfirmModal from "../components/ConfirmModal";

export default function LocationsAdmin() {
  const [locations, setLocations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, locationId: string | null}>({isOpen: false, locationId: null});
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    pincode: "",
    active: true
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const res = await fetch('/api/locations');
    const data = await res.json();
    const locations = Array.isArray(data) ? data : [];
    setLocations(locations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...formData })
      });
    } else {
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    setFormData({ name: "", city: "", state: "", pincode: "", active: true });
    setEditId(null);
    setShowModal(false);
    fetchLocations();
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({isOpen: true, locationId: id});
  };

  const confirmDelete = async () => {
    if (deleteConfirm.locationId) {
      await fetch(`/api/locations?id=${deleteConfirm.locationId}`, { method: 'DELETE' });
      fetchLocations();
    }
    setDeleteConfirm({isOpen: false, locationId: null});
  };

  const handleEdit = (loc: any) => {
    setFormData({
      name: loc.name,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      active: loc.active
    });
    setEditId(loc._id);
    setShowModal(true);
  };

  return (
    <>
          <div className="flex items-center justify-end mb-6">
            <button onClick={() => setShowModal(true)} className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2">
              <span>+</span> Add Location
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
              <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Location' : 'Add Location'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Location Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                  <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                  <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                  <input type="text" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                    <button type="submit" className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">{editId ? 'Update' : 'Add'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {locations.map((loc) => (
              <div key={loc._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-2">{loc.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{loc.city}, {loc.state}</p>
                <p className="text-sm text-gray-600 mb-4">Pincode: {loc.pincode}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(loc)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium">Edit</button>
                  <button onClick={() => handleDelete(loc._id)} className="w-9 h-9 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({isOpen: false, locationId: null})}
        type="danger"
      />
    </>
  );
}
