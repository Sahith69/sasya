// src/pages/admin/AdminAnalyticsModel.jsx - Model Agreement & 5x5 Confusion Matrix
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_CONFUSION_MATRIX } from '../../data/adminMockData';
import { 
  ArrowLeft, Cpu, ShieldCheck, CheckCircle2, 
  Sparkles, Layers, Info
} from 'lucide-react';

export default function AdminAnalyticsModel() {
  const { isDark, t } = useAuth();
  const { classes, matrix } = ADMIN_CONFUSION_MATRIX;
  const [hoveredCell, setHoveredCell] = useState(null);

  // Calculate Precision and Recall per class
  const classStats = classes.map((cls, idx) => {
    const truePositive = matrix[idx][idx];
    const totalActual = matrix[idx].reduce((a, b) => a + b, 0); // Row sum = Recall denominator
    const totalPredicted = matrix.reduce((sum, row) => sum + row[idx], 0); // Col sum = Precision denominator
    const recall = totalActual > 0 ? (truePositive / totalActual) * 100 : 0;
    const precision = totalPredicted > 0 ? (truePositive / totalPredicted) * 100 : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      name: cls,
      truePositive,
      totalActual,
      totalPredicted,
      recall: recall.toFixed(1),
      precision: precision.toFixed(1),
      f1: f1.toFixed(1)
    };
  });

  const totalSamples = matrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
  const totalCorrect = matrix.reduce((sum, row, idx) => sum + row[idx], 0);
  const overallAccuracy = ((totalCorrect / totalSamples) * 100).toFixed(1);

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
          <h1 className="text-2xl font-black">{t('admin_nav_model')}</h1>
          <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Quantifying AI diagnostic predictions against Ground Truth plant pathologist consensus.
          </p>
        </div>
      </div>

      {/* ── TOP KPI TILES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Overall Accuracy</div>
          <div className="text-3xl font-black font-mono text-emerald-500 mt-1">{overallAccuracy}%</div>
          <span className="text-[10px] text-gray-400 mt-1 block">{totalCorrect} / {totalSamples} specimens</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Mean F1-Score</div>
          <div className="text-3xl font-black font-mono text-blue-500 mt-1">96.7%</div>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Harmonic mean</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Vision Architecture</div>
          <div className="text-lg font-black mt-1">MobileNetV3-Ag</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Edge quantized INT8</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'}`}>
          <div className="text-[10px] font-mono uppercase text-gray-400">Inference Latency</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">42 ms</div>
          <span className="text-[10px] text-gray-400 mt-1 block">On standard mobile CPU</span>
        </div>
      </div>

      {/* ── SECTION 1: 5X5 INTERACTIVE CONFUSION MATRIX ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#22C55E]" />
            Pathologist Consensus Confusion Matrix (5×5)
          </h2>
          <span className="text-[10px] text-gray-400 font-mono">
            Row: Expert Ground Truth | Column: AI Prediction
          </span>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-3 text-left font-bold text-gray-400">Ground Truth \ Predicted</th>
                {classes.map((c, idx) => (
                  <th key={idx} className="p-3 font-bold font-mono text-[11px] truncate max-w-[90px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-3 text-left font-bold border-r border-gray-500/20 font-mono text-[11px]">
                    {classes[rIdx]}
                  </td>
                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    return (
                      <td
                        key={cIdx}
                        onMouseEnter={() => setHoveredCell({ actual: classes[rIdx], pred: classes[cIdx], val })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`p-3 font-mono font-bold transition-all cursor-pointer ${
                          isDiagonal
                            ? isDark ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : val > 0 
                              ? isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700'
                              : isDark ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hovered cell readout */}
        {hoveredCell && (
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono flex items-center justify-between text-gray-300 animate-fadeIn">
            <span>Actual: <strong className="text-white">{hoveredCell.actual}</strong></span>
            <span>Predicted: <strong className="text-white">{hoveredCell.pred}</strong></span>
            <span>Samples: <strong className="text-emerald-400">{hoveredCell.val}</strong></span>
          </div>
        )}
      </div>

      {/* ── SECTION 2: PER-CLASS PRECISION & RECALL ── */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
      }`}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          Class-Level Precision, Recall & F1 Benchmarks
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[10px] ${
                isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#91BA94]/40 text-[#556B5C]'
              }`}>
                <th className="py-2.5">Class Name</th>
                <th className="py-2.5 text-right">Support (Specimens)</th>
                <th className="py-2.5 text-right text-emerald-500">Precision</th>
                <th className="py-2.5 text-right text-blue-500">Recall</th>
                <th className="py-2.5 text-right text-purple-400">F1-Score</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E3A2B]' : 'divide-[#91BA94]/30'}`}>
              {classStats.map((st, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 font-mono">
                  <td className="py-3 font-bold font-sans">{st.name}</td>
                  <td className="py-3 text-right text-gray-400">{st.totalActual}</td>
                  <td className="py-3 text-right font-bold text-emerald-500">{st.precision}%</td>
                  <td className="py-3 text-right font-bold text-blue-500">{st.recall}%</td>
                  <td className="py-3 text-right font-bold text-purple-400">{st.f1}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
