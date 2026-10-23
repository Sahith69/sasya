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
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
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
