// src/pages/admin/AdminLogin.jsx - ADMIN_PASS Gate for Expert Pathologists & Administrators
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, Lock, ArrowLeft, Sun, Moon, Sparkles, 
  AlertCircle, CheckCircle2, KeyRound
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      setIsSubmitting(false);
      // Valid passwords: admin123, admin2026, or environment standard
      if (password === 'admin123' || password === 'admin2026') {
        sessionStorage.setItem('sasya_admin_auth', 'true');
        navigate('/admin');
      } else {
        setError('Invalid administrator key. For pitch demo, use "admin123" or click 1-Click Demo.');
      }
    }, 300);
  };

  const handleQuickDemo = () => {
    setPassword('admin123');
    sessionStorage.setItem('sasya_admin_auth', 'true');
    setTimeout(() => {
      navigate('/admin');
    }, 200);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link 
          to="/home" 
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-[#22C55E]" />
          <span>{t('admin_farm_app_view')}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Trilingual Switcher */}
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
                type="button"
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

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`max-w-md w-full rounded-[20px] border p-8 shadow-xl ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          
          <div className="text-center mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black ${
              isDark ? 'bg-[#162F20] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
            }`}>
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black tracking-tight">{t('admin_brand')}</h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Authorized plant pathologists, KVK agronomists, and dataset evaluators
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block mb-1.5 text-[#8BA695]">Administrator Security Key (ADMIN_PASS)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#22C55E]" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter ADMIN_PASS key..."
                  className={`w-full h-11 pl-9 pr-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Unlock Admin Operations'}</span>
            </button>

            {/* Quick Pitch Demo Button */}
            <div className="pt-3 border-t border-[#91BA94]/30">
              <button
                type="button"
                onClick={handleQuickDemo}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark ? 'bg-[#142C1E] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ 1-Click Demo Gate (Dr. Subrahmanya)</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs opacity-60 font-mono">
        Sasya Operations &bull; Agricultural AI Security Gateway
      </footer>
    </div>
  );
}
