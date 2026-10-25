// src/pages/Detect.jsx - Instant Crop Pathology & Leaf Scanner with Live Camera
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, Upload, Zap, Sun, Moon, RotateCcw, 
  MapPin, User, Settings, FileText, UploadCloud,
  CheckCircle2, Cpu, X, AlertTriangle, ArrowLeft, RefreshCw
} from 'lucide-react';
import { runCropDiagnosis } from '../services/api';

const SUPPORTED_CROPS = [
  { id: 'Arecanut', name: 'Arecanut (ಅಡಿಕೆ)' },
  { id: 'Paddy', name: 'Paddy (ಭತ್ತ)' },
  { id: 'Tomato', name: 'Tomato (ಟೊಮೆಟೊ)' },
  { id: 'Apple', name: 'Apple (ಸೇಬು)' }
];

export default function Detect() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t, logout } = useAuth();

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('Arecanut');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    'Validating leaf specimen...',
    'Running ResNet-18 neural classifier...',
    'Evaluating lesion severity ratio...',
    'Generating Grad-CAM attention heatmap...'
  ];

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

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

      // Connect stream to video element once rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play error:", e));
        }
      }, 100);
    } catch (err) {
      console.warn("Camera getUserMedia error:", err);
      setCameraError("Camera unavailable or permission denied. Please choose an image file instead.");
      setIsCameraActive(false);
      fileInputRef.current?.click();
    }
  };

  // Stop Live Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from Live Camera
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
        const file = new File([blob], `leaf_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setUploadedFile(file);
      }
    }, 'image/jpeg', 0.92);

    stopCamera();
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    setSelectedImage(null);
    setUploadedFile(null);
    stopCamera();
  };

  // Run Diagnosis
  const handleRunDiagnosis = async () => {
    if (!selectedImage && !uploadedFile) return;

    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 380);

    let liveDiag = null;
    try {
      // 12s maximum safety ceiling: guarantees diagnosis navigation even on slow cellular connections
      const safetyTimeout = new Promise((resolve) => setTimeout(() => resolve(null), 12000));
      const diagnosisPromise = runCropDiagnosis({
        file: uploadedFile,
        imageBase64: selectedImage,
        cropHint: selectedCrop,
        district: user?.district || 'Dakshina Kannada'
      });

      liveDiag = await Promise.race([diagnosisPromise, safetyTimeout]);
    } catch (err) {
      console.warn('Pathology diagnosis error:', err);
    } finally {
      clearInterval(stepInterval);
      setIsScanning(false);
    }

    const isOod = liveDiag?.is_ood === true || 
                  liveDiag?.is_valid_crop === false || 
                  liveDiag?.verification?.is_valid_crop === false;

    const rejectionReason = liveDiag?.rejection_reason || 
                            liveDiag?.verification?.rejection_reason || 
                            null;

    navigate('/detect/result', {
      state: {
        image: selectedImage,
        crop: liveDiag?.crop || selectedCrop,
        sampleId: (liveDiag?.crop || selectedCrop).toLowerCase(),
        isOod: Boolean(isOod),
        rejectionReason: rejectionReason,
        liveResult: liveDiag?.success ? liveDiag : null,
        timestamp: new Date().toISOString()
      }
    });
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 pb-20 md:pb-6 ${
      isDark 
        ? 'bg-[#0B1712] text-white selection:bg-[#22C55E] selection:text-[#0B1712]' 
        : 'bg-[#F9F9F6] text-[#275637] selection:bg-[#B1D27D] selection:text-[#275637]'
    }`}>
      
      {/* ── TOP FROSTED NAVBAR (EXACT HOMEPAGE CONSISTENCY) ── */}
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

            {/* Nav Links with Expanding Underline */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
              <Link 
                to="/home"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {t('nav_home') || 'Home'}
              </Link>
              <Link 
                to="/c/arecanut"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {t('nav_community') || 'Community'}
              </Link>
              <Link 
                to="/detect"
                className={`px-3.5 py-2 rounded-xl font-bold transition-all duration-200 ${
                  isDark 
                    ? 'bg-[#12241A] text-[#22C55E]' 
                    : 'bg-[#E8F2EA] text-[#275637]'
                }`}
              >
                {t('nav_detect') || 'Detect'}
              </Link>
              <Link 
                to="/map"
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {t('nav_map') || 'Map'}
              </Link>
            </nav>
          </div>

          {/* Right: Theme Selector, Language Switcher & Profile Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Theme Toggle Button */}
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
                <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-45" />
              )}
            </button>

            {/* Language Switcher */}
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
                aria-expanded={isProfileOpen}
                title="User Profile"
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AR'}
              </button>

              {/* Profile Dropdown Popover */}
              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-64 border rounded-[14px] shadow-2xl py-3 z-50 animate-card-in ${
                  isDark 
                    ? 'bg-[#102217] border-[#1E3A2B] text-white' 
                    : 'bg-white border-[#91BA94] text-[#275637]'
                }`}>
                  <div className={`px-4 pb-3 border-b ${isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'}`}>
                    <div className="text-xs font-bold">
                      {user?.username || 'Farmer'}
                    </div>
                    <div className={`text-[11px] flex items-center gap-1 mt-0.5 font-medium ${
                      isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                    }`}>
                      <MapPin className="w-3 h-3 text-[#22C55E]" />
                      <span>{user?.village || 'Venur'}, {user?.district || 'Dakshina Kannada'}</span>
                    </div>
                  </div>

                  <div className="py-2 text-xs font-semibold">
                    {[
                      { icon: User, label: 'Farmer Profile', to: '/profile?tab=profile' },
                      { icon: Camera, label: 'Scan Diary', to: '/profile?tab=scans' },
                      { icon: Settings, label: 'Privacy & Settings', to: '/profile?tab=settings' },
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
                      onClick={() => { logout(); navigate('/login'); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
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

      {/* ── MAIN CONTENT (HERO CONTAINER LIKE HOMEPAGE) ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col justify-center">
        
        {/* Page Greeting & Subtitle */}
        <div className="mb-6">
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
              Scan Leaf Specimen
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1.5 font-medium ml-7 ${
            isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
          }`}>
            Capture or upload a clear photo of an affected leaf, calyx, or bunch for ResNet-18 diagnostic analysis.
          </p>
        </div>

        {/* Hidden File Picker Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Crop Selector Card */}
        <div className={`border rounded-[14px] p-4 mb-5 shadow-xs ${
          isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
            isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
          }`}>
            {t('select_crop_diagnose') || 'Select Crop to Diagnose'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUPPORTED_CROPS.map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCrop(crop.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate text-center ${
                  selectedCrop === crop.id
                    ? isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E] shadow-xs' 
                      : 'bg-[#275637] text-white border-[#275637] shadow-xs'
                    : isDark 
                      ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300 hover:border-gray-500' 
                      : 'bg-[#FAFCFA] border-[#D8E4DA] text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {crop.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 1-Click Verification Test Samples (Real Crop vs Non-Crop Gatekeeper) */}
        <div className={`border rounded-[14px] p-4 mb-5 shadow-xs ${
          isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('detect_quick_samples') || '1-Click Test Samples (Verify Gatekeeper & Diseases)'}
            </span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">
              ✓ AI Gatekeeper Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'arecanut', label: '🌴 Arecanut Leaf', crop: 'Arecanut', file: '/samples/sample_arecanut.jpg' },
              { id: 'tomato', label: '🍅 Tomato Blight', crop: 'Tomato', file: '/samples/sample_tomato.jpg' },
              { id: 'paddy', label: '🌾 Paddy Blast', crop: 'Paddy', file: '/samples/sample_paddy.jpg' },
              { id: 'bluebox', label: '🚫 Blue Box (Gatekeeper Test)', crop: 'Arecanut', file: '/samples/sample_blue_box.jpg' }
            ].map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  stopCamera();
                  setSelectedCrop(sample.crop);
                  setSelectedImage(sample.file);
                  setUploadedFile(null);
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                  selectedImage === sample.file
                    ? isDark ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]' : 'bg-[#E8F2EA] border-[#275637] text-[#275637]'
                    : isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300 hover:border-gray-500' : 'bg-[#FAFCFA] border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error notification if camera fails */}
        {cameraError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* ── MAIN VIEWPORT CARD (HOMEPAGE AESTHETIC) ── */}
        <div className={`border rounded-[16px] p-5 sm:p-7 shadow-xs flex flex-col items-center justify-center transition-all ${
          isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>

          {/* VIEW 1: LIVE WEBCAM VIEWFINDER */}
          {isCameraActive ? (
            <div className="w-full max-w-lg space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xl bg-black flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Targeting Reticle */}
                <div className="absolute inset-6 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] font-mono font-bold bg-black/60 px-2.5 py-1 rounded text-emerald-300">
                    {t('align_leaf_center') || 'Align leaf lesion in center'}
                  </span>
                </div>

                {/* Close camera button */}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer transition-transform active:scale-95 shadow-md"
                  title="Close Camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Camera Shutter & Actions */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
                >
                  {t('btn_cancel') || 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-7 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-[#0B1712] font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t('btn_snap_photo') || 'Snap Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
                >
                  {t('btn_or_upload') || 'Or Upload'}
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            
            /* VIEW 2: CAPTURED / UPLOADED IMAGE PREVIEW */
            <div className="w-full max-w-md space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#91BA94]/40 shadow-inner bg-black flex items-center justify-center">
                <img 
                  src={selectedImage} 
                  alt="Captured leaf specimen" 
                  className="w-full h-full object-contain"
                />

                {/* Remove / Change Image Button */}
                {!isScanning && (
                  <button
                    onClick={handleClearImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer transition-transform active:scale-95 shadow-md"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Scanning Progress Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-white text-center">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_15px_#22C55E] animate-bounce" />
                    
                    <Cpu className="w-9 h-9 text-[#22C55E] animate-spin mb-3" />
                    <p className="font-extrabold text-sm mb-1 text-[#22C55E]">
                      {t('ai_diagnosis_progress') || 'AI Diagnosis In Progress'}
                    </p>
                    <p className="text-xs text-gray-200 min-h-[30px] font-medium">
                      {scanSteps[scanStep]}
                    </p>
                    
                    <div className="w-48 bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="bg-[#22C55E] h-full transition-all duration-300"
                        style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={handleRunDiagnosis}
                  className={`w-full h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isDark 
                      ? 'bg-[#22C55E] hover:bg-[#1ea850] text-[#0B1712]' 
                      : 'bg-[#275637] hover:bg-[#1e462b] text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{t('btn_analyze_leaf') || 'Analyze Leaf'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={startCamera}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-gray-50 border-[#91BA94] text-[#275637]'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('btn_retake_photo') || 'Retake Photo'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-gray-50 border-[#91BA94] text-[#275637]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('btn_upload_different') || 'Upload Different'}</span>
                  </button>
                </div>
              </div>
            </div>

          ) : (

            /* VIEW 3: EMPTY DROPZONE STATE (CAMERA & UPLOAD) */
            <div className="py-8 px-4 flex flex-col items-center text-center w-full max-w-sm">
              <div className={`w-18 h-18 rounded-2xl flex items-center justify-center mb-4 ${
                isDark ? 'bg-[#162C20] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
              }`}>
                <Camera className="w-9 h-9" />
              </div>

              <h2 className="text-base font-extrabold mb-1">
                {t('title_take_or_upload') || 'Take or Upload Leaf Photo'}
              </h2>
              <p className={`text-xs mb-6 ${
                isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
              }`}>
                {t('sub_focus_leaf') || 'Focus on the dark calyx rot, leaf spots, or lesion margins.'}
              </p>

              <div className="w-full space-y-2.5">
                <button
                  type="button"
                  onClick={startCamera}
                  className={`w-full h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-xs ${
                    isDark 
                      ? 'bg-[#22C55E] hover:bg-[#1ea850] text-[#0B1712]' 
                      : 'bg-[#275637] hover:bg-[#1e462b] text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('btn_open_camera') || 'Open Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' 
                      : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#22C55E]" />
                  <span>{t('btn_upload_image_file') || 'Upload Image File'}</span>
                </button>
              </div>
            </div>
          )}

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
          <span className="text-[10px] font-semibold">{t('nav_home') || 'Home'}</span>
        </button>

        <button 
          onClick={() => navigate('/c/arecanut')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <span className="text-base">💬</span>
          <span className="text-[10px] font-semibold">{t('nav_community') || 'Community'}</span>
        </button>

        <button 
          onClick={() => navigate('/detect')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#22C55E] font-bold' : 'text-[#275637] font-bold'
          }`}
        >
          <Camera className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-bold">{t('nav_detect') || 'Detect'}</span>
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{t('menu_profile') || 'Profile'}</span>
        </button>
      </nav>

    </div>
  );
}
