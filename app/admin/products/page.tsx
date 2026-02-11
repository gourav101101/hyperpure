"use client";
import { useState, useEffect } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "sonner";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  unit?: string;
  unitType?: string;
  category: string;
  subcategory?: string;
  images: string[];
  veg: boolean;
  description: string;
  keyFeatures: string[];
  servingInstructions: string[];
  sku?: string;
  brand?: string;
  manufacturer?: string;
  inStock?: boolean;
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterVeg, setFilterVeg] = useState("All");
  const [filterStock, setFilterStock] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sellerCounts, setSellerCounts] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, productId: string | null}>({isOpen: false, productId: null});
  const [showSellersModal, setShowSellersModal] = useState(false);
  const [selectedProductSellers, setSelectedProductSellers] = useState<any>(null);
  const [sellerDetails, setSellerDetails] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    unitType: "",
    category: "",
    subcategory: "",
    veg: true,
    description: "",
    keyFeatures: "",
    servingInstructions: "",
    sku: "",
    gstRate: 0,
    cessRate: 0,
    hsnCode: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterCategory !== "All") {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    if (filterVeg !== "All") {
      filtered = filtered.filter(p => filterVeg === "Veg" ? p.veg : !p.veg);
    }
    if (filterStock !== "All") {
      filtered = filtered.filter(p => filterStock === "In Stock" ? p.inStock !== false : p.inStock === false);
    }
    setFilteredProducts(filtered);
  }, [products, filterCategory, filterVeg, filterStock, searchQuery]);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    
    const products = Array.isArray(data) ? data : [];
    setProducts(products);
    
    // Extract seller counts from products
    const counts: any = {};
    products.forEach((p: any) => {
      counts[p._id] = p.sellerCount || 0;
    });
    setSellerCounts(counts);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    const categories = Array.isArray(data) ? data : [];
    setCategories(categories);
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setUploading(true);
    const urls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Upload error:', errorData);
          toast.error(`Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`);
          continue;
        }
        
        const data = await res.json();
        if (data.url) {
          urls.push(data.url);
        }
      }
      
      if (urls.length > 0) {
        setUploadedImages([...uploadedImages, ...urls]);
        toast.success(`${urls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unitType || !formData.category || !formData.subcategory) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
    
    try {
      const data = {
        name: formData.name,
        unitType: formData.unitType,
        category: formData.category,
        subcategory: formData.subcategory,
        veg: formData.veg,
        description: formData.description,
        keyFeatures: formData.keyFeatures.split("\n").filter(f => f.trim()),
        servingInstructions: formData.servingInstructions.split("\n").filter(f => f.trim()),
        sku: formData.sku || undefined,
        gstRate: formData.gstRate,
        cessRate: formData.cessRate,
        hsnCode: formData.hsnCode,
        images: uploadedImages
      };

      if (editId) {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...data })
        });
        toast.success('Product updated successfully!');
        setEditId(null);
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        toast.success('Product added successfully!');
      }
      
      setFormData({
        name: "", unitType: "", category: "", subcategory: "", veg: true, description: "",
        keyFeatures: "", servingInstructions: "", sku: "", gstRate: 0, cessRate: 0, hsnCode: ""
      });
      setUploadedImages([]);
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({isOpen: true, productId: id});
  };

  const confirmDelete = async () => {
    if (deleteConfirm.productId) {
      try {
        await fetch(`/api/products?id=${deleteConfirm.productId}`, { method: 'DELETE' });
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
    setDeleteConfirm({isOpen: false, productId: null});
  };

  const handleEdit = (prod: Product) => {
    setFormData({
      name: prod.name,
      unitType: (prod as any).unitType || "",
      category: prod.category,
      subcategory: (prod as any).subcategory || "",
      veg: prod.veg,
      description: prod.description,
      keyFeatures: prod.keyFeatures.join("\n"),
      servingInstructions: prod.servingInstructions.join("\n"),
      sku: prod.sku || "",
      gstRate: (prod as any).gstRate || 0,
      cessRate: (prod as any).cessRate || 0,
      hsnCode: (prod as any).hsnCode || ""
    });
    setUploadedImages(prod.images);
    setEditId(prod.id || (prod as any)._id);
    setShowModal(true);
  };

  const viewSellers = async (product: Product) => {
    setSelectedProductSellers(product);
    setShowSellersModal(true);
    
    // Fetch seller details
    const res = await fetch(`/api/products/sellers?productId=${product._id}`);
    if (res.ok) {
      const data = await res.json();
      setSellerDetails(data.sellers || []);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "", unitType: "", category: "", subcategory: "", veg: true, description: "",
      keyFeatures: "", servingInstructions: "", sku: "", gstRate: 0, cessRate: 0, hsnCode: ""
    });
    setUploadedImages([]);
    setEditId(null);
    setShowModal(true);
  };

  return (
    <>
          <div className="flex items-center justify-end mb-6">
            <button onClick={openAddModal} className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2">
              <span>+</span> Add Product
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search by product name or category"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white min-w-[160px]">
                <option value="All">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c._id || c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <select value={filterVeg} onChange={(e) => setFilterVeg(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white min-w-[130px]">
                <option value="All">All Types</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
              <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white min-w-[130px]">
                <option value="All">All Stock</option>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 overflow-y-auto p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl animate-scale-in my-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{editId ? 'Edit Product' : 'Add New Product'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 font-medium">Note: Sellers will set their own prices for this product</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input type="text" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type *</label>
                      <select value={formData.unitType} onChange={(e) => setFormData({...formData, unitType: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" required>
                        <option value="">Select Unit Type</option>
                        <option value="Weight">Weight (kg, g, lb)</option>
                        <option value="Volume">Volume (L, ml, gal)</option>
                        <option value="Piece">Piece (pc, dozen)</option>
                        <option value="Pack">Pack (pack, box, bundle)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Sellers will set exact unit (e.g., 500g, 1kg)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input type="text" placeholder="Product SKU" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                      <input type="text" placeholder="HSN Code" value={formData.hsnCode} onChange={(e) => setFormData({...formData, hsnCode: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
                      <input type="number" min="0" max="100" step="0.01" placeholder="0" value={formData.gstRate} onChange={(e) => setFormData({...formData, gstRate: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cess Rate (%)</label>
                      <input type="number" min="0" max="100" step="0.01" placeholder="0" value={formData.cessRate} onChange={(e) => setFormData({...formData, cessRate: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ""})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" required>
                        <option value="">Select Category</option>
                        {categories.map((c: any) => (
                          <option key={c._id || c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                      <select value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" required disabled={!formData.category}>
                        <option value="">Select Subcategory</option>
                        {categories.find(c => c.name === formData.category)?.subcategories?.map((sub: any, idx: number) => (
                          <option key={idx} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                          <input type="radio" name="vegType" checked={formData.veg} onChange={() => setFormData({...formData, veg: true})} />
                          <span className="text-sm font-medium text-gray-700">Veg</span>
                        </label>
                        <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                          <input type="radio" name="vegType" checked={!formData.veg} onChange={() => setFormData({...formData, veg: false})} />
                          <span className="text-sm font-medium text-gray-700">Non-Veg</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" rows={3} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Features (one per line)</label>
                    <textarea placeholder="Key Features" value={formData.keyFeatures} onChange={(e) => setFormData({...formData, keyFeatures: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serving Instructions (one per line)</label>
                    <textarea placeholder="Serving Instructions" value={formData.servingInstructions} onChange={(e) => setFormData({...formData, servingInstructions: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" rows={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" disabled={uploading} />
                    {uploading && <p className="text-sm text-blue-500 mt-2">Uploading images...</p>}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {uploadedImages.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors" disabled={uploading || uploadedImages.length === 0}>
                      {editId ? 'Update' : 'Add'} Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <div key={prod.id || (prod as any)._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
                <div className="relative h-44">
                  <img src={prod.images?.[0] || '/placeholder.jpg'} alt={prod.name} className="w-full h-full object-cover" />
                  <div className={`absolute top-2 left-2 w-5 h-5 border-2 ${prod.veg ? 'border-green-600' : 'border-red-600'} rounded flex items-center justify-center bg-white shadow-sm`}>
                    <div className={`w-2.5 h-2.5 ${prod.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[40px]">{prod.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{(prod as any).unitType} - {prod.category}</p>
                  
                  {/* Seller Count Badge */}
                  <div className="mb-3">
                    {sellerCounts[prod._id || (prod as any)._id] > 0 ? (
                      <button 
                        onClick={() => viewSellers(prod)}
                        className="w-full bg-green-50 border border-green-200 rounded-lg px-3 py-2 hover:bg-green-100 transition-colors"
                      >
                        <div className="text-lg font-bold text-green-600">{sellerCounts[prod._id || (prod as any)._id]}</div>
                        <div className="text-xs text-green-600">seller{sellerCounts[prod._id || (prod as any)._id] > 1 ? 's' : ''} offering</div>
                        <div className="text-xs text-green-700 font-medium mt-1">Click to view prices</div>
                      </button>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                        <div className="text-xs text-orange-600 font-medium">No sellers yet</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(prod)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete((prod as any)._id || prod.id)} className="w-9 h-9 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or add a new product</p>
              <button onClick={openAddModal} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors">
                Add First Product
              </button>
            </div>
          )}
      
      {/* Sellers Modal */}
      {showSellersModal && selectedProductSellers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSellersModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedProductSellers.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{sellerDetails.length} seller{sellerDetails.length > 1 ? 's' : ''} offering this product</p>
              </div>
              <button onClick={() => setShowSellersModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            {sellerDetails.length > 0 ? (
              <div className="space-y-3">
                {sellerDetails.map((seller: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Pack Size</div>
                        <div className="text-lg font-bold">{seller.unitValue} {seller.unitMeasure}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Customer Pays</div>
                        <div className="text-2xl font-bold text-blue-600">Rs. {seller.price}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Seller Gets</div>
                        <div className="font-bold text-green-600">Rs. {seller.sellerPrice}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Commission</div>
                        <div className="font-bold text-orange-600">Rs. {seller.commissionAmount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Stock</div>
                        <div className="font-bold">{seller.stock} units</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Seller ID</div>
                        <div className="font-mono text-xs">{seller.sellerId?.toString().slice(-6)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading seller details...</p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-bold">Note:</span> Prices shown are what customers pay (seller base price + platform commission)
              </p>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({isOpen: false, productId: null})}
        type="danger"
      />
    </>
  );
}
