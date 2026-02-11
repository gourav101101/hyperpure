"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Link from "next/link";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAppSelector } from "../store/hooks";

function CatalogueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productPrices, setProductPrices] = useState<any>({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedTopCategory, setSelectedTopCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    const cat = searchParams?.get('category');
    const subcat = searchParams?.get('subcategory');
    if (cat) {
      setSelectedTopCategory(cat);
      setSelectedCategory(subcat || "All");
    }
  }, [searchParams]);

  const handleCategoryChange = (categoryName: string, subcategoryName?: string) => {
    setLoadingProducts(true);
    setSelectedTopCategory(categoryName);
    setSelectedCategory(subcategoryName || "All");
    
    if (subcategoryName && subcategoryName !== "All") {
      router.push(`/catalogue?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryName)}`, { scroll: false });
    } else {
      router.push(`/catalogue?category=${encodeURIComponent(categoryName)}`, { scroll: false });
    }
    
    setTimeout(() => setLoadingProducts(false), 300);
  };

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
    if (!searchParams?.get('category') && categories.length > 0 && !selectedTopCategory) {
      setSelectedTopCategory(categories[0].name);
      router.push(`/catalogue?category=${encodeURIComponent(categories[0].name)}`);
    }
  }, [categories, searchParams, selectedTopCategory]);

  const fetchData = async () => {
    setLoadingPrices(true);
    setLoadingCategories(true);
    const [cats, prods] = await Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]);
    setCategories(cats);
    setProducts(prods);
    setLoadingCategories(false);
    
    // Fetch all seller prices in one bulk request
    try {
      const productIds = prods.map((p: any) => p._id);
      const bulkRes = await fetch('/api/products/bulk-sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds })
      });
      if (bulkRes.ok) {
        const { prices } = await bulkRes.json();
        setProductPrices(prices);
      }
    } catch (error) {
      console.error('Error fetching bulk seller prices:', error);
    }
    setLoadingPrices(false);
  };

  const handleAddToCart = (product: any, priceData: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (!priceData?.price) {
      alert('Currently unavailable');
      return;
    }
    addToCart({
      _id: product._id,
      name: product.name,
      price: priceData.price,
      quantity: 1,
      image: product.images[0],
      unit: priceData.unit || product.unit,
      gstRate: product.gstRate || 0,
      cessRate: product.cessRate || 0
    });
  };

  const currentCategory = categories.find(c => c.name === selectedTopCategory);
  const subcategories = [
    { name: "All", icon: "🔲" }, 
    ...(currentCategory?.subcategories?.filter((sub: any) => sub.isActive !== false) || [])
  ];
  
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
          {loadingCategories ? (
            <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide flex-1">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                ))}
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
            <button className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl font-bold flex-shrink-0">‹</button>
            <div ref={scrollContainerRef} className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide flex-1">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  ref={(el) => { categoryRefs.current[cat.name] = el; }}
                  onClick={() => handleCategoryChange(cat.name)}
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
          )}

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <aside className="w-full md:w-72 flex-shrink-0">
              {loadingCategories ? (
                <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4">
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 mb-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 md:sticky md:top-24">
                {subcategories.map((sub: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleCategoryChange(selectedTopCategory, sub.name === "All" ? undefined : sub.name)}
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
              )}
            </aside>

            <div className="flex-1">
              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-12">
                  {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg md:rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                      <div className="h-32 md:h-48 bg-gray-200"></div>
                      <div className="p-2 md:p-4">
                        <div className="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1 md:mb-2"></div>
                        <div className="h-4 md:h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : loadingPrices ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-12">
                  {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg md:rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                      <div className="h-32 md:h-48 bg-gray-200"></div>
                      <div className="p-2 md:p-4">
                        <div className="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1 md:mb-2"></div>
                        <div className="h-4 md:h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-12">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg md:rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                    <Link href={`/catalogue/${product._id}`} className="block">
                      <div className="relative">
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
                          alt={product.name} 
                          className="w-full h-32 md:h-48 object-cover"
                          onError={(e) => { 
                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Product'; 
                          }} 
                        />
                        <div className={`absolute top-1.5 md:top-3 left-1.5 md:left-3 w-3 h-3 md:w-5 md:h-5 border md:border-2 ${
                          product.veg ? 'border-green-600' : 'border-red-600'
                        } rounded flex items-center justify-center bg-white`}>
                          <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 ${
                            product.veg ? 'bg-green-600' : 'bg-red-600'
                          } rounded-full`}></div>
                        </div>
                      </div>
                      <div className="p-2 md:p-4">
                        <h3 className="font-bold text-xs md:text-base text-gray-900 mb-1 md:mb-2 line-clamp-2 min-h-[32px] md:min-h-[48px] hover:text-red-500 leading-tight">{product.name}</h3>
                        {loadingPrices ? (
                          <div className="animate-pulse">
                            <div className="h-3 md:h-4 bg-gray-200 rounded w-16 md:w-20 mb-1 md:mb-2"></div>
                            <div className="h-4 md:h-6 bg-gray-200 rounded w-20 md:w-24"></div>
                          </div>
                        ) : productPrices[product._id] ? (
                          <>
                            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                              <span className="bg-green-50 text-green-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-semibold">{productPrices[product._id].packSize}</span>
                            </div>
                            <div className="mb-1">
                              <div className="flex items-baseline gap-1 md:gap-2">
                                <span className="text-sm md:text-2xl font-bold text-green-600">₹{productPrices[product._id].price}</span>
                                <span className="text-xs text-gray-500">/ {productPrices[product._id].unit}</span>
                              </div>
                              <div className="text-xs text-gray-500">Hyperpure Verified</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                              <span className="text-xs text-gray-600">{product.unit}</span>
                              {product.packSize && (
                                <span className="bg-gray-100 text-gray-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs">{product.packSize}</span>
                              )}
                            </div>
                            <div className="text-xs text-orange-600 font-medium mb-1">Coming soon</div>
                          </>
                        )}
                      </div>
                    </Link>
                    {productPrices[product._id] && (
                      <div className="px-2 md:px-4 pb-2 md:pb-4">
                        <button 
                          onClick={(e) => { e.preventDefault(); router.push(`/catalogue/${product._id}`); }}
                          className="w-full bg-white text-red-500 border border-red-500 md:border-2 px-3 md:px-6 py-1 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-red-50">
                          VIEW OPTIONS
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {isMounted && isLoggedIn && <BottomNav />}
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
