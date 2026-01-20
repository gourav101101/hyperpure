"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [filteredWishlist, setFilteredWishlist] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterVeg, setFilterVeg] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    loadWishlist();
  }, []);

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

  const loadWishlist = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  };

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter(item => item._id !== productId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={isLoggedIn} />
      <main className="pt-24 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">My list</h1>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 md:sticky md:top-24">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl mb-2 transition-all text-sm md:text-base ${
                      selectedCategory === cat ? "bg-red-50 border-l-4 border-red-500" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl md:text-2xl">{cat === "All" ? "🔲" : "📦"}</span>
                    <span className="text-sm font-medium">{cat}</span>
                  </button>
                ))}
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

              {filteredWishlist.length === 0 ? (
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
                        onClick={() => removeFromWishlist(product._id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-red-50"
                      >
                        <span className="text-red-500 text-xl">❤️</span>
                      </button>
                      <div className="relative">
                        <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover" />
                        <div className={`absolute top-3 left-3 w-5 h-5 border-2 ${
                          product.veg ? 'border-green-600' : 'border-red-600'
                        } rounded flex items-center justify-center bg-white`}>
                          <div className={`w-2.5 h-2.5 ${
                            product.veg ? 'bg-green-600' : 'bg-red-600'
                          } rounded-full`}></div>
                        </div>
                        {product.inStock && (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="absolute bottom-3 right-3 bg-white text-red-500 border-2 border-red-500 px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-50 shadow-lg"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 min-h-[48px]">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                          <span>{product.unit}</span>
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
                          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                          {product.unit && !isNaN(parseInt(product.unit)) && (
                            <span className="text-sm text-gray-500">₹{(product.price / parseInt(product.unit)).toFixed(2)}/pc</span>
                          )}
                        </div>
                        {product.bulkPrice && (
                          <div className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block">
                            ₹{product.bulkPrice}/pc Best rate
                          </div>
                        )}
                      </div>
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
