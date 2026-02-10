"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSellerSession } from "@/app/seller/utils/session";

// Commission Calculator Component
function CommissionCalc({ price, rate }: any) {
  if (!price || !rate) return null;
  const base = parseFloat(price);
  const fee = base * rate / 100;
  const customer = base + fee;

  return (
    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">Your Base Price</span>
        <span className="font-bold">Rs. {base.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-orange-600">+ Platform Fee ({rate}%)</span>
        <span className="font-bold text-orange-600">+Rs. {fee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs pt-2 border-t border-green-200">
        <span className="font-bold">Customer Pays</span>
        <span className="font-bold text-blue-600">Rs. {customer.toFixed(2)}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-green-200 flex justify-between text-xs">
        <span className="text-green-700 font-bold">You Receive</span>
        <span className="font-bold text-green-600">Rs. {base.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function SellerProducts() {
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [commission, setCommission] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState({
    sellerPrice: '', unitValue: '', unitMeasure: '', stock: '', minOrderQty: '1', maxOrderQty: '', deliveryTime: '24 hours', discount: '0'
  });

  const getUnitOptions = (unitType: string) => {
    const options: any = {
      Weight: ['kg', 'g', 'lb', 'oz'],
      Volume: ['L', 'ml', 'gal'],
      Piece: ['pc', 'dozen', 'pair'],
      Pack: ['pack', 'box', 'bundle', 'carton']
    };
    return options[unitType] || [];
  };



  useEffect(() => {
    const session = getSellerSession();
    if (!session.sellerId) {
      setError("Seller session not found. Please log in.");
      return;
    }
    fetchAdminProducts();
    fetchSellerProducts(session.sellerId);
    fetchCommission();
  }, []);

  const fetchCommission = async () => {
    const res = await fetch('/api/seller/commission');
    if (res.ok) {
      const data = await res.json();
      setCommission(data);
    }
  };

  const fetchAdminProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setAdminProducts(data);
  };

  const fetchSellerProducts = async (sellerId: string) => {
    const res = await fetch(`/api/seller/products?sellerId=${sellerId}`);
    const data = await res.json();
    const prods = data.products || [];
    // Filter out products with null/undefined productId
    const validProducts = prods.filter((p: any) => p.productId && p.productId._id);
    setSellerProducts(validProducts);
  };

  const resetForm = () => {
    setPriceForm({ sellerPrice: '', unitValue: '', unitMeasure: '', stock: '', minOrderQty: '1', maxOrderQty: '', deliveryTime: '24 hours', discount: '0' });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSellerSession();
    const sellerId = session.sellerId;
    if (!sellerId) {
      setError("Seller session not found. Please log in.");
      return;
    }
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId, productId: selectedProduct._id,
          sellerPrice: parseFloat(priceForm.sellerPrice), unitValue: parseFloat(priceForm.unitValue), unitMeasure: priceForm.unitMeasure,
          stock: parseInt(priceForm.stock), minOrderQty: parseInt(priceForm.minOrderQty), maxOrderQty: priceForm.maxOrderQty ? parseInt(priceForm.maxOrderQty) : null,
          deliveryTime: priceForm.deliveryTime, discount: parseFloat(priceForm.discount)
        })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('Product added successfully!');
        setShowAddModal(false); setSelectedProduct(null); resetForm();
        fetchSellerProducts(sellerId);
      } else {
        toast.error(result.error || 'Failed to add product');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/seller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct._id, sellerPrice: parseFloat(priceForm.sellerPrice), unitValue: parseFloat(priceForm.unitValue), unitMeasure: priceForm.unitMeasure,
          stock: parseInt(priceForm.stock), minOrderQty: parseInt(priceForm.minOrderQty), maxOrderQty: priceForm.maxOrderQty ? parseInt(priceForm.maxOrderQty) : null,
          deliveryTime: priceForm.deliveryTime, discount: parseFloat(priceForm.discount)
        })
      });
      if (res.ok) {
        toast.success('Product updated successfully!');
        setEditingProduct(null); resetForm();
        const session = getSellerSession();
        if (session.sellerId) {
          fetchSellerProducts(session.sellerId);
        }
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    // Open in-app confirmation modal instead of using native confirm()
    setConfirmDeleteId(id);
  };

  const performDeleteProduct = async (id: string | null) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/seller/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product removed successfully!');
        const session = getSellerSession();
        if (session.sellerId) {
          fetchSellerProducts(session.sellerId);
        }
      } else {
        toast.error('Failed to remove product');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const toggleActive = async (product: any) => {
    setStatusChangeProduct(product);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeProduct) return;
    await fetch('/api/seller/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: statusChangeProduct._id, isActive: !statusChangeProduct.isActive })
    });
    const session = getSellerSession();
    if (session.sellerId) {
      fetchSellerProducts(session.sellerId);
    }
    setStatusChangeProduct(null);
  };

  const parseCsv = (input: string) => {
    const rows: string[][] = [];
    let row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const next = input[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (current.length > 0 || row.length > 0) {
          row.push(current.trim());
          rows.push(row);
          row = [];
          current = "";
        }
        continue;
      }

      current += char;
    }

    if (current.length > 0 || row.length > 0) {
      row.push(current.trim());
      rows.push(row);
    }

    return rows;
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const text = await file.text();
    const rows = parseCsv(text).filter(r => r.some(v => v && v.trim()));
    if (rows.length < 2) {
      toast.error('No valid products found in CSV');
      return;
    }
    // Expected CSV format: productName,packSize,unit,price,stock,discount
    const products = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      if (values.length < 5) continue;
      const [productName, packSize, unit, price, stock, discount = '0'] = values;
      const adminProduct = adminProducts.find(p => p.name.toLowerCase() === productName.toLowerCase());
      
      if (adminProduct) {
        products.push({
          productId: adminProduct._id,
          sellerPrice: parseFloat(price),
          unitValue: parseFloat(packSize),
          unitMeasure: unit,
          stock: parseInt(stock),
          discount: parseFloat(discount),
          minOrderQty: 1,
          deliveryTime: '24 hours'
        });
      }
    }
    
    if (products.length === 0) {
      toast.error('No valid products found in CSV');
      return;
    }
    
    const session = getSellerSession();
    const sellerId = session.sellerId;
    if (!sellerId) {
      setError("Seller session not found. Please log in.");
      return;
    }
    let success = 0;
    for (const product of products) {
      try {
        const res = await fetch('/api/seller/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sellerId, ...product })
        });
        if (res.ok) success++;
      } catch (error) {
        console.error('Error uploading product:', error);
      }
    }
    
    toast.success(`Successfully uploaded ${success} out of ${products.length} products`);
    fetchSellerProducts(sellerId);
    e.target.value = '';
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusChangeProduct, setStatusChangeProduct] = useState<any>(null);

  const availableProducts = adminProducts.filter(ap => 
    (filterCategory === "All" || ap.category === filterCategory) &&
    (searchQuery === "" || ap.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = [...new Set(adminProducts.map(p => p.category))];

  return (
    <div className="p-8">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-sm text-gray-600 mt-1">Set your pack size, brand & price</p>
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-blue-700 font-medium">Your business name is hidden from customers. Hyperpure handles all deliveries.</span>
          </div>
        </div>
        <div className="flex gap-3">
          <label className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer flex items-center gap-2">
            Bulk Upload CSV
            <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
          </label>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
            Add Product
          </button>
        </div>
      </div>

      {sellerProducts.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">All ({sellerProducts.length})</button>
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">Active ({sellerProducts.filter(p => p.isActive).length})</button>
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">Low Stock ({sellerProducts.filter(p => p.stock < 10).length})</button>
          <button 
            onClick={() => {
              const csv = 'productName,packSize,unit,price,stock,discount\nTomatoes,1,kg,50,100,0\nOnions,500,g,30,200,5';
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sample_bulk_upload.csv';
              a.click();
            }}
            className="ml-auto px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            Download Sample CSV
          </button>
        </div>
      )}

      {sellerProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
          <h3 className="text-xl font-bold mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Add products with your pack sizes & prices</p>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Add Your First Product</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pack Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
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
                            <div className="text-xs text-gray-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="text-sm font-medium">{sp.unitValue} {sp.unitMeasure}</div></td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-green-600">Rs. {sp.sellerPrice}</div>
                        <div className="text-xs text-blue-600">Customer: Rs. {(sp.sellerPrice * (1 + (commission?.commissionRate || 10) / 100)).toFixed(0)}</div>
                        {sp.discount > 0 && <div className="text-xs text-orange-600">{sp.discount}% OFF</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${sp.stock < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                          {sp.stock}
                        </div>
                      </td>
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
                              sellerPrice: sp.sellerPrice.toString(), unitValue: sp.unitValue?.toString() || '', unitMeasure: sp.unitMeasure || '',
                              stock: sp.stock.toString(), minOrderQty: sp.minOrderQty.toString(), maxOrderQty: sp.maxOrderQty?.toString() || '',
                              deliveryTime: sp.deliveryTime, discount: sp.discount?.toString() || '0'
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
              <button onClick={() => { setShowAddModal(false); setSelectedProduct(null); }} className="text-gray-400 hover:text-gray-600 text-2xl">x</button>
            </div>

            {!selectedProduct ? (
              <div className="p-6">
                <div className="mb-4">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none" />
                </div>
                <div className="flex gap-3 mb-4">
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-gray-500"><p>No products found</p></div>
                  ) : (
                    availableProducts.map((product) => (
                      <div key={product._id} onClick={() => setSelectedProduct(product)} className="border-2 border-gray-200 rounded-xl p-3 hover:border-red-500 cursor-pointer transition-all hover:shadow-md">
                        <div className="flex gap-3">
                          <img src={product.images?.[0]} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm mb-1 line-clamp-2">{product.name}</h4>
                            <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                            <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">{product.unitType}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddProduct} className="flex flex-col h-[75vh]">
                <div className="flex flex-1 overflow-hidden">
                  {/* Left: Form */}
                  <div className="w-[55%] p-6 overflow-y-auto border-r">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <img src={selectedProduct.images?.[0]} alt={selectedProduct.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{selectedProduct.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 font-medium rounded">{selectedProduct.unitType}</span>
                          <span className="text-xs text-gray-500">{getUnitOptions(selectedProduct.unitType).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pack Size *</label>
                          <input type="number" step="0.01" value={priceForm.unitValue} onChange={(e) => setPriceForm({...priceForm, unitValue: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="500" required />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Unit *</label>
                          <select value={priceForm.unitMeasure} onChange={(e) => setPriceForm({...priceForm, unitMeasure: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" required>
                            <option value="">Select</option>
                            {getUnitOptions(selectedProduct.unitType).map((unit: string) => <option key={unit} value={unit}>{unit}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Base Price (Rs.) *</label>
                          <input type="number" step="0.01" value={priceForm.sellerPrice} onChange={(e) => setPriceForm({...priceForm, sellerPrice: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="80" required />
                          <p className="text-xs text-gray-500 mt-1">Amount you want to receive</p>
                        </div>
                        <CommissionCalc price={priceForm.sellerPrice} rate={commission?.commissionRate} />
                      </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Discount (%)</label>
                          <input type="number" step="0.01" min="0" max="100" value={priceForm.discount} onChange={(e) => setPriceForm({...priceForm, discount: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="0" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Quantity *</label>
                          <input type="number" min="1" value={priceForm.stock} onChange={(e) => setPriceForm({...priceForm, stock: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="100" required />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Delivery Time *</label>
                          <select value={priceForm.deliveryTime} onChange={(e) => setPriceForm({...priceForm, deliveryTime: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" required>
                            <option value="24 hours">24 Hours</option>
                            <option value="48 hours">48 Hours</option>
                            <option value="3-5 days">3-5 Days</option>
                            <option value="1 week">1 Week</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min Order Qty *</label>
                          <input type="number" min="1" value={priceForm.minOrderQty} onChange={(e) => setPriceForm({...priceForm, minOrderQty: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="1" required />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Order Qty</label>
                          <input type="number" min="1" value={priceForm.maxOrderQty} onChange={(e) => setPriceForm({...priceForm, maxOrderQty: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="Unlimited" />
                        </div>
                      </div>
                    </div>

                    {/* Actions inside form */}
                    <div className="flex gap-3 pt-6 mt-6 border-t">
                      <button type="button" onClick={() => setSelectedProduct(null)} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-bold transition-all">Back</button>
                      <button type="submit" className="flex-[2] bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">Add to Catalog</button>
                    </div>
                  </div>

                  {/* Right: Preview */}
                  <div className="w-[45%] bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live Preview</span>
                      </div>
                      <p className="text-xs text-gray-500">See how customers will view your product</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-[280px]">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform">
                          <div className="relative">
                            <img src={selectedProduct.images?.[0]} alt={selectedProduct.name} className="w-full h-48 object-cover" />
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                              <span className="text-sm font-bold">{selectedProduct.veg ? "Veg" : "Non-veg"}</span>
                            </div>
                            {priceForm.discount && parseFloat(priceForm.discount) > 0 && (
                              <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full shadow-lg">
                                <span className="text-xs font-bold">{priceForm.discount}% OFF</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-base text-gray-900 mb-1.5 line-clamp-2 min-h-[48px]">{selectedProduct.name}</h4>
                            <div className="mb-3">
                              {priceForm.unitValue && priceForm.unitMeasure ? (
                                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{priceForm.unitValue} {priceForm.unitMeasure}</span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Pack size not set</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              {priceForm.sellerPrice ? (
                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-green-600">Rs. {(parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100)).toFixed(0)}</span>
                                    {priceForm.discount && parseFloat(priceForm.discount) > 0 && (
                                      <span className="text-sm text-gray-400 line-through">Rs. {(parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100) / (1 - parseFloat(priceForm.discount) / 100)).toFixed(0)}</span>
                                    )}
                                  </div>
                                  {priceForm.discount && parseFloat(priceForm.discount) > 0 && (
                                    <span className="text-xs text-green-600 font-semibold">Save Rs. {(parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100) / (1 - parseFloat(priceForm.discount) / 100) - parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100)).toFixed(0)}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 italic">Price not set</span>
                              )}
                              <button type="button" className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">Add</button>
                            </div>
                            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <span className="font-medium">{priceForm.deliveryTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <span className="font-medium">{priceForm.stock || '0'} in stock</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button onClick={() => { setEditingProduct(null); resetForm(); }} className="text-gray-400 hover:text-gray-600 text-2xl">x</button>
            </div>

            <form onSubmit={handleUpdateProduct} className="flex flex-col h-[75vh]">
              <div className="flex flex-1 overflow-hidden">
                <div className="w-[55%] p-6 overflow-y-auto border-r">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex gap-4">
                      <img src={editingProduct.productId?.images?.[0]} alt={editingProduct.productId?.name} className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                      <div>
                        <h3 className="font-bold text-lg">{editingProduct.productId?.name}</h3>
                        <p className="text-sm text-gray-600">Current: {editingProduct.unitValue} {editingProduct.unitMeasure}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pack Size *</label>
                        <input type="number" step="0.01" value={priceForm.unitValue} onChange={(e) => setPriceForm({...priceForm, unitValue: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Unit *</label>
                        <select value={priceForm.unitMeasure} onChange={(e) => setPriceForm({...priceForm, unitMeasure: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" required>
                          <option value="">Select</option>
                          {getUnitOptions(editingProduct.productId?.unitType).map((unit: string) => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Base Price (Rs.) *</label>
                          <input type="number" step="0.01" value={priceForm.sellerPrice} onChange={(e) => setPriceForm({...priceForm, sellerPrice: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="80" required />
                          <p className="text-xs text-gray-500 mt-1">Amount you want to receive</p>
                        </div>
                        <CommissionCalc price={priceForm.sellerPrice} rate={commission?.commissionRate} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Discount (%)</label>
                        <input type="number" step="0.01" min="0" max="100" value={priceForm.discount} onChange={(e) => setPriceForm({...priceForm, discount: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="0" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Quantity *</label>
                        <input type="number" min="1" value={priceForm.stock} onChange={(e) => setPriceForm({...priceForm, stock: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="100" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Delivery Time *</label>
                        <select value={priceForm.deliveryTime} onChange={(e) => setPriceForm({...priceForm, deliveryTime: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" required>
                          <option value="24 hours">24 Hours</option>
                          <option value="48 hours">48 Hours</option>
                          <option value="3-5 days">3-5 Days</option>
                          <option value="1 week">1 Week</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min Order Qty *</label>
                        <input type="number" min="1" value={priceForm.minOrderQty} onChange={(e) => setPriceForm({...priceForm, minOrderQty: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="1" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Order Qty</label>
                        <input type="number" min="1" value={priceForm.maxOrderQty} onChange={(e) => setPriceForm({...priceForm, maxOrderQty: e.target.value})} className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none" placeholder="Unlimited" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 mt-6 border-t">
                    <button type="button" onClick={() => { setEditingProduct(null); resetForm(); }} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-bold transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">Update Product</button>
                  </div>
                </div>

                <div className="w-[45%] bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live Preview</span>
                    </div>
                    <p className="text-xs text-gray-500">See how customers will view your product</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-[280px]">
                      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform">
                        <div className="relative">
                          <img src={editingProduct.productId?.images?.[0]} alt={editingProduct.productId?.name} className="w-full h-48 object-cover" />
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                            <span className="text-sm font-bold">{editingProduct.productId?.veg ? "Veg" : "Non-veg"}</span>
                          </div>
                          {priceForm.discount && parseFloat(priceForm.discount) > 0 && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full shadow-lg">
                              <span className="text-xs font-bold">{priceForm.discount}% OFF</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-base text-gray-900 mb-1.5 line-clamp-2 min-h-[48px]">{editingProduct.productId?.name}</h4>
                          <div className="mb-3">
                            {priceForm.unitValue && priceForm.unitMeasure ? (
                              <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{priceForm.unitValue} {priceForm.unitMeasure}</span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Pack size not set</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            {priceForm.sellerPrice ? (
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-bold text-green-600">Rs. {(parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100)).toFixed(0)}</span>
                                  {priceForm.discount && parseFloat(priceForm.discount) > 0 && (
                                    <span className="text-sm text-gray-400 line-through">Rs. {(parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100) / (1 - parseFloat(priceForm.discount) / 100)).toFixed(0)}</span>
                                  )}
                                </div>
                                {priceForm.discount && parseFloat(priceForm.discount) > 0 && (
                                  <span className="text-xs text-green-600 font-semibold">Save Rs. {(parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100) / (1 - parseFloat(priceForm.discount) / 100) - parseFloat(priceForm.sellerPrice) * (1 + (commission?.commissionRate || 10) / 100)).toFixed(0)}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Price not set</span>
                            )}
                            <button type="button" className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">Add</button>
                          </div>
                          <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <span className="font-medium">{priceForm.deliveryTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <span className="font-medium">{priceForm.stock || '0'} in stock</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Remove product?</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to remove this product from your catalog?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => performDeleteProduct(confirmDeleteId)} className="px-4 py-2 bg-red-600 text-white rounded">Remove</button>
            </div>
          </div>
        </div>
      )}

      {statusChangeProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">{statusChangeProduct.isActive ? 'Deactivate' : 'Activate'} product?</h3>
            <p className="text-sm text-gray-600 mb-4">
              {statusChangeProduct.isActive 
                ? 'This product will be hidden from customers and they won\'t be able to order it.' 
                : 'This product will be visible to customers and available for ordering.'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setStatusChangeProduct(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={confirmStatusChange} className={`px-4 py-2 text-white rounded ${statusChangeProduct.isActive ? 'bg-orange-600' : 'bg-green-600'}`}>
                {statusChangeProduct.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
