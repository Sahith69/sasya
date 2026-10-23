// src/pages/Login.jsx - Minimal Hackathon Sign In & Sign Up
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Sprout, Phone, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { lang, setLang, t, login, startPhoneSignup } = useAuth();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Sign In Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Sign Up Form States
  const [phone, setPhone] = useState('0000012345');
  const [signUpError, setSignUpError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Handle Sign In submission
  const handleSignIn = (e) => {
    e.preventDefault();
    setSignInError('');
    if (!username.trim() || !password.trim()) {
      setSignInError('Please enter both username and password.');
      return;
    }

    const res = login(username, password);
    if (res.success) {
      if (res.user.role === 'expert') {
        navigate('/expert/queue');
      } else {
        navigate(res.user.consentGiven ? '/home' : '/onboarding');
      }
    } else {
      setSignInError(res.error);
    }
  };

  // Quick Demo Auto-Fill (Saves critical pitch seconds)
  const handleQuickFill = (account) => {
    setUsername(account.username);
    setPassword(account.pass);
    setSignInError('');
  };

  // Handle Sign Up (Dummy Phone -> Send OTP)
  const handleSendOtp = (e) => {
    e.preventDefault();
    setSignUpError('');
    const res = startPhoneSignup(phone);
    if (res.success) {
      setToastMsg(`📲 Simulated SMS: OTP ${res.demoOtp} sent to +91 ${phone}`);
      setTimeout(() => {
        navigate('/verify-otp');
      }, 700);
    } else {
      setSignUpError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col justify-center items-center px-4 py-8">
      {/* Top Simulated SMS Toast */}
      {toastMsg && (
        <div className="fixed top-4 z-50 bg-[#E8F5E9] border border-[#275637] text-[#275637] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#275637]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container (Hackathon max 480px) */}
      <div className="w-full max-w-[460px]">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E8F2EA] border border-[#91BA94] text-2xl mb-3 shadow-sm">
            🌾
          </div>
          <h1 className="text-2xl font-extrabold text-[#275637] tracking-tight">
            {t('app_name')}
          </h1>
          <p className="text-xs sm:text-sm text-[#556B5C] font-medium mt-1">
            {t('tagline')}
          </p>

          {/* Language Switch Pills */}
          <div className="inline-flex bg-white p-1 rounded-full border border-[#91BA94] mt-3 gap-1 shadow-xs">
            <button
              onClick={() => setLang('kn')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'kn' ? 'bg-[#275637] text-white shadow-xs' : 'text-[#275637] hover:bg-[#F4F8F5]'
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-[#275637] text-white shadow-xs' : 'text-[#275637] hover:bg-[#F4F8F5]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'hi' ? 'bg-[#275637] text-white shadow-xs' : 'text-[#275637] hover:bg-[#F4F8F5]'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#91BA94] rounded-[14px] p-6 sm:p-7 shadow-xs">
          
          {/* Tabs: Sign In vs Sign Up */}
          <div className="flex border-b border-[#D8E4DA] mb-6">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'signin'
                  ? 'border-[#275637] text-[#275637]'
                  : 'border-transparent text-[#556B5C] hover:text-[#275637]'
              }`}
            >
              {t('tab_signin')}
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'signup'
                  ? 'border-[#275637] text-[#275637]'
                  : 'border-transparent text-[#556B5C] hover:text-[#275637]'
              }`}
            >
              {t('tab_signup')}
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {signInError && (
                <div className="bg-[#FDECEA] border border-[#B5483A] text-[#B5483A] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                  {signInError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-1.5">
                  {t('username')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#556B5C] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('enter_username')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-1.5">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#556B5C] absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('enter_password')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637] font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>{t('signin_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 1-Click Demo Shortcut Pills (Pitch Lifesaver) */}
              <div className="pt-3 border-t border-[#E8F0E9] mt-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#556B5C] mb-2 text-center">
                  {t('quick_demo')}
                </span>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-[#D8E4DA] bg-[#F9F9F6] hover:bg-[#E8F2EA] text-xs font-semibold text-[#275637] flex items-center justify-between transition-colors"
                    >
                      <span>{acc.badge}</span>
                      <span className="text-[10px] text-[#556B5C] bg-white px-2 py-0.5 rounded border border-[#D8E4DA]">
                        {acc.username}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP (Dummy Phone -> OTP) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {signUpError && (
                <div className="bg-[#FDECEA] border border-[#B5483A] text-[#B5483A] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                  {signUpError}
                </div>
              )}

              <div className="bg-[#FFF9E6] border border-[#F5E096] text-[#8C6D15] p-3 rounded-xl text-xs font-semibold leading-relaxed">
                🛡️ <strong>Sandbox Mode:</strong> Use test number <code>00000 12345</code>. No real SMS charges apply.
              </div>

              <div>
                <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-1.5">
                  {t('mobile_label')}
                </label>
                <div className="flex gap-2">
                  <div className="px-3 py-2.5 bg-[#E8F0E9] border border-[#91BA94] rounded-xl text-sm font-bold text-[#275637] flex items-center">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-[#556B5C] absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('mobile_placeholder')}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637] font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPhone('0000012345')}
                className="text-xs text-[#275637] font-bold hover:underline inline-block"
              >
                {t('use_demo_mobile')}
              </button>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>{t('send_otp_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
