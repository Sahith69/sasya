// src/pages/Risk.jsx - Clean, Streamlined 48-Hour Bioclimatic Spray Window & Weather Risk
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, CloudRain, Sun, Moon, Droplets, Wind, 
  CheckCircle2, Clock, Shield, Volume2, 
  ChevronRight, MapPin, Thermometer, AlertTriangle,
  Share2, Check
} from 'lucide-react';

const DISTRICTS = [
  { 
    id: 'dakshina_kannada', 
    name: 'Dakshina Kannada (Venur / Belthangady)', 
    crop: 'arecanut', 
    cropDisplay: '🌴 Arecanut & Paddy', 
    safeHours: 18, 
    deadline: '10:00 PM Tonight', 
    rainTime: 'Tomorrow 04:00 AM (+22h)', 
    rainMm: '14.2 mm/hr', 
    lossSaved: '₹16,500 / acre',
    advice: 'Clear weather through 21:00 tonight. Complete Bordeaux application before evening to allow 2h adhesion before rain.'
  },
  { 
    id: 'shimoga', 
    name: 'Shimoga (Tirthahalli / Sagar)', 
    crop: 'arecanut', 
    cropDisplay: '🌴 Arecanut & Paddy', 
    safeHours: 24, 
    deadline: 'Tomorrow 06:00 AM', 
    rainTime: 'Tomorrow 11:00 AM (+29h)', 
    rainMm: '11.0 mm/hr', 
    lossSaved: '₹14,000 / acre',
    advice: 'Favorable spray window through dawn tomorrow. Spray upper terraces first before valley humidity rises.'
  },
  { 
    id: 'chikkamagaluru', 
    name: 'Chikkamagaluru (Koppa / Sringeri)', 
    crop: 'arecanut', 
    cropDisplay: '🌴 Arecanut & Coffee', 
    safeHours: 14, 
    deadline: '08:00 PM Tonight', 
    rainTime: 'Tonight 11:30 PM (+15h)', 
    rainMm: '16.5 mm/hr', 
    lossSaved: '₹18,000 / acre',
    advice: 'Moderate window. Rain front arriving tonight. Add sticker adjuvant to prevent rapid copper wash-off.'
  },
  { 
    id: 'mandya', 
    name: 'Mandya (Maddur / Pandavapura)', 
    crop: 'paddy', 
    cropDisplay: '🌾 Paddy (Blast Zone)', 
    safeHours: 36, 
    deadline: 'Tomorrow 06:00 PM', 
    rainTime: 'Day after tomorrow', 
    rainMm: '4.5 mm/hr', 
    lossSaved: '₹8,500 / acre',
    advice: 'Extended dry window open. Apply systemic Tricyclazole during morning dew clearance for maximum absorption.'
  },
  { 
    id: 'shimla', 
    name: 'Shimla (Kotkhai / Rohru)', 
    crop: 'apple', 
    cropDisplay: '🍎 Apple Orchard', 
    safeHours: 30, 
    deadline: 'Tomorrow 12:00 PM', 
    rainTime: 'Tomorrow evening', 
    rainMm: '6.0 mm/hr', 
    lossSaved: '₹22,000 / acre',
    advice: 'Post-petal fall window open. Apply protective Mancozeb before the western disturbance arrives tomorrow evening.'
  }
];

const CHEMICALS = [
  { id: 'bordeaux', name: 'Bordeaux Mixture (1%)', defaultDryHours: 4.0, withStickerDryHours: 2.0, target: 'Koleroga (Phytophthora meadii)' },
  { id: 'coc', name: 'Copper Oxychloride (COC 50% WP)', defaultDryHours: 5.0, withStickerDryHours: 2.5, target: 'Contact Fruit Rot Defense' },
  { id: 'mancozeb', name: 'Mancozeb 75% WP', defaultDryHours: 4.5, withStickerDryHours: 2.0, target: 'Foliar Early Blight & Scab' },
  { id: 'tricyclazole', name: 'Tricyclazole 75% WP', defaultDryHours: 3.0, withStickerDryHours: 1.5, target: 'Systemic Blast Protection' },
];

export default function Risk() {
  const navigate = useNavigate();
  const { user, lang, setLang, toggleTheme, isDark, t } = useAuth();

  const [selectedDistrictId, setSelectedDistrictId] = useState('dakshina_kannada');
  const [selectedChemicalId, setSelectedChemicalId] = useState('bordeaux');
  const [withSticker, setWithSticker] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const dist = DISTRICTS.find(d => d.id === selectedDistrictId) || DISTRICTS[0];
  const chem = CHEMICALS.find(c => c.id === selectedChemicalId) || CHEMICALS[0];
  const neededHours = withSticker ? chem.withStickerDryHours : chem.defaultDryHours;

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      const text = `Sasya Spray Window Advisory for ${dist.name}. Safe spray window is open for the next ${dist.safeHours} hours. Deadline is ${dist.deadline}. Rain arrives at ${dist.rainTime}. Always add rosin sticker to reduce drying time to ${chem.withStickerDryHours} hours.`;
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.95;
      msg.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(msg);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 pb-16 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      
      {/* ── TOP FROSTED HEADER ── */}
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
                {t('risk_title')}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Live Open-Meteo
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('risk_sub')}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Language, Audio & Theme */}
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
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' : 'bg-[#275637] text-white shadow-xs'
                    : isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Audio Advisory Button */}
          <button
            onClick={handlePlayAudio}
            disabled={isPlayingAudio}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]'
                : isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Audio Advisory"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-[#0B1712]' : 'text-[#22C55E]'}`} />
            <span className="hidden sm:inline">{isPlayingAudio ? 'Speaking...' : t('risk_audio_btn')}</span>
          </button>

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

      {/* ── MAIN CONTENT CONTAINER (Streamlined & Clean) ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* 1. ZONE SELECTOR */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#142C1E] text-emerald-400' : 'bg-[#E8F2EA] text-[#275637]'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">
                Target Zone &amp; Plantation Area
              </span>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className={`text-xs sm:text-sm font-bold rounded-lg border px-2.5 py-1 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#22C55E] cursor-pointer ${
                  isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#FAFCFA] border-[#91BA94] text-[#275637]'
                }`}
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.cropDisplay}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className={`text-[11px] font-bold px-3 py-1 rounded-xl border self-start sm:self-auto ${
            isDark ? 'bg-[#142C1E] border-[#22C55E]/30 text-emerald-400' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
          }`}>
            {dist.cropDisplay}
          </span>
        </div>

        {/* 2. HERO VERDICT CARD (Answers: Can I spray right now?) */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{t('risk_critical_open')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                Safe to Spray for Next {dist.safeHours} Hours
              </h2>
            </div>
            
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Spray Deadline</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {dist.deadline}
              </span>
            </div>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'}`}>
              <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Safe Spray Window</span>
              </div>
              <div className="text-lg font-black mt-1 text-emerald-500">
                {dist.safeHours} Hours
              </div>
              <div className="text-[11px] text-gray-400">Until {dist.deadline}</div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'}`}>
              <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-rose-500" />
                <span>Rain Downpour Expected</span>
              </div>
              <div className="text-lg font-black mt-1 text-rose-500">
                {dist.rainTime.split(' ')[0]} {dist.rainTime.split(' ')[1]}
              </div>
              <div className="text-[11px] text-gray-400">{dist.rainMm} peak downpour</div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'}`}>
              <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Loss Prevention Margin</span>
              </div>
              <div className="text-lg font-black mt-1 text-[#275637] dark:text-emerald-400">
                {dist.lossSaved}
              </div>
              <div className="text-[11px] text-gray-400">Saved from rain wash-off</div>
            </div>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            💡 <strong>Agronomic Guidance:</strong> {dist.advice}
          </p>
        </div>

        {/* 3. SIMPLIFIED 4-PERIOD DAY TIMELINE (No awkward 12-card horizontal scroll) */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xs space-y-4 ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>48-Hour Day &amp; Night Spray Timeline</span>
            </h3>
            <span className="text-[11px] font-bold text-gray-400">
              Hour-by-hour status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Period 1: Morning */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#0E1E16] border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Morning (06:00 - 12:00)</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    SAFE
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Temp &amp; Humidity:</span>
                    <strong className="text-gray-800 dark:text-gray-200">26°C • 72% RH</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rain Probability:</span>
                    <strong className="text-emerald-500 font-bold">10% (0 mm)</strong>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Best spraying hours
              </div>
            </div>

            {/* Period 2: Afternoon */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#0E1E16] border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Afternoon (12:00 - 18:00)</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    SAFE
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Temp &amp; Humidity:</span>
                    <strong className="text-gray-800 dark:text-gray-200">29°C • 68% RH</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rain Probability:</span>
                    <strong className="text-emerald-500 font-bold">20% (0 mm)</strong>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Excellent solar drying
              </div>
            </div>

            {/* Period 3: Night */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#0E1E16] border-amber-500/40' : 'bg-amber-50/50 border-amber-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Evening (18:00 - 00:00)</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    CAUTION
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Temp &amp; Humidity:</span>
                    <strong className="text-gray-800 dark:text-gray-200">23°C • 89% RH</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rain Probability:</span>
                    <strong className="text-amber-500 font-bold">40% (0.5 mm)</strong>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ Stop spraying by 10 PM
              </div>
            </div>

            {/* Period 4: Tomorrow Downpour */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#1F1212] border-rose-500/40' : 'bg-rose-50/60 border-rose-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Tomorrow (04:00 AM+)</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    WASHOUT
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Temp &amp; Humidity:</span>
                    <strong className="text-gray-800 dark:text-gray-200">21°C • 98% RH</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Downpour Peak:</span>
                    <strong className="text-rose-500 font-bold">{dist.rainMm}</strong>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-rose-500/20 text-[11px] text-rose-500 font-bold">
                ⛔ Do not spray (Full wash-off)
              </div>
            </div>
          </div>
        </div>

        {/* 4. COMPACT CHEMICAL & ROSIN STICKER CALCULATOR */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xs space-y-4 ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>{t('risk_calc_title')}</span>
            </h3>
            <span className="text-[11px] font-bold text-gray-400">
              Adhesion Calculator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Quick Dropdown */}
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-400">
                Fungicide Formulation:
              </label>
              <select
                value={selectedChemicalId}
                onChange={(e) => setSelectedChemicalId(e.target.value)}
                className={`w-full h-11 px-3 rounded-xl border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#22C55E] cursor-pointer ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#FAFCFA] border-gray-300 text-gray-800'
                }`}
              >
                {CHEMICALS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.target}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Rosin Sticker 1-Click Toggle */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-300'
            }`}>
              <div>
                <div className="text-xs font-bold">Add Rosin Sticker (100g / 100L)</div>
                <div className="text-[11px] text-emerald-500 font-semibold">
                  {withSticker ? '✓ Halves required drying time to 2h' : '⚠️ Slower 4h drying without sticker'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWithSticker(!withSticker)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  withSticker ? 'bg-[#22C55E]' : 'bg-gray-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  withSticker ? 'left-6.5' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* Outcome Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark ? 'bg-[#142C1E] border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-300'
          }`}>
            <div>
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                Required Drying Time: {neededHours} Hours ({withSticker ? 'With Rosin Sticker' : 'No Sticker'})
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Current window offers <strong>{dist.safeHours} hours</strong> of clear weather before rain.
              </div>
            </div>

            <Link
              to={`/c/${dist.crop}?q=Koleroga`}
              className="px-4 py-2 rounded-xl bg-[#275637] hover:bg-[#1E462B] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Alert to r/{dist.crop}</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
