"use client";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ScrollSection from "./components/ScrollSection";
import QualitySection from "./components/QualitySection";
import NetworkSection from "./components/NetworkSection";
import Categories from "./components/Categories";
import ProductShowcase from "./components/ProductShowcase";
import DeliveryModels from "./components/DeliveryModels";
import Sustainability from "./components/Sustainability";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);
  
  
  const [categories, setCategories] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const slides = [
    {
      title: "Makar Sankranti made easy",
      subtitle: "til, ghee & festive must-haves at great prices",
      image1: "https://images.unsplash.com/photo-1599785209796-786432b228bc?w=200",
      image2: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150"
    },
    {
      title: "Fresh Vegetables Daily",
      subtitle: "Farm-fresh produce delivered to your doorstep",
      image1: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200",
      image2: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=150"
    },
    {
      title: "Premium Quality Spices",
      subtitle: "Authentic flavors for your kitchen",
      image1: "https://images.unsplash.com/photo-1596040033229-a0b3b7e8c5e0?w=200",
      image2: "https://images.unsplash.com/photo-1599909533730-f9d7e5d4d3b5?w=150"
    }
  ];

  useEffect(() => {
    setIsLoading(false);
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    if (showOtpScreen && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [showOtpScreen, timer]);

  const sendOTP = async () => {
    if (phoneNumber.length !== 10) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (data.success) {
        setShowOtpScreen(true);
        setTimer(30);
      }
    } catch (error) {
      alert('Failed to send OTP');
    }
    setLoading(false);
  };

  const resendOTP = async () => {
    if (timer > 0) return;
    await sendOTP();
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: otpCode })
      });
      const data = await res.json();
      if (data.success) {
        setShowOtpScreen(false);
        setShowLoginModal(false);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userPhone', phoneNumber);
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      alert('Verification failed');
    }
    setLoading(false);
  };

  return (
    <div>
      {!isLoading && <Header onLoginClick={() => setShowLoginModal(true)} isLoggedIn={isLoggedIn} />}
      
      {isLoading ? (
        <div className="min-h-screen bg-white">
          <div className="h-20 bg-gray-100 animate-pulse"></div>
          <div className="max-w-7xl mx-auto px-6 pt-28">
            <div className="h-40 bg-gray-200 rounded-3xl animate-pulse mb-12"></div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-10"></div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-6">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl p-4 animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isLoggedIn ? (
        <main className="pt-20 pb-20 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {/* Hero Banner */}
            <div className="mt-4 md:mt-8 mb-8 md:mb-12 relative rounded-2xl md:rounded-3xl overflow-hidden" style={{background: 'linear-gradient(90deg, #FDB44B 0%, #FECA8D 50%, #FED7A8 100%)'}}>
              <button onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 z-10">
                <span className="text-gray-700 text-2xl md:text-3xl font-light">‹</span>
              </button>
              <button onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 z-10">
                <span className="text-gray-700 text-2xl md:text-3xl font-light">›</span>
              </button>
              
              <div className="px-4 md:px-20 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
                <div className="flex items-center gap-3 md:gap-10 w-full md:w-auto">
                  <img src={slides[currentSlide].image1} alt="Festival" className="w-16 h-16 md:w-32 md:h-32 object-cover rounded-full shadow-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-lg md:text-4xl font-bold mb-1 md:mb-2 text-gray-900 line-clamp-2">{slides[currentSlide].title}</h2>
                    <p className="text-xs md:text-lg text-gray-800 line-clamp-1">{slides[currentSlide].subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-center">
                  <img src={slides[currentSlide].image2} alt="Decoration" className="w-16 h-16 md:w-28 md:h-28 object-contain" />
                  <button className="bg-black text-white px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base hover:bg-gray-800 transition-colors shadow-xl">
                    Shop here →
                  </button>
                </div>
              </div>
            </div>

            {/* Shop by category */}
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10 text-gray-900">Shop by category</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 md:gap-6">
                {categories.map((cat) => (
                  <a
                    key={cat._id}
                    href={`/catalogue?category=${encodeURIComponent(cat.name)}`}
                    className="bg-gray-50 rounded-2xl md:rounded-3xl pt-0 px-2 md:px-4 pb-3 md:pb-4 transition-all text-center group border border-gray-100 cursor-pointer"
                  >
                    <div className="mb-2 md:mb-4 flex justify-center group-hover:scale-110 transition-transform">
                      {cat.icon && (cat.icon.includes('http') || cat.icon.includes('cloudinary')) ? (
                        <img src={cat.icon} alt={cat.name} className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-xl md:rounded-2xl" />
                      ) : (
                        <div className="text-4xl md:text-6xl">{cat.icon}</div>
                      )}
                    </div>
                    <h3 className="text-xs md:text-base font-bold text-gray-900 leading-tight line-clamp-2">{cat.name}</h3>
                  </a>
                ))}
              </div>
            </div>

            {/* Trusted brands */}
            <div className="mt-8 md:mt-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10 text-gray-900">Trusted brands</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col items-center">
                  <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 mb-2 md:mb-3 w-16 h-16 md:w-22 md:h-22 flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Wingreens_Farms_logo.png/220px-Wingreens_Farms_logo.png" alt="Wingreens" className="w-full h-full object-contain" />
                  </div>
                  <img src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300" alt="Products" className="w-full h-16 md:h-28 object-contain" />
                </div>
                <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col items-center">
                  <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 mb-2 md:mb-3 w-16 h-16 md:w-22 md:h-22 flex items-center justify-center">
                    <span className="text-xs md:text-xl font-bold text-orange-600">MARIM BULA</span>
                  </div>
                  <img src="https://images.unsplash.com/photo-1596040033229-a0b3b7e8c5e0?w=300" alt="Products" className="w-full h-16 md:h-28 object-contain" />
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col items-center">
                  <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 mb-2 md:mb-3 w-16 h-16 md:w-22 md:h-22 flex items-center justify-center">
                    <span className="text-xs md:text-xl font-bold text-red-600">kissan</span>
                  </div>
                  <img src="https://images.unsplash.com/photo-1546548970-71785318a17b?w=300" alt="Products" className="w-full h-16 md:h-28 object-contain" />
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col items-center">
                  <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 mb-2 md:mb-3 w-16 h-16 md:w-22 md:h-22 flex items-center justify-center">
                    <span className="text-xs md:text-xl font-bold text-red-700">EVEREST</span>
                  </div>
                  <img src="https://images.unsplash.com/photo-1599909533730-f9d7e5d4d3b5?w=300" alt="Products" className="w-full h-16 md:h-28 object-contain" />
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col items-center">
                  <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 mb-2 md:mb-3 w-16 h-16 md:w-22 md:h-22 flex items-center justify-center">
                    <span className="text-xs md:text-xl font-bold">dhampure</span>
                  </div>
                  <img src="https://images.unsplash.com/photo-1587241321921-91a834d82ffc?w=300" alt="Products" className="w-full h-16 md:h-28 object-contain" />
                </div>
                <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col items-center">
                  <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 mb-2 md:mb-3 w-16 h-16 md:w-22 md:h-22 flex items-center justify-center">
                    <span className="text-xs md:text-xl font-bold text-blue-600">Amul</span>
                  </div>
                  <img src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300" alt="Products" className="w-full h-16 md:h-28 object-contain" />
                </div>
              </div>
            </div>

            {/* Stories from partners */}
            <div className="mt-8 md:mt-16">
              <Testimonials />
            </div>

            <ProductShowcase showAll={true} />
          </div>
        </main>
      ) : (
        <>
          <ScrollSection />
          <QualitySection />
          <NetworkSection />
          <Categories />
          <ProductShowcase />
          <DeliveryModels />
          <Sustainability />
          <Testimonials />
          <FAQ />
        </>
      )}
      {isLoggedIn && <BottomNav />}
      <Footer />

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center">
                <div className="w-20 h-28 border-4 border-gray-800 rounded-2xl flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-lg font-bold text-sm">+91</div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Enter mobile number</h2>
            <p className="text-gray-500 text-center mb-6">OTP will be sent to this number for verification</p>
            <div className="mb-6">
              <div className="flex items-center border-2 border-blue-400 rounded-xl px-4 py-3">
                <span className="text-2xl mr-3">🇮🇳</span>
                <span className="font-semibold mr-3">+91</span>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter mobile number" className="flex-1 outline-none text-lg" maxLength={10} />
              </div>
            </div>
            <button onClick={sendOTP} disabled={phoneNumber.length !== 10 || loading} className={`w-full py-4 rounded-xl font-bold text-lg ${phoneNumber.length === 10 && !loading ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-300 text-gray-500"}`}>
              {loading ? "Sending..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {showOtpScreen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => { setShowOtpScreen(false); setShowLoginModal(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center">
                <div className="w-20 h-28 border-4 border-gray-800 rounded-2xl flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-3 py-2 rounded-lg font-bold text-lg">* * *</div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Enter verification code</h2>
            <p className="text-gray-500 text-center mb-6">6 digit OTP has been sent to +91 {phoneNumber}</p>
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input 
                  key={index} 
                  type="text" 
                  maxLength={1} 
                  value={digit} 
                  onChange={(e) => { 
                    const newOtp = [...otp]; 
                    newOtp[index] = e.target.value; 
                    setOtp(newOtp); 
                    if (e.target.value && index < 5) { 
                      document.getElementById(`otp-${index + 1}`)?.focus(); 
                    } 
                  }} 
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6);
                    const newOtp = [...otp];
                    pastedData.split('').forEach((char, i) => {
                      if (i < 6) newOtp[i] = char;
                    });
                    setOtp(newOtp);
                  }}
                  id={`otp-${index}`} 
                  className="w-14 h-14 border-2 border-gray-300 rounded-xl text-center text-xl font-bold focus:border-blue-500 outline-none" 
                />
              ))}
            </div>
            <div className="text-center mb-6">
              <p className="text-lg font-bold mb-1">00:{timer.toString().padStart(2, '0')}</p>
              <p className="text-gray-600">Didn't receive the code? <button onClick={resendOTP} disabled={timer > 0} className={`font-semibold ${timer > 0 ? 'text-gray-400' : 'text-red-500 hover:text-red-600'}`}>{timer > 0 ? 'Resend now' : 'Resend now'}</button></p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 border-2 border-red-500 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50">Login with password</button>
              <button onClick={verifyOTP} disabled={!otp.every(d => d !== "") || loading} className={`flex-1 py-3 rounded-xl font-bold ${otp.every(d => d !== "") && !loading ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-300 text-gray-500"}`}>
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
