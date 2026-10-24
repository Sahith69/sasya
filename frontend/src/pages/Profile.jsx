// src/pages/Profile.jsx - Unified Farmer Portal (Profile, Wallet, Scans, Listings, Settings)
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Wallet, Camera, FileText, Settings, ArrowLeft, 
  MapPin, Shield, CheckCircle2, AlertTriangle, ChevronRight,
  Plus, UploadCloud, RotateCcw, Volume2, Sun, Moon, ArrowRight,
  Clock, DollarSign, Sparkles
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    user, lang, setLang, theme, setTheme, isDark, toggleTheme, 
    textSize, setTextSize, t, logout 
  } = useAuth();
  
  // Active Tab from query param (defaults to 'profile')
  const activeTab = searchParams.get('tab') || 'profile';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Wallet Simulation State
  const [walletBalance, setWalletBalance] = useState(12.00);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Listings State
  const [listings, setListings] = useState([
    { 
      title: '500L High-Pressure Power Sprayer for Rent', 
      category: 'Equipment Rental',
      rate: '₹800 / day', 
      status: 'Available Now',
      contact: 'Contact Ramesh (Self)'
    },
    { 
      title: 'URGENT: 2 Palm Climbers Needed for Koleroga Spraying', 
      category: 'Labour Request',
      rate: '₹700 / day', 
      status: 'Active Request (Rain in 28h)',
      contact: '2 young farmers responded'
    }
  ]);
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingTitle, setListingTitle] = useState('');
  const [listingCategory, setListingCategory] = useState('Equipment Rental');
  const [listingRate, setListingRate] = useState('₹500 / day');

  const handleCreateListing = (e) => {
    e.preventDefault();
    if (!listingTitle.trim()) return;
    setListings([
      {
        title: listingTitle.trim(),
        category: listingCategory,
        rate: listingRate.trim(),
        status: 'Available Now',
        contact: `Contact ${user?.name || 'Ramesh'} (Self)`
      },
      ...listings
    ]);
    setListingTitle('');
    setShowListingModal(false);
  };

  const handleSimulatePayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
    }, 4000);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      
      {/* ── TOP HEADER ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-16 flex items-center justify-between ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight">
              {t('farmer_portal_title')}
            </h1>
            <p className={`text-[10px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {user?.name || 'Ramesh Gowda'} • {user?.username || 'farmer_KA_101'}
            </p>
          </div>
        </div>

        {/* Right Controls: Language & Theme */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className={`flex items-center p-1 rounded-xl border text-xs shadow-xs ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            {[
              { code: 'en', label: 'EN' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
              { code: 'hi', label: 'हिंदी' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === item.code
                    ? isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' 
                      : 'bg-[#275637] text-white shadow-xs'
                    : isDark 
                      ? 'text-[#8BA695] hover:text-white' 
                      : 'text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#FCD34D]' : 'bg-white border-[#91BA94] text-[#275637]'
            }`}
            title="Toggle Dark/Light"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── TABS BAR (5 Items from Dropdown) ── */}
      <div className={`border-b overflow-x-auto ${isDark ? 'border-[#162C20] bg-[#0E1E16]' : 'border-[#91BA94]/60 bg-white'}`}>
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 sm:gap-2 py-2">
          {[
            { id: 'profile', label: t('menu_profile'), icon: User },
            { id: 'wallet', label: t('menu_wallet'), icon: Wallet },
            { id: 'scans', label: t('menu_scans'), icon: Camera },
            { id: 'listings', label: t('menu_listings'), icon: FileText },
            { id: 'settings', label: t('menu_settings'), icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                activeTab === tab.id
                  ? isDark 
                    ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' 
                    : 'bg-[#275637] text-white shadow-xs'
                  : isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT BODY ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* TAB 1: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-card-in">
            {/* Farmer Pass Card */}
            <div className={`border rounded-[14px] p-6 shadow-xs ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-[#91BA94]/30">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                    isDark ? 'bg-[#162C20] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
                  }`}>
                    🌾
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black">
                        {user?.name || 'Ramesh Gowda'}
                      </h2>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        isDark ? 'bg-[#0D4A3E] text-[#34D399]' : 'bg-[#B1D27D] text-[#275637]'
                      }`}>
                        {t('active_farmer_badge')}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                      Farmer ID: <strong>{user?.username || 'farmer_KA_101'}</strong> • Season 2026
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/profile/edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isDark ? 'bg-[#162C20] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                  }`}
                >
                  {t('btn_edit_profile')}
                </button>
              </div>

              {/* Farm Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'}`}>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>{t('profile_location')}</div>
                  <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#22C55E]" />
                    <span>{user?.village || 'Venur'}, {user?.district || 'Dakshina Kannada'}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'}`}>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>{t('profile_crops')}</div>
                  <div className="text-sm font-bold mt-1">
                    {user?.crops?.join(', ') || 'Arecanut (4 ac), Paddy (2 ac)'}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'}`}>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>{t('profile_privacy_shield')}</div>
                  <div className="text-sm font-bold mt-1 text-[#22C55E] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#22C55E]" />
                    <span>{t('profile_privacy_active')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WALLET (SIMULATED) */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-card-in">
            {/* Wallet Header Balance */}
            <div className={`border rounded-[14px] p-6 shadow-xs ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                    isDark ? 'text-[#34D399]' : 'text-[#275637]'
                  }`}>
                    {t('open_research_bounty')}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black mt-1 font-mono">
                    ₹{walletBalance.toFixed(2)}
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    Earned from 12 verified leaf submissions. Payout milestone: ₹50.00.
                  </p>
                </div>

                <button
                  onClick={handleSimulatePayout}
                  className={`min-h-[48px] px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] hover:bg-[#16A34A]' 
                      : 'bg-[#275637] text-white hover:bg-[#1E462B]'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{t('btn_simulate_payout')}</span>
                </button>
              </div>

              {/* Payout Success Toast */}
              {payoutSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-[#E8F5E9] border border-[#275637] text-[#275637] text-xs font-bold flex items-center gap-2 animate-toast-slide">
                  <CheckCircle2 className="w-5 h-5 text-[#275637]" />
                  <span>Simulated transfer of ₹{walletBalance.toFixed(2)} credited to VPA: ramesh@oksbi</span>
                </div>
              )}
            </div>

            {/* Submission History Table */}
            <div className={`border rounded-[14px] p-6 shadow-xs ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <h3 className="text-base font-bold mb-4">{t('verified_submission_history')}</h3>
              <div className="space-y-3">
                {[
                  { crop: 'Arecanut', disease: 'Koleroga (Fruit Rot)', date: 'Today, 10:14 AM', bounty: '+₹1.00', status: 'Approved' },
                  { crop: 'Paddy', disease: 'Blast (Pyricularia oryzae)', date: 'Yesterday', bounty: '+₹1.00', status: 'Approved' },
                  { crop: 'Tomato', disease: 'Late Blight', date: 'Oct 21, 2026', bounty: '+₹1.00', status: 'Approved' },
                  { crop: 'Arecanut', disease: 'Yellow Leaf Disease', date: 'Oct 19, 2026', bounty: '+₹1.00', status: 'Pending Review' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'
                  }`}>
                    <div>
                      <div className="font-bold text-sm">{item.crop} — {item.disease}</div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>{item.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#22C55E]">{item.bounty}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.status === 'Approved' ? 'bg-[#E8F2EA] text-[#275637]' : 'bg-[#FFF9E6] text-[#8C6D15]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MY SCANS */}
        {activeTab === 'scans' && (
          <div className="space-y-6 animate-card-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t('scan_diary_title')}</h2>
                <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                  Historical ResNet-18 diagnostic observations with Grad-CAM heatmaps
                </p>
              </div>
              <button 
                onClick={() => navigate('/detect')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                  isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{t('btn_new_scan')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  crop: 'Arecanut', 
                  disease: 'Koleroga (Fruit Rot)', 
                  confidence: '96.4%', 
                  severity: 'Stage 2 (Moderate)', 
                  date: 'Today, 10:14 AM',
                  img: '/samples/sample_arecanut.jpg',
                  status: 'Sprayed in Safe Window'
                },
                { 
                  crop: 'Paddy', 
                  disease: 'Blast Lesion', 
                  confidence: '91.2%', 
                  severity: 'Stage 1 (Mild)', 
                  date: 'Yesterday, 4:20 PM',
                  img: '/samples/sample_paddy.jpg',
                  status: 'Monitored'
                },
                { 
                  crop: 'Tomato', 
                  disease: 'Late Blight', 
                  confidence: '88.5%', 
                  severity: 'Stage 3 (Severe)', 
                  date: 'Oct 21, 2026',
                  img: '/samples/sample_tomato.jpg',
                  status: 'Resolved'
                }
              ].map((scan, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate('/detect/result', {
                    state: {
                      image: scan.img,
                      crop: scan.crop,
                      sampleId: scan.crop.toLowerCase(),
                      isOod: false
                    }
                  })}
                  className={`border rounded-[14px] p-5 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E]' : 'bg-white border-[#91BA94] hover:border-[#275637]'
                  }`}
                >
                  <div className="flex gap-3.5">
                    <img 
                      src={scan.img} 
                      alt={scan.disease} 
                      className="w-18 h-18 rounded-xl object-cover border border-[#91BA94]/40"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#22C55E]">{scan.crop}</span>
                        <span className="text-[10px] font-mono font-bold text-gray-400">{scan.confidence}</span>
                      </div>
                      <h4 className="font-extrabold text-sm mt-0.5">{scan.disease}</h4>
                      <p className={`text-[11px] mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        {scan.severity} • {scan.date}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                    isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'
                  }`}>
                    <span className="text-[#22C55E]">{scan.status}</span>
                    <span className="flex items-center gap-1 text-xs">
                      <span>View Grad-CAM</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MY LISTINGS (EQUIPMENT & LABOUR) */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-card-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Rural Equipment &amp; Labour Exchange</h2>
                <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                  Share high-pressure power sprayers or request urgent tree climbers before rains
                </p>
              </div>
              <button 
                onClick={() => setShowListingModal(true)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Listing</span>
              </button>
            </div>

            <div className="space-y-4">
              {listings.map((listing, idx) => (
                <div 
                  key={idx}
                  className={`border rounded-[14px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#22C55E]">
                      {listing.category}
                    </span>
                    <h4 className="font-extrabold text-base mt-1">{listing.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                      <span className="font-mono text-emerald-500 font-bold">{listing.rate}</span>
                      <span>•</span>
                      <span className={listing.status.includes('URGENT') ? 'text-amber-500' : 'text-emerald-500'}>
                        {listing.status}
                      </span>
                    </div>
                  </div>

                  <button className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                    isDark ? 'bg-[#162C20] border-[#22C55E]/40 text-white' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                  }`}>
                    Manage Listing
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS & ACCESSIBILITY */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-card-in">
            <div className={`border rounded-[14px] p-6 shadow-xs space-y-6 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <h2 className="text-xl font-bold">{t('settings_title')}</h2>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t('settings_lang')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'kn', label: 'ಕನ್ನಡ' },
                    { code: 'hi', label: 'हिंदी' }
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                        lang === l.code
                          ? isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
                          : isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#FAFCFA] border-[#D8E5DA] text-[#275637]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t('settings_theme')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
                      !isDark ? 'bg-[#275637] text-white border-[#275637]' : 'bg-[#0E1E16] border-[#1E3A2B] text-[#8BA695]'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>{t('settings_light')}</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#FAFCFA] border-[#D8E5DA] text-[#275637]'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{t('settings_dark')}</span>
                  </button>
                </div>
              </div>

              {/* Text Size (for sunlight legibility) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t('settings_text_size')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: t('settings_size_normal') },
                    { id: 'large', label: t('settings_size_large') },
                    { id: 'xlarge', label: t('settings_size_xlarge') }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setTextSize(s.id)}
                      className={`p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        textSize === s.id
                          ? isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
                          : isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#FAFCFA] border-[#D8E5DA] text-[#275637]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Demo Button */}
              <div className="pt-4 border-t border-[#91BA94]/30">
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Demo Sandbox Data to Factory Defaults</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ── CREATE LISTING MODAL ── */}
      {showListingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-[18px] border p-6 shadow-2xl animate-card-in ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base">
                Create Equipment or Labour Listing
              </h3>
              <button 
                onClick={() => setShowListingModal(false)}
                className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-[#8BA695]">Listing Type</label>
                <select 
                  value={listingCategory}
                  onChange={(e) => setListingCategory(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                >
                  <option value="Equipment Rental">Equipment Rental (Power Sprayer, Drones, Tools)</option>
                  <option value="Labour Request">Labour Request (Urgent Palm Climber, Harvester)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[#8BA695]">Title / Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 500L High-Pressure Power Sprayer for Rent"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 text-[#8BA695]">Rate / Price</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. ₹500 / day or ₹700 / acre"
                  value={listingRate}
                  onChange={(e) => setListingRate(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs transition-all cursor-pointer shadow-md"
              >
                Publish to Local Farm Network
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
