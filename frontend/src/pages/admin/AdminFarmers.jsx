// src/pages/admin/AdminFarmers.jsx - Farmer Contribution Ledger & Trust Registry
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_FARMERS } from '../../data/adminMockData';
import { 
  Users, Search, ShieldCheck, AlertTriangle, ArrowUpDown, 
  Award, DollarSign, MapPin, ChevronRight, CheckCircle2, UserX
} from 'lucide-react';

export default function AdminFarmers() {
  const { isDark, t } = useAuth();
  const [farmers, setFarmers] = useState(ADMIN_FARMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [sortBy, setSortBy] = useState('trustScore'); // trustScore, bounties, submissions

  // Filtering
  const filteredFarmers = farmers.filter(f => {
    const matchesTier = tierFilter === 'All' || f.trustTier.includes(tierFilter);
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' ||
      f.name.toLowerCase().includes(query) ||
      f.district.toLowerCase().includes(query) ||
      f.village.toLowerCase().includes(query) ||
      f.crops.some(c => c.toLowerCase().includes(query));
    return matchesTier && matchesSearch;
  });

  // Sorting
  const sortedFarmers = [...filteredFarmers].sort((a, b) => {
    if (sortBy === 'trustScore') return b.trustScore - a.trustScore;
    if (sortBy === 'bounties') return b.totalBountiesEarned - a.totalBountiesEarned;
    if (sortBy === 'submissions') return b.submissionsCount - a.submissionsCount;
    return 0;
  });

  const getTierBadgeClass = (tier) => {
    if (tier.includes('Elite')) {
      return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    }
    if (tier.includes('Verified')) {
      return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    }
    return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{t('admin_farmers_title')}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#275637] text-white">
              {sortedFarmers.length} Growers
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            {t('admin_farmers_sub')} ($k \ge 5$).
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border text-right ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
          }`}>
            <span className="text-[10px] text-gray-400 block">Total Payouts</span>
            <span className="font-mono font-black text-sm text-emerald-500">₹499.00</span>
          </div>
          <div className={`px-4 py-2 rounded-2xl border text-right ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
          }`}>
            <span className="text-[10px] text-gray-400 block">Avg Trust</span>
            <span className="font-mono font-black text-sm text-[#22C55E]">81.4 / 100</span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/50'
      }`}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by grower name, district, or crop..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
            }`}
          />
        </div>

        {/* Tier filter */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
            isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
          }`}
        >
          <option value="All">All Trust Tiers</option>
          <option value="Elite">Elite Contributors</option>
          <option value="Verified">Verified Growers</option>
          <option value="Suspended">Watchlist / Suspended</option>
        </select>

        {/* Sort by */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
            isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
          }`}
        >
          <option value="trustScore">Sort: Trust Score</option>
          <option value="bounties">Sort: Bounties Earned</option>
          <option value="submissions">Sort: Submissions Count</option>
        </select>
      </div>

      {/* ── TABLE VIEW ── */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] tracking-wider ${
                isDark ? 'border-[#1E3A2B] bg-[#0E1E16] text-[#8BA695]' : 'border-[#91BA94]/40 bg-[#E8F2EA]/60 text-[#556B5C]'
              }`}>
                <th className="p-3.5">Grower Name & ID</th>
                <th className="p-3.5">Location & Land</th>
                <th className="p-3.5">Crops Cultivated</th>
                <th className="p-3.5 text-center">Scans (Appr/Rej)</th>
                <th className="p-3.5">Total Bounties</th>
                <th className="p-3.5 text-center">Trust Score</th>
                <th className="p-3.5">Tier Status</th>
                <th className="p-3.5 text-right">Profile Audit</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {sortedFarmers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    No farmers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                sortedFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-[#132A1C]' : 'hover:bg-[#F2F7F3]'
                    }`}
                  >
                    {/* Name & ID */}
                    <td className="p-3.5">
                      <Link
                        to={`/admin/farmers/${farmer.id}`}
                        className="font-bold hover:underline text-sm block"
                      >
                        {farmer.name}
                      </Link>
                      <span className="font-mono text-[10px] text-gray-400">
                        {farmer.id} • {farmer.upiId}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="p-3.5">
                      <div>{farmer.village}, {farmer.district}</div>
                      <span className={`text-[10px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        Holding: {farmer.landSize}
                      </span>
                    </td>

                    {/* Crops */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {farmer.crops.map((c, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isDark ? 'bg-[#183424] text-[#8BA695]' : 'bg-[#E8F2EA] text-[#275637]'
                            }`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Scans Count */}
                    <td className="p-3.5 text-center">
                      <div className="font-bold">{farmer.submissionsCount} scans</div>
                      <span className="text-[10px] text-emerald-500 font-bold">{farmer.approvedCount} ✓</span>
                      <span className="text-[10px] text-gray-400"> / </span>
                      <span className="text-[10px] text-rose-500 font-bold">{farmer.rejectedCount} ✕</span>
                    </td>

                    {/* Bounties */}
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        ₹{farmer.totalBountiesEarned.toFixed(2)}
                      </span>
                    </td>

                    {/* Trust Score */}
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`font-mono text-xs font-black ${
                          farmer.trustScore >= 90 ? 'text-emerald-500' :
                          farmer.trustScore >= 70 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {farmer.trustScore}
                        </span>
                        <span className="text-[10px] text-gray-400">/100</span>
                      </div>
                      {farmer.flags.length > 0 && (
                        <div className="text-[9px] text-rose-400 font-bold flex items-center justify-center gap-0.5 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{farmer.flags.length} Flag</span>
                        </div>
                      )}
                    </td>

                    {/* Tier Status */}
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getTierBadgeClass(farmer.trustTier)}`}>
                        {farmer.trustTier}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/admin/farmers/${farmer.id}`}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-all ${
                          isDark 
                            ? 'bg-[#183424] hover:bg-[#22C55E] text-white hover:text-[#0B1712]' 
                            : 'bg-[#E8F2EA] hover:bg-[#275637] text-[#275637] hover:text-white'
                        }`}
                      >
                        <span>Audit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
