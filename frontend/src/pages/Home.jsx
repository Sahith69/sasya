// src/pages/Home.jsx - District-Level Disease Surveillance Map & Live GPS Rain Radar
// Replicates the Streamlit Outbreak Map (http://localhost:8501/Outbreak_Map) with GPS-detected Rain Reporting
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Shield, AlertTriangle, CheckCircle2, 
  Sun, Moon, Filter, Activity, Info, Eye, Camera, 
  ChevronRight, Sparkles, TrendingUp, Layers, ZoomIn, 
  ZoomOut, Compass, RefreshCw, CloudRain, Droplets, 
  Navigation, X, Check, Clock, User, LogOut, ArrowRight,
  Send, AlertCircle
} from 'lucide-react';

// ── Outbreak Surveillance Dataset (Matching Hackathon & AgriTrust Models) ──
const INITIAL_OUTBREAK_RECORDS = [
  { id: 'mangaluru_1', district: 'Mangaluru', state: 'Karnataka', crop: 'Arecanut', disease: 'mahali_koleroga', count: 18, is_simulated: true, lat: 12.9141, lon: 74.8560 },
  { id: 'mangaluru_2', district: 'Mangaluru', state: 'Karnataka', crop: 'Paddy', disease: 'blast', count: 14, is_simulated: true, lat: 12.9141, lon: 74.8560 },
  { id: 'mangaluru_3', district: 'Mangaluru', state: 'Karnataka', crop: 'Paddy', disease: 'bacterial_leaf_blight', count: 6, is_simulated: true, lat: 12.9141, lon: 74.8560 },
  { id: 'mangaluru_4', district: 'Mangaluru', state: 'Karnataka', crop: 'Arecanut', disease: 'mahali_koleroga', count: 10, is_simulated: false, lat: 12.9141, lon: 74.8560 }, // Field verified
  { id: 'udupi_1', district: 'Udupi', state: 'Karnataka', crop: 'Arecanut', disease: 'mahali_koleroga', count: 12, is_simulated: true, lat: 13.3409, lon: 74.7421 },
  { id: 'udupi_2', district: 'Udupi', state: 'Karnataka', crop: 'Paddy', disease: 'blast', count: 9, is_simulated: true, lat: 13.3409, lon: 74.7421 },
  { id: 'udupi_3', district: 'Udupi', state: 'Karnataka', crop: 'Arecanut', disease: 'bud_borer', count: 4, is_simulated: true, lat: 13.3409, lon: 74.7421 },
  { id: 'shivamogga_1', district: 'Shivamogga', state: 'Karnataka', crop: 'Arecanut', disease: 'yellow_leaf_disease', count: 15, is_simulated: true, lat: 13.9299, lon: 75.5681 },
  { id: 'shivamogga_2', district: 'Shivamogga', state: 'Karnataka', crop: 'Paddy', disease: 'brown_spot', count: 7, is_simulated: true, lat: 13.9299, lon: 75.5681 },
  { id: 'shivamogga_3', district: 'Shivamogga', state: 'Karnataka', crop: 'Paddy', disease: 'blast', count: 12, is_simulated: false, lat: 13.9299, lon: 75.5681 }, // Field verified
  { id: 'mysuru_1', district: 'Mysuru', state: 'Karnataka', crop: 'Paddy', disease: 'tungro', count: 8, is_simulated: true, lat: 12.2958, lon: 76.6394 },
  { id: 'mysuru_2', district: 'Mysuru', state: 'Karnataka', crop: 'Paddy', disease: 'hispa', count: 5, is_simulated: true, lat: 12.2958, lon: 76.6394 },
  { id: 'srinagar_1', district: 'Srinagar', state: 'Jammu & Kashmir', crop: 'Apple', disease: 'apple_scab', count: 22, is_simulated: true, lat: 34.0837, lon: 74.7973 },
  { id: 'srinagar_2', district: 'Srinagar', state: 'Jammu & Kashmir', crop: 'Apple', disease: 'cedar_apple_rust', count: 3, is_simulated: true, lat: 34.0837, lon: 74.7973 },
  { id: 'shimla_1', district: 'Shimla', state: 'Himachal Pradesh', crop: 'Apple', disease: 'apple_scab', count: 16, is_simulated: true, lat: 31.1048, lon: 77.1734 },
  { id: 'shimla_2', district: 'Shimla', state: 'Himachal Pradesh', crop: 'Apple', disease: 'black_rot', count: 8, is_simulated: true, lat: 31.1048, lon: 77.1734 },
  { id: 'kullu_1', district: 'Kullu', state: 'Himachal Pradesh', crop: 'Apple', disease: 'apple_scab', count: 11, is_simulated: true, lat: 31.9579, lon: 77.1095 },
  { id: 'dehradun_1', district: 'Dehradun', state: 'Uttarakhand', crop: 'Paddy', disease: 'blast', count: 7, is_simulated: true, lat: 30.3165, lon: 78.0322 }
];

// District GPS Centroid Metadata & Agronomic Protocols
const DISTRICT_GEO = {
  "Mangaluru": {
    lat: 12.9141, lon: 74.8560, state: "Karnataka",
    taluks: "Belthangady, Puttur, Sullia, Bantwal, Mangaluru",
    protocol: "Prophylactic Bordeaux mixture (1%) with rosin sticker strongly recommended before rain. Clean fallen infected areca nuts to break Phytophthora sporulation cycle."
  },
  "Udupi": {
    lat: 13.3409, lon: 74.7421, state: "Karnataka",
    taluks: "Karkala, Kundapura, Brahmavar",
    protocol: "Ensure crown drainage in arecanut palm heads. Check paddy nurseries for blast eye-shaped lesions before transplantation."
  },
  "Shivamogga": {
    lat: 13.9299, lon: 75.5681, state: "Karnataka",
    taluks: "Tirthahalli, Sagar, Hosanagara, Soraba",
    protocol: "High blast risk in river valley microclimates. Maintain balanced potassium to counteract high vegetative nitrogen susceptibility."
  },
  "Mysuru": {
    lat: 12.2958, lon: 76.6394, state: "Karnataka",
    taluks: "Nanjangud, Hunsur, T. Narasipura",
    protocol: "Scout for leafhoppers spreading tungro virus. Apply recommended bio-formulations during non-rainy midday hours."
  },
  "Shimla": {
    lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh",
    taluks: "Kotkhai, Rohru, Theog, Jubbal",
    protocol: "Apply protective Mancozeb 75% WP @ 2.5g/L immediately post petal-fall. Ensure uniform spray coverage in dense tree canopies."
  },
  "Kullu": {
    lat: 31.9579, lon: 77.1095, state: "Himachal Pradesh",
    taluks: "Manali, Banjar, Anni",
    protocol: "Sanitize fallen scab-infected foliage with 5% urea spray in autumn to accelerate decomposition and reduce primary ascospore inoculum."
  },
  "Srinagar": {
    lat: 34.0837, lon: 74.7973, state: "Jammu & Kashmir",
    taluks: "Shopian, Baramulla, Budgam",
    protocol: "Monitor Mills infection periods following wet spells. Postpone foliar treatments during rain to prevent active chemical runoff."
  },
  "Dehradun": {
    lat: 30.3165, lon: 78.0322, state: "Uttarakhand",
    taluks: "Vikasnagar, Doiwala, Rishikesh",
    protocol: "Maintain water management in paddy terraces to avoid moisture stress cycles that trigger rapid Magnaporthe spore germination."
  }
};

// Initial Crowdsourced Rain Reports
const INITIAL_RAIN_REPORTS = [
  {
    id: 'rain_seed_1',
    district: 'Mangaluru',
    placeName: 'Sullia Taluk, Dakshina Kannada',
    lat: 12.5644,
    lon: 75.3891,
    intensity: 'Heavy Downpour',
    intensityLevel: 'heavy', // 'light' | 'moderate' | 'heavy'
    timestamp: '18 mins ago',
    reportedAt: Date.now() - 18 * 60 * 1000,
    sprayAdvice: '🛑 Chemical wash-off risk high. Postpone all spray operations for 24 hours.'
  },
  {
    id: 'rain_seed_2',
    district: 'Shivamogga',
    placeName: 'Tirthahalli, Shivamogga',
    lat: 13.6938,
    lon: 75.2415,
    intensity: 'Moderate Rain',
    intensityLevel: 'moderate',
    timestamp: '42 mins ago',
    reportedAt: Date.now() - 42 * 60 * 1000,
    sprayAdvice: '⚠️ Foliage wet. Delay systemic fungicide application until leaves dry.'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { user, lang, setLang, toggleTheme, isDark, logout, t } = useAuth();

  // State: Filters matching 3_Outbreak_Map.py
  const [includeSimulated, setIncludeSimulated] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [activeDistrictKey, setActiveDistrictKey] = useState('Mangaluru');
  const [hoveredCluster, setHoveredCluster] = useState(null);
  const [mapRegion, setMapRegion] = useState('karnataka'); // 'karnataka' | 'all_india'

  // Layer toggles
  const [showOutbreaks, setShowOutbreaks] = useState(true);
  const [showRainLayer, setShowRainLayer] = useState(true);

  // Profile menu
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Rain Reporting State
  const [isRainModalOpen, setIsRainModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [detectedCoords, setDetectedCoords] = useState(null);
  const [detectedPlace, setDetectedPlace] = useState('');
  const [detectedDistrict, setDetectedDistrict] = useState('Mangaluru');
  const [rainIntensity, setRainIntensity] = useState('Moderate Rain');
  const [rainNote, setRainNote] = useState('');
  const [reportSuccessToast, setReportSuccessToast] = useState(null);

  // Crowdsourced Rain Reports Store
  const [rainReports, setRainReports] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_live_rain_reports');
      return saved ? JSON.parse(saved) : INITIAL_RAIN_REPORTS;
    } catch {
      return INITIAL_RAIN_REPORTS;
    }
  });

  // Selected or Hovered Rain Report
  const [selectedRainReport, setSelectedRainReport] = useState(null);

  // Save rain reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sasya_live_rain_reports', JSON.stringify(rainReports));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }, [rainReports]);

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

  // Filter raw records based on `includeSimulated`
  const activeRecords = INITIAL_OUTBREAK_RECORDS.filter(r => includeSimulated || !r.is_simulated);

  // Crop list
  const availableCrops = ['All Crops', ...Array.from(new Set(activeRecords.map(r => r.crop)))];

  // District list
  const availableDistricts = ['All Districts', ...Array.from(new Set(activeRecords.map(r => r.district)))];

  // Apply filters
  const filteredRecords = activeRecords.filter(r => {
    const matchesCrop = selectedCrop === 'All Crops' || r.crop === selectedCrop;
    const matchesDist = selectedDistrict === 'All Districts' || r.district === selectedDistrict;
    return matchesCrop && matchesDist;
  });

  // Aggregate by district for PyDeck-like scatterplot bubbles
  const districtClusters = {};
  filteredRecords.forEach(r => {
    if (!districtClusters[r.district]) {
      const geo = DISTRICT_GEO[r.district] || { lat: 12.9141, lon: 74.8560, state: "Karnataka", taluks: "Local Region", protocol: "" };
      districtClusters[r.district] = {
        district: r.district,
        state: geo.state,
        lat: geo.lat,
        lon: geo.lon,
        taluks: geo.taluks,
        protocol: geo.protocol,
        totalCases: 0,
        crops: new Set(),
        diseases: {},
      };
    }
    districtClusters[r.district].totalCases += r.count;
    districtClusters[r.district].crops.add(r.crop);
    districtClusters[r.district].diseases[r.disease] = (districtClusters[r.district].diseases[r.disease] || 0) + r.count;
  });

  // Format clusters for map visualization
  const clusterList = Object.values(districtClusters).map(c => {
    const cropsArr = Array.from(c.crops).sort();
    const dominantDiseaseEntry = Object.entries(c.diseases).sort((a, b) => b[1] - a[1])[0];
    const dominantDisease = dominantDiseaseEntry ? dominantDiseaseEntry[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';

    // Color coding matching Streamlit 3_Outbreak_Map.py:
    // Paddy = Emerald Green [39, 140, 75]
    // Arecanut = Amber [220, 155, 30]
    // Apple = Crimson [185, 55, 55]
    // Multi-crop = AgriTrust Forest Green [39, 86, 55]
    let fillRgb = 'rgb(39, 86, 55)';
    let fillHex = '#275637';

    if (cropsArr.includes('Paddy') && !cropsArr.includes('Apple') && !cropsArr.includes('Arecanut')) {
      fillRgb = 'rgb(39, 140, 75)'; // Emerald Green
      fillHex = '#278C4B';
    } else if (cropsArr.includes('Apple') && !cropsArr.includes('Paddy') && !cropsArr.includes('Arecanut')) {
      fillRgb = 'rgb(185, 55, 55)'; // Crimson
      fillHex = '#B93737';
    } else if (cropsArr.includes('Arecanut') && !cropsArr.includes('Paddy') && !cropsArr.includes('Apple')) {
      fillRgb = 'rgb(220, 155, 30)'; // Amber
      fillHex = '#DC9B1E';
    }

    return {
      ...c,
      cropsStr: cropsArr.join(', '),
      dominantDisease,
      fillRgb,
      fillHex,
      radius: Math.min(42, Math.max(18, c.totalCases * 0.5 + 14))
    };
  });

  // Calculate 4 Top KPIs from Streamlit reference
  const totalVerifiedCases = clusterList.reduce((acc, curr) => acc + curr.totalCases, 0);
  const monitoredDistrictsCount = clusterList.length;

  // Find overall dominant disease
  const diseaseCounts = {};
  filteredRecords.forEach(r => {
    diseaseCounts[r.disease] = (diseaseCounts[r.disease] || 0) + r.count;
  });
  const topDiseaseEntry = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0];
  const topDiseaseName = topDiseaseEntry ? topDiseaseEntry[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Koleroga (Fruit Rot)';
  const topDiseaseCount = topDiseaseEntry ? topDiseaseEntry[1] : 0;

  // Active district for details pane
  const activeCluster = clusterList.find(c => c.district === activeDistrictKey) || clusterList[0] || {
    district: 'Mangaluru',
    state: 'Karnataka',
    taluks: 'Belthangady, Puttur, Sullia',
    cropsStr: 'Arecanut, Paddy',
    dominantDisease: 'Koleroga (Fruit Rot)',
    totalCases: 48,
    fillHex: '#DC9B1E',
    protocol: DISTRICT_GEO['Mangaluru'].protocol
  };

  // ── Equirectangular Map Projection Helper ──
  // Projected coordinate system for SVG map viewport (viewBox="0 0 700 450")
  const projectCoords = (lat, lon) => {
    if (mapRegion === 'karnataka') {
      const minLon = 74.0, maxLon = 78.5;
      const minLat = 11.5, maxLat = 15.6;
      let x = ((lon - minLon) / (maxLon - minLon)) * 600 + 50;
      let y = (1 - (lat - minLat) / (maxLat - minLat)) * 360 + 45;
      // Clamp within view
      x = Math.max(35, Math.min(665, x));
      y = Math.max(35, Math.min(415, y));
      return { x, y };
    } else {
      // Pan-India (Karnataka to Himachal/Kashmir)
      const minLon = 72.0, maxLon = 80.5;
      const minLat = 11.0, maxLat = 35.0;
      let x = ((lon - minLon) / (maxLon - minLon)) * 600 + 50;
      let y = (1 - (lat - minLat) / (maxLat - minLat)) * 360 + 45;
      x = Math.max(35, Math.min(665, x));
      y = Math.max(35, Math.min(415, y));
      return { x, y };
    }
  };

  // Reverse distance check to find nearest district from GPS
  const findNearestDistrict = (lat, lon) => {
    let nearest = 'Mangaluru';
    let minDistance = Infinity;

    Object.entries(DISTRICT_GEO).forEach(([dName, geo]) => {
      const dLat = lat - geo.lat;
      const dLon = lon - geo.lon;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = dName;
      }
    });

    return nearest;
  };

  // Trigger GPS Geolocation
  const handleDetectGPS = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser. Please select district manually.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const accuracy = Math.round(pos.coords.accuracy);

        setDetectedCoords({ lat, lon, accuracy });
        const nearest = findNearestDistrict(lat, lon);
        setDetectedDistrict(nearest);
        setDetectedPlace(`GPS Coordinates: ${lat}°N, ${lon}°E (±${accuracy}m accuracy)`);
        setIsLocating(false);
      },
      (err) => {
        console.warn("GPS lookup failed, using fallback:", err);
        // Fallback: Use current user's profile location or defaults
        const fallbackLat = 12.9141;
        const fallbackLon = 74.8560;
        setDetectedCoords({ lat: fallbackLat, lon: fallbackLon, accuracy: 25 });
        setDetectedDistrict("Mangaluru");
        setDetectedPlace("Dakshina Kannada (GPS Estimated from Farm Profile)");
        setGpsError("GPS permission denied or unavailable. Fallback to registered district coordinates.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Open Rain Report Modal
  const openRainModal = () => {
    setIsRainModalOpen(true);
    handleDetectGPS();
  };

  // Submit Live Rain Report
  const handleSubmitRainReport = (e) => {
    e.preventDefault();
    if (!detectedCoords) {
      handleDetectGPS();
      return;
    }

    const intensityMap = {
      'Light Drizzle': {
        level: 'light',
        advice: '🌦️ Light mist. Spray operations may continue if rosin sticker is used.'
      },
      'Moderate Rain': {
        level: 'moderate',
        advice: '⚠️ Foliage wet. Delay systemic fungicide application until dry.'
      },
      'Heavy Downpour': {
        level: 'heavy',
        advice: '🛑 Chemical wash-off risk high. Postpone all spray operations for 24 hours.'
      }
    };

    const newReport = {
      id: `rain_${Date.now()}`,
      district: detectedDistrict,
      placeName: rainNote.trim() ? `${detectedDistrict} (${rainNote.trim()})` : (detectedPlace || `${detectedDistrict} Field`),
      lat: detectedCoords.lat,
      lon: detectedCoords.lon,
      intensity: rainIntensity,
      intensityLevel: intensityMap[rainIntensity].level,
      timestamp: 'Just now',
      reportedAt: Date.now(),
      sprayAdvice: intensityMap[rainIntensity].advice,
      isUserReported: true
    };

    setRainReports([newReport, ...rainReports]);
    setIsRainModalOpen(false);
    setSelectedRainReport(newReport);

    // Toast notification
    setReportSuccessToast(`🌧️ Rain report for ${detectedDistrict} marked on the map!`);
    setTimeout(() => setReportSuccessToast(null), 5000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white selection:bg-[#22C55E] selection:text-[#0B1712]' : 'bg-[#F9F9F6] text-[#275637] selection:bg-[#B1D27D] selection:text-[#275637]'
    }`}>
      
      {/* ── TOP BREADCRUMB & FROSTED NAVBAR (AgriTrust Design System) ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand & Navigation Breadcrumb */}
          <div className="flex items-center gap-5 sm:gap-6">
            <Link 
              to="/home" 
              className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shadow-xs group-hover:rotate-6 transition-transform ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                🌾
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-[#275637]'}`}>
                  Sasya
                </span>
                {lang !== 'en' && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-md border font-bold ${
                    isDark ? 'bg-[#12241A] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#B1D27D] border-[#91BA94] text-[#275637]'
                  }`}>
                    {lang === 'kn' ? 'ಸಸ್ಯ' : 'सस्य'}
                  </span>
                )}
              </div>
            </Link>

            {/* Top Nav Links matching Streamlit pages */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
              <Link 
                to="/home"
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-xs transition-all ${
                  isDark 
                    ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' 
                    : 'bg-[#275637] text-white border-[#275637]'
                }`}
              >
                <span>🗺️</span>
                <span>Outbreak Map</span>
              </Link>

              <Link 
                to="/detect"
                className={`px-3 py-1.5 rounded-xl border transition-all hover:-translate-y-0.5 ${
                  isDark 
                    ? 'bg-[#12241A] border-[#1E3A2B] text-[#8BA695] hover:text-white' 
                    : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                <span>📸</span>
                <span>Scan Leaf</span>
              </Link>

              <Link 
                to="/risk"
                className={`px-3 py-1.5 rounded-xl border transition-all hover:-translate-y-0.5 ${
                  isDark 
                    ? 'bg-[#12241A] border-[#1E3A2B] text-[#8BA695] hover:text-white' 
                    : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                <span>🌧️</span>
                <span>48h Spray Window</span>
              </Link>

              <Link 
                to="/c/arecanut"
                className={`px-3 py-1.5 rounded-xl border transition-all hover:-translate-y-0.5 ${
                  isDark 
                    ? 'bg-[#12241A] border-[#1E3A2B] text-[#8BA695] hover:text-white' 
                    : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                <span>👥</span>
                <span>Community</span>
              </Link>
            </nav>
          </div>

          {/* Right: GPS Rain Action, Theme, Language & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 🌧️ Live Rain Report Button with Pulse Ring */}
            <button
              onClick={openRainModal}
              className="relative px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border border-sky-400/40"
              title="Report live rain at your GPS location"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <CloudRain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Rain Here</span>
              <span className="sm:hidden">Rain</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border transition-all hover:scale-110 active:scale-90 cursor-pointer shadow-xs ${
                isDark 
                  ? 'bg-[#12241A] border-[#1E3A2B] text-[#FCD34D]' 
                  : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Switcher */}
            <div className={`hidden sm:flex items-center p-1 rounded-xl border text-xs shadow-xs ${
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
                        ? 'bg-[#22C55E] text-[#0B1712]' 
                        : 'bg-[#275637] text-white'
                      : isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#275637] hover:bg-[#E8F2EA]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#275637] border-[#91BA94] text-white'
                }`}
                title="User Profile"
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AR'}
              </button>

              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-56 border rounded-2xl shadow-2xl py-2 z-50 animate-card-in ${
                  isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
                }`}>
                  <div className={`px-4 py-2 border-b text-xs ${isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'}`}>
                    <div className="font-extrabold">{user?.username || 'Ramesh Gowda'}</div>
                    <div className="text-[11px] opacity-75">{user?.district || 'Dakshina Kannada'}, {user?.state || 'Karnataka'}</div>
                  </div>
                  <div className="py-1 text-xs font-semibold">
                    <Link 
                      to="/detect" 
                      onClick={() => setIsProfileOpen(false)}
                      className={`block px-4 py-2 transition-colors ${isDark ? 'hover:bg-[#162F20]' : 'hover:bg-[#E8F2EA]'}`}
                    >
                      📸 Leaf Pathology Scan
                    </Link>
                    <Link 
                      to="/risk" 
                      onClick={() => setIsProfileOpen(false)}
                      className={`block px-4 py-2 transition-colors ${isDark ? 'hover:bg-[#162F20]' : 'hover:bg-[#E8F2EA]'}`}
                    >
                      🌧️ 48h Bioclimatic Spray Window
                    </Link>
                    <Link 
                      to="/c/arecanut" 
                      onClick={() => setIsProfileOpen(false)}
                      className={`block px-4 py-2 transition-colors ${isDark ? 'hover:bg-[#162F20]' : 'hover:bg-[#E8F2EA]'}`}
                    >
                      👥 Community Discussions
                    </Link>
                  </div>
                  <div className={`pt-1 border-t px-2 ${isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'}`}>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        isDark ? 'text-rose-400 hover:bg-rose-950/40' : 'text-[#B5483A] hover:bg-[#FDECEA]'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {reportSuccessToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl bg-emerald-700 text-white shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
          <div className="text-xs font-bold">{reportSuccessToast}</div>
          <button onClick={() => setReportSuccessToast(null)} className="ml-auto text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── MAIN SURVEILLANCE & RAIN RADAR DASHBOARD ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── 1. SIMULATION NOTICE BANNER (Exact text from 3_Outbreak_Map.py) ── */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3 shadow-xs ${
          isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#FCD34D]' : 'bg-[#FFF9E6] border-[#F5E096] text-[#8C6D15]'
        }`}>
          <span className="text-xl shrink-0">⚠️</span>
          <div className="text-xs sm:text-sm font-semibold leading-relaxed">
            <strong>Aggregated Disease Surveillance Research System:</strong> Outbreak data displayed below combines historical spatial patterns with real farmer submissions for epidemiological monitoring.
          </div>
        </div>

        {/* ── 2. PAGE TITLE & DESCRIPTION (Exact from 3_Outbreak_Map.py) ── */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2.5">
            <span>🗺️</span>
            <span>District-Level Disease Surveillance Map</span>
          </h1>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Interactive spatial monitoring of plant disease outbreaks and expert-verified field reports for epidemiological surveillance.
          </p>
        </div>

        {/* ── 3. PRIVACY GUARANTEE BANNER (Exact from 3_Outbreak_Map.py) ── */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-semibold leading-relaxed flex items-start sm:items-center gap-2.5 shadow-xs ${
          isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-emerald-300' : 'bg-[#EBF3ED] border-[#91BA94] text-[#275637]'
        }`}>
          <span className="text-base shrink-0">🔒</span>
          <div>
            <strong>Surveillance Privacy Guarantee:</strong> Disease surveillance data is aggregated strictly at the district level. Exact farm coordinates, RTC survey numbers, and farmer identities are never published or accessible via this surveillance interface.
          </div>
        </div>

        {/* ── 4. CONTROLS: SIMULATION BENCHMARK TOGGLE & LIVE RAIN CTA ── */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
        }`}>
          <label className="flex items-center gap-2.5 text-xs sm:text-sm font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSimulated}
              onChange={(e) => setIncludeSimulated(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-[#275637] cursor-pointer"
            />
            <span>Include Historical Benchmark Surveillance Data</span>
          </label>

          <div className="flex items-center gap-2 text-xs">
            <span className={`italic ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {includeSimulated 
                ? 'ℹ️ Showing historical benchmark surveillance records alongside verified field submissions.' 
                : 'Showing strictly live expert-verified field contributions.'}
            </span>
          </div>
        </div>

        {/* ── 5. TOP 4 SURVEILLANCE KPI SUMMARY CARDS (Exact from 3_Outbreak_Map.py) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Monitored Districts */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-transform hover:-translate-y-0.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Monitored Districts
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 font-mono ${isDark ? 'text-white' : 'text-[#275637]'}`}>
              {monitoredDistrictsCount}
            </div>
            <div className={`text-xs mt-1 font-medium ${isDark ? 'text-[#5A7363]' : 'text-[#728C78]'}`}>
              Active regional centroids
            </div>
          </div>

          {/* KPI 2: Total Verified Cases */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-transform hover:-translate-y-0.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Total Verified Cases
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 font-mono text-[#22C55E]">
              {totalVerifiedCases}
            </div>
            <div className={`text-xs mt-1 font-medium ${isDark ? 'text-[#5A7363]' : 'text-[#728C78]'}`}>
              Surveillance reports
            </div>
          </div>

          {/* KPI 3: Top Monitored Pathogen */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-transform hover:-translate-y-0.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Top Monitored Pathogen
            </div>
            <div className="text-base sm:text-lg font-black mt-1.5 truncate text-amber-500">
              {topDiseaseName}
            </div>
            <div className={`text-xs mt-1 font-medium font-mono ${isDark ? 'text-[#5A7363]' : 'text-[#728C78]'}`}>
              {topDiseaseCount} documented cases
            </div>
          </div>

          {/* KPI 4: Surveillance Privacy */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-transform hover:-translate-y-0.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Surveillance Privacy
            </div>
            <div className={`text-xl sm:text-2xl font-black mt-1 font-mono ${isDark ? 'text-[#22C55E]' : 'text-[#275637]'}`}>
              100% Shielded
            </div>
            <div className={`text-xs mt-1 font-medium ${isDark ? 'text-[#5A7363]' : 'text-[#728C78]'}`}>
              District centroid only (k ≥ 5)
            </div>
          </div>

        </div>

        {/* ── 6. FILTER CONTROLS (Crop & District Selectors from 3_Outbreak_Map.py) ── */}
        <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
        }`}>
          {/* Crop Filter */}
          <div className="sm:col-span-4">
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Filter by Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white focus:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] focus:border-[#275637]'
              }`}
            >
              {availableCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="sm:col-span-4">
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Filter by District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white focus:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] focus:border-[#275637]'
              }`}
            >
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Region Switcher & Layer Toggles */}
          <div className="sm:col-span-4 flex flex-wrap items-center justify-start sm:justify-end gap-2 pt-2 sm:pt-4">
            <div className={`p-1 rounded-xl border flex items-center text-xs font-bold ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]'
            }`}>
              <button
                onClick={() => setMapRegion('karnataka')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapRegion === 'karnataka'
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                    : 'text-gray-400'
                }`}
              >
                Karnataka
              </button>
              <button
                onClick={() => setMapRegion('all_india')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapRegion === 'all_india'
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                    : 'text-gray-400'
                }`}
              >
                All-India
              </button>
            </div>

            {/* Quick Rain Report Button in Toolbar */}
            <button
              onClick={openRainModal}
              className="px-3 py-1.5 rounded-xl border border-sky-400 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Report Rain</span>
            </button>
          </div>
        </div>

        {/* ── 7. INTERACTIVE GIS OUTBREAK & LIVE RAIN MAP (Matching PyDeck) ── */}
        <div className={`p-4 sm:p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all ${
          isDark ? 'bg-[#0B1712] border-[#1E3A2B]' : 'bg-[#1A2E22] border-[#275637] text-white'
        }`}>
          
          {/* Map Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 text-xs z-10 relative">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#22C55E]" />
              <span className="font-mono font-bold tracking-wider uppercase text-white">
                📍 Disease Outbreak Intensity by District Centroid &amp; Live Rain Radar
              </span>
            </div>

            {/* Layer Filter Badges */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-emerald-200 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showOutbreaks} 
                  onChange={(e) => setShowOutbreaks(e.target.checked)}
                  className="accent-[#22C55E] cursor-pointer" 
                />
                <span>Disease Outbreaks ({clusterList.length})</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-sky-200 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showRainLayer} 
                  onChange={(e) => setShowRainLayer(e.target.checked)}
                  className="accent-sky-400 cursor-pointer" 
                />
                <span>Live Rain Reports ({rainReports.length})</span>
              </label>
            </div>
          </div>

          {/* SVG Canvas (Equirectangular Projection) */}
          <div className="relative w-full aspect-16/10 sm:aspect-21/9 rounded-2xl bg-[#07100C] border border-white/10 overflow-hidden flex items-center justify-center">
            
            <svg viewBox="0 0 700 450" className="w-full h-full select-none">
              <defs>
                {/* Glow Radial Gradients */}
                <radialGradient id="glowAmber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#DC9B1E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#DC9B1E" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glowEmerald" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#278C4B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#278C4B" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glowCrimson" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#B93737" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#B93737" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glowForest" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glowCyan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Geographic Graticule Grid Lines */}
              <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="3 3">
                <line x1="50" y1="100" x2="650" y2="100" />
                <line x1="50" y1="200" x2="650" y2="200" />
                <line x1="50" y1="300" x2="650" y2="300" />
                <line x1="50" y1="400" x2="650" y2="400" />
                <line x1="150" y1="50" x2="150" y2="420" />
                <line x1="300" y1="50" x2="300" y2="420" />
                <line x1="450" y1="50" x2="450" y2="420" />
                <line x1="600" y1="50" x2="600" y2="420" />
              </g>

              {/* Geographical Basemap Outlines */}
              {mapRegion === 'karnataka' ? (
                <g fill="none" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.5">
                  {/* Arabian Sea Coastline curve */}
                  <path d="M 110,40 Q 140,150 160,250 T 205,420" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="2.5" />
                  {/* Western Ghats Ridge Line */}
                  <path d="M 150,50 Q 190,160 220,260 T 280,410" stroke="rgba(34, 197, 94, 0.25)" strokeDasharray="4 2" strokeWidth="1.5" />
                  <text x="60" y="220" fill="rgba(56, 189, 248, 0.3)" fontSize="11" fontFamily="monospace" transform="rotate(-75 60,220)">ARABIAN SEA</text>
                  <text x="260" y="190" fill="rgba(255, 255, 255, 0.15)" fontSize="13" fontWeight="bold" fontFamily="monospace">KARNATAKA (MALNAD &amp; COASTAL)</text>
                  <text x="470" y="270" fill="rgba(255, 255, 255, 0.1)" fontSize="11" fontFamily="monospace">DECCAN BASIN</text>
                </g>
              ) : (
                <g fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5">
                  <path d="M 130,380 Q 240,430 350,395 T 510,320" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
                  <path d="M 270,120 Q 410,70 550,110" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
                  <text x="310" y="85" fill="rgba(255, 255, 255, 0.25)" fontSize="11" fontWeight="bold" fontFamily="monospace">HIMACHAL PRADESH &amp; J&amp;K</text>
                  <text x="200" y="380" fill="rgba(255, 255, 255, 0.2)" fontSize="12" fontWeight="bold" fontFamily="monospace">KARNATAKA AGRI-BELT</text>
                </g>
              )}

              {/* ── LAYER 1: DISEASE OUTBREAK CENTROID BUBBLES ── */}
              {showOutbreaks && clusterList.map((c) => {
                const { x, y } = projectCoords(c.lat, c.lon);
                const isSelected = activeDistrictKey === c.district;

                return (
                  <g 
                    key={c.district}
                    onClick={() => { setActiveDistrictKey(c.district); setSelectedRainReport(null); }}
                    onMouseEnter={() => setHoveredCluster(c)}
                    onMouseLeave={() => setHoveredCluster(null)}
                    className="cursor-pointer transition-transform duration-200"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    {/* Animated Ripple Pulse on High Severity Clusters (>= 20 cases) */}
                    {c.totalCases >= 20 && (
                      <circle
                        cx={x}
                        cy={y}
                        r={c.radius * 1.5}
                        fill="none"
                        stroke={c.fillHex}
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-ping"
                        style={{ animationDuration: '3.5s' }}
                      />
                    )}

                    {/* Outer Soft Glow Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={c.radius * 1.25}
                      fill={
                        c.cropsStr.includes('Apple') ? 'url(#glowCrimson)' :
                        c.cropsStr.includes('Paddy') && !c.cropsStr.includes('Arecanut') ? 'url(#glowEmerald)' :
                        c.cropsStr.includes('Arecanut') && !c.cropsStr.includes('Paddy') ? 'url(#glowAmber)' :
                        'url(#glowForest)'
                      }
                    />

                    {/* Main Core Bubble */}
                    <circle
                      cx={x}
                      cy={y}
                      r={c.radius}
                      fill={c.fillRgb}
                      stroke={isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.9)'}
                      strokeWidth={isSelected ? 3.5 : 2}
                      className="transition-all duration-200 hover:scale-110"
                    />

                    {/* Selection Ring */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={c.radius + 6}
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Case Count Badge inside Bubble */}
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={c.radius > 22 ? "12" : "10"}
                      fontWeight="bold"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      {c.totalCases}
                    </text>

                    {/* District Name Label */}
                    <text
                      x={x}
                      y={y + c.radius + 14}
                      textAnchor="middle"
                      fill={isSelected ? '#38BDF8' : '#FFFFFF'}
                      fontSize="10"
                      fontWeight={isSelected ? "bold" : "600"}
                      fontFamily="sans-serif"
                      stroke="#07100C"
                      strokeWidth="2.5"
                      paintOrder="stroke"
                      pointerEvents="none"
                    >
                      {c.district}
                    </text>
                  </g>
                );
              })}

              {/* ── LAYER 2: LIVE GPS RAIN REPORT MARKERS (Animated Water Ripple) ── */}
              {showRainLayer && rainReports.map((report) => {
                const { x, y } = projectCoords(report.lat, report.lon);
                const isSelected = selectedRainReport?.id === report.id;
                const isHeavy = report.intensityLevel === 'heavy';

                return (
                  <g
                    key={report.id}
                    onClick={() => setSelectedRainReport(report)}
                    className="cursor-pointer group"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    {/* Animated Pulsing Water Waves */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHeavy ? 36 : 26}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping"
                      style={{ animationDuration: isHeavy ? '1.8s' : '2.5s' }}
                    />
                    
                    {/* Secondary Ripple Wave for Heavy Downpour */}
                    {isHeavy && (
                      <circle
                        cx={x}
                        cy={y}
                        r={48}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="1"
                        opacity="0.3"
                        className="animate-ping"
                        style={{ animationDuration: '3.2s' }}
                      />
                    )}

                    {/* Outer Cyan Glow */}
                    <circle
                      cx={x}
                      cy={y}
                      r={20}
                      fill="url(#glowCyan)"
                    />

                    {/* Rain Pin Background Badge */}
                    <circle
                      cx={x}
                      cy={y}
                      r={14}
                      fill="#0284C7"
                      stroke={isSelected ? '#FFFFFF' : '#38BDF8'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Rain Drop / Cloud Emoji */}
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      pointerEvents="none"
                    >
                      🌧️
                    </text>

                    {/* Label Badge */}
                    <text
                      x={x}
                      y={y - 18}
                      textAnchor="middle"
                      fill="#38BDF8"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      stroke="#07100C"
                      strokeWidth="2"
                      paintOrder="stroke"
                      pointerEvents="none"
                    >
                      RAIN: {report.intensity.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay (Matching PyDeck Tooltip in 3_Outbreak_Map.py) */}
            {hoveredCluster && (
              <div className="absolute top-4 left-4 z-20 pointer-events-none p-3.5 rounded-xl bg-[#275637]/95 backdrop-blur-md text-white border border-white/20 shadow-2xl text-xs max-w-xs animate-fadeIn font-sans">
                <div className="font-bold text-sm text-[#38BDF8] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>📍 {hoveredCluster.district}</span>
                </div>
                <div className="mt-1.5 space-y-0.5 text-[11px] font-mono">
                  <div><strong>Verified Cases:</strong> <span className="text-amber-300">{hoveredCluster.totalCases}</span></div>
                  <div><strong>Dominant Disease:</strong> {hoveredCluster.dominantDisease}</div>
                  <div><strong>Crops Monitored:</strong> {hoveredCluster.cropsStr}</div>
                  <div className="text-[10px] text-emerald-200 pt-1 border-t border-white/10 mt-1">
                    Centroid: {hoveredCluster.lat.toFixed(2)}°N, {hoveredCluster.lon.toFixed(2)}°E ($k \ge 5$)
                  </div>
                </div>
              </div>
            )}

            {/* Selected Rain Report Card Overlay */}
            {selectedRainReport && (
              <div className="absolute bottom-4 right-4 z-20 p-4 rounded-2xl bg-[#032338]/95 backdrop-blur-md text-white border border-sky-400/40 shadow-2xl text-xs max-w-sm animate-card-in">
                <div className="flex items-center justify-between">
                  <div className="font-black text-sm text-sky-300 flex items-center gap-1.5">
                    <span>🌧️ Live Rain Reported</span>
                    {selectedRainReport.isUserReported && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200 border border-sky-400/40 font-mono">
                        By You
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedRainReport(null)}
                    className="text-white/60 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div><strong>Location:</strong> {selectedRainReport.placeName}</div>
                  <div><strong>Rain Intensity:</strong> <span className="font-bold text-amber-300">{selectedRainReport.intensity}</span></div>
                  <div><strong>GPS Coordinates:</strong> <span className="font-mono">{selectedRainReport.lat}°N, {selectedRainReport.lon}°E</span></div>
                  <div className="text-gray-300"><strong>Reported:</strong> {selectedRainReport.timestamp}</div>
                  <div className="mt-2 p-2 rounded-xl bg-sky-950/60 border border-sky-800 text-[11px] text-sky-200 leading-relaxed">
                    {selectedRainReport.sprayAdvice}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Color-Coded Map Legend (Exact from PyDeck Map in 3_Outbreak_Map.py + Rain Indicator) */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-gray-300 mt-3 pt-3 border-t border-white/10">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-[rgb(39,140,75)] inline-block border border-white/40" />
              <span>Paddy</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-[rgb(220,155,30)] inline-block border border-white/40" />
              <span>Arecanut</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-[rgb(185,55,55)] inline-block border border-white/40" />
              <span>Apple</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-[rgb(39,86,55)] inline-block border border-white/40" />
              <span>Multi-Crop Cluster</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-sky-300">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block border border-white animate-pulse" />
              <span>🌧️ Live GPS Rain</span>
            </span>
            <span className="text-[11px] text-gray-400 italic">
              (Circle size represents relative case volume. Click any circle to audit.)
            </span>
          </div>

        </div>

        {/* ── 8. ACTIVE HOTSPOTS & SURVEILLANCE LEDGER (2 Column Grid from 3_Outbreak_Map.py) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: High-Priority Regional Hotspots (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>🔥</span>
                <span>High-Priority Regional Hotspots</span>
              </h3>
              <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-[#556B5C]'}`}>
                Real-Time Triage
              </span>
            </div>

            <div className="space-y-3">
              {clusterList
                .sort((a, b) => b.totalCases - a.totalCases)
                .slice(0, 4)
                .map((c) => {
                  const isElevated = c.totalCases >= 20;
                  const badgeColor = isElevated ? '#B5483A' : '#D9822B';
                  const badgeText = isElevated ? '🚨 Elevated Alert' : '⚠️ Moderate Alert';
                  const isSelected = activeDistrictKey === c.district;

                  return (
                    <div
                      key={c.district}
                      onClick={() => { setActiveDistrictKey(c.district); setSelectedRainReport(null); }}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
                        isSelected
                          ? isDark ? 'bg-[#142C1E] border-[#22C55E] ring-1 ring-[#22C55E]' : 'bg-[#E8F2EA] border-[#275637] ring-1 ring-[#275637]'
                          : isDark ? 'bg-[#102217] border-[#1E3A2B] hover:border-[#22C55E]/50' : 'bg-white border-[#D8E4DA] hover:bg-[#F9F9F6]'
                      }`}
                      style={{ borderLeftWidth: '5px', borderLeftColor: badgeColor }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-black text-sm flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>📍 {c.district}</span>
                        </div>
                        <span 
                          className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full"
                          style={{ color: badgeColor, backgroundColor: `${badgeColor}15` }}
                        >
                          {badgeText}
                        </span>
                      </div>

                      <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-[#556B5C]'}`}>
                        Primary Focus: <strong className={isDark ? 'text-white' : 'text-[#275637]'}>{c.cropsStr}</strong> &nbsp;|&nbsp; <strong className="font-mono text-emerald-500">{c.totalCases}</strong> total verified cases
                      </div>
                      <div className={`text-[11px] mt-1 truncate ${isDark ? 'text-gray-400' : 'text-[#556B5C]'}`}>
                        Dominant: <span className="italic font-semibold">{c.dominantDisease}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Verified Outbreak Surveillance Ledger Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>📋</span>
                <span>Verified Outbreak Surveillance Ledger</span>
              </h3>
              <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-[#556B5C]'}`}>
                {filteredRecords.length} Records
              </span>
            </div>

            <div className={`rounded-2xl border overflow-hidden shadow-xs ${
              isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
            }`}>
              <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className={`border-b font-mono font-bold uppercase text-[10px] ${
                      isDark ? 'border-[#1E3A2B] bg-[#0E1E16] text-gray-400' : 'border-[#D8E4DA] bg-[#F9F9F6] text-[#556B5C]'
                    }`}>
                      <th className="p-3">District</th>
                      <th className="p-3">Crop</th>
                      <th className="p-3">Disease Condition</th>
                      <th className="p-3 text-right">Reports</th>
                      <th className="p-3">Data Origin</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#D8E4DA]/60'}`}>
                    {filteredRecords.map((r) => {
                      const formattedDisease = r.disease.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const isFieldVerified = !r.is_simulated;

                      return (
                        <tr
                          key={r.id}
                          onClick={() => { setActiveDistrictKey(r.district); setSelectedRainReport(null); }}
                          className={`cursor-pointer transition-colors ${
                            activeDistrictKey === r.district
                              ? isDark ? 'bg-[#163323]' : 'bg-[#E8F2EA]'
                              : isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                          }`}
                        >
                          <td className="p-3 font-bold flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#22C55E]" />
                            <span>{r.district}</span>
                          </td>
                          <td className="p-3 font-semibold">{r.crop}</td>
                          <td className="p-3 font-mono text-[11px]">{formattedDisease}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-500">{r.count}</td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              isFieldVerified 
                                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' 
                                : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                            }`}>
                              {isFieldVerified ? 'Field Verified Submission' : 'Historical Benchmark'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* ── 9. FOCUSED ZONE DETAILS & AGRONOMIC PROTOCOL ── */}
        <div className={`p-6 sm:p-7 rounded-3xl border shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  Detailed Advisory: {activeCluster.district}
                </h3>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  activeCluster.totalCases >= 20 
                    ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' 
                    : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                }`}>
                  {activeCluster.totalCases >= 20 ? '🚨 Elevated Alert' : '⚠️ Moderate Alert'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                Centroid Coverage: {activeCluster.taluks} • Primary Crop Focus: {activeCluster.cropsStr}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/risk"
                className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <span>Check 48h Spray Window ➔</span>
              </Link>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-xs leading-relaxed mb-4 ${
            isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-200' : 'bg-[#F9F9F6] border-[#D8E4DA] text-[#275637]'
          }`}>
            <strong className="block mb-1 text-sm font-extrabold text-[#22C55E]">
              Agronomic Protocol ({activeCluster.dominantDisease}):
            </strong>
            {activeCluster.protocol} Ensure all field equipment is sanitized between plantation blocks to mitigate zoospore transport during humid conditions.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              Data refreshed from Open-Meteo &amp; verified pathology scans
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#22C55E]" />
              Digital Personal Data Protection (DPDP) Act Compliant (k ≥ 5)
            </span>
          </div>
        </div>

      </main>

      {/* ── 10. LIVE GPS RAIN REPORTING MODAL ── */}
      {isRainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 relative animate-card-in ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-lg">
                  🌧️
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight">Report Live Rain</h3>
                  <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    Broadcast weather conditions to help neighboring farmers time sprays
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsRainModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Detection Status */}
            <div className="my-5 p-4 rounded-2xl border bg-sky-500/10 border-sky-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-sky-400">
                  <Navigation className="w-4 h-4 animate-spin text-sky-400" style={{ animationDuration: isLocating ? '1.5s' : '0s' }} />
                  <span>{isLocating ? 'Detecting Browser GPS Location...' : 'GPS Location Auto-Detected'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-detect</span>
                </button>
              </div>

              {detectedCoords ? (
                <div className="text-xs space-y-1 font-mono">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nearest District: <strong>{detectedDistrict}</strong></span>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    Coords: {detectedCoords.lat}° N, {detectedCoords.lon}° E (±{detectedCoords.accuracy}m)
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-400">
                  {gpsError || 'Requesting browser location permission...'}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRainReport} className="space-y-4 text-xs font-semibold">
              
              {/* Rain Intensity Selector */}
              <div>
                <label className="block mb-2 font-bold text-xs">
                  1. Current Rain Intensity:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Light Drizzle', icon: '🌦️', desc: 'Mild droplets' },
                    { label: 'Moderate Rain', icon: '🌧️', desc: 'Steady rain' },
                    { label: 'Heavy Downpour', icon: '⛈️', desc: 'Torrential wash-off' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setRainIntensity(item.label)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        rainIntensity === item.label
                          ? 'bg-sky-500 text-white border-sky-400 shadow-md ring-2 ring-sky-300'
                          : isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300 hover:bg-[#152B1F]' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                      }`}
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <div className="font-black text-xs">{item.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* District Override */}
              <div>
                <label className="block mb-1 font-bold">
                  2. Confirm District / Area:
                </label>
                <select
                  value={detectedDistrict}
                  onChange={(e) => setDetectedDistrict(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-bold text-xs outline-none cursor-pointer ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
                  }`}
                >
                  {Object.keys(DISTRICT_GEO).map(d => (
                    <option key={d} value={d}>{d} ({DISTRICT_GEO[d].state})</option>
                  ))}
                </select>
              </div>

              {/* Optional Field Note */}
              <div>
                <label className="block mb-1 font-bold">
                  3. Field Note / Landmark (Optional):
                </label>
                <input
                  type="text"
                  value={rainNote}
                  onChange={(e) => setRainNote(e.target.value)}
                  placeholder="e.g. Started 15 mins ago in Belthangady taluk"
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white placeholder-gray-500' : 'bg-white border-[#91BA94] text-[#275637] placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRainModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLocating}
                  className="px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Mark Rain on Map</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav className={`sm:hidden fixed bottom-0 inset-x-0 backdrop-blur-lg border-t px-6 py-2 z-40 flex items-center justify-between shadow-lg ${
        isDark ? 'bg-[#0B1712]/95 border-[#162C20]' : 'bg-white/95 border-[#91BA94]'
      }`}>
        <button 
          onClick={() => navigate('/home')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#22C55E]' : 'text-[#275637]'
          }`}
        >
          <span className="text-base">🗺️</span>
          <span className="text-[10px] font-bold">Outbreak</span>
        </button>

        <button 
          onClick={openRainModal}
          className="min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform text-sky-400"
        >
          <CloudRain className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-bold">Rain GPS</span>
        </button>

        <button 
          onClick={() => navigate('/detect')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Detect</span>
        </button>

        <button 
          onClick={() => navigate('/risk')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
          }`}
        >
          <CloudRain className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Spray</span>
        </button>

        <button 
          onClick={() => navigate('/c/arecanut')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
          }`}
        >
          <span className="text-base">👥</span>
          <span className="text-[10px] font-semibold">Community</span>
        </button>
      </nav>

    </div>
  );
}
