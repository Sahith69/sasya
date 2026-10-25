// src/pages/EditProfile.jsx - Dedicated Farmer Profile Editor (Consistent with App Design System)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, User, Phone, MapPin, CheckCircle2, 
  Shield, Sun, Moon, Sparkles, Sprout, Landmark, 
  Save, X
} from 'lucide-react';

const ALL_CROPS = [
  { id: 'Arecanut', name: 'Arecanut (ಅಡಿಕೆ / सुपारी)', icon: '🌴' },
  { id: 'Paddy', name: 'Paddy (ಭತ್ತ / धान)', icon: '🌾' },
  { id: 'Apple', name: 'Apple (ಸೇಬು / सेब)', icon: '🍎' },
  { id: 'Tomato', name: 'Tomato (ಟೊಮೆಟೊ / टमाटर)', icon: '🍅' },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  // Form state initialized from current user
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '00000 10101');
  const [landSize, setLandSize] = useState(user?.landSize || '4.0 Acres');
  const [stateName, setStateName] = useState(user?.state || 'Karnataka');
  const [district, setDistrict] = useState(user?.district || 'Dakshina Kannada');
  const [taluk, setTaluk] = useState(user?.taluk || 'Belthangady');
  const [village, setVillage] = useState(user?.village || 'Venur');
  const [upiId, setUpiId] = useState(user?.upiId || 'ramesh@oksbi');
  const [selectedCrops, setSelectedCrops] = useState(user?.crops || ['Arecanut', 'Paddy']);
  const [preferredLang, setPreferredLang] = useState(lang || 'en');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleCrop = (cropId) => {
    if (selectedCrops.includes(cropId)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter(c => c !== cropId));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const updatedData = {
      name: name.trim(),
      phone: phone.trim(),
      landSize: landSize.trim(),
      state: stateName,
      district: district.trim(),
      taluk: taluk.trim(),
      village: village.trim(),
      upiId: upiId.trim(),
      crops: selectedCrops,
      lang: preferredLang
    };

    updateProfile(updatedData);
    setSavedSuccess(true);

    setTimeout(() => {
      navigate('/profile?tab=profile');
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      {/* ── TOP NAVIGATION ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-16 flex items-center justify-between ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile?tab=profile')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
              {t('edit_profile_title')}
            </h1>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('edit_profile_sub')}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Theme & Language */}
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
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

          {/* Theme Toggle */}
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

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Success Alert Banner */}
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-[14px] bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] flex items-center gap-3 animate-card-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div className="text-xs font-bold">
              ✓ Profile changes saved successfully! Returning to profile...
            </div>
          </div>
        )}

        {/* Editor Card */}
        <div className={`p-6 sm:p-8 rounded-[18px] border shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#91BA94]/30">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 ${
              isDark ? 'bg-[#162F20] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
            }`}>
              🌾
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {name || 'Farmer Profile'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                Farmer ID: <strong className="font-mono">{user?.username || 'Grower'}</strong> • Centroid Privacy Active
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5 text-xs font-semibold">
            
            {/* Full Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-[#8BA695]">{t('label_full_name') || 'Farmer Full Name'}</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#22C55E]" />
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('placeholder_full_name') || "e.g. Ramesh Gowda"}
                    className={`w-full h-10 pl-9 pr-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                      isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-[#8BA695]">{t('label_phone_number') || 'Mobile Number'}</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-[#22C55E]" />
                  <input 
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('placeholder_phone_number') || "e.g. 98450 12345"}
                    className={`w-full h-10 pl-9 pr-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                      isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Farm Land Size & Linked UPI ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-[#8BA695]">{t('label_land_size') || 'Farm Land Size (Acres / Gunta)'}</label>
                <div className="relative">
                  <Sprout className="w-4 h-4 absolute left-3 top-3 text-[#22C55E]" />
                  <input 
                    type="text"
                    required
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    placeholder={t('placeholder_land_size') || "e.g. 4.0 Acres"}
                    className={`w-full h-10 pl-9 pr-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                      isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-[#8BA695]">{t('label_upi_id') || 'Linked UPI ID (For Micro-Bounties)'}</label>
                <div className="relative">
                  <Landmark className="w-4 h-4 absolute left-3 top-3 text-[#22C55E]" />
                  <input 
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder={t('placeholder_upi_id') || "e.g. ramesh@oksbi"}
                    className={`w-full h-10 pl-9 pr-3 rounded-xl border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                      isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Location (District, Taluk, Village) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1.5 text-[#8BA695]">{t('label_district') || 'District'}</label>
                <input 
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={t('placeholder_district') || "e.g. Dakshina Kannada"}
                  className={`w-full h-10 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[#8BA695]">{t('label_taluk_village') || 'Taluk / Tehsil'}</label>
                <input 
                  type="text"
                  required
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  placeholder={t('placeholder_taluk') || "e.g. Belthangady"}
                  className={`w-full h-10 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[#8BA695]">{t('label_village') || 'Village / Panchayat'}</label>
                <input 
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={t('placeholder_village') || "e.g. Venur"}
                  className={`w-full h-10 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>
            </div>

            {/* Primary Crops Selector */}
            <div>
              <label className="block mb-2 text-[#8BA695]">{t('label_what_you_grow') || 'Primary Crops Cultivated'}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ALL_CROPS.map((c) => {
                  const isChecked = selectedCrops.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCrop(c.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        isChecked
                          ? isDark 
                            ? 'bg-[#142C1E] border-[#22C55E] ring-1 ring-[#22C55E]' 
                            : 'bg-[#E8F2EA] border-[#275637] ring-1 ring-[#275637]'
                          : isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'
                      }`}
                    >
                      <span className="text-base">{c.icon}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{c.id}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spatial Privacy Centroid Pill */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
              isDark ? 'bg-[#142C1E] border-[#22C55E]/30 text-[#8BA695]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
            }`}>
              <Shield className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>
                <strong>Zero Cadastral Data:</strong> All disease reports are centroid-truncated to {village || 'village'} panchayat. Your personal land survey numbers are never collected or stored.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#91BA94]/30">
              <button
                type="submit"
                className="flex-1 h-12 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{t('save_profile_btn')}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile?tab=profile')}
                className={`px-6 h-12 rounded-[14px] font-bold text-xs border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                  isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
                }`}
              >
                <X className="w-4 h-4" />
                <span>{t('cancel_btn')}</span>
              </button>
            </div>

          </form>

        </div>

      </main>
    </div>
  );
}