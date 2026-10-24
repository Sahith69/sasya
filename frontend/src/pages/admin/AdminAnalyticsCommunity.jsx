// src/pages/admin/AdminAnalyticsCommunity.jsx - Young Farmer Community Hub Analytics
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_COMMUNITY_STATS } from '../../data/adminMockData';
import { 
  ArrowLeft, MessageSquare, Users, Wrench, 
  CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function AdminAnalyticsCommunity() {
  const { isDark, t } = useAuth();
  const subs = ADMIN_COMMUNITY_STATS;
  const totalMembers = subs.reduce((sum, s) => sum + s.members, 0);
  const totalPosts = subs.reduce((sum, s) => sum + s.postsThisWeek, 0);
  const totalRentals = subs.reduce((sum, s) => sum + s.activeRentals, 0);
  const totalQueries = subs.reduce((sum, s) => sum + s.resolvedQueries, 0);

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
          <h1 className="text-2xl font-black">{t('admin_nav_community')}</h1>
          <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Activity, peer sprayer sharing, and crowdsourced diagnostics across regional crop subs.
          </p>
        </div>
      </div>

      {/* ── TOP KPI TILES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Total Members</div>
          <div className="text-3xl font-black font-mono mt-1">{totalMembers.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Young farmer network</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Weekly Posts</div>
          <div className="text-3xl font-black font-mono text-blue-500 mt-1">{totalPosts}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Questions & alerts</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Active Rentals</div>
          <div className="text-3xl font-black font-mono text-amber-500 mt-1">{totalRentals}</div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Power sprayers & drones</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Resolved Queries</div>
          <div className="text-3xl font-black font-mono text-emerald-500 mt-1">{totalQueries}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">84% peer solution rate</span>
        </div>
      </div>

      {/* ── SUB-COMMUNITIES TABLE ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#22C55E]" />
          Crop-Specific Hub Telemetry
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] ${
                isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#91BA94]/40 text-[#556B5C]'
              }`}>
                <th className="py-2.5">Sub-Community</th>
                <th className="py-2.5 text-right">Grower Members</th>
                <th className="py-2.5 text-right">Weekly Discussions</th>
                <th className="py-2.5 text-right">Equipment Listings</th>
                <th className="py-2.5 text-right text-emerald-500">Resolved Inquiries</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {subs.map((s, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="py-3 font-bold font-mono text-sm text-[#22C55E]">
                    {s.sub}
                  </td>
                  <td className="py-3 text-right font-mono font-bold">{s.members.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono">{s.postsThisWeek}</td>
                  <td className="py-3 text-right font-mono text-amber-500 font-bold">{s.activeRentals}</td>
                  <td className="py-3 text-right font-mono text-emerald-500 font-bold">{s.resolvedQueries}</td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/c/${s.sub.replace('r/', '')}`}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                    >
                      Visit Sub
                    </Link>
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
