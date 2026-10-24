// src/pages/admin/AdminAnalyticsGates.jsx - Per-Gate Quality & OOD Rejection Analytics
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_GATE_REJECTIONS } from '../../data/adminMockData';
import { 
  ArrowLeft, Filter, AlertTriangle, ShieldCheck, 
  Sliders, Eye, CheckCircle2, RefreshCw
} from 'lucide-react';

export default function AdminAnalyticsGates() {
  const { isDark, t } = useAuth();
  const gates = ADMIN_GATE_REJECTIONS;
  const totalStops = gates.reduce((sum, g) => sum + g.count, 0);

  // Simulation controls
  const [laplacianThreshold, setLaplacianThreshold] = useState(100);
  const [oodThreshold, setOodThreshold] = useState(24.5);

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
          <h1 className="text-2xl font-black">{t('admin_nav_gates')}</h1>
          <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Pre-inference guardrails preventing non-leaf junk, blur artifacts, and fraudulent micro-bounty claims.
          </p>
        </div>
      </div>

      {/* ── TOP KPI TILES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Total Guard Stops</div>
          <div className="text-3xl font-black font-mono text-rose-500 mt-1">{totalStops}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">6.5% of total uploads</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Primary Stop Cause</div>
          <div className="text-lg font-black mt-1">Mahalanobis OOD</div>
          <span className="text-[10px] text-amber-500 font-bold mt-1 block">42 stops (48%)</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">False Positive Rate</div>
          <div className="text-3xl font-black font-mono text-emerald-500 mt-1">&lt; 0.3%</div>
          <span className="text-[10px] text-gray-400 mt-1 block">On valid leaves</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Bounty Budget Saved</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">₹1,140</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Fraud/Junk averted</span>
        </div>
      </div>

      {/* ── SECTION 1: PER-GATE BREAKDOWN ── */}
      <div className={`p-6 rounded-3xl border space-y-5 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#22C55E]" />
          Guardrail Interception Statistics
        </h2>

        <div className="space-y-4">
          {gates.map((g, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">{g.gate}</span>
                <span className="font-mono font-bold text-rose-500">{g.count} rejected ({g.percentage})</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: g.percentage }}
                />
              </div>
              <p className={`text-[11px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                {g.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: THRESHOLD CALIBRATION SIMULATOR ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#22C55E]" />
            Guard Threshold Tuning Simulator
          </h2>
          <span className="text-xs text-gray-400 font-mono">Real-time Safety Margin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Slider 1 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold">Laplacian Blur Filter Cutoff</span>
              <span className="font-mono text-emerald-500 font-bold">{laplacianThreshold} σ²</span>
            </div>
            <input
              type="range"
              min="60"
              max="160"
              value={laplacianThreshold}
              onChange={(e) => setLaplacianThreshold(Number(e.target.value))}
              className="w-full accent-[#22C55E] cursor-pointer"
            />
            <p className="text-[10px] text-gray-400">
              Higher cutoff rejects softer smartphone cameras; lower cutoff permits faint motion blur.
            </p>
          </div>

          {/* Slider 2 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold">Mahalanobis OOD Distance ($D_M$)</span>
              <span className="font-mono text-emerald-500 font-bold">{oodThreshold}</span>
            </div>
            <input
              type="range"
              min="18"
              max="35"
              step="0.5"
              value={oodThreshold}
              onChange={(e) => setOodThreshold(Number(e.target.value))}
              className="w-full accent-[#22C55E] cursor-pointer"
            />
            <p className="text-[10px] text-gray-400">
              Feature covariance distance in embedding space. Distance &gt; {oodThreshold} triggers non-crop rejection.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
