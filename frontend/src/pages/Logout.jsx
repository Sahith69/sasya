// src/pages/Logout.jsx - Session Termination
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Logout() {
  const navigate = useNavigate();
  const { logout, t } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#275637] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-white border border-[#91BA94] rounded-2xl p-7 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E8F2EA] border border-[#91BA94] text-[#275637] mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#275637]">
          Signed Out Successfully
        </h2>
        <p className="text-xs text-[#556B5C] mt-1 mb-5">
          Your session has been terminated safely.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-4 bg-[#275637] hover:bg-[#1E462B] text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <span>Return to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
