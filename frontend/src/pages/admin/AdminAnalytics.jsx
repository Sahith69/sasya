// src/pages/admin/AdminAnalytics.jsx - Analytics Overview Hub
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ADMIN_ANALYTICS_OVERVIEW, ADMIN_SUBMISSIONS_BY_CROP, 
  ADMIN_GATE_REJECTIONS, ADMIN_BOUNTY_SPEND 
} from '../../data/adminMockData';
import { 
  BarChart3, Layers, CheckCircle2, Cpu, Filter, 
  DollarSign, MessageSquare, ArrowRight, ShieldCheck, 
  Clock, TrendingUp, Award
} from 'lucide-react';

export default function AdminAnalytics() {
  const { isDark, t } = useAuth();
  const overview = ADMIN_ANALYTICS_OVERVIEW;

  const analyticsNavCards = [
    {
      title: t('admin_nav_submissions'),
      to: '/admin/analytics/submissions',
      icon: Layers,
      stat: '1,248 Total',
      desc: 'Distribution by crop (Arecanut 43%, Paddy 30%) and Karnataka districts.',
      color: 'text-emerald-500'
    },
    {
      title: t('admin_nav_verification'),
      to: '/admin/analytics/verification',
      icon: CheckCircle2,
      stat: '89.2% Approval',
      desc: 'Turnaround SLAs, review speed (1.8h avg), and pathologist reviewer metrics.',
      color: 'text-blue-500'
    },
    {
      title: t('admin_nav_model'),
      to: '/admin/analytics/model',
      icon: Cpu,
      stat: '96.8% Agreement',
      desc: 'Expert-vs-AI 5x5 confusion matrix, precision/recall per disease class.',
      color: 'text-purple-500'
    },
    {
      title: t('admin_nav_gates'),
      to: '/admin/analytics/gates',
      icon: Filter,
      stat: '82 Guard Stops',
      desc: 'Mahalanobis OOD distance, Laplacian blur, and crop domain gate rejections.',
      color: 'text-amber-500'
    },
    {
      title: t('admin_nav_bounty'),
      to: '/admin/analytics/bounty',
      icon: DollarSign,
      stat: '₹14,850 Disbursed',
      desc: 'Spend progression, unit cost per verified leaf (₹13.20), budget pacing.',
      color: 'text-emerald-400'
    },
    {
      title: t('admin_nav_community'),
      to: '/admin/analytics/community',
      icon: MessageSquare,
      stat: '6,300+ Members',
      desc: 'Post volume, active equipment rentals, and resolved pathology queries.',
      color: 'text-cyan-400'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight">{t('admin_analytics_title')}</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#275637] text-white">
            Live Telemetry
          </span>
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
          Biostatistical health of the Karnataka Open Ag AI vision network, reviewer throughput, and micro-bounty ROI.
        </p>
      </div>

      {/* ── MACRO KPI TILES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Total Submissions</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono">{overview.totalSubmissions.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">
            +18% from last month
          </span>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Expert Agreement</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-500">{overview.expertAgreementRate}%</div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Across 5 crop classes
          </span>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Avg Review SLA</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-500">{overview.averageReviewTimeHours} hrs</div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">
            98.4% within 4h target
          </span>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Bounty Disbursed</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₹{overview.totalBountyDisbursed.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            29.7% of ₹50K grant
          </span>
        </div>
      </div>

      {/* ── DETAILED EXPLORATION CARDS GRID ── */}
      <div>
        <h2 className="font-bold text-sm mb-3">Analytics Deep Dives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsNavCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.to}
              className={`p-5 rounded-3xl border transition-all duration-200 group flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#102217] border-[#1E3A2B] hover:border-[#22C55E] hover:bg-[#132A1C]' 
                  : 'bg-white border-[#91BA94]/60 hover:border-[#275637] hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-[#183424]' : 'bg-[#E8F2EA]'}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    {card.stat}
                  </span>
                </div>
                <h3 className="font-bold text-base group-hover:text-[#22C55E] transition-colors">
                  {card.title}
                </h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E] mt-4 pt-3 border-t border-gray-500/20">
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
