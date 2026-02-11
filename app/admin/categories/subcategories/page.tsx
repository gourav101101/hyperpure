"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Subcategory {
  name: string;
  icon: string;
  isActive: boolean;
}

interface Category {
  id?: string;
  _id?: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, type: string, data: any}>({show: false, type: '', data: null});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find(c => (c._id || c.id) === selectedCategory);
      setSubcategories(cat?.subcategories || []);
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    if (data.length > 0 && !selectedCategory) {
      setSelectedCategory(data[0]._id || data[0].id);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSub = { name, icon, isActive: true };
    const updated = editIndex !== null 
      ? subcategories.map((s, i) => i === editIndex ? newSub : s)
      : [...subcategories, newSub];
    
    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCategory, subcategories: updated })
      });
      toast.success(editIndex !== null ? 'Subcategory updated' : 'Subcategory added');
      setName("");
      setIcon("");
      setEditIndex(null);
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to save subcategory');
    }
  };

  const handleEdit = (index: number) => {
    const sub = subcategories[index];
    setName(sub.name);
    setIcon(sub.icon);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const items = [...subcategories];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setSubcategories(items);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    
    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCategory, subcategories })
      });
      toast.success('Order updated');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleConfirm = async () => {
    const { type, data } = confirmModal;
    
    try {
      if (type === 'toggleSubcategory') {
        const updated = subcategories.map((s, i) => 
          i === data.index ? { ...s, isActive: !s.isActive } : s
        );
        await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedCategory, subcategories: updated })
        });
        toast.success('Status updated');
        fetchCategories();
      } else if (type === 'deleteSubcategory') {
        const updated = subcategories.filter((_, i) => i !== data.index);
        await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedCategory, subcategories: updated })
        });
        toast.success('Subcategory deleted');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Operation failed');
    }
    
    setConfirmModal({show: false, type: '', data: null});
  };

  const currentCategory = categories.find(c => (c._id || c.id) === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
        <p className="text-gray-600 mt-1">Manage subcategories for each category</p>
      </div>

      {/* Category Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Select Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
            ))}
          </select>
          <button 
            onClick={() => { setName(""); setIcon(""); setEditIndex(null); setShowModal(true); }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
            disabled={!selectedCategory}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subcategory
          </button>
        </div>
      </div>

      {/* Current Category Info */}
      {currentCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          {currentCategory.icon && (
            <img src={currentCategory.icon} alt={currentCategory.name} className="w-12 h-12 object-cover rounded-lg" />
          )}
          <div>
            <div className="font-semibold text-gray-900">{currentCategory.name}</div>
            <div className="text-sm text-gray-600">{subcategories.length} subcategories</div>
          </div>
        </div>
      )}

      {/* Subcategories List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Subcategories List</h3>
          <p className="text-sm text-gray-600 mt-1">Drag to reorder subcategories</p>
        </div>

        {subcategories.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {subcategories.map((sub, index) => {
              const isParentDisabled = currentCategory?.isActive === false;
              const isDisabled = isParentDisabled || sub.isActive === false;
              
              return (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-move ${draggedIndex === index ? 'opacity-50' : ''} ${isDisabled ? 'bg-gray-100 opacity-60' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-gray-400 cursor-grab">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                  </div>
                  
                  <div className="font-bold text-gray-900 w-8">{index + 1}</div>
                  
                  {sub.icon && (
                    <img src={sub.icon} alt={sub.name} className="w-12 h-12 object-cover rounded-lg" />
                  )}
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{sub.name}</div>
                    {isParentDisabled && <span className="text-xs text-red-600 font-medium">DISABLED (Category disabled)</span>}
                    {!isParentDisabled && sub.isActive === false && <span className="text-xs text-red-600 font-medium">DISABLED</span>}
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sub.isActive !== false}
                      onChange={() => setConfirmModal({show: true, type: 'toggleSubcategory', data: {index}})}
                      className="sr-only peer"
                      disabled={isParentDisabled}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                  
                  <button
                    onClick={() => handleEdit(index)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => setConfirmModal({show: true, type: 'deleteSubcategory', data: {index}})}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );})}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subcategories</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a subcategory.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editIndex !== null ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Fresh Fruits"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                {icon && (
                  <img src={icon} alt="Preview" className="mt-3 w-24 h-24 object-cover rounded-lg border border-gray-200" />
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  disabled={uploading || !icon}
                >
                  {editIndex !== null ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-600">
                {confirmModal.type === 'deleteSubcategory' && 'Are you sure you want to delete this subcategory?'}
                {confirmModal.type === 'toggleSubcategory' && 'Are you sure you want to change the status?'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({show: false, type: '', data: null})}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
