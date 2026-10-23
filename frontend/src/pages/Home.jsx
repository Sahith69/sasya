// src/pages/Home.jsx - Farmer Dashboard Landing
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, CloudRain, Users, Wallet, LogOut, ShieldCheck, MapPin } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, t, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[600px] space-y-5">
        
        {/* Top User Bar */}
        <div className="bg-gradient-to-r from-[#275637] to-[#1E462B] text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#B1D27D] uppercase tracking-wider">
              {user?.role === 'expert' ? '🔬 Verified Agronomist' : '🌱 Registered Farmer Pass'}
            </div>
            <h2 className="text-xl font-extrabold mt-0.5">
              {user?.name || user?.username || 'Farmer'}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#E3ECE5]">
              <MapPin className="w-3.5 h-3.5 text-[#B1D27D]" />
              <span>{user?.village}, {user?.district}</span>
              <span>•</span>
              <span>{user?.crops?.join(', ')}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Diagnostic Card (USP Action) */}
        <div className="bg-white border border-[#91BA94] rounded-2xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5483A] bg-[#FDECEA] px-2 py-0.5 rounded border border-[#F5C2BC]">
                Active Koleroga Season
              </span>
              <h3 className="text-lg font-extrabold text-[#275637] mt-2">
                Scan Crop for Disease
              </h3>
              <p className="text-xs text-[#556B5C] mt-1 max-w-sm leading-relaxed">
                Instant AI pathology diagnosis, Grad-CAM attention heatmap, and 48-hour safe spray window.
              </p>
            </div>
            <div className="text-3xl p-3 bg-[#E8F2EA] rounded-2xl border border-[#91BA94]">
              📷
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={() => alert('Navigating to /detect in next module')}
              className="py-3 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Take Leaf Photo</span>
            </button>
            <button
              onClick={() => alert('Navigating to /risk in next module')}
              className="py-3 px-4 bg-[#FAFCFA] border border-[#91BA94] hover:bg-[#E8F2EA] text-[#275637] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <CloudRain className="w-4 h-4 text-[#275637]" />
              <span>48h Spray Window</span>
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Community */}
          <div 
            onClick={() => alert('Navigating to /c/arecanut in next module')}
            className="bg-white border border-[#91BA94] p-4 rounded-xl shadow-xs cursor-pointer hover:bg-[#F9FAF9] transition-all"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-[#E8F2EA] rounded-lg text-[#275637]">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#275637]">Crop Subs</h4>
            </div>
            <p className="text-[11px] text-[#556B5C] leading-snug">
              Connect with fellow arecanut and paddy growers in your valley.
            </p>
          </div>

          {/* Wallet */}
          <div 
            onClick={() => alert('Navigating to /wallet in next module')}
            className="bg-white border border-[#91BA94] p-4 rounded-xl shadow-xs cursor-pointer hover:bg-[#F9FAF9] transition-all"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-[#E8F2EA] rounded-lg text-[#275637]">
                <Wallet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#275637]">Bounty Wallet</h4>
            </div>
            <p className="text-[11px] text-[#556B5C] leading-snug">
              Earn ₹1.00 per verified disease photo. Payout at ₹50 milestone.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
