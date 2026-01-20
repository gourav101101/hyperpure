"use client";
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  images: string[];
  veg: boolean;
  description: string;
  keyFeatures: string[];
  servingInstructions: string[];
  packSize: string;
  bulkPrice?: string;
  bulkQuantity?: number;
  inStock: boolean;
}

export default function ProductPage({ params }: { params: any }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const resolvedParams = (React as any).use(params);
  const id = resolvedParams?.id;

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`);
      const currentProduct = await res.json();

      if (currentProduct) {
        setProduct(currentProduct);
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsInWishlist(wishlist.some((item: any) => item._id === currentProduct._id));
        
        const sellerRes = await fetch(`/api/products/sellers?productId=${currentProduct._id}`);
        const sellerData = await sellerRes.json();
        if (sellerData.sellers) {
          setSellers(sellerData.sellers);
          if (sellerData.sellers.length > 0) setSelectedSeller(sellerData.sellers[0]);
        }
        
        const allRes = await fetch('/api/products');
        const products = await allRes.json();
        const similar = products.filter((p: any) => 
          p.category === currentProduct.category && 
          p._id !== currentProduct._id
        ).slice(0, 4);
        setSimilarProducts(similar);
      }
    };
    fetchData();
  }, [id]);

  const toggleWishlist = () => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isInWishlist) {
      const updated = wishlist.filter((item: any) => item._id !== product._id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
    }
  };

  const submitNotification = () => {
    if (notifyEmail && product) {
      alert(`We'll notify you at ${notifyEmail} when ${product.name} is back in stock!`);
      setShowNotifyModal(false);
      setNotifyEmail("");
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart({
        _id: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0],
        unit: product.unit
      });
      setQuantity(0);
    }
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={isLoggedIn} />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-red-500">Home</a>
            <span>›</span>
            <a href="/catalogue" className="hover:text-red-500">Catalogue</a>
            <span>›</span>
            <a href={`/catalogue?category=${encodeURIComponent(product.category)}`} className="hover:text-red-500">{product.category}</a>
            <span>›</span>
            <a href={`/catalogue?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent((product as any).subcategory || '')}`} className="hover:text-red-500">{(product as any).subcategory}</a>
            <span>›</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>

          <div className="bg-white rounded-3xl p-8 flex gap-8 shadow-sm">
            {/* Left - Image Section */}
            <div className="w-1/2 bg-gray-50 rounded-2xl p-8 relative">
              {/* Veg/Non-Veg Indicator */}
              <div className={`absolute top-6 left-6 w-6 h-6 border-2 ${product.veg ? 'border-green-600' : 'border-red-600'} rounded flex items-center justify-center bg-white z-10`}>
                <div className={`w-3 h-3 ${product.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
              </div>
              
              {/* Main Image with Navigation */}
              <div className="relative bg-white rounded-2xl p-8 mb-6">
                <button 
                  onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 z-10"
                >
                  <span className="text-red-500 text-xl">‹</span>
                </button>
                <img src={product.images[currentImage]} alt={product.name} className="w-full h-80 object-cover rounded-2xl" />
                <button 
                  onClick={() => setCurrentImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 z-10"
                >
                  <span className="text-red-500 text-xl">›</span>
                </button>
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-3 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      currentImage === i ? 'border-red-500 scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Product Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold flex-1">{product.name}</h1>
                <button
                  onClick={toggleWishlist}
                  className={`ml-4 flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                    isInWishlist ? 'bg-red-50 border-red-500' : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className={`w-6 h-6 ${
                    isInWishlist ? 'fill-red-500' : 'fill-none stroke-gray-400'
                  }`} viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-500 mb-6">{product.unit}</p>

              {/* Seller Selection */}
              {sellers.length > 0 ? (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-blue-900">Choose from {sellers.length} seller{sellers.length > 1 ? 's' : ''}</h3>
                    {sellers.length > 1 && (
                      <div className="text-xs text-blue-700">
                        Price range: ₹{sellers[0].sellerPrice} - ₹{sellers[sellers.length - 1].sellerPrice}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {sellers.map((seller) => (
                      <button
                        key={seller._id}
                        onClick={() => setSelectedSeller(seller)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          selectedSeller?._id === seller._id ? 'border-blue-500 bg-white' : 'border-transparent bg-white/50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm">{seller.sellerId?.businessName || seller.sellerId?.name || 'Seller'}</div>
                            <div className="text-xs text-gray-600">Stock: {seller.stock} • MOQ: {seller.minOrderQty} • {seller.deliveryTime}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">₹{seller.sellerPrice}</div>
                            {sellers.length > 1 && seller.sellerPrice === sellers[0].sellerPrice && (
                              <div className="text-xs text-green-600 font-bold">🏆 Best price</div>
                            )}
                            {sellers.length > 1 && seller.sellerPrice > sellers[0].sellerPrice && (
                              <div className="text-xs text-orange-600">+₹{(seller.sellerPrice - sellers[0].sellerPrice).toFixed(2)}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-4">
                  <h3 className="font-bold text-sm mb-2 text-orange-900">⚠️ No sellers available</h3>
                  <p className="text-xs text-orange-700">This product is not currently offered by any seller. Check back later!</p>
                </div>
              )}

              {/* Pricing Card */}
              {selectedSeller && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-black">₹{selectedSeller.sellerPrice}</div>
                      <div className="text-sm text-gray-500">per {product.unit}</div>
                    </div>
                    {quantity === 0 ? (
                      <button 
                        onClick={() => setQuantity(1)}
                        className="bg-white text-red-500 border-2 border-red-500 px-8 py-3 rounded-full font-bold hover:bg-red-50 transition-colors"
                      >
                        ADD +
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white border-2 border-red-500 rounded-full px-4 py-2">
                          <button onClick={() => setQuantity(Math.max(0, quantity - 1))} className="text-red-500 font-bold text-xl w-8 h-8">-</button>
                          <span className="font-bold text-lg min-w-[30px] text-center">{quantity}</span>
                          <button onClick={() => setQuantity(quantity + 1)} className="text-red-500 font-bold text-xl w-8 h-8">+</button>
                        </div>
                        <button onClick={handleAddToCart} className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600">
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Details */}
              <h2 className="text-2xl font-bold mb-3">Product details</h2>
              <p className="text-gray-700 mb-4">{product.description}</p>

              {product.keyFeatures.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-700 mb-2">Key Features:</h3>
                  <ul className="space-y-2 text-gray-700 mb-6">
                    {product.keyFeatures.map((feature, i) => (
                      <li key={i} className="flex gap-2"><span className="text-black">•</span><span>{feature}</span></li>
                    ))}
                  </ul>
                </>
              )}

              {product.servingInstructions.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-700 mb-2">Serving Instructions:</h3>
                  <ul className="space-y-2 text-gray-700 mb-6">
                    {product.servingInstructions.map((instruction, i) => (
                      <li key={i} className="flex gap-2"><span className="text-black">•</span><span>{instruction}</span></li>
                    ))}
                  </ul>
                </>
              )}

              {product.packSize && (
                <p className="text-gray-700 font-semibold">Pack Size: <span className="font-normal">{product.packSize}</span></p>
              )}
            </div>
          </div>

          {/* Similar Items */}
          {similarProducts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar items</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map(p => (
                <Link key={p.id || p._id} href={`/catalogue/${p._id || p.id}`}>
                  <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex gap-6">
                      <div className="relative">
                        <div className={`absolute top-2 left-2 w-5 h-5 border-2 ${p.veg ? 'border-green-600' : 'border-red-600'} rounded flex items-center justify-center bg-white`}>
                          <div className={`w-2 h-2 ${p.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
                        </div>
                        <img src={p.images[0]} alt={p.name} className="w-40 h-40 object-cover rounded-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{p.unit}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            {p.bulkPrice && <div className="text-sm text-blue-600 font-medium mb-2">{p.bulkPrice} for {p.bulkQuantity} pcs+</div>}
                            <div className="text-xl font-bold">₹{p.price}</div>
                            <div className="text-xs text-gray-500">at ₹{(p.price / parseInt(p.unit)).toFixed(2)}/pc</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {p.bulkQuantity && <div className="text-sm text-red-500 font-medium">Add {Math.ceil(p.bulkQuantity / 5)}</div>}
                            <button className="bg-white text-red-500 border-2 border-red-500 px-6 py-2 rounded-full font-bold hover:bg-red-50 transition-colors">
                              ADD +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          )}
        </div>
      </main>
      <Footer />

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowNotifyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4">Notify Me</h2>
            <p className="text-gray-600 mb-6">We'll notify you when <span className="font-semibold">{product?.name}</span> is back in stock</p>
            <input 
              type="email" 
              value={notifyEmail} 
              onChange={(e) => setNotifyEmail(e.target.value)} 
              placeholder="Enter your email" 
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl mb-4 focus:border-blue-500 outline-none"
            />
            <button 
              onClick={submitNotification}
              disabled={!notifyEmail}
              className={`w-full py-3 rounded-xl font-bold ${notifyEmail ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'}`}
            >
              Notify Me
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
