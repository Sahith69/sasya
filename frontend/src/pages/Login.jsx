// src/pages/Login.jsx - Minimal Hackathon Sign In & Sign Up with Farmer Place & Crop Preferences
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Sprout, Phone, Lock, User, ArrowRight, CheckCircle2, Sparkles, Check, MapPin } from 'lucide-react';

const AVAILABLE_CROPS = [
  { id: 'Arecanut', label: '🌴 Arecanut (ಅಡಿಕೆ)' },
  { id: 'Paddy', label: '🌾 Paddy (ಭತ್ತ)' },
  { id: 'Tomato', label: '🍅 Tomato (ಟೊಮೆಟೊ)' },
  { id: 'Apple', label: '🍎 Apple (ಸೇಬು)' },
  { id: 'Coconut', label: '🥥 Coconut (ತೆಂಗು)' },
  { id: 'Black Pepper', label: '🌿 Black Pepper (ಕಾಳುಮೆಣಸು)' }
];

const DISTRICT_TALUKS = {
  'Dakshina Kannada': ['Belthangady (Venur)', 'Belthangady', 'Bantwal', 'Puttur', 'Sullia', 'Mangaluru', 'Moodabidri', 'Kadaba'],
  'Udupi': ['Karkala', 'Kundapura', 'Udupi', 'Brahmavar', 'Hebri', 'Byndoor'],
  'Shivamogga': ['Thirthahalli (Mandagadde)', 'Thirthahalli', 'Shivamogga', 'Sagara', 'Bhadravathi', 'Soraba', 'Hosanagara', 'Shikaripura'],
  'Chikkamagaluru': ['Sringeri', 'Mudigere', 'Koppa', 'Chikkamagaluru', 'Narasimharajapura', 'Tarikere', 'Kadur'],
  'Kolar': ['Kolar', 'Bangarapet', 'Srinivaspur', 'Malur', 'Mulbagal'],
  'Mandya': ['Maddur', 'Mandya', 'Pandavapura', 'Malavalli', 'Nagamangala', 'Krishnarajpet', 'Srirangapatna'],
  'Mysuru': ['Hunsur', 'Mysuru', 'Nanjangud', 'Periyapatna', 'T. Narasipura', 'H.D. Kote'],
  'Shimla': ['Theog', 'Shimla', 'Rohru', 'Kotkhai', 'Rampur', 'Jubbal'],
  'Kullu': ['Kullu', 'Manali', 'Banjar', 'Anni'],
  'Dehradun': ['Dehradun', 'Rishikesh', 'Vikasnagar', 'Chakrata']
};

const DISTRICT_OPTIONS = Object.keys(DISTRICT_TALUKS);

export default function Login() {
  const navigate = useNavigate();
  const { lang, setLang, t, login, startPhoneSignup } = useAuth();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Sign In Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [selectedDemoId, setSelectedDemoId] = useState(null);

  // Sign Up Form States (Farmer Place & Crop Preferences)
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [signUpDistrict, setSignUpDistrict] = useState('Dakshina Kannada');
  const [signUpTaluk, setSignUpTaluk] = useState('Belthangady (Venur)');
  const [signUpCrops, setSignUpCrops] = useState(['Arecanut']);
  const [signUpError, setSignUpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When District changes, update Taluk options and default selection
  const handleDistrictChange = (d) => {
    setSignUpDistrict(d);
    setSignUpTaluk(DISTRICT_TALUKS[d]?.[0] || '');
  };

  // Toggle crop selection
  const toggleCrop = (cropId) => {
    if (signUpCrops.includes(cropId)) {
      if (signUpCrops.length > 1) {
        setSignUpCrops(signUpCrops.filter(c => c !== cropId));
      }
    } else {
      setSignUpCrops([...signUpCrops, cropId]);
    }
  };

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
          navigate('/home');
        }
      } else {
        setSignInError(res.error);
      }
    }, 250);
  };

  // Handle Sign Up submission: saves preferences & triggers OTP verification
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpUsername.trim()) {
      setSignUpError(t('enter_username') || 'Please choose a username for your farmer profile.');
      return;
    }
    if (!signUpPassword.trim()) {
      setSignUpError(t('enter_password') || 'Please enter a password.');
      return;
    }
    if (signUpCrops.length === 0) {
      setSignUpError('Please select at least one crop that you grow.');
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = phone.trim() || '98450 12345';
    const res = startPhoneSignup(cleanPhone, {
      username: signUpUsername.trim(),
      password: signUpPassword.trim(),
      phone: cleanPhone,
      name: signUpName.trim() || signUpUsername.trim(),
      district: signUpDistrict,
      taluk: signUpTaluk,
      crops: signUpCrops
    });

    setTimeout(() => {
      setIsSubmitting(false);
      if (res.success) {
        navigate('/verify-otp');
      } else {
        setSignUpError(res.error || 'Failed to start verification.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col justify-center items-center p-4 sm:p-6 antialiased selection:bg-[#91BA94]/30">
      
      {/* Top Bar with Consistent Trilingual Switcher */}
      <div className="w-full max-w-md mx-auto flex justify-end mb-3">
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

      {/* Container Box */}
      <div className="w-full max-w-md mx-auto">
        
        {/* Top Header & Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#275637] text-white shadow-md mb-3 transition-transform hover:scale-105 duration-300">
            <Sprout className="w-7 h-7 text-[#91BA94]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#275637]">
            {t('app_name')}
          </h1>
          <p className="text-xs sm:text-sm text-[#556B5C] font-medium mt-1">
            {t('tagline')}
          </p>
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

              <div className="pt-3 border-t border-[#E8F0E9] mt-4 flex items-center justify-between text-xs text-[#556B5C]">
                <span>New to Sasya?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="font-bold text-[#275637] hover:underline cursor-pointer"
                >
                  Create an account →
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP (WITH FARMER PLACE & CROP PREFERENCES) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5 transition-opacity duration-300 ease-in">
              {signUpError && (
                <div className="bg-[#FDECEA] border border-[#B5483A] text-[#B5483A] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                  {signUpError}
                </div>
              )}

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#275637] uppercase tracking-wider mb-1">
                    {t('label_your_name')}
                  </label>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder={t('placeholder_your_name')}
                    className="w-full px-3 py-2 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#275637]/25 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#275637] uppercase tracking-wider mb-1">
                    {t('label_username')}
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    placeholder={t('placeholder_username')}
                    className="w-full px-3 py-2 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#275637]/25 font-medium"
                  />
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#275637] uppercase tracking-wider mb-1">
                    {t('label_mobile')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('placeholder_mobile')}
                    className="w-full px-3 py-2 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#275637]/25 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#275637] uppercase tracking-wider mb-1">
                    {t('label_password')}
                  </label>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder={t('placeholder_password')}
                    className="w-full px-3 py-2 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#275637]/25 font-medium"
                  />
                </div>
              </div>

              {/* ── PREFERENCE: FARMER'S PLACE (LOCATION) ── */}
              <div className="p-3 rounded-xl bg-[#F4F8F5] border border-[#91BA94]/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#275637]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('label_location_pref')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#556B5C] uppercase tracking-wider mb-1">
                      {t('label_district')}
                    </label>
                    <select
                      value={signUpDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#91BA94] rounded-lg text-xs font-bold text-[#275637] focus:outline-none cursor-pointer"
                    >
                      {DISTRICT_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#556B5C] uppercase tracking-wider mb-1">
                      {t('label_taluk_village')}
                    </label>
                    <select
                      value={signUpTaluk}
                      onChange={(e) => setSignUpTaluk(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#91BA94] rounded-lg text-xs font-bold text-[#275637] focus:outline-none cursor-pointer"
                    >
                      {(DISTRICT_TALUKS[signUpDistrict] || []).map((tVal) => (
                        <option key={tVal} value={tVal}>{tVal}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── PREFERENCE: WHAT THEY GROW ── */}
              <div className="p-3 rounded-xl bg-[#F4F8F5] border border-[#91BA94]/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-[#275637]">
                  <span>{t('label_what_you_grow')}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{t('sub_select_all')}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_CROPS.map((c) => {
                    const isSelected = signUpCrops.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCrop(c.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#275637] text-white border-[#275637] shadow-xs'
                            : 'bg-white border-[#91BA94]/60 text-[#275637] hover:bg-[#E8F2EA]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-xs flex items-center justify-center gap-2 group cursor-pointer mt-2"
              >
                <span>{isSubmitting ? (t('signing_in') || 'Verifying...') : t('btn_verify_mobile_otp')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
