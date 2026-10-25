// src/pages/Profile.jsx - Clean Farmer Portal (Profile, Network, Scans, Listings, Settings)
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Camera, FileText, Settings, ArrowLeft, 
  MapPin, Shield, CheckCircle2, AlertTriangle, ChevronRight,
  Plus, RotateCcw, Volume2, Sun, Moon, ArrowRight,
  Clock, Sparkles, MessageSquare, Lock, Unlock, Globe,
  UserCheck, UserPlus, Users, Check, X, Bell, ExternalLink, Trash2
} from 'lucide-react';
import { createCommunityPost } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    user, lang, setLang, theme, setTheme, isDark, toggleTheme, 
    textSize, setTextSize, t, logout 
  } = useAuth();
  
  // Active Tab from query param (defaults to 'profile', clean fallback for old links)
  const rawTab = searchParams.get('tab') || 'profile';
  const activeTab = rawTab === 'wallet' ? 'profile' : (rawTab === 'requests' ? 'network' : rawTab);
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Followers State
  const [followers, setFollowers] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_followers_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { username: 'Dr_Agronomist', name: 'Dr. Agronomist', badge: 'Agronomy Specialist', location: 'Bantwal Centroid', avatar: 'DA', crop: 'Arecanut' },
      { username: 'Ganesh_T', name: 'Ganesh', badge: 'Experienced Grower', location: 'Sullia Centroid', avatar: 'GT', crop: 'Arecanut' }
    ];
  });

  // Following State (Synced with Community feed priority)
  const [following, setFollowing] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_following_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { username: 'Dr_Agronomist', name: 'Dr. Agronomist', badge: 'Agronomy Specialist', location: 'Bantwal Centroid', avatar: 'DA', crop: 'Arecanut' },
      { username: 'Suresh_K', name: 'Suresh', badge: 'Arecanut Cultivator', location: 'Belthangady Centroid', avatar: 'SK', crop: 'Arecanut' }
    ];
  });

  // Suggested Growers in Network
  const SUGGESTED_GROWERS = [
    { username: 'Prashanth_P', name: 'Prashanth', badge: 'Young Farmer Club', location: 'Tirthahalli Centroid', avatar: 'PP', crop: 'Arecanut' },
    { username: 'Dr_S_Kumar', name: 'Dr. S. Kumar', badge: 'KVK Agronomist', location: 'Brahmavar Centroid', avatar: 'SK', crop: 'Paddy' },
    { username: 'Anand_Kolar', name: 'Anand', badge: 'Tomato Farmer', location: 'Bangarapet Centroid', avatar: 'AK', crop: 'Tomato' }
  ];

  // Persist followers
  useEffect(() => {
    try {
      localStorage.setItem('sasya_followers_list', JSON.stringify(followers));
    } catch {}
  }, [followers]);

  // Persist following
  useEffect(() => {
    try {
      localStorage.setItem('sasya_following_list', JSON.stringify(following));
    } catch {}
  }, [following]);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFollowProfile = (farmer) => {
    const isFollowing = following.some(f => f.username === farmer.username);
    let next;
    if (isFollowing) {
      next = following.filter(f => f.username !== farmer.username);
      showToast(`Unfollowed u/${farmer.username}`);
    } else {
      next = [...following, farmer];
      showToast(`✓ You are now following u/${farmer.username}! Their posts will appear at the top of your feed.`);
    }
    setFollowing(next);
    try {
      localStorage.setItem('sasya_following_list', JSON.stringify(next));
      const raw = localStorage.getItem('sasya_following_state');
      const map = raw ? JSON.parse(raw) : {};
      if (isFollowing) {
        delete map[farmer.username];
      } else {
        map[farmer.username] = 'following';
      }
      localStorage.setItem('sasya_following_state', JSON.stringify(map));
    } catch {}
  };

  // Listings State (Persisted across refreshes and synced with Community Feed)
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_farmer_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { 
        id: 1,
        postId: 2,
        title: '500L High-Pressure Power Sprayer for Rent', 
        category: 'Equipment Rental',
        rate: '₹800 / day', 
        crop: 'arecanut',
        status: 'Available Now',
        contact: 'Contact (Self)'
      },
      { 
        id: 2,
        postId: 7,
        title: 'URGENT: 2 Palm Climbers Needed for Koleroga Spraying', 
        category: 'Labour Request',
        rate: '₹700 / day', 
        crop: 'arecanut',
        status: 'Active Request (Rain in 28h)',
        contact: '2 young farmers responded'
      }
    ];
  });

  const [showListingModal, setShowListingModal] = useState(false);
  const [managingListing, setManagingListing] = useState(null);
  const [listingTitle, setListingTitle] = useState('');
  const [listingCategory, setListingCategory] = useState('Equipment Rental');
  const [listingCrop, setListingCrop] = useState(() => (user?.crops?.[0] || 'Arecanut').toLowerCase());
  const [listingRate, setListingRate] = useState('₹800 / day');

  // Handle direct navigation to exact community post with auto-scroll
  const handleViewInFeed = (listing) => {
    const targetCrop = listing.crop || 'arecanut';
    const targetPostId = listing.postId || listing.id;
    navigate(`/c/${targetCrop}?post=${targetPostId}#post-${targetPostId}`);
  };

  // Persist listings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sasya_farmer_listings', JSON.stringify(listings));
    } catch (e) {
      console.warn("Could not save listings:", e);
    }
  }, [listings]);

  // Create Listing & Automatically Post to Community Feed
  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!listingTitle.trim()) return;

    const listingId = Date.now();
    const targetCrop = (listingCrop || user?.crops?.[0] || 'arecanut').toLowerCase();
    const authorUsername = user?.username || user?.name?.replace(/\s+/g, '_') || 'Farmer';
    const authorDisplay = user?.name || user?.username || 'Farmer';
    const villageText = `${user?.village || 'Venur'}, ${user?.district || 'Dakshina Kannada'}`;

    const newListing = {
      id: listingId,
      postId: listingId,
      title: listingTitle.trim(),
      category: listingCategory,
      rate: listingRate.trim(),
      crop: targetCrop,
      status: 'Available Now (Active in Community)',
      contact: `Contact ${authorDisplay} (Self)`
    };

    const nextListings = [newListing, ...listings];
    setListings(nextListings);
    try {
      localStorage.setItem('sasya_farmer_listings', JSON.stringify(nextListings));
    } catch {}

    // AUTOMATICALLY PUBLISH TO COMMUNITY FEED (r/{crop})
    const flairColor = listingCategory === 'Labour Request'
      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
      : 'bg-blue-500/15 text-blue-500 border-blue-500/30';

    const newCommunityPost = {
      id: listingId,
      crop: targetCrop,
      author: authorUsername,
      village: villageText,
      badge: listingCategory === 'Labour Request' ? 'Labour Request' : 'Equipment Rental',
      timeAgo: 'Just now',
      flair: listingCategory,
      flairColor: flairColor,
      title: listingCategory === 'Labour Request' 
        ? `👥 ${listingTitle.trim()}` 
        : `🚜 ${listingTitle.trim()}`,
      content: `${listingTitle.trim()}\n\n• Rate / Daily Wage: ${listingRate.trim()}\n• Location: ${villageText}\n• Status: Available Now\n\nDirectly published from Rural Equipment & Labour Exchange. Click Chat below to coordinate pickup and work details!`,
      image: null,
      aiBadge: null,
      upvotes: 1,
      userVote: 1,
      saved: false,
      comments: []
    };

    try {
      const savedPosts = localStorage.getItem('sasya_community_posts');
      let currentPosts = [];
      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts);
          if (Array.isArray(parsed)) currentPosts = parsed;
        } catch {}
      }
      const updatedPosts = [newCommunityPost, ...currentPosts];
      localStorage.setItem('sasya_community_posts', JSON.stringify(updatedPosts));
    } catch (err) {
      console.warn("Could not save to local community posts", err);
    }

    // Sync to Render cloud backend
    try {
      await createCommunityPost({
        crop: targetCrop,
        author_id: user?.id || authorUsername,
        author_name: authorUsername,
        title: listingTitle.trim(),
        content: `${listingTitle.trim()} | Rate: ${listingRate.trim()} | Location: ${villageText}`,
        audio_url: null
      });
    } catch (err) {
      console.info("Listing post backed up locally");
    }

    setListingTitle('');
    setShowListingModal(false);
    showToast(`✓ Listing added & automatically posted in r/${targetCrop} community!`);
  };

  // Toggle listing status in Manage modal
  const handleToggleListingStatus = (id) => {
    const next = listings.map(l => {
      if (l.id === id) {
        const nextStatus = l.status.includes('Completed') ? 'Available Now' : 'Completed / Fulfilled';
        return { ...l, status: nextStatus };
      }
      return l;
    });
    setListings(next);
    if (managingListing?.id === id) {
      setManagingListing({ 
        ...managingListing, 
        status: managingListing.status.includes('Completed') ? 'Available Now' : 'Completed / Fulfilled' 
      });
    }
    showToast('Listing status updated');
  };

  // Delete listing from Profile & Community
  const handleDeleteListing = (id) => {
    const next = listings.filter(l => l.id !== id);
    setListings(next);
    setManagingListing(null);

    // Also remove from community posts
    try {
      const saved = localStorage.getItem('sasya_community_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(p => p.id !== id);
        localStorage.setItem('sasya_community_posts', JSON.stringify(filtered));
      }
    } catch {}

    showToast('Listing and community post removed');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      
      {/* ── TOP HEADER ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-16 flex items-center justify-between ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight">
              {t('farmer_portal_title')}
            </h1>
            <p className={`text-[10px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              {user?.name || 'Farmer'} • {user?.username || 'Grower'}
            </p>
          </div>
        </div>

        {/* Right Controls: Language & Theme */}
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

      {/* ── TABS BAR (Profile, Growers Network, Scans, Listings, Settings) ── */}
      <div className={`border-b overflow-x-auto ${isDark ? 'border-[#162C20] bg-[#0E1E16]' : 'border-[#91BA94]/60 bg-white'}`}>
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 sm:gap-2 py-2">
          {[
            { id: 'profile', label: t('menu_profile'), icon: User },
            { id: 'network', label: 'Growers Network', icon: Users },
            { id: 'scans', label: t('menu_scans'), icon: Camera },
            { id: 'listings', label: t('menu_listings'), icon: FileText },
            { id: 'settings', label: t('menu_settings'), icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                activeTab === tab.id
                  ? isDark 
                    ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' 
                    : 'bg-[#275637] text-white shadow-xs'
                  : isDark 
                    ? 'text-[#8BA695] hover:text-white hover:bg-[#12241A]' 
                    : 'text-[#556B5C] hover:text-[#275637] hover:bg-[#E8F2EA]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#275637] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-[#91BA94]">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TAB CONTENT BODY ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* TAB 1: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-card-in">
            {/* Farmer Pass Card */}
            <div className={`border rounded-[14px] p-6 shadow-xs ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-[#91BA94]/30">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                    isDark ? 'bg-[#162C20] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
                  }`}>
                    🌾
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black">
                        {user?.name || 'Farmer'}
                      </h2>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        isDark ? 'bg-[#0D4A3E] text-[#34D399]' : 'bg-[#B1D27D] text-[#275637]'
                      }`}>
                        {t('active_farmer_badge')}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                      Farmer ID: <strong>{user?.username || 'farmer_KA_101'}</strong> • Season 2026
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/profile/edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isDark ? 'bg-[#162C20] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                  }`}
                >
                  {t('btn_edit_profile')}
                </button>
              </div>

              {/* Farm Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'}`}>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>{t('profile_location')}</div>
                  <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#22C55E]" />
                    <span>{user?.village || 'Venur'}, {user?.district || 'Dakshina Kannada'}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'}`}>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>{t('profile_crops')}</div>
                  <div className="text-sm font-bold mt-1">
                    {user?.crops?.join(', ') || 'Arecanut (4 ac), Paddy (2 ac)'}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'}`}>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>Spatial Privacy</div>
                  <div className="text-sm font-bold mt-1 flex items-center gap-1.5 text-emerald-500">
                    <Shield className="w-4 h-4" />
                    <span>Centroid Shield (k ≥ 5)</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'}`}>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>Growers Network</div>
                  <div className="text-sm font-bold mt-1 flex items-center justify-between">
                    <span>{following.length} Following</span>
                    <button 
                      onClick={() => setActiveTab('network')}
                      className="text-xs text-emerald-500 hover:underline font-bold cursor-pointer"
                    >
                      View Network
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Growers Network Overview Card (Open Cooperative) */}
            <div className={`p-5 rounded-[14px] border shadow-xs space-y-3 ${
              isDark ? 'bg-[#162C20]/80 border-emerald-500/40 text-white' : 'bg-[#EBF3ED] border-[#91BA94] text-[#275637]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Growers Network • Open Cooperative</span>
                </div>
                <button 
                  onClick={() => setActiveTab('network')}
                  className="text-xs font-bold hover:underline cursor-pointer text-emerald-600 dark:text-emerald-400"
                >
                  Manage Following ({following.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className={`p-3 rounded-xl border text-center ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-white border-[#D8E5DA]'
                }`}>
                  <div className="text-base font-black text-emerald-500">{following.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Following</div>
                </div>
                <div className={`p-3 rounded-xl border text-center ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-white border-[#D8E5DA]'
                }`}>
                  <div className="text-base font-black">{followers.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Followers</div>
                </div>
                <div className={`col-span-2 sm:col-span-1 p-3 rounded-xl border text-center flex flex-col justify-center ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-white border-[#D8E5DA]'
                }`}>
                  <div className="text-xs font-black text-emerald-500">⭐ Priority Feed</div>
                  <div className="text-[10px] text-gray-400">Followed Farmers on Top</div>
                </div>
              </div>
            </div>

            {/* Reddit-Style 1-on-1 Farmer Chat & Communities Card */}
            <div className={`border rounded-[14px] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <span>1-on-1 Reddit Chat & Crop Discussions</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      Anonymous
                    </span>
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    Chat privately with fellow growers using Reddit-grade privacy (u/{user?.username || 'Farmer'}). Zero phone numbers or land records exposed.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/c/arecanut?chat=open')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Farmer Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GROWERS NETWORK (OPEN COOPERATIVE) */}
        {activeTab === 'network' && (
          <div className="space-y-6 animate-card-in">
            {/* Open Cooperative Banner */}
            <div className={`p-6 rounded-[14px] border shadow-xs space-y-3 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-[#91BA94]/30">
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <span>Open Growers Network</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500">
                      Open Cooperative
                    </span>
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    Connect directly with fellow cultivators, agronomists, and labour teams across Karnataka. Posts and labour requests from farmers you follow are automatically prioritized at the top of your community feed.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/c/arecanut')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#275637] hover:bg-[#1E462B] text-white flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
                >
                  <span>Explore Community</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Priority Status Highlight */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-emerald-400' : 'bg-[#EBF3ED] border-[#91BA94]/60 text-[#275637]'
              }`}>
                <span className="text-lg">⭐</span>
                <div>
                  <strong>Feed Priority Active:</strong> Whenever you follow a farmer, their pathology alerts and labour requests are pinned to the top of your feed with a <strong>⭐ Following</strong> tag.
                </div>
              </div>
            </div>

            {/* Suggested Growers to Connect With */}
            <div className={`p-6 rounded-[14px] border shadow-xs space-y-4 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <h3 className="font-extrabold text-sm flex items-center justify-between border-b pb-3 border-[#91BA94]/20">
                <span>Recommended Growers & Agronomists</span>
                <span className="text-xs text-gray-400 font-normal">Connect to personalize feed</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SUGGESTED_GROWERS.map((sug) => {
                  const isFollowed = following.some(f => f.username === sug.username);
                  return (
                    <div 
                      key={sug.username}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                        isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#275637] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {sug.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">u/{sug.username}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {sug.crop} • {sug.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleToggleFollowProfile(sug)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer text-center ${
                            isFollowed
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                              : 'bg-[#275637] hover:bg-[#1E462B] text-white border-transparent'
                          }`}
                        >
                          {isFollowed ? 'Following ✓' : '+ Follow'}
                        </button>
                        <button
                          onClick={() => navigate(`/c/${sug.crop.toLowerCase()}?chat=open`)}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                            isDark ? 'border-[#1E3A2B] text-gray-300 hover:text-white' : 'border-[#91BA94] text-gray-600 hover:bg-[#E8F2EA]'
                          }`}
                          title="Chat"
                        >
                          💬
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Followers & Following Directory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Following Box (Prioritized Farmers) */}
              <div className={`p-5 rounded-[14px] border shadow-xs space-y-3 ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
              }`}>
                <h3 className="font-extrabold text-sm flex items-center justify-between border-b pb-3 border-[#91BA94]/20">
                  <div className="flex items-center gap-2">
                    <span>Following</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-500">
                      {following.length} Farmers
                    </span>
                  </div>
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                </h3>

                <div className="space-y-2">
                  {following.map((f, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#275637] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {f.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs truncate block">u/{f.username}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{f.crop || 'Crop'} • {f.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => navigate('/c/arecanut?chat=open')}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={() => handleToggleFollowProfile(f)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Unfollow"
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Followers Box */}
              <div className={`p-5 rounded-[14px] border shadow-xs space-y-3 ${
                isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
              }`}>
                <h3 className="font-extrabold text-sm flex items-center justify-between border-b pb-3 border-[#91BA94]/20">
                  <div className="flex items-center gap-2">
                    <span>Followers</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-500">
                      {followers.length} Growers
                    </span>
                  </div>
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                </h3>

                <div className="space-y-2">
                  {followers.map((f, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E5DA]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#275637] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {f.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs truncate block">u/{f.username}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{f.location}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/c/arecanut?chat=open')}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                      >
                        💬 Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: MY SCANS */}
        {activeTab === 'scans' && (
          <div className="space-y-6 animate-card-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t('scan_diary_title')}</h2>
                <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                  Historical ResNet-18 diagnostic observations with Grad-CAM heatmaps
                </p>
              </div>
              <button 
                onClick={() => navigate('/detect')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                  isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{t('btn_new_scan')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  crop: 'Arecanut', 
                  disease: 'Koleroga (Fruit Rot)', 
                  confidence: '96.4%', 
                  severity: 'Stage 2 (Moderate)', 
                  date: 'Today, 10:14 AM',
                  img: '/samples/sample_arecanut.jpg',
                  status: 'Sprayed in Safe Window'
                },
                { 
                  crop: 'Paddy', 
                  disease: 'Blast Lesion', 
                  confidence: '91.2%', 
                  severity: 'Stage 1 (Mild)', 
                  date: 'Yesterday, 4:20 PM',
                  img: '/samples/sample_paddy.jpg',
                  status: 'Monitored'
                },
                { 
                  crop: 'Tomato', 
                  disease: 'Late Blight', 
                  confidence: '88.5%', 
                  severity: 'Stage 3 (Severe)', 
                  date: 'Oct 21, 2026',
                  img: '/samples/sample_tomato.jpg',
                  status: 'Resolved'
                }
              ].map((scan, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate('/detect/result', {
                    state: {
                      image: scan.img,
                      crop: scan.crop,
                      sampleId: scan.crop.toLowerCase(),
                      isOod: false
                    }
                  })}
                  className={`border rounded-[14px] p-5 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] hover:border-[#22C55E]' : 'bg-white border-[#91BA94] hover:border-[#275637]'
                  }`}
                >
                  <div className="flex gap-3.5">
                    <img 
                      src={scan.img} 
                      alt={scan.disease} 
                      className="w-18 h-18 rounded-xl object-cover border border-[#91BA94]/40"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#22C55E]">{scan.crop}</span>
                        <span className="text-[10px] font-mono font-bold text-gray-400">{scan.confidence}</span>
                      </div>
                      <h4 className="font-extrabold text-sm mt-0.5">{scan.disease}</h4>
                      <p className={`text-[11px] mt-1 ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                        {scan.severity} • {scan.date}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                    isDark ? 'border-[#1A3324]' : 'border-[#E8F0E9]'
                  }`}>
                    <span className="text-[#22C55E]">{scan.status}</span>
                    <span className="flex items-center gap-1 text-xs">
                      <span>View Grad-CAM</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MY LISTINGS (EQUIPMENT & LABOUR) */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-card-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t('rural_exchange_title') || 'Rural Equipment & Labour Exchange'}</h2>
                <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                  {t('rural_exchange_sub') || 'Share high-pressure power sprayers or request urgent tree climbers before rains'}
                </p>
              </div>
              <button 
                onClick={() => setShowListingModal(true)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  isDark ? 'bg-[#22C55E] text-[#0B1712]' : 'bg-[#275637] text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{t('create_listing_btn') || 'Create Listing'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {listings.map((listing, idx) => (
                <div 
                  key={idx}
                  className={`border rounded-[14px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#22C55E]">
                      {listing.category}
                    </span>
                    <h4 className="font-extrabold text-base mt-1">{listing.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                      <span className="font-mono text-emerald-500 font-bold">{listing.rate}</span>
                      <span>•</span>
                      <span className={listing.status.includes('URGENT') ? 'text-amber-500' : 'text-emerald-500'}>
                        {listing.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewInFeed(listing)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-emerald-400 hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#FAFCFA]'
                      }`}
                      title="View this post in the community feed"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t('view_in_feed') || 'View in Feed'}</span>
                    </button>
                    <button 
                      onClick={() => setManagingListing(listing)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        isDark ? 'bg-[#162C20] border-[#22C55E]/40 text-white hover:border-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637] hover:bg-[#D8E4DA]'
                      }`}
                    >
                      {t('manage_listing') || 'Manage'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS & ACCESSIBILITY */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-card-in">
            <div className={`border rounded-[14px] p-6 shadow-xs space-y-6 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <h2 className="text-xl font-bold">{t('settings_title')}</h2>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t('settings_lang')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'kn', label: 'ಕನ್ನಡ' },
                    { code: 'hi', label: 'हिंदी' }
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                        lang === l.code
                          ? isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
                          : isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#FAFCFA] border-[#D8E5DA] text-[#275637]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t('settings_theme')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
                      !isDark ? 'bg-[#275637] text-white border-[#275637]' : 'bg-[#0E1E16] border-[#1E3A2B] text-[#8BA695]'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>{t('settings_light')}</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#FAFCFA] border-[#D8E5DA] text-[#275637]'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{t('settings_dark')}</span>
                  </button>
                </div>
              </div>

              {/* Text Size (for sunlight legibility) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  {t('settings_text_size')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: t('settings_size_normal') },
                    { id: 'large', label: t('settings_size_large') },
                    { id: 'xlarge', label: t('settings_size_xlarge') }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setTextSize(s.id)}
                      className={`p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        textSize === s.id
                          ? isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
                          : isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#FAFCFA] border-[#D8E5DA] text-[#275637]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Demo Button */}
              <div className="pt-4 border-t border-[#91BA94]/30">
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Demo Sandbox Data to Factory Defaults</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ── CREATE LISTING MODAL ── */}
      {showListingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-[18px] border p-6 shadow-2xl animate-card-in ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base">
                Create Equipment or Labour Listing
              </h3>
              <button 
                onClick={() => setShowListingModal(false)}
                className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-[#8BA695]">{t('label_listing_type') || 'Listing Type'}</label>
                <select 
                  value={listingCategory}
                  onChange={(e) => setListingCategory(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                >
                  <option value="Equipment Rental">{t('opt_equipment_rental') || 'Equipment Rental (Power Sprayer, Drones, Tools)'}</option>
                  <option value="Labour Request">{t('opt_labour_request') || 'Labour Request (Urgent Palm Climber, Harvester)'}</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[#8BA695]">{t('label_target_crop') || 'Target Crop Community'}</label>
                <select 
                  value={listingCrop}
                  onChange={(e) => setListingCrop(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                >
                  <option value="arecanut">🌴 Arecanut (r/arecanut)</option>
                  <option value="paddy">🌾 Paddy (r/paddy)</option>
                  <option value="tomato">🍅 Tomato (r/tomato)</option>
                  <option value="apple">🍎 Apple (r/apple)</option>
                </select>
                <p className="text-[10px] text-emerald-500 mt-1 font-semibold">
                  {t('auto_post_hint') || '✓ Automatically creates a public post in this community feed!'}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-[#8BA695]">{t('label_listing_title') || 'Title / Description'}</label>
                <input 
                  type="text" 
                  required
                  placeholder={t('placeholder_listing_title') || "e.g. 500L High-Pressure Power Sprayer for Rent"}
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 text-[#8BA695]">{t('label_listing_rate') || 'Rate / Price'}</label>
                <input 
                  type="text" 
                  required
                  placeholder={t('placeholder_listing_rate') || "e.g. ₹800 / day or ₹700 / acre"}
                  value={listingRate}
                  onChange={(e) => setListingRate(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-[#F9F9F6] border-[#91BA94] text-[#275637]'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-[14px] bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('publish_listing_btn') || 'Publish Listing & Post to Community'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MANAGE LISTING MODAL ── */}
      {managingListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-[18px] border p-6 shadow-2xl animate-card-in ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-[#91BA94] text-[#275637]'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#22C55E]">
                  {managingListing.category}
                </span>
                <h3 className="font-extrabold text-base mt-0.5">
                  {t('manage_listing_title') || 'Manage Listing'}
                </h3>
              </div>
              <button 
                onClick={() => setManagingListing(null)}
                className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕ {t('btn_close') || 'Close'}
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'}`}>
                <h4 className="font-extrabold text-sm">{managingListing.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-emerald-500 font-bold">{managingListing.rate}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    managingListing.status.includes('Completed') 
                      ? 'bg-gray-500/20 text-gray-400' 
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {managingListing.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleViewInFeed(managingListing)}
                  className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDark ? 'bg-[#162C20] border-[#22C55E]/40 text-emerald-300 hover:bg-[#1E3D2C]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637] hover:bg-[#D8E4DA]'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Post in Community (r/{managingListing.crop || 'arecanut'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleListingStatus(managingListing.id)}
                  className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#183526]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#FAFCFA]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{managingListing.status.includes('Completed') ? (t('btn_mark_available') || 'Mark as Available Again') : (t('btn_mark_fulfilled') || 'Mark as Fulfilled / Completed')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteListing(managingListing.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('btn_delete_listing') || 'Delete Listing & Remove from Community'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
