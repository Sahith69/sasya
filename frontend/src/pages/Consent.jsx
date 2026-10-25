// src/pages/Consent.jsx - Step 2: Spatial Privacy & Data Sharing Consent
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Wallet, ArrowRight } from 'lucide-react';

export default function Consent() {
  const navigate = useNavigate();
  const { lang, setLang, t, grantConsent } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleAgree = () => {
    if (!agreed) {
      setError('You must check the consent box to proceed.');
      return;
    }
    grantConsent();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col justify-center items-center px-4 py-8">
      {/* Top Bar with Consistent Trilingual Switcher */}
      <div className="w-full max-w-[500px] flex justify-end mb-3">
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

      <div className="w-full max-w-[500px]">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E8F2EA] border border-[#91BA94] text-2xl mb-3 shadow-sm">
            🛡️
          </div>
          <h1 className="text-2xl font-extrabold text-[#275637] tracking-tight">
            {t('consent_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#556B5C] font-medium mt-1">
            {t('consent_desc')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#91BA94] rounded-[14px] p-6 sm:p-7 shadow-xs space-y-5">
          
          {error && (
            <div className="bg-[#FDECEA] border border-[#B5483A] text-[#B5483A] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Point 1: District Outbreak Mapping */}
          <div className="flex gap-3.5 items-start">
            <div className="p-2.5 bg-[#E8F2EA] rounded-xl text-[#275637] shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#275637]">
                {t('consent_point1_title')}
              </h4>
              <p className="text-[12px] text-[#556B5C] font-normal mt-0.5 leading-relaxed">
                {t('consent_point1_desc')}
              </p>
            </div>
          </div>

          {/* Point 2: Zero Personal Data Exposure */}
          <div className="flex gap-3.5 items-start">
            <div className="p-2.5 bg-[#E8F2EA] rounded-xl text-[#275637] shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#275637]">
                {t('consent_point2_title')}
              </h4>
              <p className="text-[12px] text-[#556B5C] font-normal mt-0.5 leading-relaxed">
                {t('consent_point2_desc')}
              </p>
            </div>
          </div>

          {/* Point 3: Bounty Wallet Eligibility */}
          <div className="flex gap-3.5 items-start">
            <div className="p-2.5 bg-[#E8F2EA] rounded-xl text-[#275637] shrink-0 mt-0.5">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#275637]">
                {t('consent_point3_title')}
              </h4>
              <p className="text-[12px] text-[#556B5C] font-normal mt-0.5 leading-relaxed">
                {t('consent_point3_desc')}
              </p>
            </div>
          </div>

          {/* Checkbox */}
          <div className="pt-3 border-t border-[#E8F0E9]">
            <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#FAFCFA] border border-[#D8E4DA] rounded-xl hover:bg-[#F4F8F5] transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setError('');
                }}
                className="w-4 h-4 rounded text-[#275637] focus:ring-[#275637] mt-0.5"
              />
              <span className="text-xs font-semibold text-[#275637] leading-tight select-none">
                {t('consent_checkbox')}
              </span>
            </label>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAgree}
            className="w-full py-3.5 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <span>{t('enter_app_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
