// src/pages/Onboarding.jsx - Step 1: Language, Crops & Location Setup
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Check } from 'lucide-react';

const CROP_OPTIONS = [
  { id: 'Arecanut', name: 'Arecanut (ಅಡಿಕೆ)', icon: '🌴', defaultSelected: true },
  { id: 'Paddy', name: 'Paddy (ಭತ್ತ)', icon: '🌾', defaultSelected: true },
  { id: 'Tomato', name: 'Tomato (ಟೊಮೇಟೊ)', icon: '🍅', defaultSelected: false },
  { id: 'Apple', name: 'Apple (ಸೇಬು)', icon: '🍏', defaultSelected: false }
];

const DISTRICT_TALUKS = {
  'Dakshina Kannada': ['Belthangady', 'Mangaluru', 'Bantwal', 'Puttur', 'Sullia'],
  'Udupi': ['Udupi', 'Kundapura', 'Karkala'],
  'Shivamogga': ['Thirthahalli', 'Shivamogga', 'Sagara', 'Bhadravathi'],
  'Kolar': ['Kolar', 'Srinivaspur', 'Malur'],
  'Shimla': ['Theog', 'Shimla', 'Rohru'],
  'Mysuru': ['Hunsur', 'Mysuru', 'Nanjangud']
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { lang, setLang, t, user, updateOnboarding } = useAuth();

  const [selectedCrops, setSelectedCrops] = useState(user?.crops || ['Arecanut', 'Paddy']);
  const [district, setDistrict] = useState(user?.district || 'Dakshina Kannada');
  const [taluk, setTaluk] = useState(user?.taluk || 'Belthangady');

  const toggleCrop = (cropId) => {
    if (selectedCrops.includes(cropId)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== cropId));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  const handleDistrictChange = (d) => {
    setDistrict(d);
    setTaluk(DISTRICT_TALUKS[d]?.[0] || '');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    updateOnboarding({
      lang: lang,
      crops: selectedCrops,
      district: district,
      taluk: taluk,
      village: taluk // default village to taluk center
    });
    navigate('/onboarding/consent');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[500px]">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E8F2EA] border border-[#91BA94] text-2xl mb-3 shadow-sm">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold text-[#275637] tracking-tight">
            {t('onboarding_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#556B5C] font-medium mt-1">
            {t('onboarding_desc')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#91BA94] rounded-[14px] p-6 sm:p-7 shadow-xs space-y-6">
          
          {/* 1. Language Selection */}
          <div>
            <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-2.5">
              {t('select_lang')}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { code: 'kn', name: 'ಕನ್ನಡ', sub: 'Kannada' },
                { code: 'en', name: 'English', sub: 'Global' },
                { code: 'hi', name: 'हिंदी', sub: 'Hindi' }
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    lang === item.code
                      ? 'border-[#275637] bg-[#E8F5E9] shadow-xs'
                      : 'border-[#D8E4DA] bg-[#FAFCFA] hover:bg-[#F4F8F5]'
                  }`}
                >
                  <span className="font-extrabold text-sm text-[#275637]">{item.name}</span>
                  <span className="text-[10px] text-[#556B5C]">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Primary Crops Selection */}
          <div>
            <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-2.5">
              {t('select_crops')}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CROP_OPTIONS.map((c) => {
                const isSelected = selectedCrops.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCrop(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#275637] bg-[#E8F5E9] shadow-xs'
                        : 'border-[#D8E4DA] bg-[#FAFCFA] hover:bg-[#F4F8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.icon}</span>
                      <span className="text-xs font-bold text-[#275637]">{c.name}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#275637] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Farm Location */}
          <div>
            <label className="block text-xs font-bold text-[#275637] uppercase tracking-wider mb-2.5">
              {t('select_location')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#556B5C] mb-1">
                  {t('district_label')}
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-xs font-bold text-[#275637] focus:outline-none focus:ring-2 focus:ring-[#275637]"
                >
                  {Object.keys(DISTRICT_TALUKS).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#556B5C] mb-1">
                  {t('taluk_label')}
                </label>
                <select
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFCFA] border border-[#91BA94] rounded-xl text-xs font-bold text-[#275637] focus:outline-none focus:ring-2 focus:ring-[#275637]"
                >
                  {(DISTRICT_TALUKS[district] || []).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3.5 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 mt-4"
          >
            <span>{t('continue_btn')}</span>
          </button>

        </div>

      </div>
    </div>
  );
}
