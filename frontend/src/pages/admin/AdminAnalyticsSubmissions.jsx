// src/pages/admin/AdminAnalyticsSubmissions.jsx - Specimen Volume by Crop & District
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ADMIN_SUBMISSIONS_BY_CROP, ADMIN_SUBMISSIONS_BY_DISTRICT 
} from '../../data/adminMockData';
import { ArrowLeft, Layers, MapPin, BarChart3, TrendingUp, Download } from 'lucide-react';

export default function AdminAnalyticsSubmissions() {
  const { isDark, t } = useAuth();
  const crops = ADMIN_SUBMISSIONS_BY_CROP;
  const districts = ADMIN_SUBMISSIONS_BY_DISTRICT;
  const totalSubmissions = crops.reduce((sum, c) => sum + c.count, 0);

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
            <h1 className="text-2xl font-black">{t('admin_nav_submissions')}</h1>
            <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Crop representation balance and spatial district density across Karnataka & Himachal.
            </p>
          </div>
        </div>

        <Link
          to="/admin/export"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#275637] text-white hover:bg-[#1E432B] flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Volume Data</span>
        </Link>
      </div>

      {/* ── TOP STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <span className="text-[10px] text-gray-400 font-mono uppercase">Total Volume</span>
          <div className="text-2xl font-black font-mono mt-1">{totalSubmissions.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-500 font-bold">100% Data Intake</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <span className="text-[10px] text-gray-400 font-mono uppercase">Top Crop</span>
          <div className="text-2xl font-black mt-1">Arecanut</div>
          <span className="text-[10px] text-gray-400 font-mono">542 scans (43.4%)</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <span className="text-[10px] text-gray-400 font-mono uppercase">Top District</span>
          <div className="text-2xl font-black mt-1">Dakshina Kannada</div>
          <span className="text-[10px] text-gray-400 font-mono">490 uploads (39.2%)</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <span className="text-[10px] text-gray-400 font-mono uppercase">Active Districts</span>
          <div className="text-2xl font-black font-mono mt-1">5 Districts</div>
          <span className="text-[10px] text-[#22C55E] font-bold">420 Active Growers</span>
        </div>
      </div>

      {/* ── SECTION 1: CROP BREAKDOWN ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#22C55E]" />
          Specimen Distribution by Crop Class
        </h2>

        {/* Multi-segment progress bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-800">
          {crops.map((c, idx) => (
            <div
              key={idx}
              style={{ width: c.percentage, backgroundColor: c.color }}
              title={`${c.crop}: ${c.count} (${c.percentage})`}
              className="h-full transition-all hover:opacity-90 cursor-pointer"
            />
          ))}
        </div>

        {/* Crop Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] ${
                isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#91BA94]/40 text-[#556B5C]'
              }`}>
                <th className="py-2.5">Crop Name</th>
                <th className="py-2.5 text-right">Uploads</th>
                <th className="py-2.5 text-right">Share (%)</th>
                <th className="py-2.5 text-right text-emerald-500">Verified</th>
                <th className="py-2.5 text-right text-amber-500">Pending</th>
                <th className="py-2.5 text-right text-rose-500">Rejected</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {crops.map((c, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="py-3 font-bold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span>{c.crop}</span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold">{c.count}</td>
                  <td className="py-3 text-right font-mono">{c.percentage}</td>
                  <td className="py-3 text-right font-mono text-emerald-500 font-bold">{c.verified}</td>
                  <td className="py-3 text-right font-mono text-amber-500">{c.pending}</td>
                  <td className="py-3 text-right font-mono text-rose-500">{c.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: DISTRICT DENSITY TABLE ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#22C55E]" />
          Regional Volume by District (Spatial Anonymity $k \ge 5$)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] ${
                isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#91BA94]/40 text-[#556B5C]'
              }`}>
                <th className="py-2.5">District & State</th>
                <th className="py-2.5">Primary Cultivation</th>
                <th className="py-2.5 text-right">Uploads</th>
                <th className="py-2.5 text-right">Active Growers</th>
                <th className="py-2.5 text-right">Density Share</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {districts.map((d, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="py-3">
                    <div className="font-bold">{d.district}</div>
                    <span className="text-[10px] text-gray-400">{d.state}</span>
                  </td>
                  <td className="py-3 font-semibold">{d.topCrop}</td>
                  <td className="py-3 text-right font-mono font-bold">{d.count}</td>
                  <td className="py-3 text-right font-mono">{d.activeGrowers}</td>
                  <td className="py-3 text-right font-mono text-emerald-500 font-bold">
                    {((d.count / totalSubmissions) * 100).toFixed(1)}%
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
