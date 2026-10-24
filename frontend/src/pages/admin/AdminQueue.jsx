// src/pages/admin/AdminQueue.jsx - Diagnostic Leaf Review Queue with Advanced Filters
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_SUBMISSIONS } from '../../data/adminMockData';
import { 
  Filter, Search, CheckCircle2, AlertTriangle, Eye, 
  ArrowUpDown, Check, RefreshCw, Sparkles, ChevronRight,
  ShieldCheck, Layers, Award, Clock
} from 'lucide-react';

export default function AdminQueue() {
  const { isDark, t } = useAuth();
  const [submissions, setSubmissions] = useState(ADMIN_SUBMISSIONS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [notification, setNotification] = useState('');

  // Filter logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCrop = cropFilter === 'All' || sub.crop.toLowerCase() === cropFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      sub.id.toLowerCase().includes(query) ||
      sub.farmerName.toLowerCase().includes(query) ||
      sub.aiPrediction.toLowerCase().includes(query) ||
      sub.district.toLowerCase().includes(query);
    return matchesStatus && matchesCrop && matchesSearch;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredSubmissions.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    setSubmissions(prev => 
      prev.map(sub => 
        selectedIds.includes(sub.id) && sub.status === 'Pending' 
          ? { ...sub, status: 'Approved', verifiedBy: 'Dr. Subrahmanya Bhat (Batch)' } 
          : sub
      )
    );
    setNotification(`Successfully verified ${selectedIds.length} submissions and scheduled UPI micro-bounties.`);
    setSelectedIds([]);
    setTimeout(() => setNotification(''), 4000);
  };

  const statusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Corrected':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{t('admin_queue_title')}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#275637] text-white">
              {filteredSubmissions.length} Items
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            {t('admin_queue_sub')}
          </p>
        </div>

        {/* Batch action button */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <span className="text-xs font-semibold">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleBatchApprove}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              {t('admin_action_batch_approve')}
            </button>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/50'
      }`}>
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin_search_placeholder')}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
            }`}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
            }`}
          >
            <option value="All">{t('status_all')}</option>
            <option value="Pending">{t('status_pending')}</option>
            <option value="Approved">{t('status_approved')}</option>
            <option value="Corrected">{t('status_corrected')}</option>
            <option value="Rejected">{t('status_rejected')}</option>
          </select>

          {/* Crop filter */}
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
            }`}
          >
            <option value="All">{t('status_all')} Crops</option>
            <option value="Arecanut">Arecanut</option>
            <option value="Apple">Apple</option>
            <option value="Paddy">Paddy</option>
            <option value="Tomato">Tomato</option>
            <option value="Non-Crop">Non-Crop (OOD)</option>
          </select>
        </div>
      </div>

      {/* ── QUEUE TABLE ── */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] tracking-wider ${
                isDark ? 'border-[#1E3A2B] bg-[#0E1E16] text-[#8BA695]' : 'border-[#91BA94]/40 bg-[#E8F2EA]/60 text-[#556B5C]'
              }`}>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredSubmissions.length}
                    onChange={handleSelectAll}
                    className="rounded cursor-pointer accent-[#22C55E]"
                  />
                </th>
                <th className="p-3.5">Submission & Specimen</th>
                <th className="p-3.5">Farmer & Village</th>
                <th className="p-3.5">Crop & Suspected Disease</th>
                <th className="p-3.5">AI Inference</th>
                <th className="p-3.5 text-center">Quality / Var</th>
                <th className="p-3.5">Bounty</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400">
                    No submissions matched the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = selectedIds.includes(sub.id);
                  return (
                    <tr
                      key={sub.id}
                      className={`transition-colors ${
                        isSelected 
                          ? isDark ? 'bg-[#163323]' : 'bg-[#E8F2EA]' 
                          : isDark ? 'hover:bg-[#132A1C]' : 'hover:bg-[#F2F7F3]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(sub.id)}
                          className="rounded cursor-pointer accent-[#22C55E]"
                        />
                      </td>

                      {/* Specimen Thumbnail & ID */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-black/20 border border-white/10 shrink-0 relative">
                            <img
                              src={sub.image}
                              alt={sub.id}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=120&q=80';
                              }}
                            />
                            {sub.flagged && (
                              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-bl-sm" title="Flagged specimen" />
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/admin/review/${sub.id}`}
                              className="font-mono font-bold text-xs hover:underline text-[#22C55E]"
                            >
                              {sub.id}
                            </Link>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {sub.submittedAt.split(' ')[1]}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Farmer */}
                      <td className="p-3.5">
                        <Link
                          to={`/admin/farmers/${sub.farmerId}`}
                          className="font-bold hover:underline block truncate max-w-[140px]"
                        >
                          {sub.farmerName}
                        </Link>
                        <span className={`text-[10px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                          {sub.village}, {sub.district}
                        </span>
                      </td>

                      {/* Crop */}
                      <td className="p-3.5">
                        <div className="font-bold">{sub.crop}</div>
                        <span className="text-[10px] text-gray-400">{sub.suspectedDisease}</span>
                      </td>

                      {/* AI Inference */}
                      <td className="p-3.5">
                        <div className="font-bold text-xs">{sub.aiPrediction}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#22C55E] h-full rounded-full"
                              style={{ width: `${sub.aiConfidence * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">
                            {(sub.aiConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Quality Score */}
                      <td className="p-3.5 text-center">
                        <span className={`font-mono text-xs font-bold ${
                          sub.qualityScore >= 80 ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {sub.qualityScore}
                        </span>
                        <div className="text-[9px] text-gray-400 font-mono">
                          σ² {sub.laplacianVariance}
                        </div>
                      </td>

                      {/* Bounty */}
                      <td className="p-3.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {sub.bountyAmount > 0 ? `₹${sub.bountyAmount.toFixed(2)}` : '—'}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/admin/review/${sub.id}`}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-all ${
                            isDark 
                              ? 'bg-[#183424] hover:bg-[#22C55E] text-white hover:text-[#0B1712]' 
                              : 'bg-[#E8F2EA] hover:bg-[#275637] text-[#275637] hover:text-white'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('admin_action_inspect')}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
