// src/pages/admin/AdminFarmerDetail.jsx - One Farmer's Historical Audit & Flag Management
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_FARMERS, ADMIN_SUBMISSIONS } from '../../data/adminMockData';
import { 
  ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, UserX, 
  MapPin, Phone, CreditCard, Layers, DollarSign, Calendar, 
  Eye, RefreshCw, Plus, Check, Trash2
} from 'lucide-react';

export default function AdminFarmerDetail() {
  const { farmerId } = useParams();
  const { isDark, t } = useAuth();

  // Find farmer or default to first
  const [farmer, setFarmer] = useState(() => {
    return ADMIN_FARMERS.find(f => f.id === farmerId) || ADMIN_FARMERS[0];
  });

  const [newFlagText, setNewFlagText] = useState('');
  const [showAddFlag, setShowAddFlag] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Find all submissions by this farmer
  const farmerSubmissions = ADMIN_SUBMISSIONS.filter(s => s.farmerId === farmer.id);

  const handleAddFlag = () => {
    if (!newFlagText.trim()) return;
    setFarmer(prev => ({
      ...prev,
      flags: [...prev.flags, newFlagText.trim()],
      trustScore: Math.max(0, prev.trustScore - 15)
    }));
    setNewFlagText('');
    setShowAddFlag(false);
    setActionNotice('Flag added. Algorithmic trust score decremented by 15 points.');
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleClearFlags = () => {
    setFarmer(prev => ({
      ...prev,
      flags: [],
      trustScore: Math.min(100, prev.trustScore + 25),
      trustTier: 'Verified Grower'
    }));
    setActionNotice('All administrative flags cleared. Trust score reinstated.');
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleToggleSuspend = () => {
    const isSuspended = farmer.trustTier.includes('Suspended');
    setFarmer(prev => ({
      ...prev,
      trustTier: isSuspended ? 'Verified Grower' : 'Suspended / Watchlist'
    }));
    setActionNotice(isSuspended ? 'Account unsuspended.' : 'Account suspended from submitting new leaves.');
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/farmers"
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{farmer.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                farmer.trustTier.includes('Elite') ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' :
                farmer.trustTier.includes('Verified') ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' :
                'bg-rose-500/15 text-rose-500 border-rose-500/30'
              }`}>
                {farmer.trustTier}
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Registry ID: <span className="font-mono font-bold">{farmer.id}</span> • Member since {farmer.joinedDate}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSuspend}
            className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              farmer.trustTier.includes('Suspended')
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                : 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
            }`}
          >
            {farmer.trustTier.includes('Suspended') ? 'Reinstate Grower' : 'Suspend Account'}
          </button>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── PROFILE & TRUST METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Col 1: Farmer Profile Card */}
        <div className={`p-5 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
            Farmer Profile
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#22C55E]" />
              <span>{farmer.village}, {farmer.taluk}, {farmer.district}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <Phone className="w-4 h-4 text-[#22C55E]" />
              <span>Centroid Mask: +91 {farmer.phone}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <CreditCard className="w-4 h-4 text-[#22C55E]" />
              <span>UPI: {farmer.upiId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Land Holding:</span>
              <span className="font-bold">{farmer.landSize}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-500/20">
            <span className="text-[10px] text-gray-400 block mb-1">Crops Registered:</span>
            <div className="flex flex-wrap gap-1.5">
              {farmer.crops.map((c, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    isDark ? 'bg-[#183424] text-[#8BA695]' : 'bg-[#E8F2EA] text-[#275637]'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Trust Score Gauge */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-3">
              Algorithmic Trust Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black font-mono ${
                farmer.trustScore >= 90 ? 'text-emerald-500' :
                farmer.trustScore >= 70 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {farmer.trustScore}
              </span>
              <span className="text-gray-400 font-mono text-xs">/ 100</span>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Calculated based on valid leaf segmentation, zero Laplacian blur violations, and spatial consistency.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-gray-500/20">
            <div>
              <span className="text-[10px] text-gray-400 block">Submissions</span>
              <span className="font-bold text-xs">{farmer.submissionsCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">Verified</span>
              <span className="font-bold text-xs text-emerald-500">{farmer.approvedCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">Rejected</span>
              <span className="font-bold text-xs text-rose-500">{farmer.rejectedCount}</span>
            </div>
          </div>
        </div>

        {/* Col 3: Bounty Disbursement Ledger */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
        }`}>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-3">
              Micro-Bounty Earnings
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-emerald-500">
                ₹{farmer.totalBountiesEarned.toFixed(2)}
              </span>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Direct NPCI UPI settlement to <span className="font-mono font-bold">{farmer.upiId}</span>.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Payment Status:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Disbursed
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── FLAGS & AUDIT SECTION ── */}
      <div className={`p-5 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${farmer.flags.length > 0 ? 'text-rose-500' : 'text-gray-400'}`} />
            <h2 className="font-bold text-sm">Integrity & Quality Flags ({farmer.flags.length})</h2>
          </div>

          <div className="flex items-center gap-2">
            {farmer.flags.length > 0 && (
              <button
                onClick={handleClearFlags}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
              >
                Clear All Flags
              </button>
            )}
            <button
              onClick={() => setShowAddFlag(!showAddFlag)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#275637] text-white hover:bg-[#1E432B] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Flag</span>
            </button>
          </div>
        </div>

        {/* Add Flag Input */}
        {showAddFlag && (
          <div className="flex gap-2 animate-fadeIn">
            <input
              type="text"
              value={newFlagText}
              onChange={(e) => setNewFlagText(e.target.value)}
              placeholder="e.g. Uploaded stock photo from web, blurry camera warning..."
              className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/50 text-[#275637]'
              }`}
            />
            <button
              onClick={handleAddFlag}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              Confirm Flag
            </button>
          </div>
        )}

        {/* Active Flags List */}
        {farmer.flags.length === 0 ? (
          <div className="text-xs text-gray-400 py-2">
            ✓ Clean record. No administrative or fraud detection flags recorded.
          </div>
        ) : (
          <div className="space-y-2">
            {farmer.flags.map((flag, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{flag}</span>
                </div>
                <span className="text-[10px] text-gray-400">Triggered by Auto-Gate</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SUBMISSIONS HISTORY BY THIS FARMER ── */}
      <div className={`p-5 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">Upload History & AI Telemetry</h2>
          <span className="text-xs text-gray-400">{farmerSubmissions.length} uploads logged</span>
        </div>

        {farmerSubmissions.length === 0 ? (
          <div className="text-xs text-gray-400 py-4 text-center">
            No specimen submissions in active triage queue for this grower.
          </div>
        ) : (
          <div className="divide-y divide-gray-500/20">
            {farmerSubmissions.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/20 shrink-0">
                    <img src={sub.image} alt={sub.id} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-xs">{sub.id} • {sub.crop}</div>
                    <div className="text-xs text-gray-400">{sub.aiPrediction} ({(sub.aiConfidence * 100).toFixed(0)}%)</div>
                    <div className="text-[10px] text-gray-400">{sub.submittedAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-emerald-500">
                      ₹{sub.bountyAmount.toFixed(2)}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      sub.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      sub.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  <Link
                    to={`/admin/review/${sub.id}`}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      isDark ? 'bg-[#183424] hover:bg-[#22C55E] text-white hover:text-[#0B1712]' : 'bg-[#E8F2EA] hover:bg-[#275637] text-[#275637] hover:text-white'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
