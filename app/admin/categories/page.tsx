"use client";
import { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

interface Category {
  id?: string;
  _id?: string;
  name: string;
  icon: string;
  order: number;
  subcategories: { name: string; icon?: string }[];
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [subcategories, setSubcategories] = useState<{name: string; icon: string}[]>([]);
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [subcategoryIcon, setSubcategoryIcon] = useState("");
  const [uploadingSubIcon, setUploadingSubIcon] = useState(false);
  const [oldIcon, setOldIcon] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    if (data.url) setIcon(data.url);
    setUploading(false);
  };

  const handleSubcategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingSubIcon(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    if (data.url) setSubcategoryIcon(data.url);
    setUploadingSubIcon(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        // Delete old image from Cloudinary if a new one was uploaded
        if (oldIcon && icon !== oldIcon && oldIcon.includes('cloudinary')) {
          const publicId = oldIcon.split('/').pop()?.split('.')[0];
          if (publicId) {
            await fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId: `hyperpure/${publicId}` })
            });
          }
        }
        await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, name, icon, subcategories })
        });
        showNotification('success', 'Category updated successfully!');
        setEditId(null);
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, icon, order: categories.length, subcategories })
        });
        showNotification('success', 'Category added successfully!');
      }
      setName("");
      setIcon("");
      setOldIcon("");
      setSubcategories([]);
      setSubcategoryInput("");
      setSubcategoryIcon("");
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      showNotification('error', 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      showNotification('success', 'Category deleted successfully!');
      setDeleteId(null);
      fetchCategories();
    } catch (error) {
      showNotification('error', 'Failed to delete category');
    }
  };

  const handleEdit = (cat: any) => {
    setName(cat.name);
    setIcon(cat.icon);
    setOldIcon(cat.icon);
    setSubcategories(cat.subcategories || []);
    setEditId(cat._id || cat.id);
    setShowModal(true);
  };

  const openAddModal = () => {
    setName("");
    setIcon("");
    setOldIcon("");
    setSubcategories([]);
    setSubcategoryInput("");
    setSubcategoryIcon("");
    setEditId(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-[73px]">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-lg shadow-lg animate-slide-in ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium`}>
              {notification.message}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-sm text-gray-600 mt-0.5">{categories.length} categories</p>
            </div>
            <button onClick={openAddModal} className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2">
              <span>+</span> Add Category
            </button>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{editId ? 'Edit Category' : 'Add New Category'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Fruits & Vegetables"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          disabled={uploading}
                        />
                        {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
                        {icon && (
                          <div className="mt-3">
                            {(icon.startsWith && (icon.startsWith('http') || icon.startsWith('data:')))
                              || (icon.includes && icon.includes('/')) ? (
                              <img src={icon} alt="Category" className="w-24 h-24 object-cover rounded-lg" />
                            ) : (
                              <div className="w-24 h-24 flex items-center justify-center text-4xl rounded-lg bg-gray-100">{icon}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Subcategories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategories</label>
                      <div className="space-y-2 mb-3">
                        <input
                          type="text"
                          placeholder="Subcategory name"
                          value={subcategoryInput}
                          onChange={(e) => setSubcategoryInput(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSubcategoryImageUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          disabled={uploadingSubIcon}
                        />
                        {uploadingSubIcon && <p className="text-xs text-blue-500">Uploading...</p>}
                        {subcategoryIcon && <img src={subcategoryIcon} alt="Sub" className="w-12 h-12 object-cover rounded" />}
                        <button
                          type="button"
                          onClick={() => {
                            if (subcategoryInput.trim() && subcategoryIcon) {
                              setSubcategories([...subcategories, { name: subcategoryInput.trim(), icon: subcategoryIcon }]);
                              setSubcategoryInput("");
                              setSubcategoryIcon("");
                            }
                          }}
                          className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                          disabled={!subcategoryInput.trim() || !subcategoryIcon}
                        >
                          Add Subcategory
                        </button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {subcategories.map((sub, idx) => (
                          <div key={idx} className="bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2">
                            {sub.icon && <img src={sub.icon} alt={sub.name} className="w-8 h-8 object-cover rounded" />}
                            <span className="text-sm flex-1">{sub.name}</span>
                            <button
                              type="button"
                              onClick={() => setSubcategories(subcategories.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 text-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 mt-4 border-t">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600" disabled={uploading || !icon}>
                      {editId ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <div key={cat.id || cat._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
                <div className="p-4 text-center">
                  <div className="mb-3">
                    {cat.icon && ((cat.icon.startsWith && (cat.icon.startsWith('http') || cat.icon.startsWith('data:'))) || (cat.icon.includes && cat.icon.includes('/'))) ? (
                      <img src={cat.icon} alt={cat.name} className="w-16 h-16 mx-auto object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center text-3xl rounded-lg bg-gray-100 mx-auto">{cat.icon || '🗂️'}</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <p className="text-xs text-gray-500 mb-4">{cat.subcategories.length} subcategories</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cat)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => setDeleteId(cat._id || cat.id || null)} className="w-9 h-9 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first category</p>
              <button onClick={openAddModal} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors">
                Add First Category
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteId && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
              <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Delete Category?</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
