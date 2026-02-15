"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "../context/CartContext";
import LogoutModal from "./LogoutModal";
import LoginModal from "./LoginModal";
import LiveNotifications from "./LiveNotifications";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { login, logout } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";
import { clearCheckout } from "../store/checkoutSlice";
import { setSelectedLocation, setAvailableLocations, setShowLocationModal, dismissLocationModal } from "../store/locationSlice";
import { setShowMenu, setShowLoginModal, setShowLogoutModal, setSearchQuery } from "../store/uiSlice";

interface HeaderProps {
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
}

export default function Header({ onLoginClick, isLoggedIn: isLoggedInProp }: HeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session, status: sessionStatus } = useSession();
  const isCatalogue = !!pathname && pathname.startsWith("/catalogue");
  const { totalItems, cartAnimation } = useCart();
  const { isLoggedIn, userId, userPhone, userName } = useAppSelector((state) => state.auth);
  const { selectedLocation, availableLocations, showLocationModal, locationModalDismissed } = useAppSelector((state) => state.location);
  const { showMenu, showLoginModal, showLogoutModal, searchQuery } = useAppSelector((state) => state.ui);
  const [isMounted, setIsMounted] = React.useState(false);
  const [locationSearch, setLocationSearch] = React.useState("");
  const [cartPulse, setCartPulse] = React.useState(false);
  const [storedLoggedIn, setStoredLoggedIn] = React.useState(false);
  const [showAccountStatementModal, setShowAccountStatementModal] = React.useState(false);
  const [statementPeriod, setStatementPeriod] = React.useState("Last month");
  const [statementStartDate, setStatementStartDate] = React.useState("2026-01-01");
  const [statementEndDate, setStatementEndDate] = React.useState("2026-01-31");
  const [statementLoading, setStatementLoading] = React.useState(false);
  const [vegMode, setVegMode] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const didInitCartPulseRef = React.useRef(false);
  const cartPulseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const clearClientPreferences = () => {
    if (typeof window === 'undefined') return;
    const keys = [
      'selectedSlotId',
      'selectedSlot',
      'needInvoice',
      'appliedCoupon',
      'useWallet',
      'payOnDelivery',
      'selectedLocation',
      'locationModalDismissed',
      'searchQuery',
      'selectedReceiver',
      'deliveryAddress',
      'savedContacts'
    ];
    keys.forEach((key) => localStorage.removeItem(key));
  };

  React.useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const storedLocation = localStorage.getItem('selectedLocation');
      if (storedLocation) {
        try {
          const parsed = JSON.parse(storedLocation);
          if (parsed?._id) {
            dispatch(setSelectedLocation(parsed));
          }
        } catch {}
      }
      const storedDismissed = localStorage.getItem('locationModalDismissed');
      if (storedDismissed === 'true') {
        dispatch(dismissLocationModal());
      }
      const storedSearch = localStorage.getItem('searchQuery');
      if (storedSearch) {
        dispatch(setSearchQuery(storedSearch));
      }
      const storedVegMode = localStorage.getItem('vegMode');
      if (storedVegMode === 'true') {
        setVegMode(true);
      }
      setStoredLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
    fetchLocations();
  }, [dispatch]);

  React.useEffect(() => {
    if (!isMounted) return;
    if (isLoggedIn && !selectedLocation && !locationModalDismissed && availableLocations.length > 0) {
      const timeout = setTimeout(() => dispatch(setShowLocationModal(true)), 500);
      return () => clearTimeout(timeout);
    }
  }, [isMounted, isLoggedIn, selectedLocation, locationModalDismissed, availableLocations.length, dispatch]);

  React.useEffect(() => {
    if (!didInitCartPulseRef.current) {
      didInitCartPulseRef.current = true;
      return;
    }
    setCartPulse(true);
    if (cartPulseTimeoutRef.current) {
      clearTimeout(cartPulseTimeoutRef.current);
    }
    cartPulseTimeoutRef.current = setTimeout(() => {
      setCartPulse(false);
      cartPulseTimeoutRef.current = null;
    }, 600);
    return () => {
      if (cartPulseTimeoutRef.current) {
        clearTimeout(cartPulseTimeoutRef.current);
      }
    };
  }, [totalItems]);

  const handleLoginClick = () => {
    dispatch(setShowLoginModal(true));
  };

  // Sync NextAuth session with Redux
  React.useEffect(() => {
    if (session?.user && isMounted) {
      dispatch(login({ 
        userId: session.user.email || '',
        userPhone: session.user.email || '', 
        userName: session.user.name || 'User' 
      }));
    }
  }, [session, isMounted, dispatch]);

  const derivedLoggedIn = isMounted ? (isLoggedIn || !!session || storedLoggedIn) : false;
  const actualIsLoggedIn = isLoggedInProp !== undefined ? (isLoggedInProp || derivedLoggedIn) : derivedLoggedIn;
  const authResolved = isMounted && sessionStatus !== "loading";

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        dispatch(setAvailableLocations(Array.isArray(data) ? data : []));
      } else {
        console.error('Failed to fetch locations:', res.status);
        dispatch(setAvailableLocations([]));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      dispatch(setAvailableLocations([]));
    }
  };

  const handleLocationSelect = (location: any) => {
    dispatch(setSelectedLocation(location));
    dispatch(setShowLocationModal(false));
    setLocationSearch("");
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLocation', JSON.stringify(location));
      localStorage.setItem('locationModalDismissed', 'false');
    }
  };

  const handleAllLocations = () => {
    const allLoc = { _id: 'all', name: 'All Locations', city: 'Nationwide', isGlobal: true };
    dispatch(setSelectedLocation(allLoc));
    dispatch(setShowLocationModal(false));
    setLocationSearch("");
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLocation', JSON.stringify(allLoc));
      localStorage.setItem('locationModalDismissed', 'false');
    }
  };

  const filteredLocations = availableLocations.filter(loc => 
    loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
    loc.city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
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

  const handleStatementDownload = async () => {
    setStatementLoading(true);
    try {
      const res = await fetch('/api/account-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          period: statementPeriod,
          startDate: statementStartDate,
          endDate: statementEndDate
        })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement-${statementStartDate}-${statementEndDate}.csv`;
        a.click();
        setShowAccountStatementModal(false);
      }
    } catch (error) {
      alert('Failed to download statement');
    }
    setStatementLoading(false);
  };

  const handleStatementEmail = async () => {
    setStatementLoading(true);
    try {
      const res = await fetch('/api/account-statement/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          period: statementPeriod,
          startDate: statementStartDate,
          endDate: statementEndDate
        })
      });
      
      if (res.ok) {
        alert('Statement sent to your email!');
        setShowAccountStatementModal(false);
      }
    } catch (error) {
      alert('Failed to send email');
    }
    setStatementLoading(false);
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
            <button onClick={onLoginClick} className="bg-rose-500 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-rose-600 font-semibold text-sm md:text-base">
              Login
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-3 md:gap-6">
          <a href="/" className="cursor-pointer flex-shrink-0">
            <div className="text-lg md:text-2xl font-bold text-black">hyperpure</div>
            <div className="text-[10px] md:text-xs text-gray-500 tracking-wide">BY ZOMATO</div>
          </a>
          {authResolved && !actualIsLoggedIn && !isCatalogue && (
            <div className="relative">
              <button onClick={() => dispatch(setShowLocationModal(true))} className="text-xs md:text-sm text-gray-600 hover:bg-gray-50 px-2 md:px-3 py-2 rounded-lg transition-colors">
                <div className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                  {selectedLocation?.isGlobal ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                      <span>Nationwide</span>
                    </>
                  ) : (
                    <span>Delivery in</span>
                  )}
                </div>
                <div className="font-semibold text-black text-xs md:text-sm flex items-center gap-1">
                  {selectedLocation ? selectedLocation.name : 'Select Location'}
                  <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              {!selectedLocation && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-xs md:text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-50">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-900 rotate-45"></div>
                  Share your location to see accurate prices
                </div>
              )}
            </div>
          )}
          {authResolved && actualIsLoggedIn && (
            <div className="hidden lg:flex items-center gap-3 text-sm border-l border-gray-200 pl-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                </svg>
                <span className="font-semibold text-gray-900">Delivery tomorrow</span>
              </div>
              <button onClick={() => dispatch(setShowLocationModal(true))} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <span className="font-medium">Guest Outlet:</span>
                <span className="text-gray-900">{selectedLocation ? selectedLocation.name : 'Select location'}</span>
              </button>
            </div>
          )}
        </div>

        {authResolved && actualIsLoggedIn ? (
          <>
            <div className="flex-1 max-w-2xl hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    dispatch(setSearchQuery(e.target.value));
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('searchQuery', e.target.value);
                    }
                  }}
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
                  value={searchQuery}
                  onChange={(e) => {
                    dispatch(setSearchQuery(e.target.value));
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('searchQuery', e.target.value);
                    }
                  }}
                  className="w-full bg-gray-50 rounded-lg px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-red-100 border border-gray-200"
                  placeholder="Search"
                />
                <svg className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
              <button onClick={() => router.push('/cart')} className="relative text-gray-700 hover:text-gray-900 hidden md:block group">
                <svg className={`w-7 h-7 transition-transform ${cartPulse ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg ${cartPulse ? 'animate-ping' : ''}`}>
                    <span className="absolute">{totalItems}</span>
                  </span>
                )}
              </button>
              <button onClick={() => router.push('/wishlist')} className="text-gray-700 hover:text-gray-900 hidden md:block">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button onClick={() => dispatch(setShowMenu(!showMenu))} className="text-gray-700 hover:text-gray-900 relative">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 bg-black/30 z-40" onClick={() => dispatch(setShowMenu(false))}></div>
                  <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
                    <div className="p-6">
                      <button onClick={() => dispatch(setShowMenu(false))} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                      
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {session?.user?.image ? (
                            <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" />
                          ) : (
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{session?.user?.name || userName || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{session?.user?.email || 'Guest Account'}</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-red-500 rounded"></div>
                          <h3 className="font-bold text-gray-900">Orders & statements</h3>
                        </div>
                        <button onClick={() => { router.push('/buyer/orders'); dispatch(setShowMenu(false)); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
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
                        <button onClick={() => { 
                          setShowAccountStatementModal(true);
                        }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
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
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-red-500 rounded"></div>
                          <h3 className="font-bold text-gray-900">Wallet & payment</h3>
                        </div>
                        <button onClick={() => { router.push('/loyalty'); dispatch(setShowMenu(false)); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
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
                        <button onClick={() => { router.push('/profile'); setShowMenu(false); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
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
                            <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
                              <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                            </div>
                            <span>Veg mode</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={vegMode}
                              onChange={(e) => {
                                setVegMode(e.target.checked);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('vegMode', e.target.checked.toString());
                                }
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </button>
                        <button onClick={() => { setShowNotifications(true); dispatch(setShowMenu(false)); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span>Notifications</span>
                          </div>
                          <LiveNotifications userType="customer" userId={((session?.user as any)?.id && /^[a-fA-F0-9]{24}$/.test((session?.user as any)?.id) ? (session?.user as any)?.id : session?.user?.email) || userPhone || ''} trigger="chevron" buttonClassName="!p-0" />
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
                        <button onClick={() => { router.push('/request-product'); dispatch(setShowMenu(false)); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
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
                        <button onClick={() => { 
                          dispatch(setShowMenu(false)); 
                          router.push('/faq');
                        }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg text-sm">
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

                      <button onClick={() => { dispatch(setShowMenu(false)); dispatch(setShowLogoutModal(true)); }} className="w-full mt-6 px-4 py-3 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100">
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
                  value={searchQuery}
                  onChange={(e) => {
                    dispatch(setSearchQuery(e.target.value));
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('searchQuery', e.target.value);
                    }
                  }}
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

        {authResolved && !actualIsLoggedIn && (
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handleLoginClick}
              className="bg-rose-500 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-rose-600 font-semibold shadow-sm text-sm md:text-base"
            >
              Login/Signup
            </button>
          </div>
        )}
        {!authResolved && (
          <div className="h-9 w-28 rounded-full bg-gray-200 animate-pulse" />
        )}
      </nav>

      {showNotifications && (
        <div className="fixed inset-0 bg-black/30 z-[60] flex">
          <div className="ml-auto w-full sm:w-96 bg-white shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 text-3xl">×</button>
            </div>
            <LiveNotifications userType="customer" userId={((session?.user as any)?.id && /^[a-fA-F0-9]{24}$/.test((session?.user as any)?.id) ? (session?.user as any)?.id : session?.user?.email) || userPhone || ''} trigger="bell" buttonClassName="hidden" />
          </div>
        </div>
      )}

      {showAccountStatementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Choose accounting period</h2>
              <button onClick={() => setShowAccountStatementModal(false)} className="text-gray-400 hover:text-gray-600 text-3xl">×</button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {["Custom", "Last month", "Current month", "Last quarter", "Current quarter"].map((p) => (
                <button
                  key={p}
                  onClick={() => setStatementPeriod(p)}
                  className={`px-6 py-2 rounded-full font-medium transition ${
                    statementPeriod === p
                      ? 'bg-red-100 text-red-600 border-2 border-red-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Select Date</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Start Date</label>
                  <input
                    type="date"
                    value={statementStartDate}
                    onChange={(e) => setStatementStartDate(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">End Date</label>
                  <input
                    type="date"
                    value={statementEndDate}
                    onChange={(e) => setStatementEndDate(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>NOTE:</strong>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                1. Account statement includes details of all your transactions on hyperpure
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStatementEmail}
                disabled={statementLoading}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {statementLoading ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={handleStatementDownload}
                disabled={statementLoading}
                className="flex-1 border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50"
              >
                {statementLoading ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => {
          dispatch(dismissLocationModal());
          if (typeof window !== 'undefined') {
            localStorage.setItem('locationModalDismissed', 'true');
          }
        }}>
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl animate-slideUp relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => {
              dispatch(dismissLocationModal());
              if (typeof window !== 'undefined') {
                localStorage.setItem('locationModalDismissed', 'true');
              }
            }} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center">
                <div className="relative">
                  <div className="text-5xl">🏪</div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">Select your location</h2>
            <p className="text-center text-gray-500 mb-6">for accurate prices & availability</p>
            
            <button
              onClick={handleAllLocations}
              className="w-full mb-4 p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 group-hover:text-blue-600">All Locations</div>
                    <div className="text-sm text-gray-500">Browse products from everywhere</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <div className="relative mb-4">
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search city name"
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl outline-none focus:border-red-400 transition-colors"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto mb-4 custom-scrollbar">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <button
                    key={loc._id}
                    onClick={() => handleLocationSelect(loc)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all group hover:border-red-400 hover:bg-red-50 ${
                      selectedLocation?._id === loc._id ? 'border-red-500 bg-red-50' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-red-600">{loc.name}</div>
                        <div className="text-sm text-gray-500">{loc.city}, {loc.state} - {loc.pincode}</div>
                      </div>
                      <svg className="w-5 h-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>No locations found</p>
                </div>
              )}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Use current location
            </button>
          </div>
        </div>
      )}
      <LogoutModal open={showLogoutModal} onClose={() => dispatch(setShowLogoutModal(false))} onLogout={() => {
        dispatch(logout());
        clearClientPreferences();
        window.location.href = '/';
      }} onLogoutAll={async () => {
        dispatch(logout());
        dispatch(clearCart());
        dispatch(clearCheckout());
        clearClientPreferences();
        window.location.href = '/';
      }} />
      <LoginModal open={showLoginModal} onClose={() => dispatch(setShowLoginModal(false))} onSuccess={() => {
        dispatch(setShowLoginModal(false));
        window.location.reload();
      }} />
    </header>
  );
}
