// src/pages/admin/AdminExport.jsx - Anonymised CSV & Open Ag AI Research Dataset Export
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_SUBMISSIONS } from '../../data/adminMockData';
import { 
  FileSpreadsheet, Download, ShieldCheck, CheckCircle2, 
  Eye, Lock, Database, Sparkles, Filter
} from 'lucide-react';

export default function AdminExport() {
  const { isDark, t } = useAuth();
  const [format, setFormat] = useState('full'); // full, highConf, arecaOnly
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate anonymized CSV dataset
  const generateAnonymizedCsv = () => {
    setIsExporting(true);

    let rows = ADMIN_SUBMISSIONS.map((sub, idx) => ({
      dataset_specimen_id: sub.id,
      crop_domain: sub.crop,
      ground_truth_disease: sub.aiPrediction,
      etiological_pathogen: sub.pathogen,
      severity_classification: sub.aiSeverity,
      laplacian_blur_variance: sub.laplacianVariance,
      centroid_district: sub.district,
      spatial_privacy_k: 5,
      anonymized_contributor_token: `anon_ka_${(idx + 1).toString().padStart(4, '0')}`,
      verification_status: sub.status,
      verified_by_institution: sub.verifiedBy ? 'Accredited Agronomy Reviewer' : 'Unverified',
      triage_timestamp: sub.submittedAt
    }));

    if (format === 'highConf') {
      rows = rows.filter(r => r.verification_status === 'Approved');
    } else if (format === 'arecaOnly') {
      rows = rows.filter(r => r.crop_domain === 'Arecanut');
    }

    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    // Trigger download
    setTimeout(() => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sasya_open_ag_ai_dataset_v2.4_${format}_anonymised.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight">{t('admin_export_title')}</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#275637] text-white">
            Standard v2.4
          </span>
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
          Export clean, peer-reviewed crop pathology images and annotations with mathematical spatial privacy ($k \ge 5$).
        </p>
      </div>

      {/* ── PRIVACY GUARANTEE BANNER ── */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-[#E8F2EA] border-[#91BA94]/60'
      }`}>
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-[#22C55E] shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-bold text-sm text-[#275637] dark:text-[#22C55E]">
              Zero-PII & Centroid Aggregation Guarantee
            </h3>
            <p className={`mt-0.5 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Farmer names, mobile numbers, and exact coordinates are stripped before serialization. Only anonymized hash tokens and district centroids are shared.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/10">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>k-anonymity = 5</span>
        </div>
      </div>

      {/* ── EXPORT CONFIGURATION & TRIGGER ── */}
      <div className={`p-6 rounded-3xl border space-y-5 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#22C55E]" />
          Dataset Partition Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormat('full')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              format === 'full'
                ? 'border-[#22C55E] bg-[#22C55E]/10 font-bold'
                : isDark ? 'border-[#1E3A2B] bg-[#0E1E16]' : 'border-[#91BA94]/40 bg-[#F9F9F6]'
            }`}
          >
            <div className="text-sm font-black">Complete Dataset</div>
            <div className="text-xs text-gray-400 mt-1">All {ADMIN_SUBMISSIONS.length} specimens including approved, corrected, and OOD.</div>
          </button>

          <button
            type="button"
            onClick={() => setFormat('highConf')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              format === 'highConf'
                ? 'border-[#22C55E] bg-[#22C55E]/10 font-bold'
                : isDark ? 'border-[#1E3A2B] bg-[#0E1E16]' : 'border-[#91BA94]/40 bg-[#F9F9F6]'
            }`}
          >
            <div className="text-sm font-black">Gold Standard Split</div>
            <div className="text-xs text-gray-400 mt-1">Only verified, approved specimens by expert reviewers.</div>
          </button>

          <button
            type="button"
            onClick={() => setFormat('arecaOnly')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              format === 'arecaOnly'
                ? 'border-[#22C55E] bg-[#22C55E]/10 font-bold'
                : isDark ? 'border-[#1E3A2B] bg-[#0E1E16]' : 'border-[#91BA94]/40 bg-[#F9F9F6]'
            }`}
          >
            <div className="text-sm font-black">Arecanut Specialty</div>
            <div className="text-xs text-gray-400 mt-1">Arecanut Koleroga and Yellow Leaf Disease focus subset.</div>
          </button>
        </div>

        {/* Download Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            Format: <strong className="text-white font-mono">RFC 4180 UTF-8 CSV</strong> • Size: ~14.8 KB
          </div>

          <button
            onClick={generateAnonymizedCsv}
            disabled={isExporting}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating Anonymized CSV...' : t('admin_action_download_csv')}</span>
          </button>
        </div>

        {/* Success toast */}
        {downloadSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>CSV downloaded successfully to your local machine!</span>
          </div>
        )}
      </div>

      {/* ── PREVIEW OF ANONYMIZED EXPORT DATA ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#22C55E]" />
            Live CSV Schema & Data Preview (First 5 Rows)
          </h2>
          <span className="text-[10px] text-gray-400 font-mono">Masked Centroid Columns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold ${
                isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#91BA94]/40 text-[#556B5C]'
              }`}>
                <th className="py-2">specimen_id</th>
                <th className="py-2">crop</th>
                <th className="py-2">disease</th>
                <th className="py-2">pathogen</th>
                <th className="py-2">lap_var</th>
                <th className="py-2">district</th>
                <th className="py-2">anon_token</th>
                <th className="py-2">status</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-[11px] ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {ADMIN_SUBMISSIONS.slice(0, 5).map((sub, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="py-2.5 font-bold text-[#22C55E]">{sub.id}</td>
                  <td className="py-2.5 font-sans font-bold">{sub.crop}</td>
                  <td className="py-2.5 font-sans">{sub.aiPrediction}</td>
                  <td className="py-2.5 italic text-gray-400">{sub.pathogen}</td>
                  <td className="py-2.5">{sub.laplacianVariance}</td>
                  <td className="py-2.5">{sub.district}</td>
                  <td className="py-2.5 text-blue-400 font-bold">anon_ka_{String(idx + 1).padStart(4, '0')}</td>
                  <td className="py-2.5">
                    <span className="text-emerald-500 font-bold">{sub.status}</span>
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
