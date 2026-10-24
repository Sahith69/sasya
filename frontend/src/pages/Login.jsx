// src/pages/Login.jsx - Minimal Hackathon Sign In & Sign Up with Smooth Micro-Animations
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Sprout, Phone, Lock, User, ArrowRight, CheckCircle2, Sparkles, Check } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { lang, setLang, t, login, startPhoneSignup } = useAuth();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Sign In Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [selectedDemoId, setSelectedDemoId] = useState(null);

  // Sign Up Form States
  const [phone, setPhone] = useState('0000012345');
  const [signUpError, setSignUpError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Sign In submission
  const handleSignIn = (e) => {
    e.preventDefault();
    setSignInError('');
    if (!username.trim() || !password.trim()) {
      setSignInError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsSubmitting(false);
      if (res.success) {
        if (res.user.role === 'expert') {
          navigate('/expert/queue');
        } else {
          navigate(res.user.consentGiven ? '/home' : '/onboarding');
        }
      } else {
        setSignInError(res.error);
      }
    }, 250);
  };

  // Quick Demo Auto-Fill (Saves critical pitch seconds)
  const handleQuickFill = (account) => {
    setUsername(account.username);
    setPassword(account.pass);
    setSelectedDemoId(account.id);
    setSignInError('');
  };

  // Handle Sign Up (Dummy Phone -> Send OTP)
  const handleSendOtp = (e) => {
    e.preventDefault();
    setSignUpError('');
    setIsSubmitting(true);

    const res = startPhoneSignup(phone);
    if (res.success) {
      setToastMsg(`📲 Simulated SMS: OTP ${res.demoOtp} sent to +91 ${phone}`);
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/verify-otp');
      }, 650);
    } else {
      setIsSubmitting(false);
      setSignUpError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Subtle Ambient Organic Blurs (Minimal & Atmospheric) */}
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-[#91BA94]/12 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#B1D27D]/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2.5s' }} />

      {/* Top Simulated SMS Toast */}
      {toastMsg && (
        <div className="fixed top-6 z-50 bg-[#E8F5E9] border-2 border-[#275637] text-[#275637] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold animate-toast-slide">
          <CheckCircle2 className="w-5 h-5 text-[#275637] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container with smooth entrance */}
      <div className="w-full max-w-[460px] relative z-10 animate-card-in">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-[#E8F2EA] border border-[#91BA94] text-2xl mb-3 shadow-xs hover:rotate-3 transition-transform duration-300">
            🌾
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#275637] tracking-tight">
            {t('app_name')}
          </h1>
          <p className="text-xs sm:text-sm text-[#556B5C] font-medium mt-1">
            {t('tagline')}
          </p>

          {/* Language Switch Pills with Smooth Active Indicator */}
          <div className="inline-flex bg-white/90 backdrop-blur-xs p-1 rounded-full border border-[#91BA94] mt-3 gap-1 shadow-xs">
            {[
              { code: 'en', label: 'English' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
              { code: 'hi', label: 'हिंदी' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  lang === item.code
                    ? 'bg-[#275637] text-white shadow-xs scale-100'
                    : 'text-[#275637] hover:bg-[#F4F8F5]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#91BA94] rounded-[16px] p-6 sm:p-7 shadow-xs relative transition-all duration-300 hover:border-[#6FA47A]">
          
          {/* Animated Segmented Tabs */}
          <div className="relative flex bg-[#F1F5F2] p-1 rounded-xl border border-[#D8E4DA] mb-6 select-none">
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg border border-[#D8E4DA] shadow-xs transition-transform duration-300 ease-out ${
                activeTab === 'signup' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
              }`}
            />
            
            <button
              onClick={() => setActiveTab('signin')}
              className={`relative z-10 flex-1 py-2 text-xs sm:text-sm font-bold text-center transition-colors duration-200 cursor-pointer ${
                activeTab === 'signin' ? 'text-[#275637]' : 'text-[#556B5C] hover:text-[#275637]'
              }`}
            >
              {t('tab_signin')}
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`relative z-10 flex-1 py-2 text-xs sm:text-sm font-bold text-center transition-colors duration-200 cursor-pointer ${
                activeTab === 'signup' ? 'text-[#275637]' : 'text-[#556B5C] hover:text-[#275637]'
              }`}
            >
              {t('tab_signup')}
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 transition-opacity duration-300 ease-in">
              {signInError && (
                <div className="bg-[#FDECEA] border border-[#B5483A] text-[#B5483A] px-3.5 py-2.5 rounded-xl text-xs font-semibold animate-shake">
                  {signInError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-1.5">
                  {t('username')}
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-[#556B5C] group-focus-within:text-[#275637] absolute left-3.5 top-3.5 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSelectedDemoId(null);
                    }}
                    placeholder={t('enter_username')}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637]/25 focus:border-[#275637] font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-1.5">
                  {t('password')}
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-[#556B5C] group-focus-within:text-[#275637] absolute left-3.5 top-3.5 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedDemoId(null);
                    }}
                    placeholder={t('enter_password')}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637]/25 focus:border-[#275637] font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-xs flex items-center justify-center gap-2 group cursor-pointer mt-2"
              >
                <span>{isSubmitting ? 'Signing In...' : t('signin_btn')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 1-Click Demo Shortcut Pills (Pitch Lifesaver) */}
              <div className="pt-3 border-t border-[#E8F0E9] mt-4">
                <div className="flex items-center justify-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#275637]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#556B5C]">
                    {t('quick_demo')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = selectedDemoId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickFill(acc)}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'border-[#275637] bg-[#E8F5E9] text-[#275637] shadow-xs scale-[1.01]'
                            : 'border-[#D8E4DA] bg-[#FAFCFA] hover:bg-[#F4F8F5] text-[#275637]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{acc.badge}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#275637]" />}
                        </div>
                        <span className="text-[10px] text-[#556B5C] bg-white px-2 py-0.5 rounded border border-[#D8E4DA]">
                          {acc.username}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP (Dummy Phone -> OTP) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSendOtp} className="space-y-4 transition-opacity duration-300 ease-in">
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
                  <div className="relative flex-1 group">
                    <Phone className="w-4 h-4 text-[#556B5C] group-focus-within:text-[#275637] absolute left-3.5 top-3.5 transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('mobile_placeholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#275637]/25 focus:border-[#275637] font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPhone('0000012345')}
                className="text-xs text-[#275637] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('use_demo_mobile')}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-xs flex items-center justify-center gap-2 group cursor-pointer mt-2"
              >
                <span>{isSubmitting ? 'Sending Simulated SMS...' : t('send_otp_btn')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
