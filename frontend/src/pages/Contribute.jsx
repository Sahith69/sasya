// src/pages/Contribute.jsx - Farmer Research Contribution Desk
// Enables farmers to donate leaf specimen photos to train open crop AI models for smallholders
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, UploadCloud, Camera, Upload, CheckCircle2, 
  Sparkles, Shield, Sun, Moon, MapPin, User, Settings,
  Award, Clock, X, Cpu, Check, AlertTriangle
} from 'lucide-react';

const CROP_OPTIONS = [
  { id: 'Arecanut', name: 'Arecanut (ಅಡಿಕೆ)' },
  { id: 'Paddy', name: 'Paddy (ಭತ್ತ)' },
  { id: 'Tomato', name: 'Tomato (ಟೊಮೆಟೊ)' },
  { id: 'Apple', name: 'Apple (ಸೇಬು)' }
];

const CONDITION_PRESETS = [
  'Koleroga / Fruit Rot (Phytophthora meadii)',
  'Yellow Leaf Disease (Phytoplasma)',
  'Anabe Roga / Foot Rot (Ganoderma lucidum)',
  'Inflorescence Die-Back',
  'Blast / Leaf Blight',
  'Healthy Specimen (Baseline Control)',
  'Other / Unidentified Anomaly'
];

const INITIAL_CONTRIBUTIONS = [
  {
    id: 'DON-8821',
    crop: 'Arecanut',
    condition: 'Koleroga (Phytophthora meadii)',
    date: 'Oct 23, 2026',
    qualityScore: '94% Quality',
    status: 'Verified by Agronomist',
    image: '/samples/sample_arecanut.jpg'
  },
  {
    id: 'DON-7940',
    crop: 'Paddy',
    condition: 'Leaf Blast (Magnaporthe oryzae)',
    date: 'Oct 18, 2026',
    qualityScore: '89% Quality',
    status: 'Added to Open Training Set',
    image: '/samples/sample_paddy.jpg'
  },
  {
    id: 'DON-6512',
    crop: 'Arecanut',
    condition: 'Yellow Leaf Disease (YLD)',
    date: 'Oct 10, 2026',
    qualityScore: '91% Quality',
    status: 'Published in Open Agronomy Archive',
    image: '/samples/sample_arecanut.jpg'
  }
];

export default function Contribute() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t, logout } = useAuth();

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const [selectedCrop, setSelectedCrop] = useState('Arecanut');
  const [selectedCondition, setSelectedCondition] = useState(CONDITION_PRESETS[0]);
  const [notes, setNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Contributions List
  const [contributions, setContributions] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_contributions_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CONTRIBUTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sasya_contributions_list', JSON.stringify(contributions));
    } catch {}
  }, [contributions]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Start Live Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      setSelectedImage(null);
      setUploadedFile(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play error:", e));
        }
      }, 100);
    } catch (err) {
      console.warn("Camera getUserMedia error:", err);
      setCameraError("Camera unavailable or permission denied. Please choose an image file.");
      setIsCameraActive(false);
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setSelectedImage(dataUrl);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `contrib_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setUploadedFile(file);
      }
    }, 'image/jpeg', 0.92);

    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleSubmitContribution = (e) => {
    e.preventDefault();
    if (!selectedImage && !uploadedFile) {
      showToast('Please capture or upload a leaf photo to contribute.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const newEntry = {
        id: `DON-${Math.floor(1000 + Math.random() * 9000)}`,
        crop: selectedCrop,
        condition: selectedCondition,
        date: 'Today (Just now)',
        qualityScore: '96% Quality',
        status: 'Submitted for Review',
        image: selectedImage || '/samples/sample_arecanut.jpg'
      };

      setContributions([newEntry, ...contributions]);
      setSelectedImage(null);
      setUploadedFile(null);
      setNotes('');
      showToast(`✓ Specimen donated! Thank you for advancing open crop science.`);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 pb-20 md:pb-8 ${
      isDark 
        ? 'bg-[#0B1712] text-white selection:bg-[#22C55E] selection:text-[#0B1712]' 
        : 'bg-[#F9F9F6] text-[#275637] selection:bg-[#B1D27D] selection:text-[#275637]'
    }`}>

      {/* ── TOP FROSTED NAVBAR (MATCHES HOMEPAGE EXACTLY) ── */}
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

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
              <Link 
                to="/home"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/c/arecanut"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                Community
              </Link>
              <Link 
                to="/detect"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                Detect
              </Link>
              <Link 
                to="/contribute"
                className={`px-3.5 py-2 rounded-xl font-bold transition-all duration-200 ${
                  isDark 
                    ? 'bg-[#12241A] text-[#22C55E]' 
                    : 'bg-[#E8F2EA] text-[#275637]'
                }`}
              >
                Contribute
              </Link>
              <Link 
                to="/map"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                Map
              </Link>
            </nav>
          </div>

          {/* Right: Theme, Language & Profile Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer shadow-xs ${
                isDark 
                  ? 'bg-[#12241A] border-[#1E3A2B] text-[#FCD34D] hover:bg-[#183526]' 
                  : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-45" />
              )}
            </button>

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
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
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

            {/* Profile Avatar Button */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                  isDark 
                    ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E] text-white' 
                    : 'bg-[#275637] hover:bg-[#1E462B] border-[#91BA94] text-white'
                }`}
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AR'}
              </button>

              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-64 border rounded-[14px] shadow-2xl py-3 z-50 animate-card-in ${
                  isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
                }`}>
                  <div className={`px-4 pb-3 border-b ${isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'}`}>
                    <div className="text-xs font-bold">{user?.username || 'Ramesh_Gowda'}</div>
                    <div className={`text-[11px] flex items-center gap-1 mt-0.5 font-medium ${
                      isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                    }`}>
                      <MapPin className="w-3 h-3 text-[#22C55E]" />
                      <span>{user?.village || 'Venur'}, {user?.district || 'Dakshina Kannada'}</span>
                    </div>
                  </div>

                  <div className="py-2 text-xs font-semibold">
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/profile?tab=profile'); }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2.5 transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-[#162F20] hover:text-white' : 'hover:bg-[#E8F2EA] text-[#275637]'
                      }`}
                    >
                      <User className="w-4 h-4 text-[#22C55E]" />
                      <span>Farmer Profile</span>
                    </button>
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/profile?tab=requests'); }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2.5 transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-[#162F20] hover:text-white' : 'hover:bg-[#E8F2EA] text-[#275637]'
                      }`}
                    >
                      <Award className="w-4 h-4 text-[#22C55E]" />
                      <span>Follow Requests</span>
                    </button>
                  </div>

                  <div className={`pt-2 border-t px-2 ${isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'}`}>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#275637] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-[#91BA94]">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        
        {/* Page Greeting & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/home')}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                }`}
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Contribute Leaf Specimens
              </h1>
            </div>
            <p className={`text-xs sm:text-sm mt-1.5 font-medium ml-7 ${
              isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
            }`}>
              Donate diseased or healthy leaf photos to help train open pathology AI models for smallholders.
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 self-start sm:self-auto ${
            isDark ? 'bg-[#162F20] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
          }`}>
            Open Agronomy Initiative
          </span>
        </div>

        {/* Contribution Impact Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 rounded-xl border shadow-xs ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>Specimens Donated</div>
            <div className="text-xl font-black mt-1 text-[#22C55E]">{contributions.length}</div>
            <div className="text-[10px] text-gray-400">By your farm handle</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>Dataset Type</div>
            <div className="text-sm font-black mt-1">Open Agronomy</div>
            <div className="text-[10px] text-gray-400">Public Domain</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>Contributor Status</div>
            <div className="text-sm font-black mt-1 text-emerald-500">Verified Partner</div>
            <div className="text-[10px] text-gray-400">Badge visible on posts</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>Location Privacy</div>
            <div className="text-sm font-black mt-1">Centroid Only</div>
            <div className="text-[10px] text-gray-400">{user?.village || 'Venur'} Centroid</div>
          </div>
        </div>

        {/* Hidden File Picker Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* ── MAIN 2-COLUMN LAYOUT: DONATE FORM (7 cols) + PREVIOUS DONATIONS (5 cols) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: DONATION SUBMISSION CARD (7 cols) */}
          <div className={`lg:col-span-7 border rounded-[16px] p-5 sm:p-7 shadow-xs space-y-5 ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            <div className="border-b pb-4 border-[#91BA94]/30">
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-500" />
                <span>Donate Specimen to Open Dataset</span>
              </h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                Help create the first open, verified botanical dataset for Karnataka farmers.
              </p>
            </div>

            <form onSubmit={handleSubmitContribution} className="space-y-4">
              
              {/* Crop Selection */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                }`}>
                  Select Crop
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CROP_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCrop(c.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate text-center ${
                        selectedCrop === c.id
                          ? isDark 
                            ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E] shadow-xs' 
                            : 'bg-[#275637] text-white border-[#275637] shadow-xs'
                          : isDark 
                            ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300 hover:border-gray-500' 
                            : 'bg-[#FAFCFA] border-[#D8E4DA] text-[#275637] hover:bg-[#E8F2EA]'
                      }`}
                    >
                      {c.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suspected Condition / Anomaly */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                }`}>
                  Suspected Disease / Symptom Category
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#FAFCFA] border-[#D8E4DA] text-gray-800'
                  }`}
                >
                  {CONDITION_PRESETS.map((cond, idx) => (
                    <option key={idx} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

              {/* Leaf Specimen Image Capture / Upload Area */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                }`}>
                  Specimen Photo *
                </label>

                {cameraError && (
                  <div className="mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Camera Viewfinder View */}
                {isCameraActive ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md bg-black flex items-center justify-center">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                        <span className="text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded text-emerald-300">
                          Align leaf symptom here
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 rounded-lg border text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-[#0B1712] font-black text-xs flex items-center gap-2 shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo</span>
                      </button>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#91BA94]/40 shadow-inner bg-black flex items-center justify-center">
                    <img 
                      src={selectedImage} 
                      alt="Donation specimen" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-white text-[10px] font-mono">
                      Ready for dataset donation
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-center ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E4DA]'
                  }`}>
                    <Camera className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
                    <p className="text-xs font-bold mb-1">Capture or Upload Leaf Specimen</p>
                    <p className={`text-[11px] mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Clear close-ups of nut calyx rot, leaf spots, or stem lesions.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Open Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                          isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Field Observation Notes */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                }`}>
                  Agronomic Notes / Weather Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Palm canopy facing north slope. Water-soaked rot appeared after 2 days of continuous mist."
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none resize-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white focus:border-[#22C55E]' : 'bg-[#FAFCFA] border-[#D8E4DA] text-gray-800 focus:border-[#275637]'
                  }`}
                />
              </div>

              {/* Privacy Notice */}
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300' : 'bg-[#EBF3ED] border-[#91BA94] text-[#275637]'
              }`}>
                <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Centroid Privacy Guarantee:</strong> Geolocation is truncated to the village centroid ({user?.village || 'Venur'}). Zero land survey boundaries, Pahani records, or phone numbers are shared with research archives.
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-[#22C55E] hover:bg-[#1ea850] text-[#0B1712]' 
                    : 'bg-[#275637] hover:bg-[#1e462b] text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Open Repository...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Submit Specimen to Open Dataset</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* RIGHT: SPECIMEN LOG & IMPACT DIRECTORY (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className={`border rounded-[16px] p-5 shadow-xs space-y-3.5 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-[#91BA94]/20">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>My Donated Specimens ({contributions.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-gray-400">Archive Log</span>
              </div>

              <div className="space-y-3">
                {contributions.map((c) => (
                  <div 
                    key={c.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'
                    }`}
                  >
                    <img 
                      src={c.image} 
                      alt={c.crop} 
                      className="w-12 h-12 rounded-lg object-cover border border-[#91BA94]/30 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{c.crop}</span>
                        <span className="text-[10px] font-mono text-emerald-500 font-bold shrink-0">
                          {c.qualityScore}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {c.condition}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                        <span>{c.date}</span>
                        <span className="text-emerald-500 font-semibold">{c.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Impact Box */}
            <div className={`border rounded-[16px] p-5 shadow-xs space-y-2.5 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                <Award className="w-4 h-4" />
                <span>Why Farmer Contributions Matter:</span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#556B5C]'}`}>
                Commercial AI models trained in Western laboratories fail when faced with Indian plantation diseases like Koleroga or Anabe Roga. Your specimen donations build the open public foundation that empowers local disease detection algorithms for every grower in your taluk.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* ── MOBILE BOTTOM NAVIGATION (EXACT HOMEPAGE CONSISTENCY) ── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around py-2 px-2 backdrop-blur-md ${
        isDark ? 'bg-[#0B1712]/95 border-[#162C20]' : 'bg-[#F9F9F6]/95 border-[#91BA94]/60'
      }`}>
        <button 
          onClick={() => navigate('/home')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <span className="text-base">🌱</span>
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button 
          onClick={() => navigate('/c/arecanut')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <span className="text-base">💬</span>
          <span className="text-[10px] font-semibold">Community</span>
        </button>

        <button 
          onClick={() => navigate('/detect')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <Camera className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] font-semibold">Detect</span>
        </button>

        <button 
          onClick={() => navigate('/contribute')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#22C55E] font-bold' : 'text-[#275637] font-bold'
          }`}
        >
          <UploadCloud className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-bold">Contribute</span>
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </nav>

    </div>
  );
}
