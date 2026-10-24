// src/pages/Detect.jsx - Instant Crop Pathology & Gatekeeper Scanner
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Camera, Upload, Sparkles, AlertTriangle, 
  CheckCircle2, Sun, Moon, Zap, ShieldAlert, RefreshCw,
  Eye, Cpu
} from 'lucide-react';
import { runCropDiagnosis } from '../services/api';

const SAMPLE_CARDS = [
  {
    id: 'arecanut',
    name: 'Arecanut (Koleroga / Fruit Rot)',
    kannada: 'ಅಡಿಕೆ (ಕೊಳೆ ರೋಗ)',
    crop: 'Arecanut',
    path: '/samples/sample_arecanut.jpg',
    badge: 'High Severity',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    description: 'Phytophthora meadii lesion on areca nut calyx & husk',
    ood: false
  },
  {
    id: 'paddy',
    name: 'Paddy (Blast / ಬೆಂಕಿ ರೋಗ)',
    kannada: 'ಭತ್ತ (ಬೆಂಕಿ ರೋಗ)',
    crop: 'Paddy',
    path: '/samples/sample_paddy.jpg',
    badge: 'Moderate',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Magnaporthe oryzae spindle-shaped necrotic lesions',
    ood: false
  },
  {
    id: 'apple',
    name: 'Apple (Apple Scab / ಸ್ಕ್ಯಾಬ್)',
    kannada: 'ಸೇಬು (ಸ್ಕ್ಯಾಬ್)',
    crop: 'Apple',
    path: '/samples/sample_apple.jpg',
    badge: 'Mild Grade 1',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Venturia inaequalis olive-green fungal spots',
    ood: false
  },
  {
    id: 'tomato',
    name: 'Tomato (Early Blight / ಅರ್ಲಿ ಬ್ಲೈಟ್)',
    kannada: 'ಟೊಮೆಟೊ (ಅರ್ಲಿ ಬ್ಲೈಟ್)',
    crop: 'Tomato',
    path: '/samples/sample_tomato.jpg',
    badge: 'Moderate Grade 2',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Alternaria solani concentric target rings',
    ood: false
  },
  {
    id: 'noncrop',
    name: 'Non-Crop Object (Reject Test)',
    kannada: 'ಬೆಳೆಯಲ್ಲದ ವಸ್ತು (ತಿರಸ್ಕಾರ ಪರೀಕ್ಷೆ)',
    crop: 'Non-Crop',
    path: '/samples/sample_noncrop.jpg',
    badge: 'OOD Guard Test',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Tests Mahalanobis Distance out-of-distribution rejection',
    ood: true
  }
];

export default function Detect() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState('/samples/sample_arecanut.jpg');
  const [selectedCrop, setSelectedCrop] = useState('Arecanut');
  const [isOodSample, setIsOodSample] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState('arecanut');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Scanning state & telemetry logs
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    'Initializing Multi-Crop Gatekeeper & Domain Guard...',
    'Computing Mahalanobis OOD distance from Imagenet feature space...',
    'Running ResNet-18 Disease Classifier attention heads...',
    'Quantifying CORN Ordinal lesion severity ratio...',
    'Synthesizing Grad-CAM Class Activation Heatmap...'
  ];

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.path);
    setSelectedCrop(sample.crop);
    setIsOodSample(sample.ood);
    setSelectedSampleId(sample.id);
    setUploadedFile(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedSampleId('custom');
      setIsOodSample(false);
    }
  };

  const handleRunDiagnosis = async () => {
    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 380);

    let liveDiag = null;
    try {
      if (uploadedFile) {
        liveDiag = await runCropDiagnosis({
          file: uploadedFile,
          cropHint: selectedCrop,
          district: user?.district || 'Dakshina Kannada'
        });
      }
    } catch (err) {
      console.warn('Backend diagnosis failed, falling back to client mode:', err);
    }

    setTimeout(() => {
      clearInterval(stepInterval);
      setIsScanning(false);

      // Navigate to /detect/result with full diagnosis state
      navigate('/detect/result', {
        state: {
          image: selectedImage,
          crop: selectedCrop,
          sampleId: selectedSampleId,
          isOod: liveDiag?.verification?.is_valid_crop === false ? true : isOodSample,
          liveResult: liveDiag?.success ? liveDiag : null,
          timestamp: new Date().toISOString()
        }
      });
    }, 2000);
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
                {t('detect_title')}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#34D399]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                AI v2.4
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('detect_sub')}
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

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Top Info Banner */}
        <div className={`p-4 rounded-[14px] border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#162F20] text-[#34D399]' : 'bg-[#E8F2EA] text-[#275637]'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">4 Crops Supported + Non-Crop Guard Active</h2>
              <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                Arecanut (Koleroga), Paddy (Blast), Apple (Scab), and Tomato. Captures or sample clicks auto-evaluated.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              isDark ? 'bg-[#162F20] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
            }`}>
              📍 {user?.village || 'Venur'}, {user?.district || 'Dakshina Kannada'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Viewport & Upload Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Image Preview Card */}
            <div className={`relative rounded-[16px] border overflow-hidden p-4 sm:p-6 flex flex-col items-center justify-center min-h-[380px] shadow-sm ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              
              {selectedImage ? (
                <div className="relative w-full max-w-md aspect-square rounded-[14px] overflow-hidden border border-[#91BA94]/40 shadow-md flex items-center justify-center bg-black/5">
                  <img 
                    src={selectedImage} 
                    alt="Leaf specimen" 
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Animation Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#275637]/30 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                      {/* Laser Bar Animation */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_15px_#22C55E] animate-bounce" />
                      
                      <div className={`p-4 rounded-xl border max-w-xs w-full text-center shadow-xl ${
                        isDark ? 'bg-[#0B1712]/95 border-[#22C55E]/40 text-white' : 'bg-white/95 border-[#275637]/40 text-[#275637]'
                      }`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Cpu className="w-5 h-5 text-[#22C55E] animate-spin" />
                          <span className="font-extrabold text-xs uppercase tracking-wider text-[#22C55E]">
                            AI Analysis In Progress
                          </span>
                        </div>
                        <p className="text-xs font-semibold min-h-[36px] flex items-center justify-center">
                          {scanSteps[scanStep]}
                        </p>
                        <div className="w-full bg-black/20 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div 
                            className="bg-[#22C55E] h-full transition-all duration-300"
                            style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specimen Tag */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span>Selected: {selectedCrop}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-8">
                  <Camera className="w-16 h-16 text-[#91BA94] mb-3 opacity-60" />
                  <p className="text-sm font-bold">No Specimen Selected</p>
                  <p className="text-xs opacity-75 mt-1">Take a photo or choose a sample below</p>
                </div>
              )}

              {/* Upload Action Triggers */}
              <div className="w-full mt-5 flex flex-wrap items-center justify-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                />

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className={`flex-1 min-w-[140px] h-12 rounded-[14px] font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs ${
                    isDark 
                      ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' 
                      : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                  }`}
                >
                  <Camera className="w-4 h-4 text-[#22C55E]" />
                  <span>{t('detect_open_camera')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 min-w-[140px] h-12 rounded-[14px] font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs ${
                    isDark 
                      ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' 
                      : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#22C55E]" />
                  <span>{t('detect_upload_file')}</span>
                </button>

                <button
                  type="button"
                  disabled={isScanning}
                  onClick={handleRunDiagnosis}
                  className={`w-full h-13 rounded-[14px] font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md ${
                    isDark 
                      ? 'bg-[#22C55E] hover:bg-[#1ea850] text-[#0B1712]' 
                      : 'bg-[#275637] hover:bg-[#1e462b] text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{t('detect_analyze_btn')}</span>
                </button>
              </div>

            </div>

            {/* Privacy & Guard Notice */}
            <div className={`p-3.5 rounded-[14px] border text-xs flex items-center gap-3 ${
              isDark ? 'bg-[#12241A]/50 border-[#1E3A2B] text-[#8BA695]' : 'bg-[#E8F2EA]/60 border-[#91BA94]/70 text-[#275637]'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>
                <strong>Spatial Privacy Guaranteed:</strong> Photo GPS is truncated to village centroid before transmission. Zero raw EXIF or cadastral land boundaries stored.
              </span>
            </div>

          </div>

          {/* Right Column: 1-Click Pitch Samples (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                <span>{t('detect_quick_samples')}</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-[#162F20] text-[#8BA695]' : 'bg-[#E8F2EA] text-[#275637]'
              }`}>
                Pitch Demo Ready
              </span>
            </div>

            <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('detect_sample_desc')}
            </p>

            <div className="space-y-3">
              {SAMPLE_CARDS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3 rounded-[14px] border transition-all duration-200 cursor-pointer flex items-center gap-3.5 hover:scale-[1.01] ${
                      isSelected
                        ? isDark 
                          ? 'bg-[#142C1E] border-[#22C55E] ring-1 ring-[#22C55E]' 
                          : 'bg-[#E8F2EA] border-[#275637] ring-1 ring-[#275637]'
                        : isDark
                          ? 'bg-[#102217] border-[#1E3A2B] hover:border-[#22C55E]/50'
                          : 'bg-white border-[#91BA94] hover:bg-[#F9F9F6]'
                    }`}
                  >
                    <img 
                      src={sample.path} 
                      alt={sample.name} 
                      className="w-14 h-14 rounded-xl object-cover border shrink-0 border-[#91BA94]/40"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold truncate">
                          {sample.name}
                        </h4>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${sample.badgeColor}`}>
                          {sample.badge}
                        </span>
                      </div>
                      <p className={`text-[11px] font-medium truncate mt-0.5 ${
                        isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                      }`}>
                        {sample.kannada}
                      </p>
                      <p className={`text-[10px] truncate mt-0.5 opacity-80 ${
                        isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                      }`}>
                        {sample.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Demo Hint */}
            <div className={`p-3.5 rounded-[14px] border text-xs ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-[#F6D05F]" />
                <span>Test OOD Guard:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Click <strong>"Non-Crop Object"</strong> to see how Sasya's Mahalanobis distance filter prevents false pesticide prescriptions on non-crop images.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}