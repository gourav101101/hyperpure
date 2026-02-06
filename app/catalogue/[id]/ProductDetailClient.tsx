"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import LoginModal from "../../components/LoginModal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToWishlist, removeFromWishlist } from "../../store/wishlistSlice";

interface Product {
  _id?: string;
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
  sku?: string;
}

export default function ProductDetailClient({ id }: { id: string }) {
  const { addToCart, updateQuantity, getCartItem, cart } = useCart();
  const dispatch = useAppDispatch();
  const { isLoggedIn: authLoggedIn, userId } = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedSellerProductId, setSelectedSellerProductId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    setIsLoggedIn(authLoggedIn);
  }, [authLoggedIn]);

  useEffect(() => {
    if (!product?._id) return;
    setIsInWishlist(wishlistItems.some((item) => item._id === product._id));
  }, [product?._id, wishlistItems]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        
        if (data && !data.error) {
          setProduct(data);
          // Get best seller product ID for cart
          const sellerRes = await fetch(`/api/products/sellers?productId=${data._id}`);
          const sellerData = await sellerRes.json();
          if (sellerData.sellers && sellerData.sellers.length > 0) {
            setSelectedSellerProductId(sellerData.sellers[0]._id);
            // Update product with GST data from seller
            data.gstRate = sellerData.sellers[0].gstRate || 0;
            data.cessRate = sellerData.sellers[0].cessRate || 0;
            setProduct(data);
          }
          
          // Fetch reviews
          const reviewRes = await fetch(`/api/reviews?productId=${data._id}`);
          const reviewData = await reviewRes.json();
          if (reviewData.reviews) {
            setReviews(reviewData.reviews);
            setAvgRating(reviewData.avgRating || 0);
            setRatingBreakdown(reviewData.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
          }
          
          // Fetch similar products
          const products = await fetch('/api/products').then(r => r.json());
          const similar = products.filter((p: any) => 
            p.category === data.category && 
            p._id !== data._id
          ).slice(0, 4);
          setSimilarProducts(similar);
          
          // Fetch delivery slot
          setLoadingSlots(true);
          const slotRes = await fetch('/api/delivery-slots');
          const slotData = await slotRes.json();
          if (slotData.slots && slotData.slots.length > 0) {
            const availableSlots = slotData.slots.filter((s: any) => !s.disabled && s.active);
            // Sort: standard first, then express
            const sorted = availableSlots.sort((a: any, b: any) => {
              if (a.isExpress === b.isExpress) return 0;
              return a.isExpress ? 1 : -1;
            });
            setDeliverySlots(sorted);
          }
          setLoadingSlots(false);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchData();
  }, [id]);

  const toggleWishlist = async () => {
    if (!product || !product._id) return;

    if (!authLoggedIn || !userId) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (isInWishlist) {
        const updated = wishlist.filter((item: any) => item._id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        dispatch(removeFromWishlist(product._id));
        setIsInWishlist(false);
      } else {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        dispatch(addToWishlist(product));
        setIsInWishlist(true);
      }
      return;
    }

    try {
      if (isInWishlist) {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: product._id }),
        });
        if (res.ok) {
          dispatch(removeFromWishlist(product._id));
          setIsInWishlist(false);
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: product._id }),
        });
        if (res.ok) {
          dispatch(addToWishlist(product));
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error('Wishlist update failed:', error);
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
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    if (product) {
      const cartId = selectedSellerProductId ? `${product._id}-${selectedSellerProductId}` : product._id || product.id;
      const existing = getCartItem(cartId);
      
      if (existing) {
        updateQuantity(cartId, existing.quantity + 1);
      } else {
        addToCart({
          _id: cartId,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.images[0],
          unit: product.unit,
          gstRate: (product as any).gstRate || 0,
          cessRate: (product as any).cessRate || 0
        });
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    if (!reviewForm.comment.trim()) {
      alert('Please write a review');
      return;
    }
    
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?._id,
          userId,
          productRating: reviewForm.rating,
          deliveryRating: reviewForm.rating,
          qualityRating: reviewForm.rating,
          overallRating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      
      if (res.ok) {
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
        // Refresh reviews
        const reviewRes = await fetch(`/api/reviews?productId=${product?._id}`);
        const reviewData = await reviewRes.json();
        if (reviewData.reviews) {
          setReviews(reviewData.reviews);
          setAvgRating(reviewData.avgRating || 0);
          setRatingBreakdown(reviewData.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (!product) return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-6" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      {/* Breadcrumb - Mobile Optimized */}
      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6 overflow-x-auto scrollbar-hide pb-1">
        <a href="/" className="hover:text-red-500 whitespace-nowrap flex-shrink-0">Home</a>
        <span className="text-gray-300 flex-shrink-0">›</span>
        <a href="/catalogue" className="hover:text-red-500 whitespace-nowrap flex-shrink-0">Catalogue</a>
        <span className="text-gray-300 flex-shrink-0">›</span>
        <a href={`/catalogue?category=${encodeURIComponent(product.category)}`} className="hover:text-red-500 whitespace-nowrap flex-shrink-0">{product.category}</a>
        {(product as any).subcategory && (
          <>
            <span className="text-gray-300 flex-shrink-0">›</span>
            <a href={`/catalogue?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent((product as any).subcategory)}`} className="hover:text-red-500 whitespace-nowrap flex-shrink-0">{(product as any).subcategory}</a>
          </>
        )}
        <span className="text-gray-300 flex-shrink-0">›</span>
        <span className="text-gray-900 font-medium whitespace-nowrap flex-shrink-0">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
        {/* Product Images - Mobile Optimized */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 mb-3 md:mb-4 shadow-sm border border-gray-100">
            <div className="relative">
              <div className={`absolute top-2 md:top-4 left-2 md:left-4 w-5 h-5 md:w-7 md:h-7 border-2 ${product.veg ? 'border-green-600' : 'border-red-600'} rounded flex items-center justify-center bg-white shadow-sm z-10`}>
                <div className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 ${product.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
              </div>
              <button onClick={toggleWishlist} className="absolute top-2 md:top-4 right-2 md:right-4 p-1.5 md:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all z-10">
                <svg className={`w-5 h-5 md:w-6 md:h-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <img src={product.images[currentImage]} alt={product.name} className="w-full h-64 md:h-96 object-contain" />
            </div>
          </div>
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setCurrentImage(idx)} className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${currentImage === idx ? 'border-4 border-red-400 shadow-md' : 'border-2 border-gray-200 hover:border-gray-300'}`}>
                <img src={img} alt="" className="w-full h-full object-contain bg-white" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-3" style={{letterSpacing: '-0.02em'}}>{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Delivery Info */}
          {loadingSlots ? (
            <div className="mb-6 md:mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 flex-shrink-0 bg-gray-50 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 flex-shrink-0 bg-gray-50 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : deliverySlots.length > 0 && (
            <div className="mb-6 md:mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {deliverySlots.map((slot) => (
                <div key={slot._id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 flex-shrink-0 ${
                  slot.isExpress 
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    slot.isExpress ? 'bg-orange-500' : 'bg-green-500'
                  }`}>
                    {slot.isExpress ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{slot.name}</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {slot.isExpress 
                        ? `Delivery in ${slot.expressDeliveryHours || 2} hours` 
                        : `Tomorrow, ${new Date(`2000-01-01T${slot.deliveryStartTime}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})} - ${new Date(`2000-01-01T${slot.deliveryEndTime}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="mb-6 md:mb-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl md:text-5xl font-extrabold text-gray-900">₹{product.price}</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">at ₹{product.price}/{product.unit}</span>
                </div>
                
                {product.inStock ? (
                  (() => {
                    const cartId = selectedSellerProductId ? `${product._id}-${selectedSellerProductId}` : product._id || product.id;
                    const cartItem = getCartItem(cartId);
                    const currentQty = cartItem?.quantity || 0;
                    
                    return currentQty > 0 ? (
                      <div className="flex items-center bg-red-50 rounded-xl px-4 py-2 border-2 border-red-300 gap-4">
                        <button 
                          onClick={() => updateQuantity(cartId, currentQty - 1)}
                          className="text-red-500 font-bold text-2xl w-8 h-8 flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">{currentQty}</span>
                        <button 
                          onClick={() => updateQuantity(cartId, currentQty + 1)}
                          className="text-red-500 font-bold text-2xl w-8 h-8 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleAddToCart}
                        className="bg-red-50 text-red-500 px-12 py-3 rounded-xl font-bold text-lg hover:bg-red-100 transition-all border-2 border-red-200 relative min-w-[140px]"
                      >
                        <span>ADD</span>
                        <span className="absolute -top-1 right-2 text-xl font-bold">+</span>
                      </button>
                    );
                  })()
                ) : (
                  <button 
                    onClick={() => setShowNotifyModal(true)}
                    className="bg-gray-200 text-gray-600 px-8 py-3 rounded-xl font-bold text-lg"
                  >
                    NOTIFY
                  </button>
                )}
              </div>
              
              {product.inStock && (
                <div className="flex items-center gap-2 mt-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-600 font-medium">In Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="mt-8 space-y-6">
            {/* Product Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-xl mb-4">Product Details</h3>
              
              {product.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
              
              {product.keyFeatures && product.keyFeatures.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                  <ul className="space-y-2.5 list-disc list-inside">
                    {product.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {product.servingInstructions && product.servingInstructions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How to Use</h4>
                  <ul className="space-y-2.5 list-disc list-inside">
                    {product.servingInstructions.map((instruction, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Nutritional Information */}
            {(product as any).nutritionalInfo && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>📊</span> Nutritional Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(product as any).nutritionalInfo.servingSize && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Serving Size</div>
                      <div className="font-bold text-gray-900">{(product as any).nutritionalInfo.servingSize}</div>
                    </div>
                  )}
                  {(product as any).nutritionalInfo.calories && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Calories</div>
                      <div className="font-bold text-gray-900">{(product as any).nutritionalInfo.calories} kcal</div>
                    </div>
                  )}
                  {(product as any).nutritionalInfo.protein && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Protein</div>
                      <div className="font-bold text-gray-900">{(product as any).nutritionalInfo.protein}</div>
                    </div>
                  )}
                  {(product as any).nutritionalInfo.carbs && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Carbs</div>
                      <div className="font-bold text-gray-900">{(product as any).nutritionalInfo.carbs}</div>
                    </div>
                  )}
                  {(product as any).nutritionalInfo.fat && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Fat</div>
                      <div className="font-bold text-gray-900">{(product as any).nutritionalInfo.fat}</div>
                    </div>
                  )}
                  {(product as any).nutritionalInfo.fiber && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Fiber</div>
                      <div className="font-bold text-gray-900">{(product as any).nutritionalInfo.fiber}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {(product as any).ingredients && (product as any).ingredients.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>🧪</span> Ingredients
                </h3>
                <p className="text-sm text-gray-700">{(product as any).ingredients.join(', ')}</p>
              </div>
            )}

            {/* Storage & Safety */}
            {((product as any).shelfLife || (product as any).storageInstructions) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>📦</span> Storage & Safety
                </h3>
                <div className="space-y-3">
                  {(product as any).shelfLife && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Shelf Life</h4>
                        <p className="text-sm text-gray-600">{(product as any).shelfLife}</p>
                      </div>
                    </div>
                  )}
                  {(product as any).storageInstructions && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Storage Instructions</h4>
                        <p className="text-sm text-gray-600">{(product as any).storageInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Information */}
            {((product as any).brand || (product as any).manufacturer || (product as any).countryOfOrigin) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>ℹ️</span> Product Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(product as any).brand && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Brand</div>
                      <div className="font-semibold text-gray-900">{(product as any).brand}</div>
                    </div>
                  )}
                  {(product as any).manufacturer && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Manufacturer</div>
                      <div className="font-semibold text-gray-900">{(product as any).manufacturer}</div>
                    </div>
                  )}
                  {(product as any).countryOfOrigin && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Country of Origin</div>
                      <div className="font-semibold text-gray-900">{(product as any).countryOfOrigin}</div>
                    </div>
                  )}
                  {product.sku && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">SKU</div>
                      <div className="font-semibold text-gray-900">{product.sku}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Customer Reviews</h3>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Write Review
                </button>
              </div>
                
              {reviews.length > 0 ? (
                <>
                  {/* Rating Summary */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900 mb-1">{avgRating.toFixed(1)}</div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{reviews.length} reviews</div>
                    </div>
                    
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = ratingBreakdown[rating as keyof typeof ratingBreakdown] || 0;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-600 w-8">{rating} ★</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400" style={{width: `${percentage}%`}}></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review: any) => (
                      <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-4 h-4 ${star <= review.overallRating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          {review.isVerified && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified Purchase</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">{(review.userId as any)?.name || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {reviews.length > 3 && (
                    <button className="w-full mt-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                      View All {reviews.length} Reviews
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">⭐</div>
                  <h4 className="font-semibold text-gray-900 mb-2">No reviews yet</h4>
                  <p className="text-sm text-gray-600 mb-4">Be the first to review this product!</p>
                  <button 
                    onClick={() => setShowReviewModal(true)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Write First Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Similar items</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {similarProducts.map((p) => (
              <a key={p._id} href={`/catalogue/${p._id}`} className="bg-white rounded-xl p-3 md:p-4 hover:shadow-lg transition-shadow border border-gray-100">
                <img src={p.images[0]} alt={p.name} className="w-full h-32 md:h-40 object-contain mb-2 md:mb-3" />
                <h3 className="font-semibold mb-1 md:mb-2 line-clamp-2 text-sm md:text-base">{p.name}</h3>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 text-xs text-gray-600">
                  <span>{p.unit}</span>
                  {p.packSize && (
                    <>
                      <span>•</span>
                      <span className="bg-blue-50 text-blue-700 px-1.5 md:px-2 py-0.5 rounded text-xs">{p.packSize}</span>
                    </>
                  )}
                </div>
                <p className="text-base md:text-lg font-bold text-gray-900">₹{p.price}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">More from Hyperpure</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {similarProducts.slice(0, 4).map((p) => (
            <a key={p._id} href={`/catalogue/${p._id}`} className="bg-white rounded-xl p-3 md:p-4 hover:shadow-lg transition-shadow border border-gray-100">
              <img src={p.images[0]} alt={p.name} className="w-full h-32 md:h-40 object-contain mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 line-clamp-2 text-xs md:text-sm">{p.name}</h3>
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 text-xs text-gray-600">
                <span>{p.unit}</span>
                {p.packSize && (
                  <>
                    <span>•</span>
                    <span className="bg-blue-50 text-blue-700 px-1.5 md:px-2 py-0.5 rounded text-xs">{p.packSize}</span>
                  </>
                )}
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900">₹{p.price}</p>
            </a>
          ))}
        </div>
      </div>

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Get Notified</h3>
            <p className="text-gray-600 mb-4">Enter your email to be notified when this product is back in stock.</p>
            <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="Your email" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowNotifyModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={submitNotification} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">Notify Me</button>
            </div>
          </div>
        </div>
      )}

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => {
        setShowLoginModal(false);
        setIsLoggedIn(true);
        window.location.reload();
      }} />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={toggleWishlist} className={`p-3 rounded-xl border-2 transition-all ${isInWishlist ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
            <svg className={`w-6 h-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {product.inStock ? (
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-red-600 transition-all"
            >
              Add to Cart - ₹{product.price}
            </button>
          ) : (
            <button 
              onClick={() => setShowNotifyModal(true)}
              className="flex-1 bg-gray-300 text-gray-600 py-3 px-6 rounded-xl font-bold text-lg"
            >
              Notify When Available
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
