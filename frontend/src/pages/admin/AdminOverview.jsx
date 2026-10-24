// src/pages/admin/AdminOverview.jsx - Central Administrative Command & Operations Dashboard
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ADMIN_ANALYTICS_OVERVIEW, ADMIN_SUBMISSIONS, ADMIN_GATE_REJECTIONS 
} from '../../data/adminMockData';
import { 
  Inbox, Users, CheckCircle2, AlertTriangle, ArrowRight, 
  TrendingUp, Shield, Cpu, Clock, DollarSign, Database, Sparkles
} from 'lucide-react';
import { getAdminOverview } from '../../services/api';

export default function AdminOverview() {
  const { isDark, t } = useAuth();
  const pendingSubmissions = ADMIN_SUBMISSIONS.filter(s => s.status === 'Pending');
  const [stats, setStats] = useState(ADMIN_ANALYTICS_OVERVIEW);
  const [pendingCount, setPendingCount] = useState(pendingSubmissions.length);

  useEffect(() => {
    async function loadLive() {
      const res = await getAdminOverview();
      if (res?.success && res.analytics?.overview) {
        const o = res.analytics.overview;
        setStats(prev => ({
          ...prev,
          totalSubmissions: o.total_submissions,
          pendingReview: o.total_pending,
          verifiedThisMonth: o.total_verified,
          totalBountyDisbursed: o.total_bounties_paid,
          expertAgreementRate: res.analytics.ai_accuracy_against_expert || prev.expertAgreementRate,
          activeGrowers: res.total_farmers || prev.activeGrowers
        }));
        setPendingCount(o.total_pending);
      }
    }
    loadLive();
  }, []);

  return (
    <div className="space-y-8 animate-card-in">
      
      {/* Top Banner */}
      <div className={`p-6 rounded-[18px] border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔬</span>
            <h2 className="text-xl font-black tracking-tight">{t('admin_overview_title')}</h2>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            {t('admin_overview_sub')}
          </p>
        </div>

        <Link
          to="/admin/queue"
          className="px-4 py-2.5 rounded-xl bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Inbox className="w-4 h-4" />
          <span>{t('admin_nav_queue')} ({pendingCount})</span>
        </Link>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-[16px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
          <div className="flex items-center justify-between text-xs text-[#8BA695]">
            <span className="font-bold uppercase tracking-wider">{t('admin_kpi_pending')}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500 mt-2">
            {stats.pendingReview}
          </div>
          <div className="text-[11px] text-[#8BA695] mt-1">
            {t('admin_kpi_review_time')}: {stats.averageReviewTimeHours} hrs
          </div>
        </div>

        <div className={`p-5 rounded-[16px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
          <div className="flex items-center justify-between text-xs text-[#8BA695]">
            <span className="font-bold uppercase tracking-wider">{t('admin_kpi_verified')}</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-3xl font-black text-[#22C55E] mt-2">
            {stats.verifiedThisMonth}
          </div>
          <div className="text-[11px] text-[#8BA695] mt-1">
            {t('admin_kpi_submissions')}: {stats.totalSubmissions}
          </div>
        </div>

        <div className={`p-5 rounded-[16px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
          <div className="flex items-center justify-between text-xs text-[#8BA695]">
            <span className="font-bold uppercase tracking-wider">{t('admin_kpi_bounty')}</span>
            <DollarSign className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-3xl font-black text-[#22C55E] mt-2">
            ₹{stats.totalBountyDisbursed.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8BA695] mt-1">
            Across {stats.activeGrowers} active young farmers
          </div>
        </div>

        <div className={`p-5 rounded-[16px] border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'}`}>
          <div className="flex items-center justify-between text-xs text-[#8BA695]">
            <span className="font-bold uppercase tracking-wider">{t('admin_kpi_agreement')}</span>
            <Cpu className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-3xl font-black text-[#22C55E] mt-2">
            {stats.expertAgreementRate}%
          </div>
          <div className="text-[11px] text-[#8BA695] mt-1">
            ResNet-18 + CORN Ordinal Grader
          </div>
        </div>

      </div>

      {/* Two Column Layout: Pending Submissions vs Rejection Gates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Pending Submissions Requiring Attention (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#22C55E]" />
              <span>{t('admin_pending_queue_title')}</span>
            </h3>
            <Link to="/admin/queue" className="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-1">
              <span>{t('status_all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.map((item) => (
              <div 
                key={item.id}
                className={`p-4 rounded-[16px] border flex items-center justify-between gap-4 transition-all ${
                  isDark ? 'bg-[#102217] border-[#1E3A2B] hover:border-[#22C55E]/50' : 'bg-white border-[#91BA94] hover:bg-[#F9F9F6]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img src={item.image} alt={item.crop} className="w-14 h-14 rounded-xl object-cover border border-[#91BA94]/40 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#8BA695]">{item.id}</span>
                      <span className="text-xs font-bold truncate">{item.crop}: {item.suspectedDisease}</span>
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                      {item.farmerName} • {item.village}, {item.district}
                    </div>
                    <div className="text-[10px] text-[#22C55E] font-semibold mt-0.5">
                      AI: {item.aiPrediction} ({Math.round(item.aiConfidence * 100)}%) • ₹{item.bountyAmount}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/admin/review/${item.id}`}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all ${
                    isDark ? 'bg-[#142C1E] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                  }`}
                >
                  Inspect &amp; Triage ➔
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Security & Rejection Gates Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#22C55E]" />
              <span>Automated Quality Gates</span>
            </h3>
            <Link to="/admin/analytics/gates" className="text-xs font-bold text-[#22C55E] hover:underline">
              Deep Analytics
            </Link>
          </div>

          <div className={`p-5 rounded-[16px] border space-y-3.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            {ADMIN_GATE_REJECTIONS.map((gate, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate">{gate.gate}</span>
                  <span className="font-mono text-rose-500">{gate.count} rejected</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-black/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: gate.percentage }}
                  />
                </div>
                <p className={`text-[10px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                  {gate.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
