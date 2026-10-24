// src/pages/admin/AdminReviewDetail.jsx - Deep Specimen Inspection & Pathology Calibration Desk
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_SUBMISSIONS } from '../../data/adminMockData';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Edit3, 
  Eye, Sparkles, Layers, ShieldCheck, DollarSign, Clock, 
  FileText, User, MapPin, ChevronLeft, ChevronRight, Check
} from 'lucide-react';

const COMMON_DISEASES = [
  { name: 'Koleroga (Fruit Rot)', pathogen: 'Phytophthora meadii', crop: 'Arecanut' },
  { name: 'Yellow Leaf Disease', pathogen: 'Phytoplasma', crop: 'Arecanut' },
  { name: 'Bud Borer Damage', pathogen: 'Conogethes punctiferalis', crop: 'Arecanut' },
  { name: 'Leaf Blast', pathogen: 'Magnaporthe oryzae', crop: 'Paddy' },
  { name: 'Brown Spot', pathogen: 'Bipolaris oryzae', crop: 'Paddy' },
  { name: 'Apple Scab', pathogen: 'Venturia inaequalis', crop: 'Apple' },
  { name: 'Early Blight', pathogen: 'Alternaria solani', crop: 'Tomato' },
  { name: 'Late Blight', pathogen: 'Phytophthora infestans', crop: 'Tomato' },
  { name: 'Healthy / No Pathogen', pathogen: 'N/A', crop: 'All' }
];

export default function AdminReviewDetail() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { isDark, t } = useAuth();

  // Find target submission or default to first
  const [submission, setSubmission] = useState(() => {
    return ADMIN_SUBMISSIONS.find(s => s.id === submissionId) || ADMIN_SUBMISSIONS[0];
  });

  const [gradCamActive, setGradCamActive] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Mahalanobis OOD Distance Exceeded (> 24.5)');
  const [reviewerNote, setReviewerNote] = useState(submission.reviewerNotes || '');
  const [bannerMessage, setBannerMessage] = useState('');

  // Find index for prev/next
  const currentIndex = ADMIN_SUBMISSIONS.findIndex(s => s.id === submission.id);
  const prevSub = currentIndex > 0 ? ADMIN_SUBMISSIONS[currentIndex - 1] : null;
  const nextSub = currentIndex < ADMIN_SUBMISSIONS.length - 1 ? ADMIN_SUBMISSIONS[currentIndex + 1] : null;

  const handleApprove = () => {
    setSubmission(prev => ({
      ...prev,
      status: 'Approved',
      verifiedBy: 'Dr. Subrahmanya Bhat',
      reviewerNotes: reviewerNote || 'Specimen verified for Karnataka Open Ag AI repository.'
    }));
    setBannerMessage(`Submission ${submission.id} approved! ₹${submission.bountyAmount.toFixed(2)} UPI transfer authorized.`);
    setTimeout(() => setBannerMessage(''), 4500);
  };

  const handleConfirmCorrection = () => {
    if (!selectedCorrection) return;
    const diseaseObj = COMMON_DISEASES.find(d => d.name === selectedCorrection);
    setSubmission(prev => ({
      ...prev,
      status: 'Corrected',
      aiPrediction: selectedCorrection,
      pathogen: diseaseObj?.pathogen || prev.pathogen,
      verifiedBy: 'Dr. Subrahmanya Bhat (Expert Override)',
      reviewerNotes: reviewerNote ? `${reviewerNote} | Re-labeled to ${selectedCorrection}` : `Re-labeled to ${selectedCorrection}`
    }));
    setShowCorrectionModal(false);
    setBannerMessage(`Diagnosis corrected to "${selectedCorrection}". Training dataset updated.`);
    setTimeout(() => setBannerMessage(''), 4500);
  };

  const handleConfirmRejection = () => {
    setSubmission(prev => ({
      ...prev,
      status: 'Rejected',
      verifiedBy: 'Dr. Subrahmanya Bhat',
      bountyAmount: 0.00,
      reviewerNotes: `Rejected: ${rejectionReason}`
    }));
    setShowRejectModal(false);
    setBannerMessage(`Submission ${submission.id} marked Rejected (${rejectionReason}).`);
    setTimeout(() => setBannerMessage(''), 4500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── TOP NAV & CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/queue"
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black font-mono">{submission.id}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                submission.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' :
                submission.status === 'Pending' ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' :
                submission.status === 'Corrected' ? 'bg-blue-500/15 text-blue-500 border-blue-500/30' :
                'bg-rose-500/15 text-rose-500 border-rose-500/30'
              }`}>
                {submission.status}
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Submitted on {submission.submittedAt}
            </p>
          </div>
        </div>

        {/* Prev / Next Pagination */}
        <div className="flex items-center gap-2">
          {prevSub ? (
            <Link
              to={`/admin/review/${prevSub.id}`}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B] hover:bg-[#163323]' : 'bg-white border-[#91BA94] hover:bg-[#E8F2EA]'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{prevSub.id}</span>
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl border text-xs font-bold opacity-30 cursor-not-allowed">
              Prev
            </span>
          )}

          {nextSub ? (
            <Link
              to={`/admin/review/${nextSub.id}`}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B] hover:bg-[#163323]' : 'bg-white border-[#91BA94] hover:bg-[#E8F2EA]'
              }`}
            >
              <span>{nextSub.id}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl border text-xs font-bold opacity-30 cursor-not-allowed">
              Next
            </span>
          )}
        </div>
      </div>

      {/* Banner */}
      {bannerMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* ── TWO COLUMN MAIN INSPECTION DECK ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: IMAGE VIEWER & GRAD-CAM (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-4 rounded-3xl border ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                {gradCamActive ? 'Grad-CAM Attention Heatmap' : 'Raw RGB Leaf Specimen'}
              </span>
              <button
                onClick={() => setGradCamActive(!gradCamActive)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  gradCamActive
                    ? 'bg-amber-500 text-[#0B1712]'
                    : isDark ? 'bg-[#1B3828] text-[#8BA695]' : 'bg-[#E8F2EA] text-[#275637]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{gradCamActive ? 'Disable Heatmap' : 'Overlay Grad-CAM'}</span>
              </button>
            </div>

            {/* Specimen Viewport */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
              <img
                src={submission.image}
                alt={submission.id}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80';
                }}
              />

              {/* Simulated Grad-CAM Heatmap Overlay */}
              {gradCamActive && (
                <div className="absolute inset-0 bg-radial from-red-500/70 via-yellow-400/50 to-blue-600/30 mix-blend-color-dodge pointer-events-none animate-pulse flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-red-500/80 bg-red-600/30 flex items-center justify-center text-white font-mono text-[10px] font-bold shadow-lg">
                    Lesion Hotspot (88.4%)
                  </div>
                </div>
              )}

              {/* Image badges */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-mono text-white flex items-center gap-2">
                <span>Res: 1920×1080</span>
                <span>•</span>
                <span className={submission.laplacianVariance >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                  Lap σ²: {submission.laplacianVariance}
                </span>
              </div>
            </div>

            {/* Quality & Focus Diagnostics */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/40'}`}>
                <div className="text-[10px] text-gray-400">Quality Score</div>
                <div className="font-mono font-extrabold text-sm text-emerald-500">{submission.qualityScore}/100</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/40'}`}>
                <div className="text-[10px] text-gray-400">Laplacian Blur</div>
                <div className="font-mono font-extrabold text-sm text-sky-400">{submission.laplacianVariance}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/40'}`}>
                <div className="text-[10px] text-gray-400">Bounty Eligible</div>
                <div className="font-mono font-extrabold text-sm text-emerald-500">₹{submission.bountyAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PATHOLOGY & REVIEW CONTROLS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* AI Inference Card */}
          <div className={`p-5 rounded-3xl border space-y-3.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">
                AI Diagnostic Telemetry
              </span>
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                {(submission.aiConfidence * 100).toFixed(1)}% Conf
              </span>
            </div>

            <div>
              <div className="text-xs text-gray-400">Predicted Class:</div>
              <div className="text-lg font-black">{submission.aiPrediction}</div>
            </div>

            <div className="text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Host Crop:</span>
                <span className="font-bold">{submission.crop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pathogen:</span>
                <span className="font-bold text-amber-500">{submission.pathogen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Severity:</span>
                <span className="font-bold">{submission.aiSeverity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reviewer:</span>
                <span className="font-bold text-emerald-400">{submission.verifiedBy || 'Pending Assignment'}</span>
              </div>
            </div>
          </div>

          {/* Farmer & Geo Metadata */}
          <div className={`p-4 rounded-3xl border text-xs space-y-2.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Grower Centroid Attribution
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#22C55E]" />
                <Link to={`/admin/farmers/${submission.farmerId}`} className="font-bold hover:underline">
                  {submission.farmerName}
                </Link>
              </div>
              <span className="text-[10px] font-mono text-gray-400">{submission.farmerId}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>{submission.village}, {submission.district}, {submission.state}</span>
            </div>
          </div>

          {/* Reviewer Notes */}
          <div className={`p-4 rounded-3xl border space-y-2 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
          }`}>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
              Pathologist Calibration Notes
            </label>
            <textarea
              rows={3}
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              placeholder="Add observation on spore lesions, perianth discoloration, or dataset inclusion remarks..."
              className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/40 text-[#275637]'
              }`}
            />
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleApprove}
              className="w-full py-3 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{t('admin_action_approve')} ₹{submission.bountyAmount.toFixed(2)}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCorrectionModal(true)}
                className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark ? 'bg-[#1B3828] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637] hover:bg-[#d8e8dc]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                <span>{t('admin_action_correct')}</span>
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="py-2.5 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{t('admin_action_reject')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── CORRECTION MODAL ── */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 animate-scaleUp ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-500" />
              Expert Label Correction
            </h3>
            <p className="text-xs text-gray-400">
              Override model classification for retraining Karnataka Open Ag AI vision weights.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold">Select Ground Truth Diagnosis:</label>
              <select
                value={selectedCorrection}
                onChange={(e) => setSelectedCorrection(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                }`}
              >
                <option value="">-- Choose verified label --</option>
                {COMMON_DISEASES.map((dis, idx) => (
                  <option key={idx} value={dis.name}>
                    {dis.crop}: {dis.name} ({dis.pathogen})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/30 text-gray-400 hover:bg-gray-500/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCorrection}
                disabled={!selectedCorrection}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 cursor-pointer"
              >
                Save Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECTION MODAL ── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 animate-scaleUp ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            <h3 className="font-extrabold text-base text-rose-500 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Reject Specimen
            </h3>
            <p className="text-xs text-gray-400">
              Mark specimen rejected. Bounty will be withheld and explanation sent to farmer.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold">Rejection Reason Code:</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                }`}
              >
                <option value="Mahalanobis OOD Distance Exceeded (> 24.5)">Mahalanobis OOD Guard (Non-crop object)</option>
                <option value="Laplacian Variance Blur (< 100)">Severe Focus Blur / Motion Artifact</option>
                <option value="Cross-Crop Domain Mismatch">Cross-Crop Domain Mismatch (e.g. weed in areca plot)</option>
                <option value="Inconclusive Perianth Lesion Area">Healthy Specimen / Insufficient Pathology Detail</option>
                <option value="Duplicate Leaf Hash (Fraud Prevention)">Duplicate Leaf Submission</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/30 text-gray-400 hover:bg-gray-500/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
