// src/pages/ExpertQueue.jsx - Agricultural Scientist Pathology Review & Bounty Triage Desk
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, Eye, Shield, 
  Sun, Moon, Award, Sparkles, Filter, Clock, MapPin, 
  ThumbsUp, X, Check, MessageSquare
} from 'lucide-react';

const INITIAL_QUEUE = [
  {
    id: 'SUB-9402',
    farmer: 'Ramesh Gowda',
    village: 'Venur, Dakshina Kannada',
    crop: 'Arecanut',
    suspectedDisease: 'Koleroga (Fruit Rot)',
    pathogen: 'Phytophthora meadii',
    aiConfidence: '96.4%',
    aiSeverity: 'Grade 2 (Moderate: 8.4% lesion ratio)',
    image: '/samples/sample_arecanut.jpg',
    bountyAmount: 15.00,
    qualityScore: '94% (Sharp focus, visible perianth rot)',
    submittedAgo: '2 hours ago',
    status: 'Pending Review'
  },
  {
    id: 'SUB-9403',
    farmer: 'Kuldeep Sharma',
    village: 'Kotkhai, Shimla (HP)',
    crop: 'Apple',
    suspectedDisease: 'Apple Scab',
    pathogen: 'Venturia inaequalis',
    aiConfidence: '97.1%',
    aiSeverity: 'Grade 1 (Mild: 1.8% lesion ratio)',
    image: '/samples/sample_apple.jpg',
    bountyAmount: 15.00,
    qualityScore: '96% (High contrast, distinct margins)',
    submittedAgo: '4 hours ago',
    status: 'Pending Review'
  },
  {
    id: 'SUB-9404',
    farmer: 'Anand Rai',
    village: 'Tirthahalli, Shimoga',
    crop: 'Paddy',
    suspectedDisease: 'Leaf Blast',
    pathogen: 'Magnaporthe oryzae',
    aiConfidence: '94.8%',
    aiSeverity: 'Grade 2 (Moderate: 6.2% lesion ratio)',
    image: '/samples/sample_paddy.jpg',
    bountyAmount: 10.00,
    qualityScore: '91% (Spindle lesions clear)',
    submittedAgo: '6 hours ago',
    status: 'Pending Review'
  }
];

export default function ExpertQueue() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedSubId, setSelectedSubId] = useState('SUB-9402');
  const [showGradCam, setShowGradCam] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const currentItem = queue.find(q => q.id === selectedSubId) || queue[0];

  const handleApproveBounty = (subId) => {
    setActionSuccess(`✓ Approved ${subId}! Micro-bounty credited to farmer.`);
    setQueue(queue.map(q => q.id === subId ? { ...q, status: 'Approved & Disbursed' } : q));
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleRejectSubmission = (subId) => {
    setActionSuccess(`⚠️ Submission ${subId} marked as blurry/unusable.`);
    setQueue(queue.map(q => q.id === subId ? { ...q, status: 'Rejected' } : q));
    setTimeout(() => setActionSuccess(''), 4000);
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
                Pathologist Verification &amp; Dataset Desk
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#34D399]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                ICAR-CPCRI / KVK Portal
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Logged in as: <strong>Dr. Subrahmanya Bhat</strong> • Senior Plant Pathologist
            </p>
          </div>
        </div>

        {/* Right Header Controls: Language & Theme */}
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
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' : 'bg-[#275637] text-white shadow-xs'
                    : isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#275637] hover:bg-[#E8F2EA]'
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

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Toast Alert */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-[14px] bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-between gap-3 animate-card-in">
            <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Triage Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-[14px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8BA695]">Awaiting Review</div>
            <div className="text-2xl font-black text-amber-500 mt-1">3 Submissions</div>
            <div className="text-[10px] text-[#8BA695]">Karnataka &amp; HP regional pool</div>
          </div>

          <div className={`p-4 rounded-[14px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8BA695]">Verified Today</div>
            <div className="text-2xl font-black text-[#22C55E] mt-1">24 Leaves</div>
            <div className="text-[10px] text-[#8BA695]">Disbursed: ₹360 in bounties</div>
          </div>

          <div className={`p-4 rounded-[14px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8BA695]">Model Accuracy</div>
            <div className="text-2xl font-black text-[#22C55E] mt-1">96.8%</div>
            <div className="text-[10px] text-[#8BA695]">ResNet-18 + CORN Grader</div>
          </div>

          <div className={`p-4 rounded-[14px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8BA695]">Centroid Privacy</div>
            <div className="text-2xl font-black text-[#22C55E] mt-1">100% Active</div>
            <div className="text-[10px] text-[#8BA695]">k ≥ 5 spatial aggregation</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Queue List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#22C55E]" />
                <span>Field Specimen Submissions</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-[#162F20] text-[#8BA695]' : 'bg-[#E8F2EA] text-[#275637]'
              }`}>
                {queue.length} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {queue.map((item) => {
                const isSelected = selectedSubId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSubId(item.id)}
                    className={`p-3.5 rounded-[14px] border transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? isDark ? 'bg-[#142C1E] border-[#22C55E] ring-1 ring-[#22C55E]' : 'bg-[#E8F2EA] border-[#275637] ring-1 ring-[#275637]'
                        : isDark ? 'bg-[#102217] border-[#1E3A2B] hover:border-[#22C55E]/50' : 'bg-white border-[#91BA94] hover:bg-[#F9F9F6]'
                    }`}
                  >
                    <img 
                      src={item.image} 
                      alt={item.crop} 
                      className="w-16 h-16 rounded-xl object-cover border border-[#91BA94]/40 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] text-[#8BA695]">{item.id}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.status === 'Approved & Disbursed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold truncate mt-0.5">
                        {item.crop}: {item.suspectedDisease}
                      </h4>

                      <div className={`text-[11px] flex items-center gap-1 mt-0.5 ${
                        isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                      }`}>
                        <MapPin className="w-3 h-3 text-[#22C55E]" />
                        <span className="truncate">{item.farmer} • {item.village}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-semibold mt-1">
                        <span className="text-[#22C55E]">Bounty: ₹{item.bountyAmount.toFixed(2)}</span>
                        <span className="text-gray-400">{item.submittedAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Focused Specimen Verification Canvas (7 cols) */}
          <div className="lg:col-span-7">
            {currentItem && (
              <div className={`p-5 sm:p-6 rounded-[18px] border shadow-xs space-y-5 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
              }`}>
                
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-[#91BA94]/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#8BA695]">{currentItem.id}</span>
                      <span className="font-extrabold text-sm">{currentItem.crop} Pathology Triage</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight mt-0.5">
                      {currentItem.suspectedDisease}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                      Submitted by: <strong>{currentItem.farmer}</strong> ({currentItem.village})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGradCam(!showGradCam)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        showGradCam
                          ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]'
                          : isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showGradCam ? 'Grad-CAM Active' : 'Show Heatmap'}</span>
                    </button>
                  </div>
                </div>

                {/* Leaf Inspection Stage */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#91BA94]/40 shadow-inner bg-black/10 flex items-center justify-center">
                  <img 
                    src={currentItem.image} 
                    alt="Specimen inspection" 
                    className="w-full h-full object-cover"
                  />

                  {/* Grad-CAM Attention Heatmap overlay */}
                  {showGradCam && (
                    <div 
                      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-color-dodge opacity-80"
                      style={{ 
                        background: 'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.85) 0%, rgba(255,165,0,0.7) 35%, rgba(0,255,0,0.4) 60%, transparent 80%)'
                      }}
                    />
                  )}

                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-semibold">
                    Target: {currentItem.pathogen}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[10px] font-mono">
                    AI Confidence: {currentItem.aiConfidence}
                  </div>
                </div>

                {/* AI Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'}`}>
                    <div className="text-[10px] text-[#8BA695]">CORN Ordinal Grader</div>
                    <div className="font-bold text-[#22C55E] mt-0.5">{currentItem.aiSeverity}</div>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'}`}>
                    <div className="text-[10px] text-[#8BA695]">Focus &amp; Contrast</div>
                    <div className="font-bold text-[#22C55E] mt-0.5">{currentItem.qualityScore}</div>
                  </div>

                  <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'}`}>
                    <div className="text-[10px] text-[#8BA695]">Bounty to Release</div>
                    <div className="font-extrabold text-[#F6D05F] dark:text-[#FCD34D] mt-0.5">₹{currentItem.bountyAmount.toFixed(2)} INR</div>
                  </div>
                </div>

                {/* Expert Verification Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleApproveBounty(currentItem.id)}
                    className="flex-1 h-12 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Validate Diagnosis &amp; Disburse ₹{currentItem.bountyAmount.toFixed(2)} Bounty</span>
                  </button>

                  <button
                    onClick={() => handleRejectSubmission(currentItem.id)}
                    className={`px-5 h-12 rounded-[14px] font-bold text-xs border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                      isDark ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-700'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Quality</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}