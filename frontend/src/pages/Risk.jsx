// src/pages/Risk.jsx - 48-Hour Bioclimatic Weather Defense & Safe Spray Window
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, CloudRain, Sun, Moon, Droplets, Wind, 
  AlertTriangle, CheckCircle2, Clock, Shield, Volume2, 
  ChevronRight, Sparkles, MapPin, Activity, Thermometer
} from 'lucide-react';

const DISTRICTS = [
  { id: 'dakshina_kannada', name: 'Dakshina Kannada (Venur / Belthangady)', crop: 'Arecanut & Paddy', lat: 13.01, lon: 75.14 },
  { id: 'shimoga', name: 'Shimoga (Tirthahalli / Sagar)', crop: 'Arecanut & Paddy', lat: 13.69, lon: 75.24 },
  { id: 'chikkamagaluru', name: 'Chikkamagaluru (Koppa / Sringeri)', crop: 'Arecanut & Coffee', lat: 13.31, lon: 75.77 },
  { id: 'mandya', name: 'Mandya (Maddur / Pandavapura)', crop: 'Paddy & Sugarcane', lat: 12.52, lon: 76.89 },
  { id: 'shimla', name: 'Shimla (Kotkhai / Rohru)', crop: 'Apple', lat: 31.10, lon: 77.17 },
];

const CHEMICALS = [
  { id: 'bordeaux', name: 'Bordeaux Mixture (1%)', defaultDryHours: 4.0, withStickerDryHours: 2.0, rainTolerance: 'Moderate (12mm)', desc: 'Standard prophylactic fungicide against Koleroga (Phytophthora meadii).' },
  { id: 'coc', name: 'Copper Oxychloride (COC 50% WP)', defaultDryHours: 5.0, withStickerDryHours: 2.5, rainTolerance: 'Low (8mm)', desc: 'Contact fungicide; vulnerable to quick wash-off in heavy monsoon rain.' },
  { id: 'mancozeb', name: 'Mancozeb 75% WP', defaultDryHours: 4.5, withStickerDryHours: 2.0, rainTolerance: 'Moderate (10mm)', desc: 'Broad spectrum contact fungicide for early blight & fruit rot.' },
  { id: 'tricyclazole', name: 'Tricyclazole 75% WP', defaultDryHours: 3.0, withStickerDryHours: 1.5, rainTolerance: 'High (Systemic)', desc: 'Systemic blast fungicide rapidly absorbed through plant xylem.' },
];

// 48-Hour Mock Open-Meteo Curve
const HOURLY_TIMELINE = [
  { hour: 'Now (+0h)', time: '06:00', temp: 23, rh: 88, rainProb: 10, rainMm: 0.0, wind: 6, sporeRisk: 'Moderate', safe: true },
  { hour: '+3h', time: '09:00', temp: 26, rh: 78, rainProb: 15, rainMm: 0.0, wind: 8, sporeRisk: 'Low', safe: true },
  { hour: '+6h', time: '12:00', temp: 29, rh: 69, rainProb: 20, rainMm: 0.0, wind: 10, sporeRisk: 'Low', safe: true },
  { hour: '+9h', time: '15:00', temp: 28, rh: 72, rainProb: 25, rainMm: 0.0, wind: 9, sporeRisk: 'Moderate', safe: true },
  { hour: '+12h', time: '18:00', temp: 25, rh: 84, rainProb: 30, rainMm: 0.2, wind: 7, sporeRisk: 'Moderate', safe: true },
  { hour: '+15h', time: '21:00', temp: 23, rh: 91, rainProb: 40, rainMm: 0.5, wind: 6, sporeRisk: 'High', safe: true },
  { hour: '+18h', time: '00:00', temp: 22, rh: 94, rainProb: 55, rainMm: 1.2, wind: 8, sporeRisk: 'High (Spore Burst)', safe: true },
  { hour: '+22h', time: '04:00', temp: 21, rh: 98, rainProb: 88, rainMm: 14.2, wind: 16, sporeRisk: 'Severe Outbreak', safe: false },
  { hour: '+26h', time: '08:00', temp: 22, rh: 96, rainProb: 92, rainMm: 18.0, wind: 18, sporeRisk: 'Severe Washout', safe: false },
  { hour: '+30h', time: '12:00', temp: 24, rh: 93, rainProb: 85, rainMm: 12.5, wind: 15, sporeRisk: 'High Washout', safe: false },
  { hour: '+36h', time: '18:00', temp: 23, rh: 89, rainProb: 60, rainMm: 4.0, wind: 11, sporeRisk: 'Moderate', safe: false },
  { hour: '+48h', time: '06:00', temp: 22, rh: 85, rainProb: 35, rainMm: 0.8, wind: 7, sporeRisk: 'Moderate', safe: true },
];

export default function Risk() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  // District state
  const [selectedDistrict, setSelectedDistrict] = useState('dakshina_kannada');
  const [selectedChemical, setSelectedChemical] = useState('bordeaux');
  const [withSticker, setWithSticker] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentDist = DISTRICTS.find(d => d.id === selectedDistrict) || DISTRICTS[0];
  const currentChem = CHEMICALS.find(c => c.id === selectedChemical) || CHEMICALS[0];
  const dryingHoursNeeded = withSticker ? currentChem.withStickerDryHours : currentChem.defaultDryHours;

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    // Simple speech synthesis in browser if supported
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(
        "Sasya 48-Hour Spray Advisory. Safe spray window is open right now for the next 18 hours in Dakshina Kannada. Rain arrives at hour plus 22 with 14 millimeters per hour. Always add Rosin sticker to Bordeaux mixture."
      );
      msg.rate = 0.95;
      msg.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(msg);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
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
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#34D399]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                Open-Meteo Live
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
            <span>{isPlayingAudio ? 'Playing...' : t('risk_audio_btn')}</span>
          </button>

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
        
        {/* District Selector Header */}
        <div className={`p-4 rounded-[14px] border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#22C55E] shrink-0" />
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block text-[#8BA695]">
                Target Plantation Zone
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className={`text-xs font-bold rounded-lg border px-2.5 py-1 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                  isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                }`}
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.crop})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
              isDark ? 'bg-[#142C1E] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
            }`}>
              Open-Meteo High-Resolution (1.1km Grid)
            </span>
          </div>
        </div>

        {/* ── BIG HERO STATUS CARD ── */}
        <div className={`p-6 sm:p-8 rounded-[18px] border mb-8 shadow-sm ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                <span>CRITICAL SPRAY WINDOW OPEN NOW</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Next 18 Hours Safe for Application
              </h2>

              <p className={`text-sm max-w-2xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#556B5C]'}`}>
                Clear weather through 21:00 tonight. Severe convective rain arrives tomorrow at <strong>Hour +22 (04:00 AM)</strong> with intensity peaking at <strong>14.2 mm/hr</strong>. Complete all spraying before evening to ensure adhesion!
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
              <div className={`flex-1 p-3.5 rounded-xl border text-center ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]'
              }`}>
                <div className="text-[10px] font-bold text-[#8BA695] uppercase tracking-wider">
                  Rain Washout Threat
                </div>
                <div className="text-xl font-black text-rose-500 mt-0.5">
                  88% at +22h
                </div>
                <div className="text-[10px] text-[#8BA695]">
                  14.2 mm/hr downpour
                </div>
              </div>

              <div className={`flex-1 p-3.5 rounded-xl border text-center ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]'
              }`}>
                <div className="text-[10px] font-bold text-[#8BA695] uppercase tracking-wider">
                  Chemical Drying Margin
                </div>
                <div className="text-xl font-black text-[#22C55E] mt-0.5">
                  18.0h available
                </div>
                <div className="text-[10px] text-[#8BA695]">
                  Only {dryingHoursNeeded}h required
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 48-HOUR HOURLY TIMELINE ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#22C55E]" />
              <span>48-Hour Hourly Adhesion & Spore Forecast</span>
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
            }`}>
              Scroll horizontally ➔
            </span>
          </div>

          <div className="overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 min-w-max">
              {HOURLY_TIMELINE.map((step, idx) => (
                <div
                  key={idx}
                  className={`w-36 p-3.5 rounded-[14px] border transition-all duration-200 flex flex-col justify-between ${
                    step.safe
                      ? isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
                      : isDark ? 'bg-[#1A1110] border-rose-500/40' : 'bg-[#FFF5F5] border-rose-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{step.hour}</span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        {step.time}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className="mb-2.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border block text-center ${
                        step.safe
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {step.safe ? 'SAFE SPRAY' : 'WASHOUT RISK'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="opacity-75 flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-[#22C55E]" /> Temp:
                        </span>
                        <span className="font-bold">{step.temp}°C</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-75 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-400" /> RH:
                        </span>
                        <span className="font-bold">{step.rh}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-75 flex items-center gap-1">
                          <CloudRain className="w-3 h-3 text-indigo-400" /> Rain:
                        </span>
                        <span className={`font-bold ${step.rainMm > 5 ? 'text-rose-500' : ''}`}>
                          {step.rainMm} mm
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-75 flex items-center gap-1">
                          <Wind className="w-3 h-3 text-[#22C55E]" /> Wind:
                        </span>
                        <span className="font-bold">{step.wind} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Spore Risk Tag */}
                  <div className={`mt-3 pt-2 border-t text-[10px] font-semibold text-center truncate ${
                    isDark ? 'border-[#1E3A2B] text-[#8BA695]' : 'border-[#91BA94]/40 text-[#556B5C]'
                  }`}>
                    {step.sporeRisk}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CHEMICAL DRYING & ADJUVANT CALCULATOR ── */}
        <div className={`p-5 sm:p-6 rounded-[18px] border shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#22C55E]" />
              <span>Chemical Adhesion & Sticker Adjuvant Calculator</span>
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDark ? 'bg-[#162F20] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
            }`}>
              Farmer Economic Defense
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left: Chemical Selector & Sticker Toggle */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1.5">
                  Select Fungicide / Chemical Formulation:
                </label>
                <div className="space-y-2">
                  {CHEMICALS.map((chem) => (
                    <div
                      key={chem.id}
                      onClick={() => setSelectedChemical(chem.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedChemical === chem.id
                          ? isDark 
                            ? 'bg-[#142C1E] border-[#22C55E] ring-1 ring-[#22C55E]' 
                            : 'bg-[#E8F2EA] border-[#275637] ring-1 ring-[#275637]'
                          : isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{chem.name}</span>
                        <span className="text-[10px] font-semibold text-[#8BA695]">
                          Tol: {chem.rainTolerance}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        {chem.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rosin Sticker Adjuvant Toggle */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'
              }`}>
                <div>
                  <div className="text-xs font-bold">Add Rosin / Pinolene Sticker (100g / 100L)</div>
                  <div className={`text-[11px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    Halves required drying time and prevents copper runoff during torrential showers.
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

            {/* Right: Calculated Outcome Card */}
            <div className={`p-5 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'
            }`}>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#8BA695]">
                Calculated Advisory for {currentChem.name}
              </h4>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
                  <div className="text-[10px] text-[#8BA695]">Required Dry Time</div>
                  <div className="text-xl font-black text-[#22C55E] mt-0.5">
                    {dryingHoursNeeded} Hours
                  </div>
                  <div className="text-[9px] text-[#8BA695]">
                    {withSticker ? '✓ With Rosin Sticker' : '⚠️ No Sticker Added'}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
                  <div className="text-[10px] text-[#8BA695]">Safe Spray Deadline</div>
                  <div className="text-xl font-black text-[#275637] dark:text-emerald-400 mt-0.5">
                    Before 10:00 PM
                  </div>
                  <div className="text-[9px] text-[#8BA695]">
                    Rain at +22h (04:00 AM)
                  </div>
                </div>
              </div>

              {/* Economic Loss Prevention Callout */}
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-[#142C1E] border-[#22C55E]/30 text-gray-200' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                <strong>💰 Loss Prevention Insight:</strong>
                <p className="mt-1">
                  At ₹320/kg for copper sulphate and ₹1,200/day for climber labour, spraying inside this verified 18-hour window protects an estimated <strong>₹16,500 per acre</strong> against immediate rain washout.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/c/arecanut"
                  className="w-full h-11 rounded-xl bg-[#275637] hover:bg-[#1E462B] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span>Share Window Alert to r/arecanut Community</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}