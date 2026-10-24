// src/pages/Wallet.jsx - Farmer Research Bounty Desk & Digital Micro-Payout Wallet
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Wallet as WalletIcon, UploadCloud, CheckCircle2, 
  Sparkles, DollarSign, ArrowUpRight, Shield, Sun, Moon, 
  Clock, Award, AlertCircle, Info, ChevronRight, Camera
} from 'lucide-react';

const INITIAL_LEDGER = [
  { id: 'TXN-88219', date: 'Oct 23, 2026', crop: 'Arecanut', disease: 'Koleroga (Phytophthora)', qualityScore: '94%', bounty: 12.00, status: 'Credited' },
  { id: 'TXN-79401', date: 'Oct 18, 2026', crop: 'Paddy', disease: 'Leaf Blast (Magnaporthe)', qualityScore: '89%', bounty: 8.00, status: 'Credited' },
  { id: 'TXN-65120', date: 'Oct 10, 2026', crop: 'Arecanut', disease: 'Yellow Leaf Disease', qualityScore: '91%', bounty: 10.00, status: 'Credited' },
];

export default function Wallet() {
  const navigate = useNavigate();
  const { user, lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  // Wallet State
  const [balance, setBalance] = useState(12.00);
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Arecanut');
  const [selectedDisease, setSelectedDisease] = useState('Koleroga');
  const [selectedImage, setSelectedImage] = useState('/samples/sample_arecanut.jpg');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payoutThreshold = 50.00;
  const progressPct = Math.min(100, Math.round((balance / payoutThreshold) * 100));

  const handleSimulatePayout = () => {
    if (balance <= 0) return;
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setBalance(0.00);
    }, 3500);
  };

  const handleSubmitSpecimen = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const bountyEarned = 15.00;
      setBalance((prev) => prev + bountyEarned);

      const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        date: 'Today (Just now)',
        crop: selectedCrop,
        disease: selectedDisease,
        qualityScore: '96%',
        bounty: bountyEarned,
        status: 'Credited'
      };

      setLedger([newTxn, ...ledger]);
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 4500);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      {/* ── TOP NAVIGATION ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-16 flex items-center justify-between ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
                {t('wallet_title')}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#34D399]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                Live Simulated UPI
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('wallet_sub')}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Language & Theme */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className={`flex items-center p-1 rounded-xl border text-xs shadow-xs ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            {[
              { code: 'en', label: 'EN' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
              { code: 'hi', label: 'हिंदी' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === item.code
                    ? isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' 
                      : 'bg-[#275637] text-white shadow-xs'
                    : isDark 
                      ? 'text-[#8BA695] hover:text-white' 
                      : 'text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#FCD34D]' : 'bg-white border-[#91BA94] text-[#275637]'
            }`}
            title="Toggle Dark/Light"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Payout Success Toast Banner */}
        {payoutSuccess && (
          <div className="mb-6 p-4 rounded-[14px] bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-between gap-3 animate-card-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">Simulated UPI Transfer Successful!</h4>
                <p className="text-xs text-white/90">
                  ₹{balance.toFixed(2)} transferred to <strong>ramesh@oksbi</strong> via Simulated UPI Autopay.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-[#22C55E]/30 px-2.5 py-1 rounded-lg">
              TXN-SUCCESS-9921
            </span>
          </div>
        )}

        {/* Submission Success Toast Banner */}
        {submissionSuccess && (
          <div className="mb-6 p-4 rounded-[14px] bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-between gap-3 animate-card-in">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">+₹15.00 Micro-Bounty Credited!</h4>
                <p className="text-xs text-white/90">
                  Specimen passed sharpness (96%) & rarity checks. Your bounty balance updated.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#22C55E]/30 px-2.5 py-1 rounded-lg">
              AI Verified
            </span>
          </div>
        )}

        {/* ── WALLET BALANCE & PAYOUT HERO ── */}
        <div className={`p-6 sm:p-8 rounded-[18px] border mb-8 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#8BA695] flex items-center gap-2">
                <WalletIcon className="w-4 h-4 text-[#22C55E]" />
                <span>Simulated Research Bounty Balance</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                  ₹{balance.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-[#8BA695]">
                  (INR)
                </span>
              </div>

              <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                Linked UPI ID: <strong className="font-mono">ramesh@oksbi</strong> • Centroid privacy preserved
              </p>
            </div>

            {/* Threshold Progress Bar & Simulated Transfer Button */}
            <div className="w-full md:w-80 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#8BA695]">Milestone: ₹{payoutThreshold.toFixed(2)}</span>
                  <span className="font-mono">{progressPct}%</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-black/30 h-2.5 rounded-full overflow-hidden border border-[#91BA94]/30">
                  <div 
                    className="bg-[#22C55E] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulatePayout}
                className="w-full h-11 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-xs"
              >
                <ArrowUpRight className="w-4 h-4 text-[#22C55E]" />
                <span>Simulate Instant UPI Withdrawal</span>
              </button>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Specimen Submission Desk (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className={`p-5 sm:p-6 rounded-[18px] border shadow-xs ${
              isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#22C55E]" />
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Contribute Diseased Leaf Specimen
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-[#162F20] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}>
                  +₹5 to +₹25 Micro-Bounty
                </span>
              </div>

              <form onSubmit={handleSubmitSpecimen} className="space-y-4">
                
                {/* Crop & Disease Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                  <div>
                    <label className="block mb-1 text-[#8BA695]">Target Crop</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                        isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                      }`}
                    >
                      <option value="Arecanut">Arecanut (ಅಡಿಕೆ)</option>
                      <option value="Paddy">Paddy (ಭತ್ತ)</option>
                      <option value="Apple">Apple (ಸೇಬು)</option>
                      <option value="Tomato">Tomato (ಟೊಮೆಟೊ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-[#8BA695]">Suspected Disease</label>
                    <select
                      value={selectedDisease}
                      onChange={(e) => setSelectedDisease(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                        isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                      }`}
                    >
                      <option value="Koleroga">Koleroga (Fruit Rot)</option>
                      <option value="Leaf Blast">Paddy Leaf Blast</option>
                      <option value="Apple Scab">Apple Scab</option>
                      <option value="Early Blight">Tomato Early Blight</option>
                    </select>
                  </div>
                </div>

                {/* Photo Preview & Selection */}
                <div>
                  <label className="block mb-1 text-xs text-[#8BA695]">Leaf Specimen</label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedImage} 
                      alt="Sample preview" 
                      className="w-20 h-20 rounded-xl object-cover border border-[#91BA94]/40 shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex gap-2">
                        {['/samples/sample_arecanut.jpg', '/samples/sample_paddy.jpg', '/samples/sample_tomato.jpg'].map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedImage(p)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              selectedImage === p 
                                ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' 
                                : isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
                            }`}
                          >
                            Sample {i + 1}
                          </button>
                        ))}
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        High resolution, in-focus photos with visible lesion margins qualify for the 2.0x rarity multiplier.
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Quality & Rarity Evaluator Box */}
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/60'
                }`}>
                  <div className="font-extrabold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                      Real-Time AI Quality Scoring
                    </span>
                    <span className="text-[#22C55E]">96% Match (Grade A)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/40'}`}>
                      <div className="text-[9px] text-[#8BA695]">Laplacian Blur</div>
                      <div className="font-bold text-[#22C55E]">Sharp (412)</div>
                    </div>
                    <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/40'}`}>
                      <div className="text-[9px] text-[#8BA695]">Lesion Contrast</div>
                      <div className="font-bold text-[#22C55E]">High (0.84)</div>
                    </div>
                    <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/40'}`}>
                      <div className="text-[9px] text-[#8BA695]">Rarity Bonus</div>
                      <div className="font-bold text-[#F6D05F] dark:text-[#FCD34D]">2.0x Active</div>
                    </div>
                  </div>
                </div>

                {/* Spatial Privacy Centroid Snap Pill */}
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  isDark ? 'bg-[#142C1E] border-[#22C55E]/30 text-[#8BA695]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}>
                  <Shield className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>
                    <strong>Spatial Privacy Guarantee:</strong> Geotag is truncated to Venur village centroid. Zero cadastral land bounds or survey numbers collected.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <span>Validating Specimen with ResNet-18...</span>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-[#22C55E]" />
                      <span>Submit Specimen & Claim +₹15.00 Micro-Bounty</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Right: Submission Ledger / History (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#22C55E]" />
                <span>Verified Contribution Ledger</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-[#162F20] text-[#8BA695]' : 'bg-[#E8F2EA] text-[#275637]'
              }`}>
                {ledger.length} Submissions
              </span>
            </div>

            <div className="space-y-3">
              {ledger.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#8BA695]">{item.id}</span>
                    <span className="text-[10px] text-[#8BA695]">{item.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">{item.disease}</div>
                      <div className={`text-[10px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        {item.crop} • Quality: {item.qualityScore}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-[#22C55E]">
                        +₹{item.bounty.toFixed(2)}
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E]">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Why Bounties Matter Callout */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#F9F9F6] border-[#91BA94] text-[#556B5C]'
            }`}>
              <h4 className="font-bold flex items-center gap-1.5 mb-1 text-[#275637] dark:text-[#34D399]">
                <Info className="w-4 h-4 shrink-0" />
                Why does Sasya pay micro-bounties?
              </h4>
              <p className="opacity-90">
                Most agricultural AI is trained on Western or Chinese crops. By rewarding Indian growers with micro-bounties for authentic local diseased leaves, Karnataka builds sovereign AI models for regional varieties (Arecanut, Mangala, Ragi, Local Paddy).
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}