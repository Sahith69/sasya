// src/pages/Home.jsx - Hackathon Palette with Theme Selector (Dark/Light), Dynamic Localized Brand & Animated Nav
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, CloudRain, Users, LogOut, Search, 
  MapPin, ChevronRight, User, Settings, FileText, 
  UploadCloud, Sun, Moon
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0B1712] text-white selection:bg-[#22C55E] selection:text-[#0B1712]' 
        : 'bg-[#F9F9F6] text-[#275637] selection:bg-[#B1D27D] selection:text-[#275637]'
    }`}>
      
      {/* ── TOP FROSTED NAVBAR ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${
        isDark 
          ? 'bg-[#0B1712]/90 border-[#162C20]' 
          : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand with Dynamic Script Badge */}
          <div className="flex items-center gap-6">
            <Link 
              to="/home" 
              className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shadow-xs group-hover:rotate-6 transition-transform ${
                isDark 
                  ? 'bg-[#12241A] border-[#1E3A2B] text-white' 
                  : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                🌾
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-extrabold text-xl tracking-tight transition-colors ${
                  isDark ? 'text-white' : 'text-[#275637]'
                }`}>
                  Sasya
                </span>
                {/* Dynamic Language Script Badge (Only shown in Kannada as ಸಸ್ಯ and Hindi as सस्य, removed in English) */}
                {lang !== 'en' && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-md border font-bold transition-all duration-300 ${
                    isDark 
                      ? 'bg-[#12241A] border-[#22C55E]/40 text-[#22C55E]' 
                      : 'bg-[#B1D27D] border-[#91BA94] text-[#275637]'
                  }`}>
                    {lang === 'kn' ? 'ಸಸ್ಯ' : 'सस्य'}
                  </span>
                )}
              </div>
            </Link>

            {/* Nav Links with Expanding Underline & Bounce Micro-Animations */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
              {[
                { label: t('nav_community'), to: '/c/arecanut' },
                { label: t('nav_detect'), to: '/detect' },
                { label: t('nav_risk'), to: '/risk' },
                { label: t('nav_contribute'), to: '/wallet' },
                { label: t('nav_map'), to: '/map' }
              ].map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`group relative px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                    isDark 
                      ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                      : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Expanding Underline Animation */}
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-250 group-hover:w-3/4 ${
                    isDark ? 'bg-[#22C55E]' : 'bg-[#275637]'
                  }`} />
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Theme Selector, Language Switcher & Profile Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Theme Selector Button (Light / Dark) with Spin & Bounce */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={isDark ? "Switch to White/Light Theme" : "Switch to Dark Theme"}
              className={`p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer shadow-xs ${
                isDark 
                  ? 'bg-[#12241A] border-[#1E3A2B] text-[#FCD34D] hover:bg-[#183526]' 
                  : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 hover:-rotate-45" />
              )}
            </button>

            {/* Language Switcher with Tactile Hover Animations */}
            <div className={`flex items-center p-1 rounded-xl border text-xs shadow-xs ${
              isDark 
                ? 'bg-[#12241A] border-[#1E3A2B]' 
                : 'bg-white border-[#91BA94]'
            }`}>
              {[
                { code: 'en', label: 'EN' },
                { code: 'kn', label: 'ಕನ್ನಡ' },
                { code: 'hi', label: 'हिंदी' }
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    lang === item.code
                      ? isDark 
                        ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' 
                        : 'bg-[#275637] text-white shadow-xs'
                      : isDark 
                        ? 'text-[#8BA695] hover:text-white hover:scale-105 active:scale-95' 
                        : 'text-[#275637] hover:bg-[#E8F2EA] hover:scale-105 active:scale-95'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Profile Avatar Button with Scale Transition */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                  isDark 
                    ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E] text-white' 
                    : 'bg-[#275637] hover:bg-[#1E462B] border-[#91BA94] text-white'
                }`}
                aria-expanded={isProfileOpen}
                title="User Profile"
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AR'}
              </button>

              {/* Floating Profile Popover (Clean z-index, no text overlap) */}
              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-64 border rounded-[14px] shadow-2xl py-3 z-50 animate-card-in ${
                  isDark 
                    ? 'bg-[#102217] border-[#1E3A2B] text-white' 
                    : 'bg-white border-[#91BA94] text-[#275637]'
                }`}>
                  <div className={`px-4 pb-3 border-b ${isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'}`}>
                    <div className="text-xs font-bold">
                      {user?.username || 'AR-KDK-0142'}
                    </div>
                    <div className={`text-[11px] flex items-center gap-1 mt-0.5 font-medium ${
                      isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                    }`}>
                      <MapPin className={`w-3 h-3 ${isDark ? 'text-[#22C55E]' : 'text-[#275637]'}`} />
                      <span>{user?.village || 'Venur'}, {user?.district || 'Dakshina Kannada'}</span>
                    </div>
                  </div>

                  <div className="py-2 text-xs font-semibold">
                    {[
                      { icon: User, label: t('menu_profile'), to: '/profile?tab=profile' },
                      { icon: UploadCloud, label: t('menu_wallet'), to: '/profile?tab=wallet' },
                      { icon: Camera, label: t('menu_scans'), to: '/profile?tab=scans' },
                      { icon: FileText, label: t('menu_listings'), to: '/profile?tab=listings' },
                      { icon: Settings, label: t('menu_settings'), to: '/profile?tab=settings' },
                    ].map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { setIsProfileOpen(false); navigate(item.to); }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isDark 
                            ? 'hover:bg-[#162F20] hover:text-white' 
                            : 'hover:bg-[#E8F2EA] text-[#275637]'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isDark ? 'text-[#22C55E]' : 'text-[#275637]'}`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className={`pt-2 border-t px-2 ${isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'}`}>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isDark 
                          ? 'text-rose-400 hover:bg-rose-950/40' 
                          : 'text-[#B5483A] hover:bg-[#FDECEA]'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('menu_signout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ── HERO VIEWPORT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center relative z-10">
        
        {/* Sample Data Pill */}
        <div className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full border shadow-xs mb-8 transition-transform hover:scale-[1.02] ${
          isDark 
            ? 'bg-[#12241A] border-[#1E3A2B]' 
            : 'bg-white border-[#91BA94]'
        }`}>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isDark 
              ? 'bg-[#0D4A3E] text-[#34D399]' 
              : 'bg-[#B1D27D] text-[#275637]'
          }`}>
            {t('sample_data_label')}
          </span>
          <span className={`text-xs font-semibold ${
            isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
          }`}>
            {t('sample_data_crops')}
          </span>
        </div>

        {/* Hero Headline (Underline REMOVED on Farm together) */}
        <div className="text-center max-w-3xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            <span className={isDark ? 'text-white' : 'text-[#275637]'}>
              {t('headline_line1')}
            </span>
            <br />
            {/* Clean without underline */}
            <span className={isDark ? 'text-[#22C55E]' : 'text-[#275637]'}>
              {t('headline_line2')}
            </span>
          </h1>

          {/* Subtext */}
          <p className={`mt-4 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-2xl mx-auto ${
            isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
          }`}>
            {t('hero_subtext')}
          </p>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="w-full max-w-2xl mt-8">
          <form 
            onSubmit={(e) => { e.preventDefault(); navigate('/detect'); }}
            className="relative flex items-center"
          >
            <div className={`absolute left-4 pointer-events-none ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              <Search className={`w-5 h-5 ${isDark ? 'text-[#22C55E]' : 'text-[#275637]'}`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className={`w-full min-h-[52px] pl-12 pr-28 py-3.5 border rounded-[14px] text-sm sm:text-base font-medium shadow-xs transition-all outline-none ${
                isDark 
                  ? 'bg-[#12241A] border-[#1E3A2B] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] text-white placeholder-[#5A7363]' 
                  : 'bg-white border-[#91BA94] focus:border-[#275637] focus:ring-2 focus:ring-[#275637]/20 text-[#275637] placeholder-[#556B5C]/70'
              }`}
            />
            <button
              type="submit"
              className={`absolute right-2 min-h-[44px] px-5 py-2.5 font-extrabold rounded-xl text-sm transition-all duration-200 shadow-xs flex items-center gap-1.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${
                isDark 
                  ? 'bg-[#16A34A] hover:bg-[#22C55E] text-white' 
                  : 'bg-[#275637] hover:bg-[#1E462B] text-white'
              }`}
            >
              <span>{t('search_btn')}</span>
            </button>
          </form>

          {/* Quick Action Chips with Tactile Hover Animations */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
            {[
              { label: '🍃 Koleroga Spray Alert', to: '/detect' },
              { label: '🌾 Paddy Blast: High Risk', to: '/detect' },
              { label: '📤 Open Dataset Upload', to: '/wallet' }
            ].map((chip, idx) => (
              <button 
                key={idx}
                onClick={() => navigate(chip.to)}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${
                  isDark 
                    ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E] text-[#8BA695] hover:text-white' 
                    : 'bg-white border-[#91BA94] hover:bg-[#E8F2EA] text-[#275637]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4 CARDS: EXACT PRIORITY ORDER & SMOOTH HOVER LIFT ── */}
        {/* Priority: 1. Community | 2. Scan | 3. Weather | 4. Contribute */}
        <div className="w-full mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Ask the community (Priority 1) */}
          <div 
            onClick={() => navigate('/c/arecanut')}
            className={`group border rounded-[14px] p-6 shadow-xs hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark 
                ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E]/60 hover:bg-[#152B1F]' 
                : 'bg-white border-[#91BA94] hover:border-[#275637] hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${
                  isDark 
                    ? 'bg-[#162C20] border-[#22C55E]/30 text-[#22C55E]' 
                    : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}>
                  <Users className="w-5 h-5" />
                </span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${
                  isDark ? 'text-[#5A7363] group-hover:text-[#22C55E]' : 'text-[#91BA94] group-hover:text-[#275637]'
                }`} />
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDark ? 'text-white group-hover:text-[#22C55E]' : 'text-[#275637] group-hover:text-[#1E462B]'
              }`}>
                {t('card_community_title')}
              </h3>
              <p className={`text-xs sm:text-sm mt-2 font-medium leading-relaxed ${
                isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
              }`}>
                {t('card_community_sub')}
              </p>
            </div>

            <div className={`mt-5 pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'border-[#1A3324] text-[#5A7363]' : 'border-[#E8F0E9] text-[#556B5C]'
            }`}>
              <span>Discussions &amp; crop feeds</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                isDark ? 'bg-[#162C20] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
              }`}>Open</span>
            </div>
          </div>

          {/* Card 2: Scan a leaf (Priority 2) */}
          <div 
            onClick={() => navigate('/detect')}
            className={`group border rounded-[14px] p-6 shadow-xs hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark 
                ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E]/60 hover:bg-[#152B1F]' 
                : 'bg-white border-[#91BA94] hover:border-[#275637] hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${
                  isDark 
                    ? 'bg-[#162C20] border-[#22C55E]/30 text-[#22C55E]' 
                    : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}>
                  <Camera className="w-5 h-5" />
                </span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${
                  isDark ? 'text-[#5A7363] group-hover:text-[#22C55E]' : 'text-[#91BA94] group-hover:text-[#275637]'
                }`} />
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDark ? 'text-white group-hover:text-[#22C55E]' : 'text-[#275637] group-hover:text-[#1E462B]'
              }`}>
                {t('card_scan_title')}
              </h3>
              <p className={`text-xs sm:text-sm mt-2 font-medium leading-relaxed ${
                isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
              }`}>
                {t('card_scan_sub')}
              </p>
            </div>

            <div className={`mt-5 pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'border-[#1A3324] text-[#5A7363]' : 'border-[#E8F0E9] text-[#556B5C]'
            }`}>
              <span>ResNet-18 + Grad-CAM</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                isDark ? 'bg-[#0D4A3E] text-[#34D399]' : 'bg-[#B1D27D] text-[#275637]'
              }`}>2.1s</span>
            </div>
          </div>

          {/* Card 3: Spray window (Priority 3) */}
          <div 
            onClick={() => navigate('/risk')}
            className={`group border rounded-[14px] p-6 shadow-xs hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark 
                ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E]/60 hover:bg-[#152B1F]' 
                : 'bg-white border-[#91BA94] hover:border-[#275637] hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${
                  isDark 
                    ? 'bg-[#162C20] border-[#22C55E]/30 text-[#22C55E]' 
                    : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}>
                  <CloudRain className="w-5 h-5" />
                </span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${
                  isDark ? 'text-[#5A7363] group-hover:text-[#22C55E]' : 'text-[#91BA94] group-hover:text-[#275637]'
                }`} />
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDark ? 'text-white group-hover:text-[#22C55E]' : 'text-[#275637] group-hover:text-[#1E462B]'
              }`}>
                {t('card_weather_title')}
              </h3>
              <p className={`text-xs sm:text-sm mt-2 font-medium leading-relaxed ${
                isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
              }`}>
                {t('card_weather_sub')}
              </p>
            </div>

            <div className={`mt-5 pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'border-[#1A3324] text-[#5A7363]' : 'border-[#E8F0E9] text-[#556B5C]'
            }`}>
              <span>Open-Meteo rain alerts</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                isDark ? 'bg-[#2A2111] text-[#F59E0B]' : 'bg-[#F6D05F] text-[#275637]'
              }`}>48-Hour</span>
            </div>
          </div>

          {/* Card 4: Contribute (Priority 4 - No 1rs) */}
          <div 
            onClick={() => navigate('/wallet')}
            className={`group border rounded-[14px] p-6 shadow-xs hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark 
                ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E]/60 hover:bg-[#152B1F]' 
                : 'bg-white border-[#91BA94] hover:border-[#275637] hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${
                  isDark 
                    ? 'bg-[#162C20] border-[#22C55E]/30 text-[#22C55E]' 
                    : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}>
                  <UploadCloud className="w-5 h-5" />
                </span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${
                  isDark ? 'text-[#5A7363] group-hover:text-[#22C55E]' : 'text-[#91BA94] group-hover:text-[#275637]'
                }`} />
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDark ? 'text-white group-hover:text-[#22C55E]' : 'text-[#275637] group-hover:text-[#1E462B]'
              }`}>
                {t('card_contribute_title')}
              </h3>
              <p className={`text-xs sm:text-sm mt-2 font-medium leading-relaxed ${
                isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
              }`}>
                {t('card_contribute_sub')}
              </p>
            </div>

            <div className={`mt-5 pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'border-[#1A3324] text-[#5A7363]' : 'border-[#E8F0E9] text-[#556B5C]'
            }`}>
              <span>Verified pathology pool</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                isDark ? 'bg-[#162C20] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
              }`}>Public AI</span>
            </div>
          </div>

        </div>

      </main>

      {/* ── MOBILE BOTTOM NAV (360px phones, Tap targets >= 48px) ── */}
      <nav className={`sm:hidden fixed bottom-0 inset-x-0 backdrop-blur-lg border-t px-6 py-2 z-50 flex items-center justify-between shadow-lg ${
        isDark 
          ? 'bg-[#0B1712]/95 border-[#162C20]' 
          : 'bg-white/95 border-[#91BA94]'
      }`}>
        <button 
          onClick={() => navigate('/home')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#22C55E]' : 'text-[#275637]'
          }`}
        >
          <span className="text-base">🌱</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => navigate('/c/arecanut')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Community</span>
        </button>

        <button 
          onClick={() => navigate('/detect')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Detect</span>
        </button>

        <button 
          onClick={() => navigate('/risk')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <CloudRain className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Weather</span>
        </button>

        <button 
          onClick={() => navigate('/wallet')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Contribute</span>
        </button>
      </nav>

    </div>
  );
}
