// src/pages/admin/AdminLayout.jsx - Master Administrative Navigation & Layout Shell
import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, LayoutDashboard, Inbox, Users, AlertTriangle, 
  BarChart3, FileSpreadsheet, History, Award, CheckCircle2,
  Cpu, Filter, Sun, Moon, ArrowLeft, LogOut, Menu, X, 
  Layers, MessageSquare, DollarSign, Database
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, theme, toggleTheme, isDark, t } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check admin session auth
  const isAdminAuthed = sessionStorage.getItem('sasya_admin_auth') === 'true';

  const handleAdminLogout = () => {
    sessionStorage.removeItem('sasya_admin_auth');
    navigate('/admin/login');
  };

  const navSections = [
    {
      title: t('admin_sec_operations'),
      items: [
        { label: t('admin_nav_overview'), to: '/admin', icon: LayoutDashboard },
        { label: t('admin_nav_queue'), to: '/admin/queue', icon: Inbox, badge: '3' },
        { label: t('admin_nav_farmers'), to: '/admin/farmers', icon: Users },
        { label: t('admin_nav_moderation'), to: '/admin/moderation', icon: AlertTriangle, badge: '1' },
        { label: t('admin_nav_experts'), to: '/admin/experts', icon: ShieldCheck }
      ]
    },
    {
      title: t('admin_sec_analytics'),
      items: [
        { label: t('admin_nav_analytics'), to: '/admin/analytics', icon: BarChart3 },
        { label: t('admin_nav_submissions'), to: '/admin/analytics/submissions', icon: Layers },
        { label: t('admin_nav_verification'), to: '/admin/analytics/verification', icon: CheckCircle2 },
        { label: t('admin_nav_model'), to: '/admin/analytics/model', icon: Cpu },
        { label: t('admin_nav_gates'), to: '/admin/analytics/gates', icon: Filter },
        { label: t('admin_nav_bounty'), to: '/admin/analytics/bounty', icon: DollarSign },
        { label: t('admin_nav_community'), to: '/admin/analytics/community', icon: MessageSquare }
      ]
    },
    {
      title: t('admin_sec_governance'),
      items: [
        { label: t('admin_nav_export'), to: '/admin/export', icon: FileSpreadsheet },
        { label: t('admin_nav_audit'), to: '/admin/audit', icon: History }
      ]
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={`w-72 border-r shrink-0 hidden md:flex flex-col justify-between ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
      }`}>
        <div>
          {/* Brand Header */}
          <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-[#1E3A2B]' : 'border-[#91BA94]/40'}`}>
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
              }`}>
                🌾
              </div>
              <div>
                <h1 className="font-extrabold text-sm leading-none">{t('admin_brand')}</h1>
                <span className={`text-[10px] font-mono ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                  {t('admin_console_sub')}
                </span>
              </div>
            </Link>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {t('admin_live_badge')}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <div className={`px-3 text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'
                }`}>
                  {section.title}
                </div>
                {section.items.map((item, iIdx) => {
                  const isActive = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
                  return (
                    <Link
                      key={iIdx}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 ${
                        isActive
                          ? isDark 
                            ? 'bg-[#22C55E] text-[#0B1712] font-extrabold shadow-xs' 
                            : 'bg-[#275637] text-white font-extrabold shadow-xs'
                          : isDark
                            ? 'text-[#8BA695] hover:text-white hover:bg-[#162F20]'
                            : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isActive 
                            ? isDark ? 'bg-[#0B1712] text-white' : 'bg-white text-[#275637]'
                            : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Session Box */}
        <div className={`p-4 border-t ${isDark ? 'border-[#1E3A2B] bg-[#0E1E16]' : 'border-[#91BA94]/40 bg-[#F9F9F6]'}`}>
          <div className="flex items-center justify-between mb-3 text-xs">
            <div>
              <div className="font-bold">Dr. Subrahmanya</div>
              <div className="text-[10px] text-[#8BA695]">Pathologist Admin</div>
            </div>
            <button
              onClick={handleAdminLogout}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
              title="Admin Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('admin_exit')}</span>
            </button>
          </div>

          <Link
            to="/home"
            className={`w-full py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{t('admin_farm_app_view')}</span>
          </Link>
        </div>

      </aside>

      {/* ── MAIN CONTENT VIEWPORT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 sm:px-6 h-16 flex items-center justify-between ${
          isDark ? 'bg-[#0B1712]/90 border-[#1E3A2B]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
        }`}>
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <span className="font-mono text-xs font-bold text-[#8BA695] hidden sm:inline">
              {t('admin_secure_gate')}
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
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
                      ? isDark ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' : 'bg-[#275637] text-white shadow-xs'
                      : isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#275637] hover:bg-[#E8F2EA]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden p-4 border-b space-y-4 ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="text-[10px] font-mono text-[#8BA695] uppercase font-bold">{sec.title}</div>
                {sec.items.map((it, iIdx) => (
                  <Link
                    key={iIdx}
                    to={it.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-1.5 px-2 text-xs font-bold"
                  >
                    <it.icon className="w-4 h-4 text-[#22C55E]" />
                    <span>{it.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>

      </div>

    </div>
  );
}
