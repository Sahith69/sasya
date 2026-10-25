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
import AIAssistant from './pages/AIAssistant';
import Risk from './pages/Risk';
import Wallet from './pages/Wallet';
import Contribute from './pages/Contribute';
import SurveillanceMap from './pages/SurveillanceMap';
import ExpertQueue from './pages/ExpertQueue';

// Admin & Operations Portal Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOverview from './pages/admin/AdminOverview';
import AdminQueue from './pages/admin/AdminQueue';
import AdminReviewDetail from './pages/admin/AdminReviewDetail';
import AdminFarmers from './pages/admin/AdminFarmers';
import AdminFarmerDetail from './pages/admin/AdminFarmerDetail';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAnalyticsSubmissions from './pages/admin/AdminAnalyticsSubmissions';
import AdminAnalyticsVerification from './pages/admin/AdminAnalyticsVerification';
import AdminAnalyticsModel from './pages/admin/AdminAnalyticsModel';
import AdminAnalyticsGates from './pages/admin/AdminAnalyticsGates';
import AdminAnalyticsBounty from './pages/admin/AdminAnalyticsBounty';
import AdminAnalyticsCommunity from './pages/admin/AdminAnalyticsCommunity';
import AdminModeration from './pages/admin/AdminModeration';
import AdminExperts from './pages/admin/AdminExperts';
import AdminExport from './pages/admin/AdminExport';
import AdminAudit from './pages/admin/AdminAudit';

// Admin Protected Route wrapper
function AdminProtectedRoute({ children }) {
  const isAdminAuthed = sessionStorage.getItem('sasya_admin_auth') === 'true';
  if (!isAdminAuthed) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

// Protected Route wrapper (Clean direct access for authenticated farmers)
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
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
        
        {/* Young Farmer Crop Sasya Groups & 1-on-1 Farmer Chat */}
        <Route path="/c/:crop" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/c" element={<Navigate to="/c/arecanut" replace />} />
        <Route path="/chat" element={<Navigate to="/c/arecanut?chat=open" replace />} />
        <Route path="/messages" element={<Navigate to="/c/arecanut?chat=open" replace />} />
        
        {/* Sasya AI Agronomist & Pathology Assistant */}
        <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/assistant" element={<Navigate to="/ai" replace />} />
        <Route path="/ask" element={<Navigate to="/ai" replace />} />

        {/* Deprecated /risk and /spray routes redirected to /home */}
        <Route path="/risk" element={<Navigate to="/home" replace />} />
        <Route path="/spray" element={<Navigate to="/home" replace />} />
        <Route path="/weather" element={<Navigate to="/home" replace />} />
        
        {/* Open Agronomy Dataset Contribution Desk */}
        <Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
        
        {/* Epidemic Surveillance Map */}
        <Route path="/map" element={<SurveillanceMap />} />
        
        {/* Agricultural Scientist & Expert Pathology Review Desk */}
        <Route path="/expert/queue" element={<ProtectedRoute><ExpertQueue /></ProtectedRoute>} />
        <Route path="/expert" element={<Navigate to="/expert/queue" replace />} />

        {/* ── OPERATIONS & ADMIN CONSOLE (17 Exact Routes) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminOverview /></AdminProtectedRoute>} />
        <Route path="/admin/queue" element={<AdminProtectedRoute><AdminQueue /></AdminProtectedRoute>} />
        <Route path="/admin/review" element={<Navigate to="/admin/queue" replace />} />
        <Route path="/admin/review/:submissionId" element={<AdminProtectedRoute><AdminReviewDetail /></AdminProtectedRoute>} />
        <Route path="/admin/farmers" element={<AdminProtectedRoute><AdminFarmers /></AdminProtectedRoute>} />
        <Route path="/admin/farmers/:farmerId" element={<AdminProtectedRoute><AdminFarmerDetail /></AdminProtectedRoute>} />
        
        {/* Analytics Sub-Routes */}
        <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />
        <Route path="/admin/analytics/submissions" element={<AdminProtectedRoute><AdminAnalyticsSubmissions /></AdminProtectedRoute>} />
        <Route path="/admin/analytics/verification" element={<AdminProtectedRoute><AdminAnalyticsVerification /></AdminProtectedRoute>} />
        <Route path="/admin/analytics/model" element={<AdminProtectedRoute><AdminAnalyticsModel /></AdminProtectedRoute>} />
        <Route path="/admin/analytics/gates" element={<AdminProtectedRoute><AdminAnalyticsGates /></AdminProtectedRoute>} />
        <Route path="/admin/analytics/bounty" element={<AdminProtectedRoute><AdminAnalyticsBounty /></AdminProtectedRoute>} />
        <Route path="/admin/analytics/community" element={<AdminProtectedRoute><AdminAnalyticsCommunity /></AdminProtectedRoute>} />
        
        {/* Governance & Operations */}
        <Route path="/admin/moderation" element={<AdminProtectedRoute><AdminModeration /></AdminProtectedRoute>} />
        <Route path="/admin/experts" element={<AdminProtectedRoute><AdminExperts /></AdminProtectedRoute>} />
        <Route path="/admin/export" element={<AdminProtectedRoute><AdminExport /></AdminProtectedRoute>} />
        <Route path="/admin/audit" element={<AdminProtectedRoute><AdminAudit /></AdminProtectedRoute>} />

        {/* Convenient Route Aliases */}
        <Route path="/scan" element={<Navigate to="/detect" replace />} />
        <Route path="/weather" element={<Navigate to="/home" replace />} />
        <Route path="/bounty" element={<Navigate to="/profile" replace />} />
        <Route path="/settings" element={<Navigate to="/profile?tab=settings" replace />} />
        <Route path="/scans" element={<Navigate to="/profile?tab=scans" replace />} />
        <Route path="/listings" element={<Navigate to="/profile?tab=listings" replace />} />
        
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