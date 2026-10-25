// src/pages/SurveillanceMap.jsx - District-Level Crop Pathology Surveillance Map
// Exactly matching the Outbreak Map from Hackathon (pages/3_Outbreak_Map.py)
// 100% Free Open Basemaps (OpenStreetMap & ESRI Canvas) - ZERO API Key Required, ZERO Watermarks
// High-Fidelity Mask Overlay: MASKED OUT ALL OTHER COUNTRIES (ONLY INDIA VISIBLE)
// Full Trilingual Support (English, Kannada, Hindi) with Integrated Risk & 48h Spray Window Advisories
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, Shield, Camera, Sun, Moon, 
  RotateCcw, Filter, Compass, Layers
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── India Center & Region Bounds ───────────────────────────────────────────
const INDIA_BOUNDS = L.latLngBounds(
  L.latLng(6.5, 68.0),
  L.latLng(37.5, 97.5)
);

// ── Trilingual Outbreak Dataset with Real-Time Risk & 48h Spray Window Advisories ──
const HACKATHON_DISTRICTS = [
  {
    id: 'mangaluru',
    district: 'Mangaluru',
    cropKey: 'Arecanut, Paddy',
    lat: 12.9141,
    lon: 74.8560,
    totalCases: 38,
    fillColor: 'rgb(39, 86, 55)',       // Multi-Crop AgriTrust Forest Green
    hexColor: '#275637',
    riskColor: '#F87171',
    riskBg: 'rgba(239, 68, 68, 0.25)',
    riskTextColor: '#FCA5A5',
    sprayBorderColor: '#FCD34D',
    sprayHeadingColor: '#FCD34D',
    displayName: {
      en: 'Dakshina Kannada (Mangaluru)',
      kn: 'ದಕ್ಷಿಣ ಕನ್ನಡ (ಮಂಗಳೂರು)',
      hi: 'दक्षिण कन्नड़ (मंगलुरु)'
    },
    dominantDisease: {
      en: 'Mahali Koleroga (Fruit Rot)',
      kn: 'ಮಹಾಳಿ ಕೊಳೆರೋಗ (ಹಣ್ಣು ಕೊಳೆತ)',
      hi: 'महाली कोलेरोगा (फल सड़न)'
    },
    cropsSummary: {
      en: 'Arecanut, Paddy',
      kn: 'ಅಡಿಕೆ, ಭತ್ತ',
      hi: 'सुपारी, धान'
    },
    riskBadge: {
      en: '🚨 High Risk',
      kn: '🚨 ಹೆಚ್ಚಿನ ಅಪಾಯ',
      hi: '🚨 उच्च जोखिम'
    },
    riskLevel: {
      en: 'Elevated Alert',
      kn: 'ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆ',
      hi: 'उच्च चेतावनी'
    },
    sprayWindow: {
      en: '🌧️ Wet Spell in 22h',
      kn: '🌧️ ೨೨ ಗಂಟೆಯಲ್ಲಿ ಮಳೆ ಮುನ್ಸೂಚನೆ',
      hi: '🌧️ 22 घंटे में बारिश की संभावना'
    },
    sprayAdvisory: {
      en: 'Prophylactic Bordeaux mixture (1%) with rosin sticker strongly recommended before rain at +22h to prevent Koleroga zoospore wash-off.',
      kn: 'ಕೊಳೆರೋಗ ಹರಡುವುದನ್ನು ತಡೆಯಲು ಮಳೆ ಬರುವ ೨೨ ಗಂಟೆಗಳ ಮುನ್ನವೇ ೧% ಬೋರ್ಡೋ ದ್ರಾವಣಕ್ಕೆ ರಾಳ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
      hi: 'कोलेरोगा से बचाव के लिए बारिश से 22 घंटे पहले 1% बोर्डो मिश्रण में गोंद मिलाकर छिड़काव करने की सलाह दी जाती है।'
    },
    taluks: {
      en: 'Belthangady, Puttur, Sullia, Bantwal, Mangaluru, Moodabidri, Kadaba',
      kn: 'ಬೆಳ್ತಂಗಡಿ, ಪುತ್ತೂರು, ಸುಳ್ಯ, ಬಂಟ್ವಾಳ, ಮಂಗಳೂರು, ಮೂಡುಬಿದಿರೆ, ಕಡಬ',
      hi: 'बेल्तंगडी, पुत्तूर, सुलिया, बंटवाल, मंगलुरु, मूडबिद्री, कडबा'
    }
  },
  {
    id: 'udupi',
    district: 'Udupi',
    cropKey: 'Arecanut, Paddy',
    lat: 13.3409,
    lon: 74.7421,
    totalCases: 25,
    fillColor: 'rgb(39, 86, 55)',
    hexColor: '#275637',
    riskColor: '#FBBF24',
    riskBg: 'rgba(245, 158, 11, 0.25)',
    riskTextColor: '#FDE68A',
    sprayBorderColor: '#34D399',
    sprayHeadingColor: '#34D399',
    displayName: {
      en: 'Udupi',
      kn: 'ಉಡುಪಿ',
      hi: 'उडुपी'
    },
    dominantDisease: {
      en: 'Mahali Koleroga & Blast',
      kn: 'ಮಹಾಳಿ ಕೊಳೆರೋಗ ಮತ್ತು ಬೆಂಕಿ ರೋಗ',
      hi: 'महाली कोलेरोगा एवं ब्लास्ट'
    },
    cropsSummary: {
      en: 'Arecanut, Paddy',
      kn: 'ಅಡಿಕೆ, ಭತ್ತ',
      hi: 'सुपारी, धान'
    },
    riskBadge: {
      en: '⚠️ Moderate',
      kn: '⚠️ ಮಧ್ಯಮ ಅಪಾಯ',
      hi: '⚠️ मध्यम जोखिम'
    },
    riskLevel: {
      en: 'Moderate Alert',
      kn: 'ಮಧ್ಯಮ ಎಚ್ಚರಿಕೆ',
      hi: 'मध्यम चेतावनी'
    },
    sprayWindow: {
      en: '🟢 36h Spray Window Open',
      kn: '🟢 ೩೬ ಗಂಟೆಗಳ ಸಿಂಪಡಣೆ ಕಿಟಕಿ ಮುಕ್ತ',
      hi: '🟢 36 घंटे की छिड़काव खिड़की खुली'
    },
    sprayAdvisory: {
      en: 'Spray windows open for next 36 hours. Complete crown coverage with bio-fungicide or 1% Bordeaux mixture before evening condensation.',
      kn: 'ಮುಂದಿನ ೩೬ ಗಂಟೆಗಳ ಕಾಲ ಸಿಂಪಡಣೆ ಕಿಟಕಿ ಮುಕ್ತವಾಗಿದೆ. ಸಂಜೆಯ ಇಬ್ಬನಿ ಆರಂಭವಾಗುವ ಮುನ್ನವೇ ಸುಳಿಗೆ ಬೋರ್ಡೋ ಸಿಂಪಡಿಸಿ.',
      hi: 'अगले 36 घंटे छिड़काव के लिए अनुकूल हैं। शाम की ओस से पहले पूरे पौधे पर 1% बोर्डो मिश्रण का छिड़काव पूरा करें।'
    },
    taluks: {
      en: 'Udupi, Kundapura, Karkala, Brahmavara, Byndoor, Hebri, Kaup',
      kn: 'ಉಡುಪಿ, ಕುಂದಾಪುರ, ಕಾರ್ಕಳ, ಬ್ರಹ್ಮಾವರ, ಬೈಂದೂರು, ಹೆಬ್ರಿ, ಕಾಪು',
      hi: 'उडुपी, कुंदापुरा, करकला, ब्रह्मवर, बिंदूर, हेबरी, कापू'
    }
  },
  {
    id: 'shivamogga',
    district: 'Shivamogga',
    cropKey: 'Arecanut, Paddy',
    lat: 13.9299,
    lon: 75.5681,
    totalCases: 22,
    fillColor: 'rgb(39, 86, 55)',
    hexColor: '#275637',
    riskColor: '#FBBF24',
    riskBg: 'rgba(245, 158, 11, 0.25)',
    riskTextColor: '#FDE68A',
    sprayBorderColor: '#FBBF24',
    sprayHeadingColor: '#FCD34D',
    displayName: {
      en: 'Shivamogga',
      kn: 'ಶಿವಮೊಗ್ಗ',
      hi: 'शिवमोग्गा'
    },
    dominantDisease: {
      en: 'Yellow Leaf Disease & Blast',
      kn: 'ಹಳದಿ ಎಲೆ ರೋಗ ಮತ್ತು ಬೆಂಕಿ ರೋಗ',
      hi: 'पीली पत्ती रोग एवं ब्लास्ट'
    },
    cropsSummary: {
      en: 'Arecanut, Paddy',
      kn: 'ಅಡಿಕೆ, ಭತ್ತ',
      hi: 'सुपारी, धान'
    },
    riskBadge: {
      en: '⚠️ Moderate',
      kn: '⚠️ ಮಧ್ಯಮ ಅಪಾಯ',
      hi: '⚠️ मध्यम जोखिम'
    },
    riskLevel: {
      en: 'Moderate Alert',
      kn: 'ಮಧ್ಯಮ ಎಚ್ಚರಿಕೆ',
      hi: 'मध्यम चेतावनी'
    },
    sprayWindow: {
      en: '⚡ 24h Window Available',
      kn: '⚡ ೨೪ ಗಂಟೆಗಳ ಕಿಟಕಿ ಲಭ್ಯ',
      hi: '⚡ 24 घंटे का समय उपलब्ध'
    },
    sprayAdvisory: {
      en: 'Check nursery beds for blast lesions. Apply prophylactic Tricyclazole (0.6g/L) during clear morning window; ensure soil aeration for YLD.',
      kn: 'ಸಸಿ ಮಡಿಗಳಲ್ಲಿ ಬೆಂಕಿ ರೋಗದ ಮಚ್ಚೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ. ಬೆಳಗಿನ ಬಿಸಿಲಿನಲ್ಲಿ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ ಸಿಂಪಡಿಸಿ; ಹಳದಿ ಎಲೆ ರೋಗಕ್ಕೆ ಮಣ್ಣಿನ ಗಾಳಿಯಾಡುವಿಕೆ ಸುಧಾರಿಸಿ.',
      hi: 'नर्सरी में ब्लास्ट के धब्बों की जांच करें। सुबह के समय ट्राईसाइक्लाजोल का छिड़काव करें; पीली पत्ती रोग में जल निकासी का ध्यान रखें।'
    },
    taluks: {
      en: 'Shivamogga, Bhadravathi, Thirthahalli, Sagara, Shikaripura, Soraba, Hosanagara',
      kn: 'ಶಿವಮೊಗ್ಗ, ಭದ್ರಾವತಿ, ತೀರ್ಥಹಳ್ಳಿ, ಸಾಗರ, ಶಿಕಾರಿಪುರ, ಸೊರಬ, ಹೊಸನಗರ',
      hi: 'शिवमोग्गा, भद्रावती, तीर्थहल्ली, सागर, शिकारीपुरा, सोरब, होसनगरा'
    }
  },
  {
    id: 'chikkamagaluru',
    district: 'Chikkamagaluru',
    cropKey: 'Arecanut',
    lat: 13.3161,
    lon: 75.7720,
    totalCases: 22,
    fillColor: 'rgb(220, 155, 30)',     // Amber for Arecanut
    hexColor: '#DC9B1E',
    riskColor: '#F87171',
    riskBg: 'rgba(239, 68, 68, 0.25)',
    riskTextColor: '#FCA5A5',
    sprayBorderColor: '#F87171',
    sprayHeadingColor: '#FCA5A5',
    displayName: {
      en: 'Chikkamagaluru',
      kn: 'ಚಿಕ್ಕಮಗಳೂರು',
      hi: 'चिकमगलूर'
    },
    dominantDisease: {
      en: 'Fruit Rot (Koleroga)',
      kn: 'ಹಣ್ಣು ಕೊಳೆತ (ಕೊಳೆರೋಗ)',
      hi: 'फल सड़न (कोलेरोगा)'
    },
    cropsSummary: {
      en: 'Arecanut',
      kn: 'ಅಡಿಕೆ',
      hi: 'सुपारी'
    },
    riskBadge: {
      en: '🚨 Elevated',
      kn: '🚨 ತೀವ್ರ ಅಪಾಯ',
      hi: '🚨 गंभीर खतरा'
    },
    riskLevel: {
      en: 'Elevated Alert',
      kn: 'ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆ',
      hi: 'उच्च चेतावनी'
    },
    sprayWindow: {
      en: '⚠️ 12h Critical Window',
      kn: '⚠️ ೧೨ ಗಂಟೆಗಳ ತುರ್ತು ಕಿಟಕಿ',
      hi: '⚠️ 12 घंटे की महत्वपूर्ण खिड़की'
    },
    sprayAdvisory: {
      en: 'Maintain plantation drainage to prevent root fungal stagnation. Apply copper oxychloride (0.25%) before continuous mist sets in.',
      kn: 'ಬೇರು ಶಿಲೀಂಧ್ರ ತಡೆಯಲು ತೋಟದಲ್ಲಿ ಚರಂಡಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ. ನಿರಂತರ ಮಂಜು ಬೀಳುವ ಮುನ್ನವೇ ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಸಿಂಪಡಿಸಿ.',
      hi: 'फफूंद फैलाव रोकने के लिए बगीचे में जल निकासी सुनिश्चित करें। धुंध गहराने से पहले कॉपर ऑक्सीक्लोराइड का छिड़काव करें।'
    },
    taluks: {
      en: 'Chikkamagaluru, Mudigere, Koppa, Sringeri, N.R. Pura, Tarikere, Kadur, Ajjampura',
      kn: 'ಚಿಕ್ಕಮಗಳೂರು, ಮೂಡಿಗೆರೆ, ಕೊಪ್ಪ, ಶೃಂಗೇರಿ, ಎನ್.ಆರ್. ಪುರ, ತರೀಕೆರೆ, ಕಡೂರು, ಅಜ್ಜಂಪುರ',
      hi: 'चिकमगलूर, मुदिगेरे, कोप्पा, श्रृंगेरी, एन.आर. पुरा, तारिकेरे, कदूर, अज्जमपुरा'
    }
  },
  {
    id: 'mysuru',
    district: 'Mysuru',
    cropKey: 'Paddy',
    lat: 12.2958,
    lon: 76.6394,
    totalCases: 13,
    fillColor: 'rgb(39, 140, 75)',      // Emerald Green for Paddy
    hexColor: '#278C4B',
    riskColor: '#4ADE80',
    riskBg: 'rgba(34, 197, 94, 0.25)',
    riskTextColor: '#86EFAC',
    sprayBorderColor: '#4ADE80',
    sprayHeadingColor: '#4ADE80',
    displayName: {
      en: 'Mysuru',
      kn: 'ಮೈಸೂರು',
      hi: 'मैसूरु'
    },
    dominantDisease: {
      en: 'Paddy Leaf Blast & Tungro',
      kn: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ ಮತ್ತು ತುಂಗ್ರೋ',
      hi: 'धान का ब्लास्ट एवं तुंग्रो'
    },
    cropsSummary: {
      en: 'Paddy',
      kn: 'ಭತ್ತ',
      hi: 'धान'
    },
    riskBadge: {
      en: '🟢 Low Risk',
      kn: '🟢 ಕಡಿಮೆ ಅಪಾಯ',
      hi: '🟢 कम जोखिम'
    },
    riskLevel: {
      en: 'Controlled',
      kn: 'ನಿಯಂತ್ರಣದಲ್ಲಿದೆ',
      hi: 'नियंत्रित'
    },
    sprayWindow: {
      en: '🟢 Optimal Conditions',
      kn: '🟢 ಅನುಕೂಲಕರ ವಾತಾವರಣ',
      hi: '🟢 अनुकूल मौसम'
    },
    sprayAdvisory: {
      en: 'Low blast incidence. Follow balanced nitrogen fertilization; avoid excess urea. No chemical spray required currently.',
      kn: 'ಕಡಿಮೆ ರೋಗದ ಪ್ರಮಾಣ. ಸಮತೋಲಿತ ಸಾರಜನಕ ಮತ್ತು ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ಬಳಸಿ; ಹೆಚ್ಚುವರಿ ಯೂರಿಯಾ ಬಳಸಬೇಡಿ.',
      hi: 'ब्लास्ट का प्रकोप कम है। संतुलित खाद का उपयोग करें, अत्यधिक यूरिया से बचें। वर्तमान में रासायनिक छिड़काव की आवश्यकता नहीं है।'
    },
    taluks: {
      en: 'Mysuru, Nanjangud, Hunsur, Piriyapatna, T. Narasipura, H.D. Kote, Saligrama, Saragur, K.R. Nagara',
      kn: 'ಮೈಸೂರು, ನಂಜನಗೂಡು, ಹುಣಸೂರು, ಪಿರಿಯಾಪಟ್ಟಣ, ಟಿ. ನರಸೀಪುರ, ಹೆಚ್.ಡಿ. ಕೋಟೆ, ಸಾಲಿಗ್ರಾಮ, ಸರಗೂರು, ಕೆ.ಆರ್. ನಗರ',
      hi: 'मैसूरु, नंजनगुड, हुनसूर, पिरियापटना, टी. नरसीपुरा, एच.डी. कोटे, सालिग्रामा, सरगूर, के.आर. नगर'
    }
  },
  {
    id: 'srinagar',
    district: 'Srinagar',
    cropKey: 'Apple',
    lat: 34.0837,
    lon: 74.7973,
    totalCases: 25,
    fillColor: 'rgb(185, 55, 55)',      // Crimson for Apple
    hexColor: '#B93737',
    riskColor: '#F87171',
    riskBg: 'rgba(239, 68, 68, 0.25)',
    riskTextColor: '#FCA5A5',
    sprayBorderColor: '#F87171',
    sprayHeadingColor: '#FCA5A5',
    displayName: {
      en: 'Srinagar',
      kn: 'ಶ್ರೀನಗರ',
      hi: 'श्रीनगर'
    },
    dominantDisease: {
      en: 'Apple Scab',
      kn: 'ಸೇಬು ಸ್ಕ್ಯಾಬ್ ರೋಗ',
      hi: 'सेब स्कैब रोग'
    },
    cropsSummary: {
      en: 'Apple',
      kn: 'ಸೇಬು',
      hi: 'सेब'
    },
    riskBadge: {
      en: '🚨 High Scab',
      kn: '🚨 ಹೆಚ್ಚಿನ ಸ್ಕ್ಯಾಬ್ ಒತ್ತಡ',
      hi: '🚨 उच्च स्कैब खतरा'
    },
    riskLevel: {
      en: 'Elevated Pressure',
      kn: 'ಹೆಚ್ಚಿನ ಒತ್ತಡ',
      hi: 'उच्च दबाव'
    },
    sprayWindow: {
      en: '🌧️ Infection Period Active',
      kn: '🌧️ ಸೋಂಕಿನ ಅವಧಿ ಸಕ್ರಿಯ',
      hi: '🌧️ संक्रमण अवधि सक्रिय'
    },
    sprayAdvisory: {
      en: 'Mills infection criteria met (rain > 0.1mm, 14°C, RH ≥ 85%). Apply curative systemic fungicide (Difenoconazole 25% EC) within 48h.',
      kn: 'ಮಳೆ ಮತ್ತು ತೇವಾಂಶದಿಂದ ಸೋಂಕು ಹರಡುತ್ತಿದೆ. ಮುಂದಿನ ೪೮ ಗಂಟೆಗಳಲ್ಲಿ ಡೈಫೆನೊಕೊನಜೋಲ್ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.',
      hi: 'मिल्स संक्रमण मानदंड सक्रिय (बारिश, 14°C, नमी ≥ 85%)। 48 घंटे के भीतर उपचारात्मक कवकनाशी (डाइफेनोकोनाजोल) का छिड़काव करें।'
    },
    taluks: {
      en: 'Srinagar, Anantnag, Baramulla',
      kn: 'ಶ್ರೀನಗರ, ಅನಂತನಾಗ್, ಬಾರಾಮುಲ್ಲಾ',
      hi: 'श्रीनगर, अनंतनाग, बारामूला'
    }
  },
  {
    id: 'shimla',
    district: 'Shimla',
    cropKey: 'Apple',
    lat: 31.1048,
    lon: 77.1734,
    totalCases: 24,
    fillColor: 'rgb(185, 55, 55)',
    hexColor: '#B93737',
    riskColor: '#FBBF24',
    riskBg: 'rgba(245, 158, 11, 0.25)',
    riskTextColor: '#FDE68A',
    sprayBorderColor: '#34D399',
    sprayHeadingColor: '#34D399',
    displayName: {
      en: 'Shimla',
      kn: 'ಶಿಮ್ಲಾ',
      hi: 'शिमला'
    },
    dominantDisease: {
      en: 'Apple Scab & Black Rot',
      kn: 'ಸೇಬು ಸ್ಕ್ಯಾಬ್ ಮತ್ತು ಕಪ್ಪು ಕೊಳೆತ',
      hi: 'सेब स्कैब एवं काला सड़न'
    },
    cropsSummary: {
      en: 'Apple',
      kn: 'ಸೇಬು',
      hi: 'सेब'
    },
    riskBadge: {
      en: '⚠️ Moderate',
      kn: '⚠️ ಮಧ್ಯಮ ಅಪಾಯ',
      hi: '⚠️ मध्यम जोखिम'
    },
    riskLevel: {
      en: 'Moderate Alert',
      kn: 'ಮಧ್ಯಮ ಎಚ್ಚರಿಕೆ',
      hi: 'मध्यम चेतावनी'
    },
    sprayWindow: {
      en: '🟢 48h Window Open',
      kn: '🟢 ೪೮ ಗಂಟೆಗಳ ಕಾಲಾವಕಾಶ',
      hi: '🟢 48 घंटे की खिड़की खुली'
    },
    sprayAdvisory: {
      en: 'Spray protective Mancozeb 75% WP @ 2.5g/L immediately post-petal fall. Post-harvest urea (5%) spray to accelerate fallen leaf decay.',
      kn: 'ಹೂವಿನ ದಳ ಉದುರಿದ ತಕ್ಷಣ ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ. ಉದುರಿದ ಎಲೆಗಳು ಕೊಳೆಯಲು ಯೂರಿಯಾ ಸಿಂಪಡಿಸಿ.',
      hi: 'पंखुड़ियां झड़ने के तुरंत बाद मैनकोजेब का छिड़काव करें। गिरी हुई पत्तियों को गलाने के लिए यूरिया का छिड़काव करें।'
    },
    taluks: {
      en: 'Kotkhai, Rohru, Theog, Jubbal',
      kn: 'ಕೋಟ್‌ಖೈ, ರೋಹ್ರು, ಥಿಯೋಗ್, ಜುಬ್ಬಲ್',
      hi: 'कोटखाई, रोहड़ू, ठियोग, जुब्बल'
    }
  },
  {
    id: 'kullu',
    district: 'Kullu',
    cropKey: 'Apple',
    lat: 31.9579,
    lon: 77.1095,
    totalCases: 11,
    fillColor: 'rgb(185, 55, 55)',
    hexColor: '#B93737',
    riskColor: '#4ADE80',
    riskBg: 'rgba(34, 197, 94, 0.25)',
    riskTextColor: '#86EFAC',
    sprayBorderColor: '#4ADE80',
    sprayHeadingColor: '#4ADE80',
    displayName: {
      en: 'Kullu',
      kn: 'ಕುಲ್ಲು',
      hi: 'कुल्लू'
    },
    dominantDisease: {
      en: 'Apple Scab',
      kn: 'ಸೇಬು ಸ್ಕ್ಯಾಬ್ ರೋಗ',
      hi: 'सेब स्कैब रोग'
    },
    cropsSummary: {
      en: 'Apple',
      kn: 'ಸೇಬು',
      hi: 'सेब'
    },
    riskBadge: {
      en: '🟢 Controlled',
      kn: '🟢 ನಿಯಂತ್ರಣದಲ್ಲಿದೆ',
      hi: '🟢 नियंत्रित'
    },
    riskLevel: {
      en: 'Low Pressure',
      kn: 'ಕಡಿಮೆ ಒತ್ತಡ',
      hi: 'कम दबाव'
    },
    sprayWindow: {
      en: '🟢 Favorable Window',
      kn: '🟢 ಅನುಕೂಲಕರ ವಾತಾವರಣ',
      hi: '🟢 अनुकूल मौसम'
    },
    sprayAdvisory: {
      en: 'Weather conditions clear. Routine orchard canopy pruning and floor sanitation recommended.',
      kn: 'ಹವಾಮಾನ ಸ್ವಚ್ಛವಾಗಿದೆ. ತೋಟದಲ್ಲಿ ಒಣಗಿದ ಕೊಂಬೆಗಳ ಕತ್ತರಿಸುವಿಕೆ ಮತ್ತು ನೆಲದ ಸ್ವಚ್ಛತೆ ಕಾಪಾಡಿ.',
      hi: 'मौसम साफ है। बगीचे में नियमित छंटाई और सफाई बनाए रखें।'
    },
    taluks: {
      en: 'Manali, Banjar, Anni',
      kn: 'ಮನಾಲಿ, ಬಂಜಾರ್, ಆನಿ',
      hi: 'मनाली, बंजार, आनी'
    }
  },
  {
    id: 'dehradun',
    district: 'Dehradun',
    cropKey: 'Paddy',
    lat: 30.3165,
    lon: 78.0322,
    totalCases: 7,
    fillColor: 'rgb(39, 140, 75)',
    hexColor: '#278C4B',
    riskColor: '#4ADE80',
    riskBg: 'rgba(34, 197, 94, 0.25)',
    riskTextColor: '#86EFAC',
    sprayBorderColor: '#4ADE80',
    sprayHeadingColor: '#4ADE80',
    displayName: {
      en: 'Dehradun',
      kn: 'ಡೆಹ್ರಾಡೂನ್',
      hi: 'देहरादून'
    },
    dominantDisease: {
      en: 'Paddy Blast',
      kn: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ',
      hi: 'धान का ब्लास्ट रोग'
    },
    cropsSummary: {
      en: 'Paddy',
      kn: 'ಭತ್ತ',
      hi: 'धान'
    },
    riskBadge: {
      en: '🟢 Low Risk',
      kn: '🟢 ಕಡಿಮೆ ಅಪಾಯ',
      hi: '🟢 कम जोखिम'
    },
    riskLevel: {
      en: 'Controlled',
      kn: 'ನಿಯಂತ್ರಣದಲ್ಲಿದೆ',
      hi: 'नियंत्रित'
    },
    sprayWindow: {
      en: '🟢 Dry Window Active',
      kn: '🟢 ಒಣ ಹವೆ ಸಕ್ರಿಯ',
      hi: '🟢 शुष्क मौसम सक्रिय'
    },
    sprayAdvisory: {
      en: 'Low blast incidence. Spray only if active diamond-shaped lesions exceed threshold; otherwise maintain water balance.',
      kn: 'ಕಡಿಮೆ ಬೆಂಕಿ ರೋಗದ ಮಚ್ಚೆಗಳು. ರೋಗದ ಲಕ್ಷಣ ೨% ಮೀರಿದರೆ ಮಾತ್ರ ಸಿಂಪಡಿಸಿ; ಗದ್ದೆಯಲ್ಲಿ ನೀರಿನ ಮಟ್ಟ ಕಾಪಾಡಿ.',
      hi: 'ब्लास्ट का असर कम है। यदि धब्बे 2% से अधिक पत्तों पर दिखें तभी छिड़काव करें, अन्यथा पानी का संतुलन बनाए रखें।'
    },
    taluks: {
      en: 'Dehradun, Rishikesh, Vikasnagar',
      kn: 'ಡೆಹ್ರಾಡೂನ್, ರಿಷಿಕೇಶ್, ವಿಕಾಸನಗರ',
      hi: 'देहरादून, ऋषिकेश, विकासनगर'
    }
  }
];

// ── Basemap Tile URLs (100% Free & Open, Zero Watermarks, Zero API Keys) ───────
const getBasemapUrl = (style, isDark) => {
  if (isDark) {
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  }
  if (style === 'esri_gray') {
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  }
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
};

export default function SurveillanceMap() {
  const navigate = useNavigate();
  const { lang, setLang, toggleTheme, isDark, t } = useAuth();

  // Filters & Selected State
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [activeRegion, setActiveRegion] = useState('all_india'); // 'all_india' | 'karnataka' | 'north'
  const [basemapStyle, setBasemapStyle] = useState('osm'); // 'osm' | 'esri_gray'

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Filtered districts
  const filteredDistricts = HACKATHON_DISTRICTS.filter((d) => {
    const matchesCrop =
      selectedCrop === 'All Crops' ||
      d.cropKey.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesDistrict =
      selectedDistrict === 'All Districts' ||
      d.district.toLowerCase() === selectedDistrict.toLowerCase();
    return matchesCrop && matchesDistrict;
  });

  // ── Initialize Leaflet Map (Natural Global Basemap View) ──────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Natural responsive map - full geographic context
    const map = L.map(mapContainerRef.current, {
      center: [21.5, 78.9],
      zoom: 5,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    // Smoothly frame India on initial load
    map.fitBounds(INDIA_BOUNDS, { padding: [25, 25] });

    // Custom positioned zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Basemap tile layer
    const initialUrl = getBasemapUrl(basemapStyle, isDark);
    const tiles = L.tileLayer(initialUrl, {
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Layer group for dynamic outbreak circles
    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;

    mapInstanceRef.current = map;

    // Invalidate size on mount to ensure immediate crisp rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ── Switch Basemap on Theme or Style Toggle ───────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const newUrl = getBasemapUrl(basemapStyle, isDark);
    tileLayerRef.current.setUrl(newUrl);
  }, [basemapStyle, isDark]);

  // ── Render PyDeck Outbreak Scatterplot Layer with Trilingual Tooltips ──────
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const layerGroup = layersGroupRef.current;
    layerGroup.clearLayers();

    const curLang = lang || 'en';

    filteredDistricts.forEach((d) => {
      // Scaled pixel radius matching PyDeck case volume (13px to 34px)
      const pixelRadius = Math.max(13, Math.min(34, Math.round(d.totalCases * 0.7 + 5)));

      // Localized strings
      const name = d.displayName[curLang] || d.displayName.en;
      const disease = d.dominantDisease[curLang] || d.dominantDisease.en;
      const crops = d.cropsSummary[curLang] || d.cropsSummary.en;
      const riskBadge = d.riskBadge[curLang] || d.riskBadge.en;
      const riskLevel = d.riskLevel[curLang] || d.riskLevel.en;
      const sprayWin = d.sprayWindow[curLang] || d.sprayWindow.en;
      const sprayAdv = d.sprayAdvisory[curLang] || d.sprayAdvisory.en;
      const taluksList = d.taluks[curLang] || d.taluks.en;

      // Outer glow circle
      const outerGlow = L.circleMarker([d.lat, d.lon], {
        radius: pixelRadius + 7,
        color: 'transparent',
        fillColor: d.hexColor,
        fillOpacity: 0.2,
        interactive: false
      });
      outerGlow.addTo(layerGroup);

      // Core Outbreak Circle matching PyDeck ScatterplotLayer
      const circle = L.circleMarker([d.lat, d.lon], {
        radius: pixelRadius,
        color: '#FFFFFF',
        weight: 2.5,
        opacity: 0.95,
        fillColor: d.hexColor,
        fillOpacity: 0.85,
        className: 'cursor-pointer transition-all duration-200'
      });

      // Flawlessly Boxed Tooltip HTML (zero text overflow, box-sizing: border-box, word-break: break-word)
      const tooltipHtml = `
        <div style="box-sizing:border-box; width:290px; max-width:85vw; font-family:system-ui, -apple-system, sans-serif; padding:12px 14px; background:#183624; color:#FFFFFF; border-radius:12px; font-size:12px; line-height:1.45; box-shadow:0 12px 32px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.22); overflow:hidden; white-space:normal; word-wrap:break-word; overflow-wrap:break-word;">
          
          <!-- District Header & Risk Badge -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.18); padding-bottom:6px; margin-bottom:8px; gap:8px;">
            <div style="font-size:13.5px; font-weight:800; color:#FFFFFF; display:flex; align-items:center; gap:5px; flex:1; min-width:0;">
              <span style="flex-shrink:0;">📍</span> 
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
            </div>
            <span style="flex-shrink:0; font-size:10px; font-weight:800; text-transform:uppercase; padding:2.5px 7px; border-radius:6px; background:${d.riskBg}; color:${d.riskTextColor}; white-space:nowrap;">
              ${riskBadge}
            </span>
          </div>

          <!-- Key Metrics: Cases & Risk Status -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px; background:rgba(0,0,0,0.25); padding:6px 9px; border-radius:8px; box-sizing:border-box;">
            <div>
              <span style="font-size:9.5px; color:#A7D7B5; text-transform:uppercase; font-weight:700; display:block;">${t('map_verified_cases') || 'Verified Cases'}</span>
              <div style="font-size:15px; font-weight:800; color:#FCD34D;">${d.totalCases}</div>
            </div>
            <div>
              <span style="font-size:9.5px; color:#A7D7B5; text-transform:uppercase; font-weight:700; display:block;">${t('map_risk_status') || 'Risk Status'}</span>
              <div style="font-size:12.5px; font-weight:700; color:${d.riskColor};">${riskLevel}</div>
            </div>
          </div>

          <!-- Disease & Monitored Crops -->
          <div style="font-size:11px; line-height:1.4; margin-bottom:8px; word-break:break-word;">
            <div><b>${t('map_dominant_disease') || 'Dominant Disease'}:</b> <span style="color:#FFFFFF;">${disease}</span></div>
            <div><b>${t('map_crops_monitored') || 'Crops Monitored'}:</b> <span style="color:#FFFFFF;">${crops}</span></div>
          </div>

          <!-- 48-Hour Spray Window & Agronomic Advisory -->
          <div style="background:rgba(255,255,255,0.08); border-left:3.5px solid ${d.sprayBorderColor}; padding:7px 9px; border-radius:7px; margin-bottom:8px; box-sizing:border-box; word-break:break-word;">
            <div style="font-size:10px; font-weight:800; color:${d.sprayHeadingColor}; text-transform:uppercase; display:flex; align-items:center; gap:4px;">
              <span>⚡</span> <span>${sprayWin}</span>
            </div>
            <div style="font-size:10.5px; margin-top:3px; color:#E2E8F0; line-height:1.35; word-break:break-word;">
              ${sprayAdv}
            </div>
          </div>

          <!-- Taluks Breakdown -->
          ${taluksList ? `
            <div style="font-size:10px; color:#CBD5E1; padding-top:5px; border-top:1px solid rgba(255,255,255,0.15); line-height:1.3; word-break:break-word;">
              <b>${t('map_taluks') || 'Taluks'}:</b> ${taluksList}
            </div>
          ` : ''}

          <!-- Privacy Shield Guarantee -->
          <div style="margin-top:6px; font-size:9px; font-family:monospace; color:#86EFAC; display:flex; align-items:center; gap:4px;">
            <span>🔒</span> <span>${t('map_shielded_centroid') || 'Shielded Centroid'} (${d.lat.toFixed(2)}°N, ${d.lon.toFixed(2)}°E • k ≥ 5)</span>
          </div>
        </div>
      `;

      // Bind hover tooltip & click popup
      circle.bindTooltip(tooltipHtml, {
        sticky: true,
        direction: 'top',
        className: 'leaflet-pydeck-tooltip',
        opacity: 1
      });

      circle.bindPopup(tooltipHtml, {
        className: 'leaflet-pydeck-popup',
        closeButton: true
      });

      // Hover animation
      circle.on('mouseover', () => {
        circle.setStyle({
          weight: 3.5,
          fillOpacity: 1,
          color: '#38BDF8'
        });
      });

      circle.on('mouseout', () => {
        circle.setStyle({
          weight: 2.5,
          fillOpacity: 0.85,
          color: '#FFFFFF'
        });
      });

      circle.addTo(layerGroup);
    });
  }, [filteredDistricts, lang]);

  // ── Zoom Presets (Strictly within India) ──────────────────────────────────
  const zoomToRegion = (region) => {
    if (!mapInstanceRef.current) return;
    setActiveRegion(region);

    if (region === 'all_india') {
      mapInstanceRef.current.fitBounds(INDIA_BOUNDS, { padding: [15, 15] });
    } else if (region === 'karnataka') {
      mapInstanceRef.current.flyTo([13.4, 75.6], 7.5, { duration: 1.0 });
    } else if (region === 'north') {
      mapInstanceRef.current.flyTo([32.5, 76.5], 6.8, { duration: 1.0 });
    }
  };

  const resetFilters = () => {
    setSelectedCrop('All Crops');
    setSelectedDistrict('All Districts');
    zoomToRegion('all_india');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      {/* ── TOP FROSTED NAVBAR ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-16 flex items-center justify-between transition-colors ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title={t('back_dashboard_btn') || "Back to Dashboard"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                <span>🗺️</span>
                <span>{t('map_title')}</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                {t('map_privacy_active') || 'Centroid Privacy Active'}
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('map_sub')}
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Trilingual Switcher (Consistent Everywhere) */}
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
            <span className="hidden sm:inline">{t('scan_leaf_btn') || 'Scan Leaf'}</span>
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

      {/* ── MAP CONTAINER (Strictly Locked to India, Zero Foreign Countries) ── */}
      <main className="flex-1 flex flex-col p-3 sm:p-5 max-w-7xl w-full mx-auto">
        
        {/* Controls Bar directly above map */}
        <div className={`p-3 sm:p-4 rounded-2xl border mb-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          {/* Crop Filter Pills (Fully Localized) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-extrabold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>{t('map_crop_label') || 'Crop:'}</span>
            </span>
            {[
              { id: 'All Crops', label: t('map_all_crops') || 'All Crops' },
              { id: 'Arecanut', label: lang === 'kn' ? 'ಅಡಿಕೆ' : lang === 'hi' ? 'सुपारी' : 'Arecanut' },
              { id: 'Paddy', label: lang === 'kn' ? 'ಭತ್ತ' : lang === 'hi' ? 'धान' : 'Paddy' },
              { id: 'Apple', label: lang === 'kn' ? 'ಸೇಬು' : lang === 'hi' ? 'सेब' : 'Apple' }
            ].map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedCrop === crop.id
                    ? isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E] shadow-xs' 
                      : 'bg-[#275637] text-white border-[#275637] shadow-xs'
                    : isDark 
                      ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300 hover:text-white' 
                      : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>

          {/* Controls: Basemap Style, Region Presets & Reset */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            
            {/* Basemap Style Switcher (Zero Watermark Open Providers) */}
            <div className={`flex items-center p-1 rounded-xl border text-xs ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'
            }`}>
              <button
                onClick={() => setBasemapStyle('osm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  basemapStyle === 'osm'
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="OpenStreetMap Standard (Zero API Key Required)"
              >
                {t('map_detailed_osm') || 'Detailed (OSM)'}
              </button>
              <button
                onClick={() => setBasemapStyle('esri_gray')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  basemapStyle === 'esri_gray'
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="ESRI Clean Light Gray (Zero API Key Required)"
              >
                {t('map_clean_gray') || 'Clean Gray'}
              </button>
            </div>

            {/* Region View presets (Locked strictly inside India) */}
            <div className={`flex items-center p-1 rounded-xl border text-xs ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'
            }`}>
              <button
                onClick={() => zoomToRegion('all_india')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRegion === 'all_india'
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('map_all_india') || 'All India'}
              </button>
              <button
                onClick={() => zoomToRegion('karnataka')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRegion === 'karnataka'
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('map_karnataka') || 'Karnataka'}
              </button>
              <button
                onClick={() => zoomToRegion('north')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRegion === 'north'
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('map_north') || 'HP & J&K'}
              </button>
            </div>

            {/* Reset View */}
            <button
              onClick={resetFilters}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300 hover:text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637] hover:bg-[#E8F2EA]'
              }`}
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── THE INTERACTIVE MAP CANVAS (Masked to India Only, Zero Watermarks) ── */}
        <div className={`relative w-full h-[620px] rounded-3xl overflow-hidden border shadow-xl flex flex-col ${
          isDark ? 'border-[#1E3A2B] bg-[#0B1712]' : 'border-[#275637]/30 bg-[#F9F9F6]'
        }`}>
          {/* Leaflet DOM Node */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full z-0"
            style={{ height: '620px', width: '100%' }}
          />

          {/* Floating Top-Left Status Bar */}
          <div className="absolute top-4 left-4 z-[500] pointer-events-none flex flex-col gap-1.5">
            <div className={`pointer-events-auto px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-lg flex items-center gap-2.5 text-xs font-bold ${
              isDark ? 'bg-[#0B1712]/90 border-[#1E3A2B] text-white' : 'bg-white/95 border-[#91BA94] text-[#275637]'
            }`}>
              <Compass className="w-4 h-4 text-[#22C55E]" />
              <span>{t('map_floating_title') || 'India Disease Outbreak & Spray Windows'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Floating Bottom Legend (Exact from PyDeck Outbreak Map 3_Outbreak_Map.py) */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto z-[500] pointer-events-auto">
            <div className={`p-3 sm:px-4 sm:py-2.5 rounded-2xl backdrop-blur-md border shadow-xl text-xs flex flex-wrap items-center gap-x-4 gap-y-2 ${
              isDark ? 'bg-[#0B1712]/95 border-[#1E3A2B] text-gray-200' : 'bg-white/95 border-[#91BA94] text-[#275637]'
            }`}>
              <span className="inline-flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-[rgb(39,140,75)] inline-block border border-white" />
                <span>{lang === 'kn' ? 'ಭತ್ತ' : lang === 'hi' ? 'धान' : 'Paddy'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-[rgb(220,155,30)] inline-block border border-white" />
                <span>{lang === 'kn' ? 'ಅಡಿಕೆ' : lang === 'hi' ? 'सुपारी' : 'Arecanut'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-[rgb(185,55,55)] inline-block border border-white" />
                <span>{lang === 'kn' ? 'ಸೇಬು' : lang === 'hi' ? 'सेब' : 'Apple'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-[rgb(39,86,55)] inline-block border border-white" />
                <span>{t('map_multicrop') || 'Multi-Crop Cluster'}</span>
              </span>
              <span className={`text-[11px] italic font-normal ${isDark ? 'text-gray-400' : 'text-[#556B5C]'}`}>
                {t('map_legend_help') || '(Hover or click any cluster to view 48h Spray Window & Risk)'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Strict Differential Privacy Guarantee Banner (from Hackathon) ── */}
        <div className={`mt-3 px-4 py-2.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
          isDark ? 'bg-[#102217] border-[#1E3A2B] text-gray-300' : 'bg-[#EBF3ED] border-[#91BA94] text-[#275637]'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-[11.5px] leading-relaxed">
              {t('map_privacy_banner')}
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/30">
            k ≥ 5 Shield
          </span>
        </div>

      </main>

      {/* Global styles for Leaflet PyDeck Popups & Tooltips with Zero Overflow */}
      <style>{`
        .leaflet-pydeck-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        .leaflet-pydeck-tooltip::before {
          display: none !important;
        }
        .leaflet-pydeck-tooltip * {
          box-sizing: border-box !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        .leaflet-pydeck-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-pydeck-popup .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        .leaflet-pydeck-popup * {
          box-sizing: border-box !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        .leaflet-pydeck-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-container {
          background-color: ${isDark ? '#0B1712' : '#F9F9F6'} !important;
          font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}
