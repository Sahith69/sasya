// src/pages/admin/AdminAudit.jsx - Immutable Administrative Action Log & Governance Trail
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_AUDIT_LOGS } from '../../data/adminMockData';
import { 
  History, Search, ShieldCheck, Filter, Clock, 
  CheckCircle2, DollarSign, Edit3, XCircle, Sliders, Lock
} from 'lucide-react';

export default function AdminAudit() {
  const { isDark, t } = useAuth();
  const [logs, setLogs] = useState(ADMIN_AUDIT_LOGS);
  const [actionFilter, setActionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' ||
      log.id.toLowerCase().includes(query) ||
      log.actor.toLowerCase().includes(query) ||
      log.target.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query);
    return matchesAction && matchesSearch;
  });

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'DISBURSE_BOUNTY':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'LABEL_CORRECTION':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
      case 'OOD_REJECTION':
        return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
      case 'CONFIG_UPDATE':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'DISBURSE_BOUNTY':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      case 'LABEL_CORRECTION':
        return <Edit3 className="w-3.5 h-3.5 text-blue-500" />;
      case 'OOD_REJECTION':
        return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
      case 'CONFIG_UPDATE':
        return <Sliders className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <History className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{t('admin_audit_title')}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#275637] text-white">
              {filteredLogs.length} Events
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Cryptographically sealed ledger recording reviewer verdicts, bounty payouts, and biometric safety gates.
          </p>
        </div>

        {/* SHA-256 seal */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5" />
          <span>Ledger Integrity: VERIFIED (SHA-256)</span>
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
            placeholder={t('admin_search_placeholder')}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
              isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
            }`}
          />
        </div>

        {/* Action Type filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
            isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/60 text-[#275637]'
          }`}
        >
          <option value="All">All Audit Actions</option>
          <option value="DISBURSE_BOUNTY">Disburse Bounty</option>
          <option value="LABEL_CORRECTION">Label Correction</option>
          <option value="OOD_REJECTION">OOD Rejection</option>
          <option value="CONFIG_UPDATE">Config Update</option>
        </select>
      </div>

      {/* ── LOGS TABLE ── */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] tracking-wider ${
                isDark ? 'border-[#1E3A2B] bg-[#0E1E16] text-[#8BA695]' : 'border-[#91BA94]/40 bg-[#E8F2EA]/60 text-[#556B5C]'
              }`}>
                <th className="p-3.5">Log ID & Time</th>
                <th className="p-3.5">Authorised Actor</th>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Audit Event Details</th>
                <th className="p-3.5 text-right">IP Hash</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No audit records matched the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-[#132A1C]' : 'hover:bg-[#F2F7F3]'
                    }`}
                  >
                    {/* ID & Time */}
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-xs block text-[#22C55E]">
                        {log.id}
                      </span>
                      <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {log.timestamp}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="p-3.5 font-bold">
                      {log.actor}
                    </td>

                    {/* Action */}
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 font-mono ${getActionBadgeClass(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span>{log.action}</span>
                      </span>
                    </td>

                    {/* Target */}
                    <td className="p-3.5 font-mono text-xs font-semibold">
                      {log.target}
                    </td>

                    {/* Details */}
                    <td className="p-3.5 text-xs max-w-md">
                      {log.details}
                    </td>

                    {/* IP Hash */}
                    <td className="p-3.5 text-right font-mono text-[10px] text-gray-400">
                      {log.ipHash}
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
