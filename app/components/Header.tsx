"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import LogoutModal from "./LogoutModal";

interface HeaderProps {
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
}

export default function Header({ onLoginClick, isLoggedIn = false }: HeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const isCatalogue = !!pathname && pathname.startsWith("/catalogue");
  const { totalItems } = useCart();
  const [showMenu, setShowMenu] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  const [query, setQuery] = React.useState("");
  const [locations, setLocations] = React.useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    fetchLocations();
    const saved = localStorage.getItem('selectedLocation');
    if (saved) {
      setSelectedLocation(JSON.parse(saved));
    }
  }, []);

  const fetchLocations = async () => {
    const res = await fetch('/api/locations');
    const data = await res.json();
    setLocations(data);
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    localStorage.setItem('selectedLocation', JSON.stringify(location));
    setShowLocationModal(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(`/catalogue?search=${encodeURIComponent(trimmed)}`);
  };

  const handleQualityClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('quality-section');
    if (element) {
      const offset = 150;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const handleSustainabilityClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('sustainability-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simplified header for register-seller route
  if (pathname === '/register-seller') {
    return (
      <header className="fixed top-0 w-full bg-white shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <a href="/" className="cursor-pointer">
            <div className="text-lg md:text-2xl font-bold text-black">hyperpure</div>
            <div className="text-[10px] md:text-xs text-gray-500 tracking-wide">BY ZOMATO</div>
          </a>
          <div>
            <button onClick={() => (onLoginClick ? onLoginClick() : router.push('/'))} className="bg-rose-500 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-rose-600 font-semibold text-sm md:text-base">
              Login
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-3 md:gap-6">
          <a href="/" className="cursor-pointer flex-shrink-0">
            <div className="text-lg md:text-2xl font-bold text-black">hyperpure</div>
            <div className="text-[10px] md:text-xs text-gray-500 tracking-wide">BY ZOMATO</div>
          </a>
          {isMounted && isLoggedIn && (
            <div className="hidden lg:flex items-center gap-3 text-sm border-l border-gray-200 pl-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                </svg>
                <span className="font-semibold text-gray-900">Delivery tomorrow</span>
              </div>
              <button onClick={() => setShowLocationModal(true)} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <span className="font-medium">Guest Outlet:</span>
                <span className="text-gray-900">{selectedLocation ? selectedLocation.name : 'Select location'}</span>
              </button>
            </div>
          )}
        </div>

        {isMounted && isLoggedIn ? (
          <>
            <div className="flex-1 max-w-2xl hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-gray-50 rounded-lg px-12 py-3 text-sm outline-none focus:ring-2 focus:ring-red-100 border border-gray-200"
                  placeholder="Search 'Coloured capsicum'"
                />
                <svg className="w-5 h-5 text-red-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </div>
            
            {/* Mobile Search */}
            <div className="flex-1 md:hidden">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-gray-50 rounded-lg px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-red-100 border border-gray-200"
                  placeholder="Search"
                />
                <svg className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
              <button onClick={() => router.push('/cart')} className="relative text-gray-700 hover:text-gray-900 hidden md:block">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => router.push('/wishlist')} className="text-gray-700 hover:text-gray-900 hidden md:block">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button onClick={() => setShowMenu(!showMenu)} className="text-gray-700 hover:text-gray-900 relative">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowMenu(false)}></div>
                  <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
                    <div className="p-6">
                      <button onClick={() => setShowMenu(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                      
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-lg">Guest Outlet</div>
                          <div className="text-sm text-gray-500">Guest Account</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-red-500 rounded"></div>
                          <h3 className="font-bold text-gray-900">Orders & statements</h3>
                        </div>
                        <button onClick={() => { router.push('/profile'); setShowMenu(false); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Your orders</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button onClick={() => { router.push('/register-business'); setShowMenu(false); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Account statement</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Need help</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-red-500 rounded"></div>
                          <h3 className="font-bold text-gray-900">Wallet & payment</h3>
                        </div>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Hyperpure wallet</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-teal-500 text-white px-2 py-1 rounded-full font-medium">₹0</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-red-500 rounded"></div>
                          <h3 className="font-bold text-gray-900">Others</h3>
                        </div>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile settings</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>Register as business</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">NEW</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
                              <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                            </div>
                            <span>Veg mode</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span>Notifications</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button onClick={() => { router.push('/wishlist'); setShowMenu(false); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>My list</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            <span>Claim coupon</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Request new product</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Contact us</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      <button onClick={() => setShowLogoutModal(true)} className="w-full mt-6 px-4 py-3 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100">
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (isMounted && isCatalogue) ? (
            <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 shadow-sm">
                <button type="submit" aria-label="Search" className="flex items-center justify-center w-9 h-9 text-rose-500 bg-rose-100 rounded-full mr-3 hover:bg-rose-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 18a7 7 0 100-14 7 7 0 000 14z" />
                  </svg>
                </button>
                <input
                  aria-label="Search catalogue"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none px-1 text-sm"
                  placeholder="Search for products, brands or categories"
                />
              </div>
            </form>
          ) : (
          <div className="flex-1 flex items-center justify-center">
            <ul className="hidden md:flex items-center gap-8 text-gray-700 text-sm font-medium">
              <li>
                <a href="/catalogue" className="flex items-center gap-2 hover:text-rose-600">
                  <span>Browse catalogue</span>
                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">NEW</span>
                </a>
              </li>
              <li>
                <a href="#quality" onClick={handleQualityClick} className="hover:text-rose-600">Quality</a>
              </li>
              <li>
                <a href="#sustainability" onClick={handleSustainabilityClick} className="hover:text-rose-600">Sustainability</a>
              </li>
              <li>
                <a href="/blog" className="hover:text-rose-600">Blogs</a>
              </li>
            </ul>
          </div>
        )}

        {isMounted && !isLoggedIn && (
          <div className="flex items-center gap-2 md:gap-4">
            {!isCatalogue && (
              <button 
                onClick={() => setShowLocationModal(true)}
                className="hidden sm:block text-xs md:text-sm text-gray-600 hover:bg-gray-50 px-2 md:px-3 py-2 rounded-lg transition-colors">
                <div className="text-[10px] md:text-xs text-gray-500">Delivery in</div>
                <div className="font-semibold text-black text-xs md:text-sm">{selectedLocation ? selectedLocation.name : 'Select Location'} <span className="text-gray-400">▾</span></div>
              </button>
            )}
            <button
              onClick={onLoginClick}
              className="bg-rose-500 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-rose-600 font-semibold shadow-sm text-sm md:text-base"
            >
              Login/Signup
            </button>
          </div>
        )}
      </nav>

      {showLocationModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowLocationModal(false)}>
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg md:text-xl font-bold mb-4">Select Delivery Location</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {locations.map((loc) => (
                <button
                  key={loc._id}
                  onClick={() => handleLocationSelect(loc)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedLocation?._id === loc._id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="font-semibold">{loc.name}</div>
                  <div className="text-sm text-gray-600">{loc.city}, {loc.state} - {loc.pincode}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <LogoutModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onLogout={() => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userPhone');
        window.location.href = '/';
      }} onLogoutAll={async () => {
        localStorage.clear();
        window.location.href = '/';
      }} />
    </header>
  );
}
