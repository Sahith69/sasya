// src/pages/admin/AdminExperts.jsx - Manage Simulated Plant Pathology Experts & Reviewers
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EXPERTS } from '../../data/adminMockData';
import { 
  ShieldCheck, UserPlus, CheckCircle2, Award, 
  Building2, BookOpen, Check, X, Sparkles
} from 'lucide-react';

export default function AdminExperts() {
  const { isDark, t } = useAuth();
  const [experts, setExperts] = useState(ADMIN_EXPERTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notice, setNotice] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Senior Plant Pathologist');
  const [institution, setInstitution] = useState('Regional Agronomy Research Station');
  const [specialty, setSpecialty] = useState('Arecanut & Palms Pathology');
  const [avatar, setAvatar] = useState('👨‍🔬');

  const handleToggleStatus = (id) => {
    setExperts(prev => prev.map(exp => {
      if (exp.id === id) {
        const nextStatus = exp.status === 'Active Reviewer' ? 'On Leave / Inactive' : 'Active Reviewer';
        return { ...exp, status: nextStatus };
      }
      return exp;
    }));
  };

  const handleAddExpert = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExp = {
      id: `EXP-0${experts.length + 1}`,
      name: name.trim(),
      title,
      institution,
      specialty,
      status: 'Active Reviewer',
      verifiedCount: 0,
      agreementRate: '100%',
      avatar
    };

    setExperts(prev => [...prev, newExp]);
    setName('');
    setShowAddModal(false);
    setNotice(`New simulated reviewer ${newExp.name} added to triage rota.`);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{t('admin_experts_title')}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#275637] text-white">
              {experts.length} Pathologists
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
            Accredited agronomists and plant pathologists verifying farm scans and fine-tuning AI.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Expert Reviewer</span>
        </button>
      </div>

      {/* Notice */}
      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ── EXPERTS CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {experts.map((exp) => {
          const isActive = exp.status === 'Active Reviewer';
          return (
            <div
              key={exp.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/60'
              } ${isActive ? '' : 'opacity-60'}`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl">
                    {exp.avatar}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isActive ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                  }`}>
                    {exp.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-base">{exp.name}</h3>
                <div className="text-xs text-[#22C55E] font-semibold">{exp.title}</div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-2">{exp.institution}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-500/20 text-xs space-y-1">
                  <div className="text-gray-400 text-[10px] uppercase font-mono">Specialization</div>
                  <div className="font-semibold">{exp.specialty}</div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-500/20">
                <div className="grid grid-cols-2 gap-2 text-center mb-4">
                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/30'}`}>
                    <span className="text-[10px] text-gray-400 block">Verified Scans</span>
                    <span className="font-mono font-bold text-xs text-emerald-500">{exp.verifiedCount}</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/30'}`}>
                    <span className="text-[10px] text-gray-400 block">Agreement</span>
                    <span className="font-mono font-bold text-xs text-blue-400">{exp.agreementRate}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(exp.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    isActive
                      ? 'border-gray-500/30 text-gray-400 hover:bg-gray-500/10'
                      : 'bg-emerald-600 text-white border-transparent'
                  }`}
                >
                  {isActive ? 'Mark On Leave' : 'Reactivate Rota'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExpert}
            className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 animate-scaleUp ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                Enroll Expert Reviewer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Full Name & Honorific:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Harish Kumar"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Academic / Research Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Professor & Head of Entomology"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Institution:</label>
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none font-bold ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                  }`}
                >
                  <option value="Regional Agronomy Research Station">Regional Agronomy Research Station</option>
                  <option value="University of Agricultural & Horticultural Sciences (UAHS), Shimoga">UAHS Shimoga</option>
                  <option value="Krishi Vigyan Kendra (KVK), Brahmavar">KVK Brahmavar</option>
                  <option value="University of Agricultural Sciences (UAS), GKVK Bangalore">UAS GKVK Bangalore</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Specialization Domain:</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Spore Trapping & Bioclimatic Spray Timing"
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/30 text-gray-400 hover:bg-gray-500/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Add to Rota
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
