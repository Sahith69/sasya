// src/pages/Community.jsx - Reddit Replica for Crop Communities (r/arecanut, r/paddy, r/tomato, r/apple)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addCommunityComment, createCommunityPost, getCommunityComments, upvoteCommunityPost } from '../services/api';
import RedditChat from '../components/RedditChat';
import { 
  COMMUNITY_POST_TRANSLATIONS, 
  COMMUNITY_COMMENT_TRANSLATIONS, 
  parseAiListingDraft, 
  translateDynamicText 
} from '../services/communityAi';
import { 
  ArrowLeft, MessageSquare, Share2, Bookmark, Flag, 
  Send, Sparkles, Filter, AlertTriangle, ShieldCheck, 
  Sun, Moon, MapPin, Tag, Plus, CheckCircle2, ChevronDown,
  ChevronUp, Wrench, Clock, Users, Camera, Flame, 
  TrendingUp, Image as ImageIcon, Check, X, Search, MoreHorizontal,
  Mic, MicOff, Globe, Bot, ShieldAlert
} from 'lucide-react';

// Subreddit Crop Metadata
const SUBREDDITS = {
  arecanut: {
    id: 'arecanut',
    name: 'r/arecanut',
    displayName: 'Arecanut Plantation Growers',
    icon: '🌴',
    members: '1,420 members',
    online: '38 online',
    description: 'The premier community for arecanut palm cultivators, plant pathologists, and agronomists across Coastal & Malnad Karnataka. Share Koleroga alerts, spray schedules, and harvest techniques.',
    rules: [
      'Be specific about palm canopy symptoms and leaf wetness',
      'Attach clear photos when requesting disease identification',
      'Share prophylactic Bordeaux spray timing before continuous rain'
    ]
  },
  paddy: {
    id: 'paddy',
    name: 'r/paddy',
    displayName: 'Paddy & Rice Agronomy',
    icon: '🌾',
    members: '2,890 members',
    online: '64 online',
    description: 'Surveillance and crop management discussions for paddy farmers. Monitor leaf blast, bacterial blight, water management, and panicle protection.',
    rules: [
      'Report blast lesions promptly to protect neighboring basins',
      'Specify rice variety (Jaya, Jyothi, MTU 1010) in your post'
    ]
  },
  tomato: {
    id: 'tomato',
    name: 'r/tomato',
    displayName: 'Tomato & Solanaceous Growers',
    icon: '🍅',
    members: '1,120 members',
    online: '29 online',
    description: 'Commercial tomato growers and market gardeners. Discuss early blight, late blight, yellow leaf curl virus, and drip fertigation.',
    rules: [
      'Distinguish early vs late blight symptoms clearly',
      'State greenhouse vs open-field cultivation conditions'
    ]
  },
  apple: {
    id: 'apple',
    name: 'r/apple',
    displayName: 'Himachal & Kashmir Apple Orchards',
    icon: '🍏',
    members: '870 members',
    online: '21 online',
    description: 'High-altitude orchard management for Apple Scab (Venturia inaequalis), dormancy treatments, winter pruning, and KVK recommendations.',
    rules: [
      'Note orchard elevation and prevailing valley humidity',
      'Follow integrated pest management protocols'
    ]
  }
};

const INITIAL_POSTS = [];

export default function Community() {
  const navigate = useNavigate();
  const { crop: cropParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, lang, setLang, toggleTheme, isDark, t } = useAuth();

  // Active Subreddit
  const activeCrop = cropParam && SUBREDDITS[cropParam.toLowerCase()] ? cropParam.toLowerCase() : 'arecanut';
  const currentSubreddit = SUBREDDITS[activeCrop];

  // Feed State - Persisted across refreshes in localStorage (cleared demo posts)
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_community_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isLegacy = parsed.every(p => typeof p.id === 'number' && p.id <= 10);
          if (!isLegacy) return parsed;
        }
        localStorage.removeItem('sasya_community_posts');
      }
    } catch {}
    return [];
  });

  // Live Cloud Comment Synchronization (Fetches comments posted by other farmers/devices)
  const syncCommentsFromBackend = async () => {
    try {
      let anyNew = false;
      const updatedPosts = await Promise.all(
        posts.map(async (p) => {
          try {
            const res = await getCommunityComments(p.id);
            if (res?.success && Array.isArray(res.comments) && res.comments.length > 0) {
              const currentComments = [...p.comments];
              let addedCount = 0;

              for (const bc of res.comments) {
                if (!bc.content || typeof bc.content !== 'string') continue;

                // Match existing comment by content & author to prevent duplicates
                const isAlreadyPresent = currentComments.some(
                  (c) => c.content?.trim() === bc.content?.trim() && 
                        (c.author?.toLowerCase() === (bc.author_name || bc.author_id || '').toLowerCase())
                );

                if (!isAlreadyPresent) {
                  const isExpert = (bc.author_name || '').includes('Dr_');
                  currentComments.push({
                    id: `cloud_${bc.id || Date.now() + Math.random()}`,
                    author: bc.author_name || bc.author_id || 'Farmer',
                    badge: isExpert ? 'Agronomy Specialist' : 'Grower',
                    badgeColor: isExpert 
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' 
                      : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
                    content: bc.content,
                    timeAgo: bc.created_at ? new Date(bc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                    upvotes: 1,
                    userVote: 0
                  });
                  addedCount++;
                }
              }

              if (addedCount > 0) {
                anyNew = true;
                return { ...p, comments: currentComments };
              }
            }
          } catch {}
          return p;
        })
      );

      if (anyNew) {
        setPosts(updatedPosts);
        try {
          localStorage.setItem('sasya_community_posts', JSON.stringify(updatedPosts));
        } catch {}
      }
    } catch (e) {
      console.warn("Could not sync comments:", e);
    }
  };

  // Sync comments on mount and continuously every 6 seconds
  useEffect(() => {
    syncCommentsFromBackend();
    const interval = setInterval(syncCommentsFromBackend, 6000);
    return () => clearInterval(interval);
  }, [posts.length]);

  const [sortFilter, setSortFilter] = useState('hot'); // 'hot', 'new', 'top'
  const [flairFilter, setFlairFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [highlightedPostId, setHighlightedPostId] = useState(() => {
    const p = searchParams.get('post');
    return p ? Number(p) : null;
  });

  // Handle direct scroll & highlight for incoming post parameter (?post=123)
  useEffect(() => {
    const postParam = searchParams.get('post');
    if (postParam) {
      const targetId = Number(postParam);
      setHighlightedPostId(targetId);
      setFlairFilter('All');
      setSearchQuery('');
      setExpandedPostId(targetId);

      // Smooth scroll directly to the exact target post
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById(`post-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);

      // Pulse highlight for 5 seconds
      const highlightTimer = setTimeout(() => {
        setHighlightedPostId(null);
      }, 5000);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(highlightTimer);
      };
    }
  }, [searchParams, posts]);

  // Synchronize searchQuery when URL query ?q= changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // 1-on-1 Reddit Private Chat State
  const [isChatOpen, setIsChatOpen] = useState(() => searchParams.get('chat') === 'open');
  const [chatTargetUser, setChatTargetUser] = useState(null);

  const handleOpenChat = (target = null) => {
    if (target) {
      setChatTargetUser(target);
    }
    setIsChatOpen(true);
  };

  // Farmer Follow State (Open Network - No Private Account Gates)
  const [followingMap, setFollowingMap] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_following_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'Dr_Agronomist': 'following'
    };
  });

  const handleToggleFollow = (author) => {
    const isFollowing = followingMap[author] === 'following';
    const next = { ...followingMap };
    if (isFollowing) {
      delete next[author];
      showToast(`Unfollowed u/${author}`);
    } else {
      next[author] = 'following';
      showToast(`✓ You are now following u/${author}`);
    }
    setFollowingMap(next);
    localStorage.setItem('sasya_following_state', JSON.stringify(next));
  };
  
  // Post Creator State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFlair, setNewFlair] = useState('Labour Request');
  const [labourWorkers, setLabourWorkers] = useState('');
  const [labourWage, setLabourWage] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // Auto-fill draft if navigated from AI Agronomist with pending draft
  useEffect(() => {
    try {
      const rawDraft = sessionStorage.getItem('sasya_pending_community_draft');
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft.title) setNewTitle(draft.title);
        if (draft.content) setNewContent(draft.content);
        if (draft.flair) setNewFlair(draft.flair);
        if (draft.workers) setLabourWorkers(draft.workers);
        if (draft.wage) setLabourWage(draft.wage);
        setIsCreateModalOpen(true);
        sessionStorage.removeItem('sasya_pending_community_draft');
      }
    } catch (e) {
      console.warn('Error reading pending draft', e);
    }
  }, []);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is larger than 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewImageUrl(event.target.result);
      showToast('✓ Photo attached from your device!');
    };
    reader.readAsDataURL(file);
  };

  // Comment Thread Expansion State
  const [expandedPostId, setExpandedPostId] = useState(1);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});

  // ── SASYA AI QUICK DRAFT & TRANSLATION STATE ──
  const [aiDraftPrompt, setAiDraftPrompt] = useState('');
  const [isAiListening, setIsAiListening] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiDraftSuccess, setAiDraftSuccess] = useState(null);
  const speechRecognitionRef = useRef(null);

  // 1-Tap Trilingual Translation State (postId -> 'kn' | 'hi' | 'en' | null)
  const [postTranslations, setPostTranslations] = useState({});
  // commentId -> 'kn' | 'hi' | 'en' | null
  const [commentTranslations, setCommentTranslations] = useState({});

  // Web Speech API Voice Dictation for Listing Draft
  const handleToggleAiVoiceDraft = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice input is not supported in this browser. Please type your request.');
      return;
    }

    if (isAiListening) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      setIsAiListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsAiListening(true);
        showToast(
          lang === 'kn' ? '🎙️ ಸಸ್ಯ AI ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ (ಉದಾ: 2 ಜನ ಆಳುಗಳು ಬೇಕು)'
          : lang === 'hi' ? '🎙️ सस्य AI सुन रहा है... बोलिए (उदा: 2 मजदूर चाहिए)'
          : '🎙️ Sasya AI listening... Speak e.g. "need 2 climbers Thursday, Venur"'
        );
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setAiDraftPrompt(transcript);
          showToast(`🎙️ "${transcript}"`);
          handleApplyAiDraft(transcript);
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition warning:', err);
        setIsAiListening(false);
        showToast('Could not hear voice. Please type or speak again.');
      };

      recognition.onend = () => {
        setIsAiListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsAiListening(false);
    }
  };

  // AI Listing Formatter (Labour, Equipment, or Agronomic Query with Automatic Safety Nudge)
  const handleApplyAiDraft = (promptInput) => {
    const text = (typeof promptInput === 'string' ? promptInput : aiDraftPrompt).trim();
    if (!text) {
      showToast('Please type or speak your request first (e.g. "need 2 climbers Thursday, Venur")');
      return;
    }

    setIsAiDrafting(true);
    const draft = parseAiListingDraft(text, activeCrop, user?.village || 'Venur');

    if (draft) {
      setNewFlair(draft.flair);
      if (draft.workers) setLabourWorkers(draft.workers);
      if (draft.wage) setLabourWage(draft.wage);
      setNewTitle(draft.title);
      setNewContent(draft.content);
      setAiDraftSuccess('✓ AI Draft created! Review and edit below before posting.');
      showToast('✓ AI Draft applied to form! (AI drafts, you confirm)');
      setTimeout(() => setAiDraftSuccess(null), 6000);
    }
    setIsAiDrafting(false);
  };

  // 1-Tap Translation Handlers
  const handleTogglePostTranslation = (postId, targetLang) => {
    setPostTranslations(prev => {
      const current = prev[postId];
      if (current === targetLang) {
        const next = { ...prev };
        delete next[postId];
        showToast('Viewing original post');
        return next;
      }
      showToast(`Post translated to ${targetLang === 'kn' ? 'ಕನ್ನಡ' : targetLang === 'hi' ? 'हिंदी' : 'English'}`);
      return { ...prev, [postId]: targetLang };
    });
  };

  const handleToggleCommentTranslation = (commentId, defaultTarget = (lang === 'en' ? 'kn' : 'en')) => {
    setCommentTranslations(prev => {
      const current = prev[commentId];
      if (current) {
        const next = { ...prev };
        delete next[commentId];
        showToast('Viewing original comment');
        return next;
      }
      showToast(`Comment translated to ${defaultTarget === 'kn' ? 'ಕನ್ನಡ' : defaultTarget === 'hi' ? 'हिंदी' : 'English'}`);
      return { ...prev, [commentId]: defaultTarget };
    });
  };

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Upvote / Downvote Handler (Reddit Style with Cloud Sync & Persistence)
  const handleVote = async (postId, delta) => {
    let newDelta = 0;
    const nextPosts = posts.map(p => {
      if (p.id === postId) {
        const nextVote = p.userVote === delta ? 0 : delta;
        newDelta = nextVote;
        const diff = nextVote - (p.userVote || 0);
        return { ...p, upvotes: Math.max(0, p.upvotes + diff), userVote: nextVote };
      }
      return p;
    });

    setPosts(nextPosts);
    try {
      localStorage.setItem('sasya_community_posts', JSON.stringify(nextPosts));
    } catch {}

    // Cloud sync upvote to Render backend
    if (newDelta === 1) {
      try {
        await upvoteCommunityPost(postId);
      } catch (e) {
        console.info("Upvote persisted locally");
      }
    }
  };

  // Comment Upvote / Like Handler
  const handleCommentVote = (postId, commentId) => {
    const nextPosts = posts.map(p => {
      if (p.id === postId) {
        const nextComments = p.comments.map(c => {
          if (c.id === commentId) {
            const isUpvoted = c.userVote === 1;
            const nextVote = isUpvoted ? 0 : 1;
            const diff = nextVote - (c.userVote || 0);
            return { ...c, upvotes: Math.max(0, (c.upvotes || 0) + diff), userVote: nextVote };
          }
          return c;
        });
        return { ...p, comments: nextComments };
      }
      return p;
    });

    setPosts(nextPosts);
    try {
      localStorage.setItem('sasya_community_posts', JSON.stringify(nextPosts));
    } catch {}
  };

  // Save / Bookmark Toggle
  const handleToggleSave = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const nextSaved = !p.saved;
        showToast(nextSaved ? 'Saved to bookmarks' : 'Removed from bookmarks');
        return { ...p, saved: nextSaved };
      }
      return p;
    }));
  };

  // Share Handler
  const handleShare = (post) => {
    navigator.clipboard.writeText(window.location.href);
    showToast(`Link to "${post.title.substring(0, 30)}..." copied!`);
  };

  // Add Comment to Post (100% Persisted across F5 refreshes & Synced with Render backend)
  const handleAddComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    const authorName = user?.username || user?.name?.replace(/\s+/g, '_') || 'Farmer';
    const newC = {
      id: Date.now(),
      author: authorName,
      badge: 'Grower (Verified)',
      badgeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
      content: text,
      timeAgo: 'Just now',
      upvotes: 1,
      userVote: 1
    };

    const nextPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newC] };
      }
      return p;
    });

    setPosts(nextPosts);
    try {
      localStorage.setItem('sasya_community_posts', JSON.stringify(nextPosts));
    } catch {}

    setCommentInputs({ ...commentInputs, [postId]: '' });
    showToast('✓ Comment published & permanently saved!');

    // Background sync with live Render backend
    try {
      await addCommunityComment(postId, {
        post_id: postId,
        author_id: user?.id || user?.username || 'farmer_local',
        author_name: authorName,
        content: text
      });
      setTimeout(syncCommentsFromBackend, 400);
    } catch (err) {
      console.info("Comment backed up locally");
    }
  };

  // Reply to Specific Comment (Threaded Discussion)
  const handleAddReply = async (postId, parentCommentId, parentAuthor) => {
    const text = (replyInputs[parentCommentId] || '').trim();
    if (!text) return;

    const authorName = user?.username || user?.name?.replace(/\s+/g, '_') || 'Farmer';
    const newReply = {
      id: Date.now(),
      parentId: parentCommentId,
      replyTo: parentAuthor,
      author: authorName,
      badge: 'Grower (Verified)',
      badgeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
      content: text,
      timeAgo: 'Just now',
      upvotes: 1,
      userVote: 1
    };

    const nextPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newReply] };
      }
      return p;
    });

    setPosts(nextPosts);
    try {
      localStorage.setItem('sasya_community_posts', JSON.stringify(nextPosts));
    } catch {}

    setReplyInputs({ ...replyInputs, [parentCommentId]: '' });
    setReplyingToCommentId(null);
    showToast(`✓ Replied to u/${parentAuthor}`);

    // Background sync to Render backend with thread attribution
    try {
      await addCommunityComment(postId, {
        post_id: postId,
        author_id: user?.id || user?.username || 'farmer_local',
        author_name: authorName,
        content: `↳ @${parentAuthor}: ${text}`
      });
      setTimeout(syncCommentsFromBackend, 400);
    } catch (err) {
      console.info("Reply backed up locally");
    }
  };

  // Create Post Submission
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const flairColorMap = {
      'Labour Request': 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      'Equipment Rental': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
      'Disease Query': 'bg-rose-500/15 text-rose-500 border-rose-500/30',
      'Weather Advisory': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      'General Discussion': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
    };

    let postBody = newContent.trim();
    if (newFlair === 'Labour Request') {
      const tags = [];
      if (labourWorkers.trim()) tags.push(`👥 Workers Needed: ${labourWorkers.trim()}`);
      if (labourWage.trim()) tags.push(`💰 Wage: ${labourWage.trim()}`);
      if (tags.length > 0) {
        postBody = postBody ? `${tags.join(' | ')}\n\n${postBody}` : tags.join(' | ');
      }
    }

    const newPost = {
      id: Date.now(),
      crop: activeCrop,
      author: user?.username || user?.name?.replace(/\s+/g, '_') || 'Young_Farmer',
      village: `${user?.village || 'Venur'}, ${user?.district || 'Coastal KA'}`,
      badge: 'Grower',
      timeAgo: 'Just now',
      flair: newFlair,
      flairColor: flairColorMap[newFlair] || 'bg-gray-500/15 text-gray-500',
      title: newTitle.trim(),
      content: postBody,
      image: newImageUrl.trim() || null,
      aiBadge: null,
      upvotes: 1,
      userVote: 1,
      saved: false,
      comments: []
    };

    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    try {
      localStorage.setItem('sasya_community_posts', JSON.stringify(nextPosts));
    } catch {}

    setNewTitle('');
    setNewContent('');
    setLabourWorkers('');
    setLabourWage('');
    setNewImageUrl('');
    setIsCreateModalOpen(false);
    showToast(`✓ Post published & permanently saved!`);

    // Background sync with live Render backend
    try {
      await createCommunityPost({
        crop: activeCrop,
        author_id: user?.id || user?.username || 'farmer_local',
        author_name: user?.username || user?.name || 'Young_Farmer',
        title: newTitle.trim(),
        content: postBody
      });
    } catch (err) {
      console.info("Post synced locally");
    }
  };

  // Filter & Sort Posts (Followed Farmers ALWAYS at the top)
  const filteredPosts = posts
    .filter(p => p.crop === activeCrop)
    .filter(p => flairFilter === 'All' || p.flair === flairFilter)
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.flair.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        (p.aiBadge && p.aiBadge.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // 1. Followed farmers' posts ALWAYS at the very top!
      const aFollowed = followingMap[a.author] === 'following';
      const bFollowed = followingMap[b.author] === 'following';
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;

      // 2. Secondary sort according to selected filter
      if (sortFilter === 'new') return b.id - a.id;
      if (sortFilter === 'top') return b.upvotes - a.upvotes;
      return b.upvotes - a.upvotes; // default hot
    });

  return (
    <div className={`min-h-screen flex flex-col w-full max-w-full overflow-x-hidden transition-colors duration-300 pb-20 md:pb-8 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>

      {/* ── REDDIT TOP HEADER (HACKATHON THEME) ── */}
      <header className={`sticky top-0 z-40 border-b h-14 px-2.5 sm:px-4 flex items-center justify-between backdrop-blur-md w-full max-w-full overflow-hidden ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        {/* Left: Back & Subreddit Identity */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          <button 
            onClick={() => navigate('/home')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link to={`/c/${activeCrop}`} className="flex items-center gap-1.5 sm:gap-2 font-black text-xs sm:text-base min-w-0">
            <span className="text-lg sm:text-xl shrink-0">{currentSubreddit.icon}</span>
            <span className={`truncate max-w-[100px] xs:max-w-[130px] sm:max-w-none ${isDark ? 'text-white' : 'text-[#275637]'}`}>
              {currentSubreddit.name}
            </span>
          </Link>
        </div>

        {/* Center: Reddit Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_community_placeholder') || `Search ${currentSubreddit.name}...`}
              className={`w-full pl-9 pr-4 py-1.5 rounded-full text-xs font-medium border outline-none transition-all ${
                isDark 
                  ? 'bg-[#12241A] border-[#1E3A2B] text-white focus:border-[#22C55E]' 
                  : 'bg-white border-[#91BA94] text-[#275637] focus:ring-1 focus:ring-[#275637]'
              }`}
            />
          </div>
        </div>

        {/* Right Controls: Chat, Create Post CTA, Theme */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => handleOpenChat(null)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              isDark 
                ? 'bg-[#12241A] border-[#1E3A2B] text-emerald-400 hover:bg-[#162F20]' 
                : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Open 1-on-1 Reddit Farmer Chat"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Farmer Chat</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-black bg-[#275637] hover:bg-[#1E462B] text-white flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden text-[11px]">Post</span>
          </button>

          {/* Trilingual Switcher (Compact on Mobile to Prevent Overflow) */}
          <div className={`flex items-center p-0.5 sm:p-1 rounded-xl border text-[10px] sm:text-xs shadow-xs shrink-0 ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            {[
              { code: 'en', label: 'EN', short: 'EN' },
              { code: 'kn', label: 'ಕನ್ನಡ', short: 'ಕ' },
              { code: 'hi', label: 'हिंदी', short: 'हि' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code)}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === item.code
                    ? isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' 
                      : 'bg-[#275637] text-white shadow-xs'
                    : isDark 
                      ? 'text-[#8BA695] hover:text-white' 
                      : 'text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                <span className="hidden xs:inline">{item.label}</span>
                <span className="xs:hidden">{item.short}</span>
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-amber-400' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── SUBREDDIT BANNER ── */}
      <div className={`border-b w-full overflow-hidden ${isDark ? 'bg-[#102217] border-[#1A2820]' : 'bg-white border-[#D8E4DA]'}`}>
        <div className="h-14 sm:h-20 bg-gradient-to-r from-[#275637] via-[#1E462B] to-[#12241A] relative" />
        <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4 -mt-5 sm:-mt-8 relative z-10 w-full min-w-0">
          <div className="flex items-end gap-2.5 sm:gap-4 min-w-0 flex-1">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-4 border-[#F9F9F6] dark:border-[#102217] bg-[#12241A] flex items-center justify-center text-2xl sm:text-4xl shadow-md shrink-0">
              {currentSubreddit.icon}
            </div>
            <div className="mb-0.5 min-w-0 flex-1">
              <h1 className="text-base sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="truncate">{currentSubreddit.displayName}</span>
              </h1>
              <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                {currentSubreddit.name} • {currentSubreddit.members} • {currentSubreddit.online}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 mb-0.5">
            <button className="px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs bg-[#22C55E] text-[#0B1712] hover:bg-[#16A34A] cursor-pointer shadow-xs">
              {t('btn_joined') || 'Joined'} ✓
            </button>
          </div>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#275637] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── MAIN 2-COLUMN REDDIT LAYOUT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        
        {/* ── LEFT FEED COLUMN (8 cols) ── */}
        <div className="lg:col-span-8 space-y-3 min-w-0 w-full">
          
          {/* Reddit Create Post Card */}
          <div 
            onClick={() => setIsCreateModalOpen(true)}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2.5 sm:gap-3 cursor-pointer transition-colors shadow-xs w-full min-w-0 ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] hover:border-gray-500' : 'bg-white border-[#D8E4DA] hover:border-[#275637]'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#275637] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AR'}
            </div>
            <input 
              type="text" 
              readOnly 
              placeholder={t('create_post_placeholder') || `Create Post in ${currentSubreddit.name}...`}
              className={`flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer truncate ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-400' : 'bg-[#FAFCFA] border-[#D8E4DA] text-gray-500'
              }`}
            />
            <button className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-[#275637] dark:hover:text-[#22C55E] shrink-0">
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Reddit Sort & Filter Strip */}
          <div className={`p-2 rounded-xl border flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs font-bold shadow-xs w-full min-w-0 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'hot', label: 'Hot', icon: Flame },
                { id: 'new', label: 'New', icon: Sparkles },
                { id: 'top', label: 'Top', icon: TrendingUp },
              ].map(sort => (
                <button
                  key={sort.id}
                  onClick={() => setSortFilter(sort.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                    sortFilter === sort.id
                      ? isDark ? 'bg-[#1E3A2B] text-[#22C55E]' : 'bg-[#E8F2EA] text-[#275637]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <sort.icon className="w-3.5 h-3.5" />
                  <span>{sort.label}</span>
                </button>
              ))}
            </div>

            {/* Category Filter Dropdown */}
            <select
              value={flairFilter}
              onChange={(e) => setFlairFilter(e.target.value)}
              className={`max-w-[130px] sm:max-w-none px-2 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer truncate shrink-0 ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-[#FAFCFA] border-[#D8E4DA] text-gray-800'
              }`}
            >
              <option value="All">{t('comm_all_flairs') || 'All Categories'}</option>
              <option value="Labour Request">👥 {t('comm_labour') || 'Labour Request'}</option>
              <option value="Equipment Rental">🛠️ {t('comm_rentals') || 'Equipment Rental'}</option>
              <option value="Disease Query">🍃 {t('comm_queries') || 'Disease Query'}</option>
              <option value="Weather Advisory">🌧️ {t('comm_alerts') || 'Weather Advisory'}</option>
              <option value="General Discussion">💬 General Discussion</option>
            </select>
          </div>

          {/* Quick Flair Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none w-full max-w-full">
            {[
              { id: 'All', label: 'All', icon: null },
              { id: 'Labour Request', label: '👥 Labour Request' },
              { id: 'Equipment Rental', label: '🛠️ Equipment Rental' },
              { id: 'Disease Query', label: '🍃 Disease Query' },
              { id: 'Weather Advisory', label: '🌧️ Weather Advisory' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFlairFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  flairFilter === f.id
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' : 'bg-[#275637] text-white border-[#275637]'
                    : isDark ? 'bg-[#102217] border-[#1E3A2B] text-gray-300 hover:border-gray-500' : 'bg-white border-[#D8E4DA] text-gray-700 hover:bg-[#E8F2EA]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Active Search Filter Banner */}
          {searchQuery.trim() && (
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold animate-fadeIn w-full min-w-0 ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] text-emerald-400' : 'bg-[#EBF3ED] border-[#91BA94] text-[#275637]'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">
                  Filtering discussions for <strong className="underline">"{searchQuery}"</strong> ({filteredPosts.length} matching {filteredPosts.length === 1 ? 'post' : 'posts'})
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="text-xs hover:underline text-gray-400 hover:text-rose-500 cursor-pointer shrink-0 ml-2"
              >
                Clear ✕
              </button>
            </div>
          )}

          {/* Reddit Posts List */}
          {filteredPosts.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center text-xs text-gray-400 w-full ${
              isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
            }`}>
              No posts found in {currentSubreddit.name} matching your filter. Be the first to start a discussion!
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isExpanded = expandedPostId === post.id;
              const isUpvoted = post.userVote === 1;
              const isDownvoted = post.userVote === -1;

              return (
                <article
                  key={post.id}
                  id={`post-${post.id}`}
                  className={`rounded-xl border transition-all duration-300 overflow-hidden shadow-xs w-full max-w-full hover:border-[#275637] dark:hover:border-gray-500 ${
                    highlightedPostId === post.id
                      ? 'ring-4 ring-[#22C55E] border-[#22C55E] shadow-2xl scale-[1.01] bg-[#22C55E]/[0.04]'
                      : isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
                  }`}
                >
                  {/* Focused Post Banner (when arriving via View in Feed) */}
                  {highlightedPostId === post.id && (
                    <div className="bg-[#22C55E] text-[#0B1712] px-3.5 py-1.5 text-xs font-black flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0B1712]" />
                        <span>Focused Listing from Rural Exchange</span>
                      </div>
                      <span className="text-[10px] tracking-wider uppercase font-mono font-bold bg-[#0B1712]/15 px-2 py-0.5 rounded">
                        Active Post
                      </span>
                    </div>
                  )}
                  <div className="flex items-start w-full min-w-0">
                    
                    {/* LEFT REDDIT VOTING STRIP (Desktop & Mobile) */}
                    <div className={`w-9 sm:w-12 pt-3 pb-2 flex flex-col items-center shrink-0 ${
                      isDark ? 'bg-[#0E1E16]' : 'bg-[#FAFCFA]'
                    }`}>
                      <button
                        onClick={() => handleVote(post.id, 1)}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                          isUpvoted ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
                        }`}
                        title="Upvote"
                      >
                        <ChevronUp className={`w-5 h-5 ${isUpvoted ? 'stroke-[3]' : ''}`} />
                      </button>

                      <span className={`text-xs font-black font-mono my-0.5 ${
                        isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {post.upvotes}
                      </span>

                      <button
                        onClick={() => handleVote(post.id, -1)}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                          isDownvoted ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
                        }`}
                        title="Downvote"
                      >
                        <ChevronDown className={`w-5 h-5 ${isDownvoted ? 'stroke-[3]' : ''}`} />
                      </button>
                    </div>

                    {/* MAIN POST CONTENT */}
                    <div className="flex-1 p-2.5 sm:p-4 min-w-0 w-full overflow-hidden">
                      
                      {/* Post Metadata Header */}
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-gray-400 flex-wrap mb-1.5 min-w-0 w-full">
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {currentSubreddit.name}
                        </span>
                        <span>•</span>
                        <span>
                          Posted by{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChat({
                                username: post.author,
                                name: post.author.replace(/_/g, ' '),
                                badge: post.badge,
                                village: post.village,
                                crop: SUBREDDITS[post.crop]?.displayName || 'Grower'
                              });
                            }}
                            className="font-bold hover:underline cursor-pointer text-gray-800 dark:text-gray-200"
                            title={`Chat privately with u/${post.author}`}
                          >
                            u/{post.author}
                          </button>
                        </span>

                        {/* Followed Farmer Priority Badge */}
                        {followingMap[post.author] === 'following' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-xs">
                            <span>⭐</span> {t('comm_following_tag') || 'Following'}
                          </span>
                        )}

                        {/* Follow / Unfollow Button (Direct 1-Click, Open Network) */}
                        {post.author !== (user?.username || 'Farmer') && (
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(post.author)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              followingMap[post.author] === 'following'
                                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 hover:bg-rose-500/10 hover:text-rose-500'
                                : isDark
                                  ? 'border-[#1E3A2B] text-gray-300 hover:border-emerald-500 hover:text-emerald-400'
                                  : 'border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                            }`}
                            title={
                              followingMap[post.author] === 'following'
                                ? 'Click to Unfollow'
                                : 'Follow this grower'
                            }
                          >
                            {followingMap[post.author] === 'following' ? 'Following ✓' : '+ Follow'}
                          </button>
                        )}
                        <span className="text-[10px] opacity-75">({post.village})</span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                        
                        {/* Flair Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.flairColor}`}>
                          {post.flair}
                        </span>

                        {/* 1-Tap Post Translation Switcher */}
                        <div className="flex items-center gap-1 sm:ml-auto">
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Globe className="w-3 h-3 text-emerald-500" />
                          </span>
                          {[
                            { code: 'kn', label: 'ಕನ್ನಡ' },
                            { code: 'hi', label: 'हिंदी' },
                            { code: 'en', label: 'EN' }
                          ].map((tItem) => (
                            <button
                              key={tItem.code}
                              type="button"
                              onClick={() => handleTogglePostTranslation(post.id, tItem.code)}
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                postTranslations[post.id] === tItem.code
                                  ? 'bg-[#275637] text-white border-[#275637] shadow-xs'
                                  : isDark 
                                    ? 'border-[#1E3A2B] text-gray-400 hover:text-white hover:border-emerald-500' 
                                    : 'border-gray-200 text-gray-600 hover:bg-[#E8F2EA] hover:text-[#275637]'
                              }`}
                              title={`Translate post to ${tItem.label}`}
                            >
                              {tItem.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Translation Indicator Banner */}
                      {postTranslations[post.id] && (
                        <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-fadeIn">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            <span>
                              Translated to <strong>{postTranslations[post.id] === 'kn' ? 'ಕನ್ನಡ' : postTranslations[post.id] === 'hi' ? 'हिंदी' : 'English'}</strong> (AI Translation)
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleTogglePostTranslation(post.id, postTranslations[post.id])}
                            className="underline hover:text-emerald-300 cursor-pointer text-[10px]"
                          >
                            Show Original
                          </button>
                        </div>
                      )}

                      {/* Post Title */}
                      <h2 className={`text-sm sm:text-base font-bold leading-snug tracking-tight mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {postTranslations[post.id]
                          ? (COMMUNITY_POST_TRANSLATIONS[post.id]?.[postTranslations[post.id]]?.title || translateDynamicText(post.title, postTranslations[post.id]))
                          : post.title}
                      </h2>

                      {/* Post Body */}
                      <p className={`text-xs sm:text-sm leading-relaxed mb-3 whitespace-pre-line ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {postTranslations[post.id]
                          ? (COMMUNITY_POST_TRANSLATIONS[post.id]?.[postTranslations[post.id]]?.content || translateDynamicText(post.content, postTranslations[post.id]))
                          : post.content}
                      </p>

                      {/* Attached Image (if present) */}
                      {post.image && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-96 bg-black flex items-center justify-center">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="max-h-96 w-full object-contain" 
                          />
                        </div>
                      )}

                      {/* AI Verification Pill (if present) */}
                      {post.aiBadge && (
                        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{post.aiBadge}</span>
                        </div>
                      )}

                      {/* REDDIT ACTION BAR */}
                      <div className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 flex-wrap">
                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments.length} {t('comments_count_label') || 'Comments'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePostTranslation(post.id, postTranslations[post.id] ? postTranslations[post.id] : (lang === 'en' ? 'kn' : 'en'))}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            postTranslations[post.id]
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          title="1-Tap Translate this post"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{postTranslations[post.id] ? 'Original' : 'Translate'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenChat({
                            username: post.author,
                            name: post.author.replace(/_/g, ' '),
                            badge: post.badge,
                            village: post.village,
                            crop: SUBREDDITS[post.crop]?.displayName || 'Grower'
                          })}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400 font-semibold"
                          title={`Open Reddit-style 1-on-1 private chat with u/${post.author}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{t('btn_chat') || 'Chat'}</span>
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{t('btn_share') || 'Share'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleSave(post.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                            post.saved ? 'text-amber-500' : ''
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${post.saved ? 'fill-amber-500' : ''}`} />
                          <span>{post.saved ? (t('btn_saved') || 'Saved') : (t('btn_save') || 'Save')}</span>
                        </button>
                      </div>

                      {/* THREADED REDDIT COMMENT SECTION */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                          
                          {/* New Comment Input Box */}
                          <div className="space-y-2">
                            <span className="text-[11px] text-gray-400">
                              Comment as <strong className="text-emerald-500">u/{user?.username || 'Farmer'}</strong>
                            </span>
                            <div className="flex gap-2">
                              <textarea
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                placeholder={t('placeholder_comment') || 'What are your thoughts?'}
                                rows={2}
                                className={`w-full p-2.5 rounded-xl border text-xs outline-none resize-none ${
                                  isDark ? 'bg-[#07100C] border-[#1E3A2B] text-white focus:border-[#22C55E]' : 'bg-[#FAFCFA] border-gray-300 text-gray-800 focus:border-[#275637]'
                                }`}
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="px-4 py-1.5 rounded-full font-bold text-xs bg-[#275637] hover:bg-[#1E462B] text-white flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>{t('btn_comment') || 'Comment'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Comments Tree */}
                          {post.comments.length === 0 ? (
                            <div className="text-center py-4 text-xs text-gray-400 italic">
                              No comments yet. Be the first to share your agronomic insight!
                            </div>
                          ) : (
                            <div className="space-y-3 pt-2">
                              {post.comments.map((comment) => {
                                const isReply = comment.replyTo || (comment.content && comment.content.startsWith('↳'));
                                return (
                                <div 
                                  key={comment.id} 
                                  className={`flex gap-2.5 pl-2 border-l-2 transition-all ${
                                    isReply 
                                      ? 'ml-4 sm:ml-6 pl-3 border-emerald-500/50 bg-emerald-500/[0.03] py-2 rounded-r-xl' 
                                      : 'border-gray-200 dark:border-gray-800'
                                  }`}
                                >
                                  <div className="flex-1 space-y-1">
                                    {comment.replyTo && (
                                      <div className="text-[10px] text-emerald-500 font-semibold mb-0.5 flex items-center gap-1">
                                        <span>↳ replying to</span>
                                        <span className="underline">u/{comment.replyTo}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenChat({
                                            username: comment.author,
                                            name: comment.author.replace(/_/g, ' '),
                                            badge: comment.badge,
                                            village: 'Verified Community Member',
                                            crop: currentSubreddit.displayName
                                          });
                                        }}
                                        className="font-bold hover:underline cursor-pointer text-gray-900 dark:text-gray-200"
                                        title={`Chat privately with u/${comment.author}`}
                                      >
                                        u/{comment.author}
                                      </button>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${comment.badgeColor || 'border-gray-500'}`}>
                                        {comment.badge}
                                      </span>
                                      <span>•</span>
                                      <span>{comment.timeAgo}</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {commentTranslations[comment.id]
                                        ? (COMMUNITY_COMMENT_TRANSLATIONS[comment.id]?.[commentTranslations[comment.id]] || translateDynamicText(comment.content, commentTranslations[comment.id]))
                                        : comment.content}
                                    </p>
                                    {commentTranslations[comment.id] && (
                                      <span className="inline-block text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded mt-0.5">
                                        🌐 Translated to {commentTranslations[comment.id] === 'kn' ? 'ಕನ್ನಡ' : commentTranslations[comment.id] === 'hi' ? 'हिंदी' : 'English'}
                                      </span>
                                    )}
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-0.5 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => handleCommentVote(post.id, comment.id)}
                                        className={`font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                          comment.userVote === 1 
                                            ? 'text-orange-500 scale-105' 
                                            : 'text-emerald-500 hover:text-orange-400'
                                        }`}
                                        title="Upvote comment"
                                      >
                                        ▲ {comment.upvotes || 1}
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => handleOpenChat({
                                          username: comment.author,
                                          name: comment.author.replace(/_/g, ' '),
                                          badge: comment.badge,
                                          village: 'Verified Community Member',
                                          crop: currentSubreddit.displayName
                                        })}
                                        className="hover:underline cursor-pointer text-emerald-600 dark:text-emerald-400 font-semibold"
                                        title={`Chat privately with u/${comment.author}`}
                                      >
                                        💬 {t('btn_chat') || 'Chat'}
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => handleToggleCommentTranslation(comment.id, commentTranslations[comment.id] ? commentTranslations[comment.id] : (lang === 'en' ? 'kn' : 'en'))}
                                        className={`hover:underline cursor-pointer flex items-center gap-1 font-semibold ${
                                          commentTranslations[comment.id] ? 'text-emerald-500 font-bold' : 'text-gray-400 hover:text-emerald-400'
                                        }`}
                                        title="1-Tap Translate comment"
                                      >
                                        <Globe className="w-3 h-3 text-emerald-500" />
                                        <span>{commentTranslations[comment.id] ? 'Original' : (lang === 'en' ? 'Translate' : 'ಅನುವಾದ')}</span>
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                                        className="hover:underline cursor-pointer hover:text-emerald-500 font-semibold flex items-center gap-0.5"
                                      >
                                        ↩ {t('btn_reply') || 'Reply'}
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(window.location.href);
                                          showToast('Link to comment thread copied!');
                                        }}
                                        className="hover:underline cursor-pointer"
                                      >
                                        {t('btn_share') || 'Share'}
                                      </button>
                                    </div>

                                    {/* Inline Reply Box for this Comment Thread */}
                                    {replyingToCommentId === comment.id && (
                                      <div className={`mt-2 p-2.5 rounded-xl border space-y-2 animate-card-in ${
                                        isDark ? 'bg-[#0B1812] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-300'
                                      }`}>
                                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                                          <span>Replying to <strong className="text-emerald-500">u/{comment.author}</strong></span>
                                          <button 
                                            type="button" 
                                            onClick={() => setReplyingToCommentId(null)}
                                            className="hover:text-rose-400 cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <textarea
                                          value={replyInputs[comment.id] || ''}
                                          onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                          placeholder={t('add_to_discussion') || `Add to discussion with u/${comment.author}...`}
                                          rows={2}
                                          className={`w-full p-2 rounded-lg border text-xs outline-none resize-none ${
                                            isDark 
                                              ? 'bg-[#07100C] border-[#1E3A2B] text-white focus:border-[#22C55E]' 
                                              : 'bg-white border-gray-300 text-gray-800 focus:border-[#275637]'
                                          }`}
                                        />
                                        <div className="flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setReplyingToCommentId(null)}
                                            className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                          >
                                            {t('btn_cancel') || 'Cancel'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleAddReply(post.id, comment.id, comment.author)}
                                            className="px-3.5 py-1 rounded-full font-bold text-xs bg-[#275637] hover:bg-[#1E462B] text-white flex items-center gap-1 cursor-pointer shadow-xs"
                                          >
                                            <Send className="w-3 h-3" />
                                            <span>{t('btn_reply') || 'Reply'}</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                </div>
                              );
                              })}
                            </div>
                          )}

                        </div>
                      )}

                    </div>

                  </div>
                </article>
              );
            })
          )}

        </div>

        {/* ── RIGHT REDDIT SIDEBAR (4 cols) ── */}
        <aside className="lg:col-span-4 space-y-4">
          
          {/* About Subreddit Card */}
          <div className={`rounded-xl border overflow-hidden shadow-xs ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className="p-3 bg-[#275637] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>About Community</span>
              <span>{currentSubreddit.icon}</span>
            </div>
            
            <div className="p-4 space-y-3 text-xs">
              <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#556B5C]'}`}>
                {currentSubreddit.description}
              </p>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="font-black text-sm">{currentSubreddit.members.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-400">Members</div>
                </div>
                <div>
                  <div className="font-black text-sm text-emerald-500">● {currentSubreddit.online.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-400">Online Now</div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full py-2 px-3 rounded-full font-bold text-xs bg-[#275637] hover:bg-[#1E462B] text-white shadow-xs cursor-pointer transition-transform active:scale-95"
                >
                  Create Post
                </button>
                <button
                  onClick={() => handleOpenChat(null)}
                  className={`w-full py-2 px-3 rounded-full font-bold text-xs border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    isDark 
                      ? 'border-[#1E3A2B] bg-[#12241A] text-emerald-400 hover:bg-[#183223]' 
                      : 'border-[#91BA94] bg-[#FAFCFA] text-[#275637] hover:bg-[#E8F2EA]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Farmer Chat (Private DMs)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subreddit Rules Card */}
          <div className={`p-4 rounded-xl border text-xs shadow-xs space-y-2.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#556B5C] dark:text-gray-400">
              {currentSubreddit.name} Rules
            </h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-600 dark:text-gray-300">
              {currentSubreddit.rules.map((rule, idx) => (
                <li key={idx} className="leading-snug">{rule}</li>
              ))}
            </ol>
          </div>

          {/* Growers Network (Open Farmer Cooperative) */}
          <div className={`p-4 rounded-xl border text-xs shadow-xs space-y-3 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#556B5C] dark:text-gray-400">
                Growers Network
              </h3>
              <Link to="/profile" className="text-[11px] font-bold text-emerald-500 hover:underline">
                View Profile
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'}`}>
                <div className="font-extrabold text-sm">2</div>
                <div className="text-[10px] text-gray-400">Followers</div>
              </div>
              <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'}`}>
                <div className="font-extrabold text-sm text-emerald-500">
                  {Object.values(followingMap).filter(v => v === 'following').length + 1}
                </div>
                <div className="text-[10px] text-gray-400">Following</div>
              </div>
            </div>

            <div className={`w-full py-2 px-3 rounded-xl border text-xs text-center flex items-center justify-center gap-1.5 ${
              isDark 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-[#E8F2EA] text-[#275637] border-[#91BA94]'
            }`}>
              <Users className="w-3.5 h-3.5" />
              <span>Open Network • Followed Farmers First</span>
            </div>
          </div>

          {/* Crop Subreddits Switcher Card */}
          <div className={`p-4 rounded-xl border text-xs shadow-xs space-y-2.5 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#556B5C] dark:text-gray-400">
              Other Crop Subreddits
            </h3>
            <div className="space-y-1">
              {Object.values(SUBREDDITS).map((sub) => (
                <Link
                  key={sub.id}
                  to={`/c/${sub.id}`}
                  className={`w-full p-2 rounded-lg flex items-center justify-between transition-colors ${
                    activeCrop === sub.id 
                      ? isDark ? 'bg-[#14281C] text-emerald-400 font-bold' : 'bg-[#E8F2EA] text-[#275637] font-bold'
                      : isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {sub.members.split(' ')[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </aside>

      </main>

      {/* ── CREATE POST MODAL ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative animate-card-in ${
            isDark ? 'bg-[#102217] border-[#1E3A2B] text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <span>{t('create_post_in') || 'Create Post in'} {currentSubreddit.name}</span>
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs font-semibold">
              {/* ── SASYA AI QUICK DRAFT (VOICE & TEXT) ── */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 transition-all ${
                isDark 
                  ? 'bg-gradient-to-br from-[#12241A] to-[#0A1710] border-[#22C55E]/40' 
                  : 'bg-gradient-to-br from-[#E8F2EA] to-[#F4F8F5] border-[#91BA94]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#275637] text-white shadow-xs">
                      <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black flex items-center gap-1.5 text-gray-900 dark:text-white">
                        <span>✨ Sasya AI Quick Draft</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Voice or Text
                        </span>
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                        Speak or type what you need. AI fills the listing card in 10 seconds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={aiDraftPrompt}
                      onChange={(e) => setAiDraftPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyAiDraft();
                        }
                      }}
                      placeholder={t('placeholder_voice_or_type') || "e.g. need 2 climbers Thursday, Venur or 2 ಜನ ಆಳುಗಳು ಬೇಕು..."}
                      className={`w-full pl-3 pr-24 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark 
                          ? 'bg-[#07100C] border-[#1E3A2B] text-white placeholder-gray-500 focus:border-[#22C55E]' 
                          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#275637]'
                      }`}
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleToggleAiVoiceDraft}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isAiListening 
                            ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                            : isDark 
                              ? 'bg-[#12241A] border-[#1E3A2B] text-emerald-400 hover:bg-[#1A3324]' 
                              : 'bg-[#FAFCFA] border-gray-200 text-[#275637] hover:bg-gray-100'
                        }`}
                        title={isAiListening ? 'Listening... click to stop' : 'Click to speak in Kannada, Hindi, or English'}
                      >
                        {isAiListening ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyAiDraft()}
                        disabled={isAiDrafting}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-black bg-[#275637] hover:bg-[#1E462B] text-white flex items-center gap-1 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-300" />
                        <span>{t('btn_voice_ai_draft') || 'Draft'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Tap Quick Examples */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-gray-400 font-medium">Try:</span>
                    {[
                      { label: '👥 2 Climbers Thursday (Venur)', prompt: 'need 2 climbers Thursday, Venur' },
                      { label: '🛠️ Power Sprayer Rental', prompt: 'need power sprayer for rent tomorrow' },
                      { label: 'ಕನ್ನಡ: 2 ಜನ ಮರ ಹತ್ತುವವರು ಬೇಕು', prompt: '2 ಜನ ಮರ ಹತ್ತುವವರು ಬೇಕು ಗುರುವಾರ ವೇಣೂರು' },
                      { label: 'हिंदी: 2 मजदूर चाहिए', prompt: 'गुरुवार को 2 मजदूर चाहिए वेणूर में' }
                    ].map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiDraftPrompt(ex.prompt);
                          handleApplyAiDraft(ex.prompt);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          isDark 
                            ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300 hover:border-emerald-500 hover:text-emerald-400' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-[#E8F2EA] hover:text-[#275637]'
                        }`}
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>

                  {/* AI Draft Applied Feedback Banner */}
                  {aiDraftSuccess && (
                    <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{aiDraftSuccess}</span>
                    </div>
                  )}

                  {/* Safety Boundary / Human in the loop rule */}
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 italic flex items-center gap-1">
                    <span>🛡️ The AI drafts and you confirm. Nothing posts by itself. Zero dosages recommended.</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">{t('label_category_flair') || 'Flair / Category'}</label>
                <select
                  value={newFlair}
                  onChange={(e) => setNewFlair(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="Labour Request">👥 Labour Request</option>
                  <option value="Equipment Rental">🛠️ Equipment Rental</option>
                  <option value="Disease Query">🍃 Disease Query</option>
                  <option value="Weather Advisory">🌧️ Weather Advisory</option>
                  <option value="General Discussion">💬 General Discussion</option>
                </select>
              </div>

              {/* Dedicated Labour Request Fields */}
              {newFlair === 'Labour Request' && (
                <div className={`p-3 rounded-xl border space-y-2.5 animate-fadeIn ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F4F8F5] border-[#91BA94]/60'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-600 dark:text-purple-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t('label_labour_specs') || 'Labour Request Specifications'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-[10px] text-gray-400 font-bold uppercase">{t('label_workers_needed') || 'Workers Needed'}</label>
                      <input
                        type="text"
                        value={labourWorkers}
                        onChange={(e) => setLabourWorkers(e.target.value)}
                        placeholder={t('placeholder_workers_needed') || "e.g. 3 Skilled Tree Climbers"}
                        className={`w-full p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-[#07100C] border-[#1E3A2B] text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] text-gray-400 font-bold uppercase">{t('label_daily_wage') || 'Daily Wage (₹)'}</label>
                      <input
                        type="text"
                        value={labourWage}
                        onChange={(e) => setLabourWage(e.target.value)}
                        placeholder={t('placeholder_daily_wage') || "e.g. ₹900/day + food"}
                        className={`w-full p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-[#07100C] border-[#1E3A2B] text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">{t('label_post_title') || 'Post Title *'}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    newFlair === 'Labour Request'
                      ? (t('placeholder_workers_needed') || "e.g. 3 Tree Climbers Needed for Arecanut Harvesting in Belthangady")
                      : (t('placeholder_post_title') || "Title: e.g. Yellow leaf spots appearing after yesterday's rain")
                  }
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">{t('label_post_content') || 'Text Content'}</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={t('placeholder_post_content') || "Describe crop symptoms, spray details, or question..."}
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none resize-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Photo Attachment: From Device Camera or File or URL */}
              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">
                  {t('label_attach_photo') || 'Attach Photo (Camera / Device or URL)'}
                </label>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-[#0E1E16] border-[#1E3A2B] text-emerald-400 hover:bg-[#152B1F]' 
                        : 'bg-[#F4F8F5] border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-emerald-500" />
                    <span>{t('btn_upload_photo') || 'Upload Photo from Device'}</span>
                  </button>
                  {newImageUrl && (
                    <button
                      type="button"
                      onClick={() => setNewImageUrl('')}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t('btn_remove') || 'Remove'}</span>
                    </button>
                  )}
                </div>

                {/* Photo Preview Thumbnail */}
                {newImageUrl && (
                  <div className="relative mb-2 rounded-xl overflow-hidden border border-emerald-500/30 max-h-48 bg-black/40 flex items-center justify-center">
                    <img src={newImageUrl} alt="Preview" className="max-h-48 w-full object-contain" />
                  </div>
                )}

                <input
                  type="text"
                  value={newImageUrl.startsWith('data:') ? '' : newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder={t('placeholder_image_url') || "Or paste an image URL (/samples/sample_arecanut.jpg)"}
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                >
                  {t('btn_cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-bold text-xs bg-[#275637] hover:bg-[#1E462B] text-white shadow-xs cursor-pointer"
                >
                  {t('btn_post') || 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FLOATING REDDIT CHAT TRIGGER ── */}
      {!isChatOpen && (
        <button
          onClick={() => handleOpenChat(null)}
          className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#275637] hover:bg-[#1E462B] text-white shadow-xl flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#91BA94]/50"
          title="Reddit-style 1-on-1 Farmer Chat"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="hidden xs:inline">Farmer Chat</span>
          <span className="xs:hidden">Chat</span>
        </button>
      )}

      {/* ── REDDIT-STYLE 1-ON-1 FARMER CHAT WINDOW ── */}
      <RedditChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetUser={chatTargetUser}
        isDark={isDark}
        currentUser={user}
      />

      {/* ── MOBILE BOTTOM NAVIGATION (CONSISTENT APP SHELL) ── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around py-1.5 px-2 backdrop-blur-md ${
        isDark ? 'bg-[#0B1712]/95 border-[#162C20]' : 'bg-[#F9F9F6]/95 border-[#91BA94]/60'
      }`}>
        <button 
          onClick={() => navigate('/home')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <span className="text-base">🌱</span>
          <span className="text-[10px] font-semibold">{t('nav_home') || 'Home'}</span>
        </button>

        <button 
          onClick={() => navigate(`/c/${activeCrop}`)}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#22C55E] font-bold' : 'text-[#275637] font-bold'
          }`}
        >
          <span className="text-base">💬</span>
          <span className="text-[10px] font-bold">{t('nav_community') || 'Community'}</span>
        </button>

        <button 
          onClick={() => navigate('/detect')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <Camera className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-semibold">{t('nav_detect') || 'Detect'}</span>
        </button>

        <button 
          onClick={() => navigate('/ai')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{t('nav_ai') || 'Sasya AI'}</span>
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{t('menu_profile') || 'Profile'}</span>
        </button>
      </nav>

    </div>
  );
}
