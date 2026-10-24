// src/pages/Community.jsx - Young Farmer Crop Sub-Communities (r/arecanut, r/paddy, etc.)
import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Share2, 
  Send, Sparkles, Filter, AlertTriangle, ShieldCheck, 
  Sun, Moon, MapPin, Tag, Plus, CheckCircle2, ChevronDown,
  ChevronUp, Wrench, Clock, Users, Camera
} from 'lucide-react';

const CROPS = [
  { id: 'arecanut', name: 'Arecanut (ಅಡಿಕೆ)', members: '1,420 growers', activeBadge: 'High Koleroga Season' },
  { id: 'paddy', name: 'Paddy (ಭತ್ತ)', members: '2,890 growers', activeBadge: 'Blast Warning' },
  { id: 'apple', name: 'Apple (ಸೇಬು)', members: '870 growers', activeBadge: 'Post-Harvest' },
  { id: 'tomato', name: 'Tomato (ಟೊಮೆಟೊ)', members: '1,120 growers', activeBadge: 'Blight Watch' },
];

const INITIAL_POSTS = [
  {
    id: 1,
    crop: 'arecanut',
    author: 'Ramesh Gowda',
    authorId: 'farmer_KA_101',
    village: 'Venur, Dakshina Kannada',
    badge: 'Grower (4 acres)',
    timeAgo: '2 hours ago',
    category: 'Disease Query',
    title: 'Koleroga spotted after continuous mist. Is 1% Bordeaux mixture enough or should I add sticker?',
    content: 'Noticed dark water-soaked rot starting on 3-month-old nut calyxes on the north slope. Sasya scan gave 96.4% confidence Koleroga. Since rain is predicted in 22 hours, is normal Bordeaux spray adequate or must I mix rosin sticker adjuvant?',
    image: '/samples/sample_arecanut.jpg',
    aiVerified: 'Sasya AI Verified: Grade 2 Koleroga (Phytophthora meadii)',
    upvotes: 32,
    userVoted: 1,
    comments: [
      {
        id: 101,
        author: 'Dr. Hegde (Pathologist, CPCRI Vittal)',
        badge: 'Verified Scientist',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        content: 'Ramesh, definitely add 100g Rosin sticker per 100L of 1% Bordeaux. With Open-Meteo predicting 14mm rain tomorrow afternoon, unbonded copper will wash off in 40 minutes, wasting ₹8,000+ per acre. Spray immediately before 3 PM today.',
        timeAgo: '1 hour ago'
      },
      {
        id: 102,
        author: 'Ganesh Bhat',
        village: 'Tirthahalli',
        badge: 'Experienced Grower',
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        content: 'Also make sure to tie polyethene hoods (kotte) over the crown bunches if rain becomes continuous next week. I lost ₹4L two years ago by delaying just 36 hours.',
        timeAgo: '45 mins ago'
      }
    ]
  },
  {
    id: 2,
    crop: 'arecanut',
    author: 'Prashanth Hegde',
    authorId: 'prashanth_thalli',
    village: 'Mandagadde, Tirthahalli',
    badge: 'Young Farmer Club',
    timeAgo: '4 hours ago',
    category: 'Equipment Rental',
    title: 'High-pressure 50ft power sprayer available for rent today & tomorrow',
    content: 'Reaches the highest palm tops without tree climbing. Includes 100m high-pressure hose and brass atomizing nozzle. Rent is ₹350/day. Cleaned and ready for Bordeaux application before the weekend monsoon front.',
    image: null,
    aiVerified: null,
    upvotes: 19,
    userVoted: 0,
    comments: [
      {
        id: 201,
        author: 'Suresh Rai',
        village: 'Koppa',
        badge: 'Grower',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        content: 'Prashanth, I need it tomorrow morning from 7 AM to 12 PM for 2 acres. Sent you a DM on your profile!',
        timeAgo: '3 hours ago'
      }
    ]
  },
  {
    id: 3,
    crop: 'arecanut',
    author: 'Dr. S. K. Nayak (KVK Brahmavar)',
    authorId: 'kvk_expert_nayak',
    village: 'Brahmavar, Udupi',
    badge: 'Agronomy Specialist',
    timeAgo: '7 hours ago',
    category: 'Weather Alert',
    title: 'Bioclimatic Alert: Relative Humidity > 92% sustained across Coastal Ghats',
    content: 'Our environmental sensor telemetry indicates 14 continuous hours above 90% RH with temperatures between 21°C - 24°C. This is the exact epidemiological trigger for Phytophthora zoospore release. Complete all prophylactic spraying during current morning dry spell.',
    image: null,
    aiVerified: 'Open-Meteo High Bioclimatic Risk Verified',
    upvotes: 68,
    userVoted: 0,
    comments: []
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { crop: cropParam } = useParams();
  const { user, lang, setLang, theme, toggleTheme, isDark, t } = useAuth();

  // Active Crop selection
  const [activeCrop, setActiveCrop] = useState(cropParam || 'arecanut');
  const [activeFilter, setActiveFilter] = useState('All');

  // Posts State
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Disease Query');
  const [expandedComments, setExpandedComments] = useState({ 1: true });
  const [newCommentText, setNewCommentText] = useState({});

  const handleVote = (postId, delta) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const nextVote = p.userVoted === delta ? 0 : delta;
        const diff = nextVote - p.userVoted;
        return { ...p, upvotes: p.upvotes + diff, userVoted: nextVote };
      }
      return p;
    }));
  };

  const handleAddComment = (postId) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        const newC = {
          id: Date.now(),
          author: user?.name || 'Ramesh Gowda',
          village: user?.village || 'Venur',
          badge: 'Grower (Local)',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          content: text,
          timeAgo: 'Just now'
        };
        return { ...p, comments: [...p.comments, newC] };
      }
      return p;
    }));

    setNewCommentText({ ...newCommentText, [postId]: '' });
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const newPost = {
      id: Date.now(),
      crop: activeCrop,
      author: user?.name || 'Ramesh Gowda',
      authorId: user?.username || 'farmer_KA_101',
      village: `${user?.village || 'Venur'}, ${user?.district || 'Dakshina Kannada'}`,
      badge: 'Grower (4 acres)',
      timeAgo: 'Just now',
      category: newPostCategory,
      title: newPostTitle,
      content: newPostContent,
      image: null,
      aiVerified: null,
      upvotes: 1,
      userVoted: 1,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
  };

  const currentCropObj = CROPS.find(c => c.id === activeCrop) || CROPS[0];

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
                {t('comm_title')}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#34D399]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}>
                Live Feed
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {t('comm_sub')}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Language & Actions */}
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
            onClick={() => setShowNewPostModal(true)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${
              isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{t('comm_ask_growers')}</span>
          </button>

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

      {/* ── CROP TABS SELECTOR ── */}
      <div className={`border-b overflow-x-auto ${isDark ? 'border-[#162C20] bg-[#0E1E16]' : 'border-[#91BA94]/60 bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 py-2.5">
          {CROPS.map((c) => {
            const isSelected = activeCrop === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCrop(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' 
                      : 'bg-[#275637] text-white border-[#275637]'
                    : isDark
                      ? 'bg-[#12241A] border-[#1E3A2B] text-[#8BA695] hover:text-white'
                      : 'bg-[#F9F9F6] border-[#91BA94]/70 text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                <span>r/{c.id}</span>
                <span className="text-[10px] opacity-75">({c.members})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* Sub Header Banner */}
        <div className={`p-4 sm:p-5 rounded-[16px] border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">
                r/{currentCropObj.id} • {currentCropObj.name}
              </h2>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-[#FFF9E6] text-[#275637] border-[#F6D05F]'
              }`}>
                {currentCropObj.activeBadge}
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Dedicated pathology discussion, chemical recipes, spray alerts, and local power sprayers for {currentCropObj.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/detect"
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
                isDark ? 'bg-[#142C1E] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Diagnose Leaf First</span>
            </Link>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {['All', 'Disease Queries', 'Weather Alerts', 'Equipment Rental'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                activeFilter === f
                  ? isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
                  : isDark ? 'bg-[#102217] border-[#1E3A2B] text-[#8BA695]' : 'bg-white border-[#91BA94]/70 text-[#275637]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Feed Posts */}
        <div className="space-y-5">
          {posts.map((post) => {
            const isCommentsOpen = !!expandedComments[post.id];
            return (
              <div 
                key={post.id}
                className={`rounded-[16px] border shadow-xs overflow-hidden transition-all duration-200 hover:border-[#22C55E]/50 ${
                  isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
                }`}
              >
                {/* Post Top Meta */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs">
                        {post.author}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                        isDark ? 'bg-[#162F20] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                      }`}>
                        {post.badge}
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        <MapPin className="w-3 h-3 text-[#22C55E]" />
                        {post.village}
                      </span>
                    </div>

                    <span className={`text-[11px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                      {post.timeAgo}
                    </span>
                  </div>

                  {/* Post Title & Category */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        post.category === 'Disease Query'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : post.category === 'Equipment Rental'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg leading-snug">
                      {post.title}
                    </h3>
                  </div>

                  {/* Post Content Body */}
                  <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-[#556B5C]'}`}>
                    {post.content}
                  </p>

                  {/* Optional Leaf Specimen Image */}
                  {post.image && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-[#91BA94]/40 max-w-sm">
                      <img src={post.image} alt="Specimen" className="w-full h-48 object-cover" />
                      {post.aiVerified && (
                        <div className={`p-2 text-[11px] font-bold flex items-center gap-1.5 ${
                          isDark ? 'bg-[#142C1E] text-[#34D399]' : 'bg-[#E8F2EA] text-[#275637]'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>{post.aiVerified}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#91BA94]/20 text-xs font-bold">
                    
                    {/* Voting Controls */}
                    <div className={`flex items-center rounded-xl border p-1 ${
                      isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]/50'
                    }`}>
                      <button
                        onClick={() => handleVote(post.id, 1)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          post.userVoted === 1
                            ? 'bg-[#22C55E] text-[#0B1712]'
                            : isDark ? 'hover:bg-[#162F20] text-[#8BA695]' : 'hover:bg-[#E8F2EA] text-[#275637]'
                        }`}
                        title="Upvote"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      
                      <span className="px-2 font-mono text-xs">
                        {post.upvotes}
                      </span>

                      <button
                        onClick={() => handleVote(post.id, -1)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          post.userVoted === -1
                            ? 'bg-rose-500 text-white'
                            : isDark ? 'hover:bg-[#162F20] text-[#8BA695]' : 'hover:bg-[#E8F2EA] text-[#275637]'
                        }`}
                        title="Downvote"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comments Toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedComments({
                          ...expandedComments,
                          [post.id]: !isCommentsOpen
                        })}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDark 
                            ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' 
                            : 'bg-white border-[#91BA94]/60 text-[#275637] hover:bg-[#E8F2EA]'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>{post.comments.length} Comments</span>
                        {isCommentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* WhatsApp Share Button */}
                      <button
                        onClick={() => {
                          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`🌾 Sasya Farmer Hub Alert: ${post.title} - Read more on Sasya!`)}`;
                          window.open(url, '_blank');
                        }}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDark 
                            ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' 
                            : 'bg-white border-[#91BA94]/60 text-[#275637] hover:bg-[#E8F2EA]'
                        }`}
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Comments Accordion Tray */}
                {isCommentsOpen && (
                  <div className={`p-4 sm:p-5 border-t space-y-3.5 ${
                    isDark ? 'bg-[#0E1E16] border-[#162C20]' : 'bg-[#F9F9F6] border-[#91BA94]/30'
                  }`}>
                    {post.comments.map((comment) => (
                      <div 
                        key={comment.id}
                        className={`p-3 rounded-xl border text-xs ${
                          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{comment.author}</span>
                            {comment.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${comment.badgeColor || 'bg-gray-500/20 text-gray-400'}`}>
                                {comment.badge}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                            {comment.timeAgo}
                          </span>
                        </div>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#556B5C]'}`}>
                          {comment.content}
                        </p>
                      </div>
                    ))}

                    {/* New Comment Input Box */}
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Reply to this farmer with local advice..."
                        value={newCommentText[post.id] || ''}
                        onChange={(e) => setNewCommentText({
                          ...newCommentText,
                          [post.id]: e.target.value
                        })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className={`flex-1 h-10 px-3.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                          isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
                        }`}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="h-10 px-4 rounded-xl bg-[#275637] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#1E462B] transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>

      {/* ── CREATE NEW POST MODAL ── */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-[18px] border p-6 shadow-2xl animate-card-in ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base">
                Ask Growers in r/{activeCrop}
              </h3>
              <button 
                onClick={() => setShowNewPostModal(false)}
                className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1">Category</label>
                <select 
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                >
                  <option value="Disease Query">Disease Query & Diagnosis</option>
                  <option value="Weather Alert">Spray Window & Weather Alert</option>
                  <option value="Equipment Rental">Power Equipment Rental / Service</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Koleroga spotted on south slope palms after rain"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1">Description / Observation</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Describe your symptoms, weather conditions, or equipment details..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-sm transition-all cursor-pointer shadow-md"
              >
                Publish to r/{activeCrop} Community
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}