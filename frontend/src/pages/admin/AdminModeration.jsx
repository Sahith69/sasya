// src/pages/admin/AdminModeration.jsx - Moderation Desk for Hazardous Chemicals & Price Gouging
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_MODERATION_ITEMS } from '../../data/adminMockData';
import { 
  AlertTriangle, ShieldCheck, CheckCircle2, XCircle, 
  Trash2, MessageSquare, UserX, Clock, Filter, Search
} from 'lucide-react';

export default function AdminModeration() {
  const { isDark, t } = useAuth();
  const [items, setItems] = useState(ADMIN_MODERATION_ITEMS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionNotice, setActionNotice] = useState('');

  const filteredItems = items.filter(item => {
    if (statusFilter === 'All') return true;
    return item.status.toLowerCase().includes(statusFilter.toLowerCase());
  });

  const handleResolve = (id, resolution) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: `Resolved (${resolution})` } : item
    ));
    setActionNotice(`Report ${id} marked as Resolved: ${resolution}.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleDismiss = (id) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Dismissed (False Report)' } : item
    ));
    setActionNotice(`Report ${id} dismissed.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{t('admin_moderation_title')}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
              {items.filter(i => i.status.includes('Pending')).length} Pending Actions
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Triage illegal pesticide compound claims (CIB&RC violations), price gouging on sprayers, and misinformation.
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer self-start sm:self-auto ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94]/60 text-[#275637]'
          }`}
        >
          <option value="All">All Reports</option>
          <option value="Pending">Pending Action</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── ITEMS LIST ── */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className={`p-8 rounded-3xl border text-center text-gray-400 text-xs ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
          }`}>
            No moderation flags currently match the filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isPending = item.status.includes('Pending');
            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border space-y-4 transition-all ${
                  isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
                } ${isPending ? 'border-amber-500/40 shadow-xs' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className={`w-4 h-4 ${isPending ? 'text-amber-500' : 'text-gray-400'}`} />
                    <span className="font-mono font-bold text-xs">{item.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-black/10 dark:bg-white/10">
                      {item.targetType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.reportedAt}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPending ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' :
                      'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm">{item.targetTitle}</h3>
                  <div className="text-xs text-rose-500 dark:text-rose-400 font-semibold mt-1">
                    Violation: {item.reason}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Author: <span className="font-mono text-gray-300">{item.author}</span> • Reported by: <span className="font-semibold text-gray-300">{item.reportedBy}</span>
                  </div>
                </div>

                {/* Moderation Actions */}
                {isPending && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-500/20">
                    <button
                      onClick={() => handleResolve(item.id, 'Listing Removed')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Listing</span>
                    </button>

                    <button
                      onClick={() => handleResolve(item.id, 'Official Warning Issued')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Issue Regulatory Warning</span>
                    </button>

                    <button
                      onClick={() => handleDismiss(item.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-500/30 text-gray-400 hover:bg-gray-500/10 cursor-pointer"
                    >
                      Dismiss Report
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
