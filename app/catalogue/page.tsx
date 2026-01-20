"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Link from "next/link";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

function CatalogueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productPrices, setProductPrices] = useState<any>({});
  const [selectedTopCategory, setSelectedTopCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const subcat = searchParams.get('subcategory');
    if (cat) {
      setSelectedTopCategory(cat);
      setSelectedCategory(subcat || "All");
    }
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedTopCategory && categories.length > 0 && scrollContainerRef.current) {
      setTimeout(() => {
        const button = categoryRefs.current[selectedTopCategory];
        const container = scrollContainerRef.current;
        if (button && container) {
          const buttonLeft = button.offsetLeft;
          const buttonWidth = button.offsetWidth;
          const containerWidth = container.offsetWidth;
          const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
          container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedTopCategory, categories]);

  useEffect(() => {
    if (!searchParams.get('category') && categories.length > 0 && !selectedTopCategory) {
      setSelectedTopCategory(categories[0].name);
      router.push(`/catalogue?category=${encodeURIComponent(categories[0].name)}`);
    }
  }, [categories, searchParams, selectedTopCategory]);

  const fetchData = async () => {
    const [cats, prods] = await Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]);
    setCategories(cats);
    setProducts(prods);
    
    // Fetch lowest price for each product
    const prices: any = {};
    for (const product of prods) {
      const sellerRes = await fetch(`/api/products/sellers?productId=${product._id}`);
      const sellerData = await sellerRes.json();
      if (sellerData.sellers && sellerData.sellers.length > 0) {
        prices[product._id] = sellerData.sellers[0].sellerPrice; // Already sorted by price
      }
    }
    setProductPrices(prices);
  };

  const handleAddToCart = (product: any, price: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!price) {
      alert('No sellers available for this product');
      return;
    }
    addToCart({
      _id: product._id,
      name: product.name,
      price: price,
      quantity: 1,
      image: product.images[0],
      unit: product.unit
    });
  };

  const currentCategory = categories.find(c => c.name === selectedTopCategory);
  const subcategories = [{ name: "All", icon: "🔲" }, ...(currentCategory?.subcategories || [])];
  
  const filteredProducts = products.filter(p => {
    if (p.category !== selectedTopCategory) return false;
    if (selectedCategory !== "All" && p.subcategory !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header isLoggedIn={isLoggedIn} />
      <main className="pt-20 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
            <button className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl font-bold flex-shrink-0">‹</button>
            <div ref={scrollContainerRef} className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide flex-1">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  ref={(el) => { categoryRefs.current[cat.name] = el; }}
                  onClick={() => {
                    setSelectedTopCategory(cat.name);
                    router.push(`/catalogue?category=${encodeURIComponent(cat.name)}`);
                  }}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg whitespace-nowrap font-semibold transition-colors flex-shrink-0 text-sm md:text-base ${
                    selectedTopCategory === cat.name ? "text-black" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl font-bold flex-shrink-0">›</button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <aside className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 md:sticky md:top-24">
                {subcategories.map((sub: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCategory(sub.name);
                      if (sub.name === "All") {
                        router.push(`/catalogue?category=${encodeURIComponent(selectedTopCategory)}`);
                      } else {
                        router.push(`/catalogue?category=${encodeURIComponent(selectedTopCategory)}&subcategory=${encodeURIComponent(sub.name)}`);
                      }
                    }}
                    className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl mb-2 transition-all text-sm md:text-base ${
                      selectedCategory === sub.name ? "bg-red-50 border-l-4 border-red-500" : "hover:bg-gray-50"
                    }`}
                  >
                    {sub.icon && (sub.icon.includes('http') || sub.icon.includes('cloudinary')) ? (
                      <img src={sub.icon} alt={sub.name} className="w-6 h-6 md:w-8 md:h-8 object-cover rounded" />
                    ) : (
                      <span className="text-xl md:text-2xl">{sub.icon || "📦"}</span>
                    )}
                    <span className="text-xs md:text-sm font-medium text-left">{sub.name}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-12">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-xl md:rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                    <Link href={`/catalogue/${product._id}`} className="block">
                      <div className="relative">
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
                          alt={product.name} 
                          className="w-full h-36 md:h-48 object-cover"
                          onError={(e) => { 
                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Product'; 
                          }} 
                        />
                        <div className={`absolute top-2 md:top-3 left-2 md:left-3 w-4 h-4 md:w-5 md:h-5 border-2 ${
                          product.veg ? 'border-green-600' : 'border-red-600'
                        } rounded flex items-center justify-center bg-white`}>
                          <div className={`w-2 h-2 md:w-2.5 md:h-2.5 ${
                            product.veg ? 'bg-green-600' : 'bg-red-600'
                          } rounded-full`}></div>
                        </div>
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2 line-clamp-2 min-h-[40px] md:min-h-[48px] hover:text-red-500">{product.name}</h3>
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 text-xs md:text-sm text-gray-600">
                          <span>{product.unit}</span>
                          {product.packSize && (
                            <>
                              <span>•</span>
                              <span>{product.packSize}</span>
                            </>
                          )}
                        </div>
                        {productPrices[product._id] ? (
                          <div className="mb-1">
                            <div className="flex items-baseline gap-1 md:gap-2">
                              <span className="text-lg md:text-2xl font-bold text-green-600">₹{productPrices[product._id]}</span>
                              <span className="text-xs text-gray-500">from</span>
                            </div>
                            <div className="text-xs text-gray-500">Best seller price</div>
                          </div>
                        ) : (
                          <div className="text-xs text-orange-600 font-medium mb-1">No sellers yet</div>
                        )}
                      </div>
                    </Link>
                    {productPrices[product._id] && (
                      <div className="px-3 md:px-4 pb-3 md:pb-4">
                        <button 
                          onClick={(e) => { e.preventDefault(); router.push(`/catalogue/${product._id}`); }}
                          className="w-full bg-white text-red-500 border-2 border-red-500 px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-red-50">
                          VIEW SELLERS
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {isLoggedIn && <BottomNav />}
      <Footer />
    </div>
  );
}

export default function Catalogue() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <CatalogueContent />
    </Suspense>
  );
}
