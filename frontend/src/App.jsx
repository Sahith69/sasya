// src/App.jsx - Main Application Router with Opening Splash Animation
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import OpeningAnimation from './components/OpeningAnimation';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import Onboarding from './pages/Onboarding';
import Consent from './pages/Consent';
import Home from './pages/Home';
import Logout from './pages/Logout';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Detect from './pages/Detect';
import DetectResult from './pages/DetectResult';
import Community from './pages/Community';
import Risk from './pages/Risk';
import Wallet from './pages/Wallet';
import SurveillanceMap from './pages/SurveillanceMap';

// Protected Route wrapper
function ProtectedRoute({ children, requireConsent = true }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireConsent && !user.consentGiven && user.role !== 'expert') {
    return <Navigate to="/onboarding/consent" replace />;
  }
  return children;
}

function MainApp() {
  const { user } = useAuth();
  // Play splash intro once per browser session
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('sasya_splash_seen');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('sasya_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <OpeningAnimation onFinish={handleSplashFinish} />}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/onboarding" element={<ProtectedRoute requireConsent={false}><Onboarding /></ProtectedRoute>} />
        <Route path="/onboarding/consent" element={<ProtectedRoute requireConsent={false}><Consent /></ProtectedRoute>} />
        
        {/* Core Farm Dashboard */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* Farmer Profile & Management Portal (profile, wallet, scans, listings, settings) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        
        {/* Scan a leaf & Diagnostic Result */}
        <Route path="/detect" element={<ProtectedRoute><Detect /></ProtectedRoute>} />
        <Route path="/detect/result" element={<ProtectedRoute><DetectResult /></ProtectedRoute>} />
        
        {/* Young Farmer Crop Sub-Communities */}
        <Route path="/c/:crop" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/c" element={<Navigate to="/c/arecanut" replace />} />
        
        {/* 48-Hour Bioclimatic Spray Window */}
        <Route path="/risk" element={<ProtectedRoute><Risk /></ProtectedRoute>} />
        
        {/* Digital Research Bounty Desk & Wallet */}
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        
        {/* Epidemic Surveillance Map */}
        <Route path="/map" element={<ProtectedRoute><SurveillanceMap /></ProtectedRoute>} />
        
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}