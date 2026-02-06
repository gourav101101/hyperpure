"use client";
import { useState, useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { login } from "../store/authSlice";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

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
        setDevOtp(data.otp || "");
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
        dispatch(login({ 
          userId: data.userId, 
          userPhone: data.userPhone || phoneNumber, 
          userName: data.userName || 'Guest' 
        }));
        onSuccess();
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      alert('Verification failed');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <>
      {!showOtpScreen ? (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
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
      ) : (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => { setShowOtpScreen(false); onClose(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center">
                <div className="w-20 h-28 border-4 border-gray-800 rounded-2xl flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-3 py-2 rounded-lg font-bold text-lg">* * *</div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Enter verification code</h2>
            <p className="text-gray-500 text-center mb-6">6 digit OTP has been sent to +91 {phoneNumber}</p>
            {devOtp && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-yellow-800">Dev OTP: <strong>{devOtp}</strong></span>
                <button onClick={() => navigator.clipboard.writeText(devOtp)} className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded">
                  Copy
                </button>
              </div>
            )}
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
              <p className="text-gray-600">Didn't receive the code? <button onClick={resendOTP} disabled={timer > 0} className={`font-semibold ${timer > 0 ? 'text-gray-400' : 'text-red-500 hover:text-red-600'}`}>Resend now</button></p>
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
    </>
  );
}
