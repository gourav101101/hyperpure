"use client";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterSeller() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState("");
  const [heroImgError, setHeroImgError] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    businessType: 'manufacturer',
    brandNames: '',
    category: '',
    cities: '',
    horecaClients: '',
    catalogue: null as File | null
  });

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/seller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setShowRegister(false);
        setFormData({
          name: '', businessName: '', phone: '', email: '', businessType: 'manufacturer',
          brandNames: '', category: '', cities: '', horecaClients: '', catalogue: null
        });
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Registration failed. Please try again.', 'error');
    }
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    const duration = message.length > 50 ? 7000 : type === 'error' ? 5000 : 3000;
    setTimeout(() => setToast(null), duration);
  };

  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/seller/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, role: 'seller' })
      });
      const data = await res.json();
      if (data.success) {
        setTimer(30);
        setDevOtp(data.otp || ""); // Store OTP for development
        const countdown = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        showToast('OTP sent to your mobile number', 'success');
      } else if (data.needsRegistration) {
        setShowLogin(false);
        showToast('Please complete seller registration first', 'error');
        setTimeout(() => setShowRegister(true), 1000);
      } else {
        showToast(data.error || 'Failed to send OTP', 'error');
      }
    } catch (e) {
      showToast('Network error. Please try again.', 'error');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showToast('Please enter complete 6-digit OTP', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/seller/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: otpCode, role: 'seller' })
      });
      const data = await res.json();
      console.log('Verify OTP response:', res.status, data);
      
      if (res.ok && data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userPhone', phoneNumber);
        localStorage.setItem('userRole', 'seller');
        localStorage.setItem('sellerId', data.seller.id);
        setShowLogin(false);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => router.push('/seller/dashboard'), 1000);
      } else {
        showToast(data.error || 'Verification failed. Please try again.', 'error');
      }
    } catch (e) {
      console.error('Verification error:', e);
      showToast('Verification failed. Please check your connection.', 'error');
    }
    setLoading(false);
  };

  function FAQList() {
    const faqs = [
      {
        q: 'How do I register as a seller?',
        a: 'Click "Register Now" and fill out the onboarding form. Our team will contact you for KYC and next steps.'
      },
      {
        q: 'What categories can I sell?',
        a: 'We support ingredients, FMCG items, packaged foods, and kitchen essentials. Contact us for special categories.'
      },
      {
        q: 'How do payouts work?',
        a: 'Payouts are processed on the settlement cycle visible in your seller dashboard. We offer multiple payout options.'
      },
      {
        q: 'Is logistics handled by Hyperpure?',
        a: 'We provide logistic partners and options; sellers can also use their own preferred logistics partners.'
      }
    ];
    const [open, setOpen] = useState<number | null>(null);
    return (
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 flex justify-between items-center">
              <span className="font-medium">{f.q}</span>
              <span className="text-gray-500">{open === i ? '−' : '+'}</span>
            </button>
            <div className={`${open === i ? 'max-h-96 p-6' : 'max-h-0 p-0'} transition-all duration-200 text-gray-600 text-sm`}>
              <div>{f.a}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={() => setShowLogin(true)} />

      <main className="pt-24">
        <section className="bg-gradient-to-r from-red-500 to-red-400 text-white rounded-b-3xl pb-20 pt-12">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Sell your products to<br/>lakhs of restaurants<br/>with Hyperpure</h1>
              <p className="mt-6 text-lg text-white/90">Reach thousands of restaurants across cities and grow your business with reliable supply and logistics.</p>
              <div className="mt-8 flex gap-4">
                <button onClick={() => setShowRegister(true)} className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90">Register Now</button>
                <button onClick={() => {console.log('Login clicked'); setShowLogin(true);}} className="inline-block bg-white text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">Seller Login</button>
              </div>
            </div>

                <div className="hidden md:block w-96 h-56">
              {!heroImgError ? (
                <img
                  src="/images/seller-hero.svg"
                  alt="seller-hero"
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => { setHeroImgError(true); }}
                />
              ) : (
                <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center">
                  <div className="text-6xl">📦</div>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">👥</div>
                <div>
                  <div className="text-lg font-bold">600+</div>
                  <div className="text-sm">Sellers</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🍽️</div>
                <div>
                  <div className="text-lg font-bold">9 Lakh+</div>
                  <div className="text-sm">Restaurants</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">📍</div>
                <div>
                  <div className="text-lg font-bold">Across 150+</div>
                  <div className="text-sm">Cities</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        

        {/* Partners and Why Sell section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">We've partnered with 600+ sellers</h2>
            <div className="flex items-center justify-center gap-10 mb-12 overflow-x-auto">
              {/* Example partner logos - replace src with real logos as needed */}
              {[
                '/logos/mccain.svg','/logos/goldencrown.svg','/logos/itc.svg','/logos/veeba.svg','/logos/everest.svg','/logos/amul.svg','/logos/monin.svg','/logos/barilla.svg','/logos/leekumkee.svg'
              ].map((src, i) => (
                <div key={i} className="w-36 h-12 flex items-center justify-center opacity-90">
                  <img
                    src={src}
                    alt={`partner-${i}`}
                    className="max-h-12 object-contain"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      t.src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22360%22 height=%22120%22><rect width=%22360%22 height=%22120%22 fill=%22%23f3f4f6%22/><text x=%22180%22 y=%2265%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23999%22>Logo</text></svg>';
                    }}
                  />
                </div>
              ))}
            </div>

            <h3 className="text-3xl md:text-4xl font-bold mb-8">Why sell on hyperpure?</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-6 text-3xl">🏬</div>
                <h4 className="text-xl font-bold mb-3">Reach the right buyers</h4>
                <p className="text-gray-500">Access lakhs of restaurants in 130+ cities seeking premium ingredients and kitchen essentials.</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-6 text-3xl">💸</div>
                <h4 className="text-xl font-bold mb-3">Fast & reliable payments</h4>
                <p className="text-gray-500">Timely payouts with multiple payment options. Transparent prices and payment cycles with clear reconciliation.</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-6 text-3xl">🚚</div>
                <h4 className="text-xl font-bold mb-3">Efficient logistics</h4>
                <p className="text-gray-500">Benefit from seamless deliveries and supply chain support to keep stock moving on time.</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-6 text-3xl">🤝</div>
                <h4 className="text-xl font-bold mb-3">A trusted platform</h4>
                <p className="text-gray-500">Sell on a marketplace preferred by top chefs and restaurateurs with transparent processes.</p>
              </div>
            </div>

            <div className="mt-12 max-w-4xl mx-auto px-6">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-6">Frequently asked questions</h3>
              <FAQList />
            </div>
          </div>
        </section>

        {showRegister && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowRegister(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl z-[10000] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Tell us about your brand</h2>
                <button onClick={() => setShowRegister(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              
              <form onSubmit={handleSubmitRegistration} className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Your details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your name *"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Business/Shop name *"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone number *"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email ID *"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent mt-4"
                    required
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Brand details</h3>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="businessType"
                        value="manufacturer"
                        checked={formData.businessType === 'manufacturer'}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="text-red-500"
                      />
                      <span>Manufacturer</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="businessType"
                        value="distributor"
                        checked={formData.businessType === 'distributor'}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="text-red-500"
                      />
                      <span>Distributor</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Enter brand name(s)"
                      value={formData.brandNames}
                      onChange={(e) => setFormData({...formData, brandNames: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select brand category</option>
                      <option value="ingredients">Ingredients</option>
                      <option value="packaged-foods">Packaged Foods</option>
                      <option value="beverages">Beverages</option>
                      <option value="dairy">Dairy Products</option>
                      <option value="spices">Spices & Seasonings</option>
                      <option value="kitchen-essentials">Kitchen Essentials</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <input
                      type="text"
                      placeholder="Enter active cities"
                      value={formData.cities}
                      onChange={(e) => setFormData({...formData, cities: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="How many HoReCa clients do you have?"
                      value={formData.horecaClients}
                      onChange={(e) => setFormData({...formData, horecaClients: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Upload your catalogue</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.pdf"
                      onChange={(e) => setFormData({...formData, catalogue: e.target.files?.[0] || null})}
                      className="hidden"
                      id="catalogue-upload"
                    />
                    <label htmlFor="catalogue-upload" className="cursor-pointer">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-600">CSV/Excel/PDF file (max 5 MB)</p>
                      <p className="text-sm text-gray-500 mt-1">Click to upload your product catalogue</p>
                      {formData.catalogue && (
                        <p className="text-green-600 mt-2 font-medium">{formData.catalogue.name}</p>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        )}

        {showLogin && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogin(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl z-[10000] max-w-md w-[90%] p-6 md:p-10 relative">
              <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <div className="text-3xl">📱</div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">Seller Login</h2>
                <p className="text-gray-500 mb-6">Enter your registered mobile number to access seller dashboard</p>

                <div className="w-full mb-4">
                  <input 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                    placeholder="Enter 10-digit mobile number" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    maxLength={10} 
                  />
                  {phoneNumber && !/^[6-9]\d{9}$/.test(phoneNumber) && (
                    <p className="text-red-500 text-xs mt-1">Please enter a valid mobile number</p>
                  )}
                </div>
                <div className="flex gap-3 w-full mb-4">
                  <button 
                    onClick={sendOTP} 
                    disabled={loading || !/^[6-9]\d{9}$/.test(phoneNumber)} 
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                  >
                    {loading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Send OTP'}
                  </button>
                  <button 
                    onClick={() => { setOtp(["", "", "", "", "", ""]); setPhoneNumber(''); setTimer(0); setDevOtp(''); }} 
                    className="py-3 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {devOtp && (
                  <div className="w-full mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-yellow-800">OTP: <strong className="text-lg">{devOtp}</strong></span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(devOtp);
                        const newOtp = devOtp.split('');
                        setOtp(newOtp);
                      }}
                      className="text-xs bg-yellow-200 hover:bg-yellow-300 px-3 py-1.5 rounded font-medium"
                    >
                      Copy
                    </button>
                  </div>
                )}

                <div className="w-full mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} 
                        id={`otp-s-${idx}`} 
                        type="text" 
                        maxLength={1} 
                        value={digit} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const newOtp = [...otp]; 
                          newOtp[idx] = value; 
                          setOtp(newOtp);
                          if (value && idx < 5) {
                            const el = document.getElementById(`otp-s-${idx + 1}`) as HTMLInputElement | null;
                            el?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                          const newOtp = [...otp];
                          for (let i = 0; i < pastedData.length && i < 6; i++) {
                            newOtp[i] = pastedData[i];
                          }
                          setOtp(newOtp);
                          const nextEmptyIndex = Math.min(pastedData.length, 5);
                          const el = document.getElementById(`otp-s-${nextEmptyIndex}`) as HTMLInputElement | null;
                          el?.focus();
                        }} 
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                            const el = document.getElementById(`otp-s-${idx - 1}`) as HTMLInputElement | null;
                            el?.focus();
                          }
                        }}
                        className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-semibold text-lg" 
                      />
                    ))}
                  </div>
                </div>

                <div className="w-full">
                  <button 
                    onClick={verifyOTP} 
                    disabled={loading || otp.join('').length !== 6} 
                    className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login to Dashboard'}
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 mb-2">Only registered sellers can access this portal</p>
                  <p className="text-xs text-gray-400">New seller? <button onClick={() => {setShowLogin(false); setShowRegister(true);}} className="text-red-500 hover:text-red-600 underline">Register here</button></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className={`fixed top-4 right-4 z-[10001] px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  );
}
