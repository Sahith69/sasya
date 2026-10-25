// src/pages/admin/AdminAnalyticsBounty.jsx - Bounty Spend & Unit Cost Analytics
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_BOUNTY_SPEND } from '../../data/adminMockData';
import { 
  ArrowLeft, DollarSign, TrendingUp, Award, 
  CreditCard, PieChart, CheckCircle2, Download
} from 'lucide-react';

export default function AdminAnalyticsBounty() {
  const { isDark, t } = useAuth();
  const bounty = ADMIN_BOUNTY_SPEND;
  const percentSpent = ((bounty.spentToDate / bounty.totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <h1 className="text-2xl font-black">{t('admin_nav_bounty')}</h1>
            <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Agricultural research dataset grant utilization, average cost per verified specimen, and runway.
            </p>
          </div>
        </div>

        <Link
          to="/admin/export"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#275637] text-white hover:bg-[#1E432B] flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Payouts CSV</span>
        </Link>
      </div>

      {/* ── TOP KPI TILES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Total Disbursed</div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{bounty.spentToDate.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">{percentSpent}% of total grant</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Remaining Budget</div>
          <div className="text-3xl font-black font-mono text-blue-500 mt-1">
            ₹{bounty.remainingBudget.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Of ₹50,000 Allocation</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Avg Cost / Leaf</div>
          <div className="text-3xl font-black font-mono text-emerald-500 mt-1">
            ₹{bounty.averageCostPerVerifiedLeaf.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Below ₹15 target cap</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Estimated Runway</div>
          <div className="text-3xl font-black font-mono text-purple-400 mt-1">6.4 Mos</div>
          <span className="text-[10px] text-gray-400 mt-1 block">At current burn rate</span>
        </div>
      </div>

      {/* ── BUDGET CONSUMPTION PROGRESS ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#22C55E]" />
            Grant Allocation & Pacing (Agricultural Research Dataset Fund)
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-500">{percentSpent}% Utilized</span>
        </div>

        <div className="w-full h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-emerald-600 rounded-full"
            style={{ width: `${percentSpent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-mono text-gray-400 pt-1">
          <span>₹0</span>
          <span>₹25,000 (Midpoint)</span>
          <span>₹50,000 (Total Grant)</span>
        </div>
      </div>

      {/* ── MONTHLY SPEND PROGRESSION TABLE ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          Monthly Disbursement Trajectory
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className={`border-b uppercase text-[10px] ${
                isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#91BA94]/40 text-[#556B5C]'
              }`}>
                <th className="py-2.5">Billing Month</th>
                <th className="py-2.5 text-right">Verified Specimens</th>
                <th className="py-2.5 text-right">Disbursed (₹)</th>
                <th className="py-2.5 text-right">Unit Cost / Specimen</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {bounty.monthlySpendCurve.map((m, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="py-3 font-bold font-sans">{m.month}</td>
                  <td className="py-3 text-right text-gray-400">{m.verified}</td>
                  <td className="py-3 text-right font-bold text-emerald-500">₹{m.spend.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold">₹{(m.spend / m.verified).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
