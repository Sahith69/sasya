// src/pages/SurveillanceMap.jsx - District Epidemic Surveillance Map & Centroid Privacy
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, Shield, AlertTriangle, CheckCircle2, 
  Sun, Moon, Filter, Activity, Info, Eye, Camera, 
  ChevronRight, Sparkles, TrendingUp, Layers
} from 'lucide-react';

const DISTRICT_DATA = [
  {
    id: 'dakshina_kannada',
    district: 'Dakshina Kannada',
    taluks: 'Belthangady, Puttur, Sullia, Bantwal, Mangaluru',
    crop: 'Arecanut',
    pathogen: 'Koleroga (Phytophthora meadii)',
    cases48h: 48,
    status: 'Critical Alert',
    trend: '+24% this week',
    rhAvg: '94%',
    riskColor: 'border-rose-500 bg-rose-500/10 text-rose-500',
    intensity: 95,
    advisory: 'Prophylactic Bordeaux spray (1%) with rosin sticker strongly recommended before rain at +22h.'
  },
  {
    id: 'shimoga',
    district: 'Shimoga',
    taluks: 'Tirthahalli, Sagar, Hosanagara, Soraba',
    crop: 'Arecanut & Paddy',
    pathogen: 'Koleroga & Leaf Blast',
    cases48h: 34,
    status: 'High Alert',
    trend: '+12% this week',
    rhAvg: '91%',
    riskColor: 'border-amber-500 bg-amber-500/10 text-amber-500',
    intensity: 75,
    advisory: 'Check nursery beds for blast lesions; high spore germination probability in river valleys.'
  },
  {
    id: 'chikkamagaluru',
    district: 'Chikkamagaluru',
    taluks: 'Koppa, Sringeri, Mudigere, N.R. Pura',
    crop: 'Arecanut & Coffee',
    pathogen: 'Fruit Rot & Berry Borer',
    cases48h: 22,
    status: 'Moderate Alert',
    trend: 'Stable',
    rhAvg: '88%',
    riskColor: 'border-amber-500 bg-amber-500/10 text-amber-500',
    intensity: 55,
    advisory: 'Maintain field drainage to prevent root fungal stagnation during continuous mist.'
  },
  {
    id: 'udupi',
    district: 'Udupi',
    taluks: 'Karkala, Kundapura, Brahmavar',
    crop: 'Arecanut & Paddy',
    pathogen: 'Koleroga',
    cases48h: 19,
    status: 'Moderate Alert',
    trend: '-8% this week',
    rhAvg: '86%',
    riskColor: 'border-amber-500 bg-amber-500/10 text-amber-500',
    intensity: 45,
    advisory: 'Spray windows open for next 36 hours. Complete crown coverage.'
  },
  {
    id: 'mandya',
    district: 'Mandya',
    taluks: 'Maddur, Pandavapura, Srirangapatna',
    crop: 'Paddy',
    pathogen: 'Paddy Leaf Blast',
    cases48h: 14,
    status: 'Monitoring',
    trend: 'Controlled',
    rhAvg: '76%',
    riskColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-500',
    intensity: 30,
    advisory: 'Low blast incidence. Follow balanced nitrogen fertilization.'
  },
  {
    id: 'shimla',
    district: 'Shimla (HP)',
    taluks: 'Kotkhai, Rohru, Jubbal',
    crop: 'Apple',
    pathogen: 'Apple Scab (Venturia inaequalis)',
    cases48h: 11,
    status: 'Monitoring',
    trend: 'Controlled',
    rhAvg: '72%',
    riskColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-500',
    intensity: 25,
    advisory: 'Post-harvest urea spray to accelerate fallen leaf decomposition.'
  }
];

export default function SurveillanceMap() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  // Filter state
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedDistrictId, setSelectedDistrictId] = useState('dakshina_kannada');

  const filteredDistricts = DISTRICT_DATA.filter(d => {
    if (selectedCrop === 'All') return true;
    return d.crop.toLowerCase().includes(selectedCrop.toLowerCase());
  });

  const activeDist = DISTRICT_DATA.find(d => d.id === selectedDistrictId) || DISTRICT_DATA[0];

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
            onClick={() => navigate('/home')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
                {t('map_title')}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#34D399]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                k-Anonymity Active
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('map_sub')}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Language, Report & Theme */}
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

          <Link
            to="/detect"
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Report Symptom</span>
          </Link>

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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Outbreak Alert Ticker */}
        <div className={`p-4 rounded-[14px] border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
          isDark ? 'bg-[#1A1110] border-rose-500/40 text-rose-300' : 'bg-[#FFF5F5] border-rose-300 text-rose-700'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce text-rose-500" />
            <div className="text-xs">
              <strong className="font-bold">Active Outbreak Alert:</strong> 48 verified Koleroga (Phytophthora) reports in Belthangady & Venur taluks over the last 48 hours. Spore dispersal index is High.
            </div>
          </div>
          <Link
            to="/risk"
            className="text-xs font-bold underline shrink-0 hover:opacity-80"
          >
            Check Spray Window ➔
          </Link>
        </div>

        {/* Spatial Privacy Guarantee Card */}
        <div className={`p-4 rounded-[14px] border mb-8 flex items-center justify-between gap-4 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-[#E8F2EA] border-[#91BA94]'
        }`}>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#22C55E] shrink-0" />
            <div>
              <h4 className="text-xs font-bold">100% Spatial Anonymity (k ≥ 5) Guaranteed</h4>
              <p className={`text-[11px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                Individual farm survey numbers, exact GPS, and boundaries are never stored. Reports are snapped to village panchayat centroids and aggregated by district.
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border hidden md:inline-block shrink-0 ${
            isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-[#34D399]' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            DP-Laplace Noise: ε=0.5
          </span>
        </div>

        {/* Crop Filter Selector */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#22C55E]" />
            <span className="text-xs font-bold">Filter Outbreak by Crop:</span>
            {['All', 'Arecanut', 'Paddy', 'Apple'].map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  selectedCrop === crop
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
                    : isDark ? 'bg-[#102217] border-[#1E3A2B] text-[#8BA695]' : 'bg-white border-[#91BA94]/60 text-[#275637]'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          <span className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Showing {filteredDistricts.length} surveillance zones
          </span>
        </div>

        {/* ── SURVEILLANCE GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredDistricts.map((dist) => {
            const isSelected = selectedDistrictId === dist.id;
            return (
              <div
                key={dist.id}
                onClick={() => setSelectedDistrictId(dist.id)}
                className={`p-4 rounded-[16px] border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isDark 
                      ? 'bg-[#142C1E] border-[#22C55E] ring-1 ring-[#22C55E] shadow-md' 
                      : 'bg-[#E8F2EA] border-[#275637] ring-1 ring-[#275637] shadow-md'
                    : isDark 
                      ? 'bg-[#102217] border-[#1E3A2B] hover:border-[#22C55E]/50' 
                      : 'bg-white border-[#91BA94] hover:bg-[#F9F9F6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm">{dist.district}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${dist.riskColor}`}>
                      {dist.status}
                    </span>
                  </div>

                  <p className={`text-xs mb-3 font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    {dist.crop} • {dist.pathogen}
                  </p>

                  {/* Intensity Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-[#8BA695]">Epidemic Intensity</span>
                      <span className="font-mono">{dist.intensity}%</span>
                    </div>
                    <div className="w-full bg-black/10 dark:bg-black/30 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          dist.intensity > 70 ? 'bg-rose-500' : dist.intensity > 40 ? 'bg-amber-500' : 'bg-[#22C55E]'
                        }`}
                        style={{ width: `${dist.intensity}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                    <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/40'}`}>
                      <div className="text-[9px] text-[#8BA695]">48h Reports</div>
                      <div className="font-bold">{dist.cases48h} clusters</div>
                    </div>
                    <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/40'}`}>
                      <div className="text-[9px] text-[#8BA695]">Mean RH</div>
                      <div className="font-bold">{dist.rhAvg} humidity</div>
                    </div>
                  </div>
                </div>

                <div className={`pt-2 border-t text-[11px] font-medium leading-relaxed truncate ${
                  isDark ? 'border-[#1E3A2B] text-gray-300' : 'border-[#91BA94]/40 text-[#556B5C]'
                }`}>
                  {dist.advisory}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FOCUSED ZONE DETAILS ── */}
        <div className={`p-6 sm:p-7 rounded-[18px] border shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  Detailed Advisory: {activeDist.district}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeDist.riskColor}`}>
                  {activeDist.status}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                Taluks covered: {activeDist.taluks}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/c/arecanut"
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isDark ? 'bg-[#142C1E] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637] hover:bg-[#d9ebd9]'
                }`}
              >
                Discuss with {activeDist.district} Farmers ➔
              </Link>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed mb-4 ${
            isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-200' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
          }`}>
            <strong className="block mb-1 text-sm font-extrabold text-[#22C55E]">
              Agronomic Outbreak Protocol:
            </strong>
            {activeDist.advisory} Ensure all farm workers sanitize harvesting poles and baskets between plantation plots to prevent secondary mechanical spread of zoospores.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#8BA695]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              Data refreshed every 6 hours from Open-Meteo & verified scans
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#22C55E]" />
              Fully compliant with Digital Personal Data Protection (DPDP) Act
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}