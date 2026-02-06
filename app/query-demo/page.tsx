"use client";
import { useProducts, useCategories, useAddProduct, useDeleteProduct } from '@/hooks/useApi';

export default function QueryDemo() {
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const addProduct = useAddProduct();
  const deleteProduct = useDeleteProduct();

  const handleAddProduct = () => {
    addProduct.mutate({
      name: 'Test Product',
      category: 'Test',
      images: ['/test.jpg'],
      veg: true,
      description: 'Test description',
      unitType: 'Weight',
      subcategory: 'Test Sub',
      keyFeatures: ['Feature 1'],
      servingInstructions: ['Instruction 1'],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-4xl font-bold text-white mb-2">TanStack Query Demo</h1>
          <p className="text-white/80">Smart Data Fetching & Caching</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">📦 Products</h2>
              <button
                onClick={handleAddProduct}
                disabled={addProduct.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-50"
              >
                {addProduct.isPending ? 'Adding...' : 'Add Test'}
              </button>
            </div>

            {productsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            )}

            {productsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Error loading products</p>
              </div>
            )}

            {products && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="text-sm text-green-700">
                    ✅ Loaded {products.length} products
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Cached & validated with Zod
                  </div>
                </div>
                {products.slice(0, 5).map((product: any) => (
                  <div key={product._id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{product.name}</div>
                      <div className="text-xs text-gray-600">{product.category}</div>
                    </div>
                    <button
                      onClick={() => deleteProduct.mutate(product._id)}
                      disabled={deleteProduct.isPending}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🗂️ Categories</h2>

            {categoriesLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            )}

            {categories && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                  <div className="text-sm text-purple-700">
                    ✅ Loaded {categories.length} categories
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    Auto-refetch & type-safe
                  </div>
                </div>
                {categories.map((category: any) => (
                  <div key={category._id} className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{category.name}</div>
                      <div className="text-xs text-gray-600">Order: {category.order}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-4">✨ TanStack Query Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold text-sm">Auto Caching</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-semibold text-sm">Auto Refetch</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold text-sm">Optimistic UI</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-sm">Type Safe</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600">{products?.length || 0}</div>
            <div className="text-sm text-gray-600">Products Cached</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-purple-600">{categories?.length || 0}</div>
            <div className="text-sm text-gray-600">Categories Cached</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600">60s</div>
            <div className="text-sm text-gray-600">Cache Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
