// src/pages/admin/AdminAnalyticsVerification.jsx - Approval Rates & Review Speed SLAs
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_VERIFICATION_METRICS } from '../../data/adminMockData';
import { 
  ArrowLeft, CheckCircle2, Clock, ShieldCheck, 
  Award, TrendingUp, AlertCircle, UserCheck
} from 'lucide-react';

export default function AdminAnalyticsVerification() {
  const { isDark, t } = useAuth();
  const metrics = ADMIN_VERIFICATION_METRICS;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/analytics"
          className={`p-2 rounded-xl border transition-all ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black">{t('admin_nav_verification')}</h1>
          <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Triage speed, diagnostic approval rates, and pathologist review throughput for ICAR-CPCRI.
          </p>
        </div>
      </div>

      {/* ── TOP KPI TILES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Approval Rate</div>
          <div className="text-3xl font-black font-mono text-emerald-500 mt-1">{metrics.overallApprovalRate}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">894 verified leaf specimens</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Mean Turnaround</div>
          <div className="text-3xl font-black font-mono text-blue-500 mt-1">1.8 hrs</div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Target: &lt; 4.0 hrs</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Correction Rate</div>
          <div className="text-3xl font-black font-mono text-amber-500 mt-1">{metrics.correctionRate}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Expert label override</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">SLA Compliance</div>
          <div className="text-3xl font-black font-mono text-[#22C55E] mt-1">{metrics.slaCompliance4Hours}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Within 4-hour window</span>
        </div>
      </div>

      {/* ── VERIFICATION STATUS PROGRESS BAR ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          Triaged Specimen Outcome Breakdown
        </h2>

        {/* Stacked bar */}
        <div className="w-full h-5 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-800 font-mono text-[10px] font-bold text-white text-center">
          <div style={{ width: '89.2%' }} className="bg-emerald-600 flex items-center justify-center">89.2% Approved</div>
          <div style={{ width: '4.3%' }} className="bg-amber-500 flex items-center justify-center">4.3%</div>
          <div style={{ width: '6.5%' }} className="bg-rose-600 flex items-center justify-center">6.5%</div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Approved for Dataset & Bounty (89.2%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="font-bold text-amber-500">Corrected Diagnosis (4.3%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="font-bold text-rose-500">Rejected Quality/OOD (6.5%)</span>
          </div>
        </div>
      </div>

      {/* ── REVIEWER THROUGHPUT TABLE ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            Plant Pathologist Reviewer SLA Benchmarks
          </h2>
          <span className="text-xs text-gray-400">3 Institutional Reviewers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] ${
                isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#91BA94]/40 text-[#556B5C]'
              }`}>
                <th className="py-2.5">Reviewer Name</th>
                <th className="py-2.5">Institution</th>
                <th className="py-2.5 text-right">Specimens Reviewed</th>
                <th className="py-2.5 text-right">Approval Rate</th>
                <th className="py-2.5 text-right">Avg SLA Speed</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {metrics.reviewerStats.map((rev, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="py-3 font-bold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#22C55E]" />
                    <span>{rev.name}</span>
                  </td>
                  <td className="py-3 text-gray-400 font-semibold">{rev.institution}</td>
                  <td className="py-3 text-right font-mono font-bold">{rev.reviewed}</td>
                  <td className="py-3 text-right font-mono text-emerald-500 font-bold">{rev.approvalRate}</td>
                  <td className="py-3 text-right font-mono text-blue-400 font-bold">{rev.avgTime}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
