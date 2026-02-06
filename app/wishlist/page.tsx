"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { removeFromWishlist } from "../store/wishlistSlice";

export default function Wishlist() {
  const { addToCart } = useCart();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isHydrating = useAppSelector((state) => state.wishlist.isHydrating);
  const [filteredWishlist, setFilteredWishlist] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterVeg, setFilterVeg] = useState(false);
  const loading = isHydrating;

  useEffect(() => {
    let filtered = wishlist;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (filterVeg) {
      filtered = filtered.filter(item => item.veg);
    }
    setFilteredWishlist(filtered);
  }, [wishlist, selectedCategory, filterVeg]);

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      unit: product.unit
    });
  };

  const categories = ["All", ...Array.from(new Set(wishlist.map(item => item.category)))];
  const getCategoryImage = (category: string) => {
    if (category === "All") return null;
    const match = wishlist.find(item => item.category === category && item.images?.[0]);
    return match?.images?.[0] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={isLoggedIn} />
      <main className="pt-24 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">My list</h1>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 md:sticky md:top-24">
                {categories.map((cat, idx) => {
  const catImage = getCategoryImage(cat);
  return (
    <button
      key={idx}
      onClick={() => setSelectedCategory(cat)}
      className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl mb-2 transition-all text-sm md:text-base ${
        selectedCategory === cat ? "bg-red-50 border-l-4 border-red-500" : "hover:bg-gray-50"
      }`}
    >
      {catImage ? (
        <img src={catImage} alt={cat} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <span className="text-xl md:text-2xl">{cat === "All" ? "🔲" : "📦"}</span>
      )}
      <span className="text-sm font-medium">{cat}</span>
    </button>
  );
})}
              </div>
            </aside>

            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 mb-4 md:mb-6 flex items-center gap-2 md:gap-4 overflow-x-auto">
                <button
                  onClick={() => setFilterVeg(!filterVeg)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                    filterVeg ? "bg-green-50 text-green-700 border-2 border-green-500" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  ⭐ Rated 4.0+
                </button>
                <button
                  onClick={() => setFilterVeg(!filterVeg)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                    filterVeg ? "bg-green-50 text-green-700 border-2 border-green-500" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Veg
                </button>
                <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                  Brand ▼
                </button>
                <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                  Brownies
                </button>
                <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                  Type ▼
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredWishlist.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500">Add products you love to your wishlist</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredWishlist.map((product) => (
                    <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow relative">
  <button
    onClick={() => handleRemoveFromWishlist(product._id)}
    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-red-50"
  >
    <span className="text-red-500 text-xl">❤️</span>
  </button>
  <Link href={`/catalogue/${product._id}`} className="block">
    <div className="relative">
      {product.images?.[0] ? (
        <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>
      )}
      <div className={`absolute top-3 left-3 w-5 h-5 border-2 ${
        product.veg ? 'border-green-600' : 'border-red-600'
      } rounded flex items-center justify-center bg-white`}>
        <div className={`w-2.5 h-2.5 ${
          product.veg ? 'bg-green-600' : 'bg-red-600'
        } rounded-full`}></div>
      </div>
    </div>
  </Link>
  {product.inStock && (
    <button
      onClick={() => handleAddToCart(product)}
      className="absolute bottom-20 right-3 bg-white text-red-500 border-2 border-red-500 px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-50 shadow-lg"
    >
      ADD
    </button>
  )}
  <Link href={`/catalogue/${product._id}`} className="block p-4">
    <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 min-h-[48px]">{product.name}</h3>
    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
      <span>{product.unit || "—"}</span>
      {product.rating && (
        <>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="text-green-600">●</span>
            {product.rating} ({product.reviews || 0})
          </span>
        </>
      )}
    </div>
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-2xl font-bold text-gray-900">₹{product.price ?? 0}</span>
      {product.unit && !isNaN(parseInt(product.unit)) && product.price && (
        <span className="text-sm text-gray-500">₹{(product.price / parseInt(product.unit)).toFixed(2)}/pc</span>
      )}
    </div>
    {product.bulkPrice && (
      <div className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block">
        ₹{product.bulkPrice}/pc Best rate
      </div>
    )}
  </Link>
</div>
))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
      <Footer />
    </div>
  );
}

