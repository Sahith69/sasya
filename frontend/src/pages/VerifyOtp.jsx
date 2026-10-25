// src/pages/VerifyOtp.jsx - Dummy OTP Verification & Credential Creation
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { lang, setLang, t, pendingSignup, verifyDummyOtp, completeAccountCreation } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [step, setStep] = useState('otp'); // 'otp' or 'credentials'

  // Credential inputs
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const inputRefs = useRef([]);

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next box
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Quick 1-click Auto-fill of 123456
  const handleAutoFill = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    setError('');
  };

  // Handle Verify OTP click
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    const res = verifyDummyOtp(fullCode);
    if (res.success) {
      if (pendingSignup?.username && pendingSignup?.password) {
        const createRes = completeAccountCreation(pendingSignup.username, pendingSignup.password);
        if (createRes.success) {
          navigate('/home');
          return;
        }
      }
      setStep('credentials');
    } else {
      setError(res.error);
    }
  };

  // Handle Account Creation click
  const handleCreateAccount = (e) => {
    e.preventDefault();
    setError('');
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const res = completeAccountCreation(newUsername, newPassword);
    if (res.success) {
      navigate('/home');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col justify-center items-center px-4 py-8">
      {/* Top Bar with Consistent Trilingual Switcher */}
      <div className="w-full max-w-[460px] flex justify-end mb-3">
        <div className="flex items-center p-1 rounded-xl border border-[#91BA94] bg-white text-xs shadow-xs">
          {[
            { code: 'en', label: 'EN' },
            { code: 'kn', label: 'ಕನ್ನಡ' },
            { code: 'hi', label: 'हिंदी' }
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === item.code
                  ? 'bg-[#275637] text-white shadow-xs'
                  : 'text-[#275637] hover:bg-[#E8F2EA]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[460px]">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E8F2EA] border border-[#91BA94] text-2xl mb-3 shadow-sm">
            🛡️
          </div>
          <h1 className="text-2xl font-extrabold text-[#275637] tracking-tight">
            {step === 'otp' ? t('verify_otp_title') : t('set_creds_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#556B5C] font-medium mt-1">
            {step === 'otp' 
              ? `${t('verify_otp_desc')} +91 ${pendingSignup?.phone || '00000 12345'}`
              : 'Set your username and secure password to complete registration'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#91BA94] rounded-[14px] p-6 sm:p-7 shadow-xs">
          
          {error && (
            <div className="bg-[#FDECEA] border border-[#B5483A] text-[#B5483A] px-3.5 py-2.5 rounded-xl text-xs font-semibold mb-4">
              {error}
            </div>
          )}

          {/* STEP 1: OTP BOXES */}
          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Demo Sandbox Alert */}
              <div className="bg-[#E8F5E9] border border-[#91BA94] text-[#275637] p-3 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>⚡ {t('demo_otp_banner')}</span>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="bg-[#275637] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-[#1E462B]"
                >
                  Fill
                </button>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-12 h-14 text-center text-xl font-bold bg-[#FAFCFA] border border-[#91BA94] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#275637]"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{t('verify_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-[#556B5C] hover:text-[#275637] font-semibold inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Mobile Login</span>
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: CHOOSE USERNAME & PASSWORD */
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="bg-[#E8F5E9] text-[#275637] border border-[#91BA94] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#275637]" />
                <span>Mobile +91 {pendingSignup?.phone} verified successfully!</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-1.5">
                  Choose Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. manjunatha_kolar"
                  className="w-full px-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-1.5">
                  Choose Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set your password"
                  className="w-full px-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637] font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>{t('create_account_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
