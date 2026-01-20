"use client";
import { useEffect, useState } from "react";

export default function SellerProducts() {
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [priceForm, setPriceForm] = useState({
    sellerPrice: '', stock: '', minOrderQty: '1', deliveryTime: '24 hours',
    brand: '', manufacturer: '', batchNumber: '', expiryDate: '', origin: ''
  });

  useEffect(() => {
    const sellerId = localStorage.getItem('sellerId');
    if (sellerId) {
      fetchAdminProducts();
      fetchSellerProducts(sellerId);
    }
  }, []);

  const fetchAdminProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setAdminProducts(data);
  };

  const fetchSellerProducts = async (sellerId: string) => {
    const res = await fetch(`/api/seller/products?sellerId=${sellerId}`);
    const data = await res.json();
    setSellerProducts(data.products || []);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId, productId: selectedProduct._id,
        sellerPrice: parseFloat(priceForm.sellerPrice), stock: parseInt(priceForm.stock),
        minOrderQty: parseInt(priceForm.minOrderQty), deliveryTime: priceForm.deliveryTime,
        brand: priceForm.brand, manufacturer: priceForm.manufacturer,
        batchNumber: priceForm.batchNumber, expiryDate: priceForm.expiryDate || null, origin: priceForm.origin
      })
    });
    if (res.ok) {
      setShowAddModal(false); setSelectedProduct(null);
      setPriceForm({ sellerPrice: '', stock: '', minOrderQty: '1', deliveryTime: '24 hours', brand: '', manufacturer: '', batchNumber: '', expiryDate: '', origin: '' });
      fetchSellerProducts(sellerId!);
    } else {
      alert((await res.json()).error || 'Failed to add product');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/seller/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingProduct._id, sellerPrice: parseFloat(priceForm.sellerPrice), stock: parseInt(priceForm.stock),
        minOrderQty: parseInt(priceForm.minOrderQty), deliveryTime: priceForm.deliveryTime,
        brand: priceForm.brand, manufacturer: priceForm.manufacturer,
        batchNumber: priceForm.batchNumber, expiryDate: priceForm.expiryDate || null, origin: priceForm.origin
      })
    });
    if (res.ok) {
      setEditingProduct(null);
      setPriceForm({ sellerPrice: '', stock: '', minOrderQty: '1', deliveryTime: '24 hours', brand: '', manufacturer: '', batchNumber: '', expiryDate: '', origin: '' });
      fetchSellerProducts(localStorage.getItem('sellerId')!);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Remove this product from your catalog?')) return;
    const res = await fetch(`/api/seller/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchSellerProducts(localStorage.getItem('sellerId')!);
  };

  const toggleActive = async (product: any) => {
    await fetch('/api/seller/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product._id, isActive: !product.isActive })
    });
    fetchSellerProducts(localStorage.getItem('sellerId')!);
  };

  const availableProducts = adminProducts.filter(ap => 
    !sellerProducts.some(sp => sp.productId?._id === ap._id) &&
    (filterCategory === "All" || ap.category === filterCategory) &&
    (searchQuery === "" || ap.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = [...new Set(adminProducts.map(p => p.category))];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-sm text-gray-600 mt-1">Add products and set your brand, price & stock</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
          <span>➕</span> Add Product
        </button>
      </div>

      {sellerProducts.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">All ({sellerProducts.length})</button>
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">Active ({sellerProducts.filter(p => p.isActive).length})</button>
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">Low Stock ({sellerProducts.filter(p => p.stock < 10).length})</button>
        </div>
      )}

      {sellerProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Add products and set your brand & prices</p>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Add Your First Product</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sellerProducts.map((sp) => {
                  const product = sp.productId;
                  if (!product) return null;
                  return (
                    <tr key={sp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.unit} • {product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="text-lg font-bold text-green-600">₹{sp.sellerPrice}</div></td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${sp.stock < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                          {sp.stock}{sp.stock < 10 && <span className="text-xs ml-1">⚠️</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="text-sm text-gray-600">{sp.brand || '-'}</div></td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleActive(sp)} className={`px-3 py-1 rounded-full text-xs font-bold ${sp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {sp.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => {
                            setEditingProduct(sp);
                            setPriceForm({
                              sellerPrice: sp.sellerPrice.toString(), stock: sp.stock.toString(),
                              minOrderQty: sp.minOrderQty.toString(), deliveryTime: sp.deliveryTime,
                              brand: sp.brand || '', manufacturer: sp.manufacturer || '',
                              batchNumber: sp.batchNumber || '', expiryDate: sp.expiryDate ? new Date(sp.expiryDate).toISOString().split('T')[0] : '', origin: sp.origin || ''
                            });
                          }} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                          <button onClick={() => handleDeleteProduct(sp._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Product to Your Catalog</h2>
              <button onClick={() => { setShowAddModal(false); setSelectedProduct(null); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            {!selectedProduct ? (
              <div className="p-6">
                <div className="mb-4">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products by name..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none" />
                </div>
                <div className="flex gap-3 mb-4">
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-gray-500"><p>{searchQuery || filterCategory !== "All" ? 'No products found' : 'No products available'}</p></div>
                  ) : (
                    availableProducts.map((product) => (
                      <div key={product._id} onClick={() => setSelectedProduct(product)} className="border rounded-lg p-4 hover:border-red-500 cursor-pointer">
                        <div className="flex gap-3">
                          <img src={product.images?.[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                            <p className="text-xs text-gray-500">{product.unit} • {product.category}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex gap-4">
                    <img src={selectedProduct.images?.[0]} alt={selectedProduct.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div>
                      <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                      <p className="text-sm text-gray-600">{selectedProduct.unit} • {selectedProduct.category}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Your Price (₹) *</label><input type="number" step="0.01" value={priceForm.sellerPrice} onChange={(e) => setPriceForm({...priceForm, sellerPrice: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label><input type="number" value={priceForm.stock} onChange={(e) => setPriceForm({...priceForm, stock: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Brand</label><input type="text" value={priceForm.brand} onChange={(e) => setPriceForm({...priceForm, brand: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" placeholder="Your brand" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label><input type="text" value={priceForm.manufacturer} onChange={(e) => setPriceForm({...priceForm, manufacturer: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" placeholder="Manufacturer" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label><input type="text" value={priceForm.batchNumber} onChange={(e) => setPriceForm({...priceForm, batchNumber: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" placeholder="LOT-2024-001" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label><input type="date" value={priceForm.expiryDate} onChange={(e) => setPriceForm({...priceForm, expiryDate: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Origin/Source</label><input type="text" value={priceForm.origin} onChange={(e) => setPriceForm({...priceForm, origin: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" placeholder="e.g., Maharashtra" /></div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setSelectedProduct(null)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Back</button>
                  <button type="submit" className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">Add to My Catalog</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button onClick={() => { setEditingProduct(null); setPriceForm({ sellerPrice: '', stock: '', minOrderQty: '1', deliveryTime: '24 hours', brand: '', manufacturer: '', batchNumber: '', expiryDate: '', origin: '' }); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold">{editingProduct.productId?.name}</h3>
                <p className="text-sm text-gray-600">{editingProduct.productId?.unit}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Your Price (₹) *</label><input type="number" step="0.01" value={priceForm.sellerPrice} onChange={(e) => setPriceForm({...priceForm, sellerPrice: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label><input type="number" value={priceForm.stock} onChange={(e) => setPriceForm({...priceForm, stock: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Brand</label><input type="text" value={priceForm.brand} onChange={(e) => setPriceForm({...priceForm, brand: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label><input type="text" value={priceForm.manufacturer} onChange={(e) => setPriceForm({...priceForm, manufacturer: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label><input type="text" value={priceForm.batchNumber} onChange={(e) => setPriceForm({...priceForm, batchNumber: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label><input type="date" value={priceForm.expiryDate} onChange={(e) => setPriceForm({...priceForm, expiryDate: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Origin</label><input type="text" value={priceForm.origin} onChange={(e) => setPriceForm({...priceForm, origin: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" /></div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setEditingProduct(null); setPriceForm({ sellerPrice: '', stock: '', minOrderQty: '1', deliveryTime: '24 hours', brand: '', manufacturer: '', batchNumber: '', expiryDate: '', origin: '' }); }} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
