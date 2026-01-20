"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NetworkSection() {
  const [particles, setParticles] = useState<any[]>([]);
  const [visibleBrands, setVisibleBrands] = useState<Set<string>>(new Set());
  const router = useRouter();

  const sellers = [
    { 
      name: "FARM", 
      brands: [
        { img: "🥬", bg: "bg-green-50", id: "farm1" },
        { img: "🐟", bg: "bg-blue-50", id: "farm2" },
        { img: "🥗", bg: "bg-lime-50", id: "farm3" }
      ]
    },
    { 
      name: "NATIONAL", 
      brands: [
        { img: "🏪", bg: "bg-purple-50", id: "nat1" },
        { img: "🥛", bg: "bg-blue-50", id: "nat2" },
        { img: "🍞", bg: "bg-orange-50", id: "nat3" }
      ]
    },
    { 
      name: "IMPORTED", 
      brands: [
        { img: "✈️", bg: "bg-sky-50", id: "imp1" },
        { img: "🌍", bg: "bg-green-50", id: "imp2" },
        { img: "📦", bg: "bg-amber-50", id: "imp3" }
      ]
    }
  ];

  const customers = [
    { 
      name: "DINING", 
      brands: [
        { img: "🍽️", bg: "bg-pink-50", id: "din1" },
        { img: "🍴", bg: "bg-rose-50", id: "din2" },
        { img: "🥂", bg: "bg-red-50", id: "din3" }
      ]
    },
    { 
      name: "QSRs", 
      brands: [
        { img: "🍔", bg: "bg-yellow-50", id: "qsr1" },
        { img: "🍕", bg: "bg-orange-50", id: "qsr2" },
        { img: "🌮", bg: "bg-amber-50", id: "qsr3" }
      ]
    },
    { 
      name: "CLOUD KITCHENS", 
      brands: [
        { img: "☁️", bg: "bg-blue-50", id: "ck1" },
        { img: "🍱", bg: "bg-teal-50", id: "ck2" },
        { img: "📱", bg: "bg-slate-50", id: "ck3" }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const sellerIdx = Math.floor(Math.random() * 3);
      const customerIdx = Math.floor(Math.random() * 3);
      const brandIdx = Math.floor(Math.random() * 3);
      
      const sellerBrand = sellers[sellerIdx].brands[brandIdx];
      const customerBrand = customers[customerIdx].brands[brandIdx];
      
      setVisibleBrands(prev => new Set(prev).add(sellerBrand.id).add(customerBrand.id));
      
      const newParticle = {
        id: Date.now() + Math.random(),
        sellerIdx,
        customerIdx,
        brand: sellerBrand,
        outBrand: customerBrand,
        progress: 0
      };
      
      setParticles(prev => [...prev, newParticle]);
      
      const animationDuration = 4000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        setParticles(prev => prev.map(p => 
          p.id === newParticle.id ? { ...p, progress } : p
        ));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== newParticle.id));
            setVisibleBrands(prev => {
              const next = new Set(prev);
              next.delete(sellerBrand.id);
              next.delete(customerBrand.id);
              return next;
            });
          }, 500);
        }
      };
      
      requestAnimationFrame(animate);
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden relative">
      {/* Light pink background with curved bottom */}
      <div className="bg-[#FFF0F0] pb-40 rounded-b-[80px]">
        <div className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-[40px] font-bold mb-3">
              <span className="text-[#CF4A57]">Building a wide network of</span>
            </h2>
            <div className="text-[28px] font-bold text-[#1C1C1C] flex items-center justify-center gap-4">
              <div className="w-[31px] h-[2px] bg-black"></div>
              Sellers & Customers
              <div className="w-[31px] h-[2px] bg-black"></div>
            </div>
          </div>

          <div className="relative min-h-[500px] flex items-center justify-center">
          {/* Left Side - Sellers */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-20">
            {sellers.map((seller, idx) => (
              <div key={seller.name} className="flex items-center gap-6">
                <div className="flex gap-3">
                  {seller.brands.map((brand) => (
                    <div 
                      key={brand.id} 
                      className={`w-16 h-16 rounded-full ${brand.bg} shadow-xl flex items-center justify-center text-2xl border-2 border-white transition-all duration-500 hover:scale-110 ${
                        visibleBrands.has(brand.id) ? 'opacity-100 scale-100 ring-2 ring-red-300' : 'opacity-40 scale-90'
                      }`}
                    >
                      {brand.img}
                    </div>
                  ))}
                </div>
                <div className="px-6 py-2 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-bold text-xs shadow-2xl border border-gray-700 backdrop-blur-sm min-w-[120px] text-center relative z-20">
                  {seller.name}
                </div>
              </div>
            ))}
          </div>

          {/* Center - Compact Hyperpure */}
          <div className="relative z-10">
            <div className="bg-white rounded-2xl shadow-2xl px-10 py-4 border-2 border-gray-200 hover:shadow-red-200/50 transition-shadow duration-300">
              <div className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">hyperpure</div>
              <div className="text-[9px] text-gray-500 text-center tracking-[0.2em] mt-0.5">BY ZOMATO</div>
            </div>
          </div>

          {/* Right Side - Customers */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-20">
            {customers.map((customer, idx) => (
              <div key={customer.name} className="flex items-center gap-6 flex-row-reverse">
                <div className="flex gap-3">
                  {customer.brands.map((brand) => (
                    <div 
                      key={brand.id} 
                      className={`w-16 h-16 rounded-full ${brand.bg} shadow-xl flex items-center justify-center text-2xl border-2 border-white transition-all duration-500 hover:scale-110 ${
                        visibleBrands.has(brand.id) ? 'opacity-100 scale-100 ring-2 ring-amber-300' : 'opacity-40 scale-90'
                      }`}
                    >
                      {brand.img}
                    </div>
                  ))}
                </div>
                <div className="px-6 py-2 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-bold text-xs shadow-2xl border border-gray-700 backdrop-blur-sm min-w-[150px] text-center relative z-20">
                  {customer.name}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Animated Roads */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="roadGradientIn" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.15 }} />
                <stop offset="50%" style={{ stopColor: '#dc2626', stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.15 }} />
              </linearGradient>
              <linearGradient id="roadGradientOut" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 0.15 }} />
                <stop offset="50%" style={{ stopColor: '#d97706', stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.15 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {[0, 1, 2].map(i => {
              const yOffset = (i - 1) * 160;
              const startX = 330;
              const endX = 970;
              return (
                <g key={i}>
                  <path
                    d={`M ${startX} ${250 + yOffset} Q ${startX + 150} ${250 + yOffset * 0.5} ${startX + 300} 250`}
                    fill="none"
                    stroke="url(#roadGradientIn)"
                    strokeWidth="2"
                    strokeDasharray="20 12"
                    filter="url(#glow)"
                    style={{ animation: 'dash 2s linear infinite' }}
                  />
                  <path
                    d={`M ${endX - 300} 250 Q ${endX - 150} ${250 + yOffset * 0.5} ${endX} ${250 + yOffset}`}
                    fill="none"
                    stroke="url(#roadGradientOut)"
                    strokeWidth="2"
                    strokeDasharray="20 12"
                    filter="url(#glow)"
                    style={{ animation: 'dash 2s linear infinite' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Animated Brands */}
          {particles.map(particle => {
            const sellerY = (particle.sellerIdx - 1) * 200;
            const customerY = (particle.customerIdx - 1) * 200;
            
            let x, y, size, currentBrand, rotation;
            
            if (particle.progress < 0.5) {
              const phase = particle.progress * 2;
              x = 250 + (350 * phase);
              y = 250 + sellerY * (1 - phase);
              size = 70 - (35 * phase);
              rotation = phase * 180;
              currentBrand = particle.brand;
            } else {
              const phase = (particle.progress - 0.5) * 2;
              x = 700 + (350 * phase);
              y = 250 + customerY * phase;
              size = 35 + (35 * phase);
              rotation = 180 + (phase * 180);
              currentBrand = particle.outBrand;
            }
            
            return (
              <div
                key={particle.id}
                className={`absolute rounded-full ${currentBrand.bg} shadow-2xl flex items-center justify-center border-3 border-white transition-transform duration-300`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${size}px`,
                  height: `${size}px`,
                  fontSize: `${size * 0.45}px`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${1 + Math.sin(particle.progress * Math.PI * 4) * 0.1})`,
                  zIndex: 10,
                  boxShadow: `0 0 ${size * 0.3}px rgba(0,0,0,0.2)`
                }}
              >
                {currentBrand.img}
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {/* White background for cards */}
      <div className="bg-white py-16 px-6">
        <div className="flex justify-center items-center relative max-w-5xl mx-auto">
          {/* Sellers Card */}
          <div className="w-[440px] bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-[32px] shadow-2xl p-10 pt-14 border border-gray-200 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 relative z-0 group">
            <div className="absolute -top-3 left-12">
              <div className="bg-black text-white text-xs font-bold tracking-[0.15em] px-6 py-2 rounded-full shadow-lg">
                FOR SELLERS
              </div>
            </div>
            <h2 className="text-[32px] font-bold mt-2 mb-3 leading-tight text-gray-900">Sell to restaurants<br/>now</h2>
            <p className="text-lg text-gray-600 mb-8 font-medium">Join 600+ sellers now</p>
            <button onClick={() => router.push('/register-seller')} className="bg-black text-white text-base px-6 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-gray-800 hover:gap-3 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
              Register as a seller
              <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Customers Card */}
          <div className="w-[440px] -ml-16 bg-gradient-to-br from-[#C85A57] via-[#B84E4B] to-[#A84440] text-white rounded-[32px] shadow-2xl p-10 pt-14 border border-red-900/20 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 relative z-10 group">
            <div className="absolute -top-3 left-12">
              <div className="bg-black text-white text-xs font-bold tracking-[0.15em] px-5 py-2 rounded-full shadow-lg">
                FOR CUSTOMERS
              </div>
            </div>
            <h2 className="text-[32px] font-bold mt-2 mb-3 leading-tight">Smarter sourcing,<br/>better serving</h2>
            <p className="text-lg text-white/80 mb-8 font-medium">Trusted by 1 lakh+ restaurants</p>
            <button className="bg-white text-black text-base px-6 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-gray-50 hover:gap-3 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
              Signup now
              <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
