// src/pages/Community.jsx - Reddit Replica for Crop Communities (r/arecanut, r/paddy, r/tomato, r/apple)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addCommunityComment, createCommunityPost, getCommunityComments, upvoteCommunityPost } from '../services/api';
import RedditChat from '../components/RedditChat';
import { 
  ArrowLeft, MessageSquare, Share2, Bookmark, Flag, 
  Send, Sparkles, Filter, AlertTriangle, ShieldCheck, 
  Sun, Moon, MapPin, Tag, Plus, CheckCircle2, ChevronDown,
  ChevronUp, Wrench, Clock, Users, Camera, Flame, 
  TrendingUp, Image as ImageIcon, Check, X, Search, MoreHorizontal
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

const INITIAL_POSTS = [
  {
    id: 1,
    crop: 'arecanut',
    author: 'Ramesh_Gowda',
    village: 'Venur, Dakshina Kannada',
    badge: 'Arecanut Cultivator (4ac)',
    timeAgo: '2 hours ago',
    flair: 'Disease Query',
    flairColor: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    title: 'Koleroga spotted after continuous mist. Is 1% Bordeaux mixture enough or should I add rosin sticker?',
    content: 'Noticed dark water-soaked rot starting on 3-month-old nut calyxes on the north-facing slope. Sasya ResNet scan flagged 96.4% confidence Koleroga (Phytophthora meadii). With Open-Meteo forecasting rainfall in 22 hours, is standard neutral Bordeaux spray sufficient or is rosin sticker mandatory to stop wash-off?',
    image: '/samples/sample_arecanut.jpg',
    aiBadge: 'Sasya AI Verified: Grade 2 Koleroga (Phytophthora meadii)',
    upvotes: 34,
    userVote: 1, // 1 for up, -1 for down, 0 for none
    saved: false,
    comments: [
      {
        id: 101,
        author: 'Dr_Hegde_CPCRI',
        badge: 'Verified Scientist',
        badgeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
        content: 'Ramesh, definitely add 100g Rosin sticker per 100L of 1% Bordeaux mixture. With the forecast predicting 14mm rain tomorrow afternoon, unbonded copper particles will wash off within 45 minutes. Complete spraying before 3 PM today while leaf surfaces are dry.',
        timeAgo: '1 hour ago',
        upvotes: 18,
        userVote: 0
      },
      {
        id: 102,
        author: 'Ganesh_Bhat_Thalli',
        badge: 'Experienced Grower',
        badgeColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        content: 'Also make sure to tie polyethene hoods (kotte) over the developing crown bunches if continuous monsoon spells persist next week. Prevention is 10x cheaper than harvesting dropped rotten nuts.',
        timeAgo: '42 mins ago',
        upvotes: 9,
        userVote: 0
      }
    ]
  },
  {
    id: 2,
    crop: 'arecanut',
    author: 'Prashanth_Hegde',
    village: 'Mandagadde, Tirthahalli',
    badge: 'Young Farmer Club',
    timeAgo: '4 hours ago',
    flair: 'Equipment Rental',
    flairColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    title: 'High-pressure 50ft power sprayer available for rent today & tomorrow (Tirthahalli taluk)',
    content: 'Reaches the highest palm tops from ground level without needing tree climbers. Includes 100m high-pressure braided hose and brass atomizing nozzle. Rent is ₹350/day. Cleaned and ready for Bordeaux application before the weekend monsoon front.',
    image: null,
    aiBadge: null,
    upvotes: 21,
    userVote: 0,
    saved: false,
    comments: [
      {
        id: 201,
        author: 'Suresh_Rai_Koppa',
        badge: 'Grower',
        badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        content: 'Prashanth, I need it tomorrow morning from 7 AM to 12 PM for 2 acres. DM me on WhatsApp!',
        timeAgo: '3 hours ago',
        upvotes: 4,
        userVote: 0
      }
    ]
  },
  {
    id: 3,
    crop: 'arecanut',
    author: 'Dr_S_K_Nayak',
    village: 'Brahmavar, Udupi',
    badge: 'Agronomy Specialist (KVK)',
    timeAgo: '7 hours ago',
    flair: 'Weather Advisory',
    flairColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    title: 'Bioclimatic Alert: Relative Humidity > 92% sustained across Coastal Ghats',
    content: 'Environmental station telemetry indicates 14 continuous hours above 90% RH with ambient temperatures between 21°C - 24°C. This is the exact epidemiological trigger for Phytophthora zoospore release. Complete all prophylactic canopy coverage during the morning dry window.',
    image: null,
    aiBadge: 'Open-Meteo High Bioclimatic Risk Verified',
    upvotes: 72,
    userVote: 0,
    saved: true,
    comments: []
  },
  {
    id: 4,
    crop: 'paddy',
    author: 'Manjunath_Mandya',
    village: 'Maddur, Mandya',
    badge: 'Paddy Grower',
    timeAgo: '3 hours ago',
    flair: 'Disease Query',
    flairColor: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    title: 'Eye-shaped spindle blast lesions on nursery seedlings (variety Jyothi)',
    content: 'Seedlings are 22 days old. Leaf blast lesions have greyish centers and dark brown margins. Should I drain the standing nursery water and apply Tricyclazole 75% WP @ 0.6g/L?',
    image: null,
    aiBadge: 'Sasya AI Verified: Magnaporthe oryzae (Leaf Blast)',
    upvotes: 19,
    userVote: 0,
    saved: false,
    comments: [
      {
        id: 401,
        author: 'KVK_Agronomist',
        badge: 'KVK Mandya',
        badgeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
        content: 'Yes, drain stagnant water immediately to reduce microclimate humidity. Spray Tricyclazole in early morning before sunlight breaks spore adhesion.',
        timeAgo: '2 hours ago',
        upvotes: 7,
        userVote: 0
      }
    ]
  },
  {
    id: 5,
    crop: 'tomato',
    author: 'Anand_Kolar',
    village: 'Bangarapet, Kolar',
    badge: 'Tomato Farmer',
    timeAgo: '5 hours ago',
    flair: 'Disease Query',
    flairColor: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    title: 'Water-soaked greasy patches on tomato fruit after two nights of fog',
    content: 'Rapid spreading observed on green fruits. Phytophthora infestans (Late Blight) suspected. What is the recommended curative tank mix before rain?',
    image: null,
    aiBadge: 'Sasya AI Verified: Phytophthora infestans (Late Blight)',
    upvotes: 27,
    userVote: 0,
    saved: false,
    comments: []
  },
  {
    id: 6,
    crop: 'apple',
    author: 'Kuldeep_Sharma',
    village: 'Theog, Shimla',
    badge: 'Orchardist (HP)',
    timeAgo: '6 hours ago',
    flair: 'Weather Advisory',
    flairColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    title: 'Post-harvest urea application timing for apple scab control',
    content: 'Harvest complete in higher elevation blocks. Preparing 5% urea spray on fallen orchard leaves to accelerate decomposition and destroy overwintering pseudothecia.',
    image: null,
    aiBadge: null,
    upvotes: 41,
    userVote: 0,
    saved: false,
    comments: []
  },
  {
    id: 7,
    crop: 'arecanut',
    author: 'Suresh_Hegde',
    village: 'Belthangady, Dakshina Kannada',
    badge: 'Arecanut Cultivator',
    timeAgo: '1 hour ago',
    flair: 'Labour Request',
    flairColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    title: '👥 URGENT: 3 Skilled Arecanut Palm Climbers Needed for Koleroga Spraying (Belthangady)',
    content: 'Need 3 experienced palm climbers for crown spraying and fungicide application across 6 acres in Belthangady taluk. Daily wage: ₹950/day + breakfast, lunch & travel allowance provided. Work starts this Thursday morning before monsoon showers resume.',
    image: null,
    aiBadge: null,
    upvotes: 48,
    userVote: 0,
    saved: false,
    comments: [
      {
        id: 701,
        author: 'Manju_Climber_Team',
        badge: 'Labour Group Lead',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        content: 'We are a crew of 4 trained palm climbers with safety harnesses. Available Thursday to Saturday. Sent you a DM on Reddit chat!',
        timeAgo: '35 mins ago',
        upvotes: 8,
        userVote: 0
      }
    ]
  },
  {
    id: 8,
    crop: 'paddy',
    author: 'Ganesh_Mandya',
    village: 'Maddur, Mandya',
    badge: 'Paddy Farmer',
    timeAgo: '2 hours ago',
    flair: 'Labour Request',
    flairColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    title: '👥 Paddy Transplanting Labour Group (6-8 Workers) Needed for 2 Days (Maddur basin)',
    content: 'Paddy nursery seedlings (Jyothi variety) are 22 days old and ready for field transplantation. Looking for a group of 6-8 experienced farm workers for 2 days. ₹650/day/worker with direct pickup from Maddur bus stand.',
    image: null,
    aiBadge: null,
    upvotes: 31,
    userVote: 0,
    saved: false,
    comments: []
  },
  {
    id: 9,
    crop: 'tomato',
    author: 'Venkatesh_Kolar',
    village: 'Bangarapet, Kolar',
    badge: 'Commercial Grower',
    timeAgo: '3 hours ago',
    flair: 'Labour Request',
    flairColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    title: '👥 4 Workers Needed for Bamboo Staking & Trellising Tomato Field (Bangarapet)',
    content: 'Need 4 workers experienced in bamboo staking, trellis wiring and nylon twine tying for semi-determinate tomato crop. Starting tomorrow 8:00 AM. ₹600/day.',
    image: null,
    aiBadge: null,
    upvotes: 22,
    userVote: 0,
    saved: false,
    comments: []
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { crop: cropParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, lang, setLang, toggleTheme, isDark, t } = useAuth();

  // Active Subreddit
  const activeCrop = cropParam && SUBREDDITS[cropParam.toLowerCase()] ? cropParam.toLowerCase() : 'arecanut';
  const currentSubreddit = SUBREDDITS[activeCrop];

  // Feed State - Persisted across refreshes in localStorage
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_community_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_POSTS;
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
                  const isScientist = (bc.author_id || '').includes('cpcri') || (bc.author_name || '').includes('Dr_');
                  currentComments.push({
                    id: `cloud_${bc.id || Date.now() + Math.random()}`,
                    author: bc.author_name || bc.author_id || 'Farmer',
                    badge: isScientist ? 'Verified Scientist' : 'Grower (Verified)',
                    badgeColor: isScientist 
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
      'Dr_Hegde_CPCRI': 'following',
      'Suresh_Hegde': 'following'
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

    const authorName = user?.username || user?.name?.replace(/\s+/g, '_') || 'Ramesh_Gowda';
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

    const authorName = user?.username || user?.name?.replace(/\s+/g, '_') || 'Ramesh_Gowda';
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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>

      {/* ── REDDIT TOP HEADER (HACKATHON THEME) ── */}
      <header className={`sticky top-0 z-40 border-b h-14 px-4 flex items-center justify-between backdrop-blur-md ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        {/* Left: Back & Subreddit Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/home')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link to={`/c/${activeCrop}`} className="flex items-center gap-2 font-black text-sm sm:text-base">
            <span className="text-xl">{currentSubreddit.icon}</span>
            <span className={isDark ? 'text-white' : 'text-[#275637]'}>{currentSubreddit.name}</span>
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
              placeholder={`Search ${currentSubreddit.name}...`}
              className={`w-full pl-9 pr-4 py-1.5 rounded-full text-xs font-medium border outline-none transition-all ${
                isDark 
                  ? 'bg-[#12241A] border-[#1E3A2B] text-white focus:border-[#22C55E]' 
                  : 'bg-white border-[#91BA94] text-[#275637] focus:ring-1 focus:ring-[#275637]'
              }`}
            />
          </div>
        </div>

        {/* Right Controls: Chat, Create Post CTA, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleOpenChat(null)}
            className={`px-3 py-1.5 rounded-full border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
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
            className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#275637] hover:bg-[#1E462B] text-white flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden">Post</span>
          </button>

          {/* Trilingual Switcher (Consistent Everywhere) */}
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
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-amber-400' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── SUBREDDIT BANNER ── */}
      <div className={`border-b ${isDark ? 'bg-[#102217] border-[#1A2820]' : 'bg-white border-[#D8E4DA]'}`}>
        <div className="h-16 sm:h-20 bg-gradient-to-r from-[#275637] via-[#1E462B] to-[#12241A] relative" />
        <div className="max-w-5xl mx-auto px-4 pb-3 flex items-end justify-between -mt-6 sm:-mt-8 relative z-10">
          <div className="flex items-end gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#F9F9F6] dark:border-[#102217] bg-[#12241A] flex items-center justify-center text-3xl sm:text-4xl shadow-md">
              {currentSubreddit.icon}
            </div>
            <div className="mb-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>{currentSubreddit.displayName}</span>
              </h1>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {currentSubreddit.name} • {currentSubreddit.members} • {currentSubreddit.online}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <button className="px-4 py-1.5 rounded-full font-bold text-xs bg-[#22C55E] text-[#0B1712] hover:bg-[#16A34A] cursor-pointer shadow-xs">
              Joined ✓
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ── LEFT FEED COLUMN (8 cols) ── */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Reddit Create Post Card */}
          <div 
            onClick={() => setIsCreateModalOpen(true)}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors shadow-xs ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] hover:border-gray-500' : 'bg-white border-[#D8E4DA] hover:border-[#275637]'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#275637] text-white flex items-center justify-center text-xs font-bold">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AR'}
            </div>
            <input 
              type="text" 
              readOnly 
              placeholder={`Create Post in ${currentSubreddit.name}...`}
              className={`flex-1 px-3.5 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-400' : 'bg-[#FAFCFA] border-[#D8E4DA] text-gray-500'
              }`}
            />
            <button className="p-2 rounded-lg text-gray-400 hover:text-[#275637] dark:hover:text-[#22C55E]">
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Reddit Sort & Filter Strip */}
          <div className={`p-2 rounded-xl border flex items-center justify-between text-xs font-bold shadow-xs ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#D8E4DA]'
          }`}>
            <div className="flex items-center gap-1">
              {[
                { id: 'hot', label: 'Hot', icon: Flame },
                { id: 'new', label: 'New', icon: Sparkles },
                { id: 'top', label: 'Top', icon: TrendingUp },
              ].map(sort => (
                <button
                  key={sort.id}
                  onClick={() => setSortFilter(sort.id)}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
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
              className={`px-2 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer ${
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
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
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
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
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
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold animate-fadeIn ${
              isDark ? 'bg-[#102217] border-[#1E3A2B] text-emerald-400' : 'bg-[#EBF3ED] border-[#91BA94] text-[#275637]'
            }`}>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Filtering discussions for <strong className="underline">"{searchQuery}"</strong> ({filteredPosts.length} matching {filteredPosts.length === 1 ? 'post' : 'posts'})
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="text-xs hover:underline text-gray-400 hover:text-rose-500 cursor-pointer shrink-0"
              >
                Clear Search ✕
              </button>
            </div>
          )}

          {/* Reddit Posts List */}
          {filteredPosts.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center text-xs text-gray-400 ${
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
                  className={`rounded-xl border transition-all duration-300 overflow-hidden shadow-xs hover:border-[#275637] dark:hover:border-gray-500 ${
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
                  <div className="flex items-start">
                    
                    {/* LEFT REDDIT VOTING STRIP (Desktop & Mobile) */}
                    <div className={`w-10 sm:w-12 pt-3 pb-2 flex flex-col items-center shrink-0 ${
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
                    <div className="flex-1 p-3 sm:p-4 min-w-0">
                      
                      {/* Post Metadata Header */}
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap mb-1.5">
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
                        {post.author !== (user?.username || 'Ramesh_Gowda') && (
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
                      </div>

                      {/* Post Title */}
                      <h2 className={`text-sm sm:text-base font-bold leading-snug tracking-tight mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {post.title}
                      </h2>

                      {/* Post Body */}
                      <p className={`text-xs sm:text-sm leading-relaxed mb-3 whitespace-pre-line ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {post.content}
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
                      <div className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments.length} Comments</span>
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
                          <span>Chat</span>
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>

                        <button
                          onClick={() => handleToggleSave(post.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                            post.saved ? 'text-amber-500' : ''
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${post.saved ? 'fill-amber-500' : ''}`} />
                          <span>{post.saved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>

                      {/* THREADED REDDIT COMMENT SECTION */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                          
                          {/* New Comment Input Box */}
                          <div className="space-y-2">
                            <span className="text-[11px] text-gray-400">
                              Comment as <strong className="text-emerald-500">u/{user?.username || 'Ramesh_Gowda'}</strong>
                            </span>
                            <div className="flex gap-2">
                              <textarea
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                placeholder="What are your thoughts?"
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
                                <span>Comment</span>
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
                                      {comment.content}
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-0.5">
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
                                        💬 Chat
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                                        className="hover:underline cursor-pointer hover:text-emerald-500 font-semibold flex items-center gap-0.5"
                                      >
                                        ↩ Reply
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(window.location.href);
                                          showToast('Link to comment thread copied!');
                                        }}
                                        className="hover:underline cursor-pointer"
                                      >
                                        Share
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
                                          placeholder={`Add to discussion with u/${comment.author}...`}
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
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleAddReply(post.id, comment.id, comment.author)}
                                            className="px-3.5 py-1 rounded-full font-bold text-xs bg-[#275637] hover:bg-[#1E462B] text-white flex items-center gap-1 cursor-pointer shadow-xs"
                                          >
                                            <Send className="w-3 h-3" />
                                            <span>Reply</span>
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
              <span>Create Post in {currentSubreddit.name}</span>
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">Flair / Category</label>
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
                    <span>Labour Request Specifications</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-[10px] text-gray-400 font-bold uppercase">Workers Needed</label>
                      <input
                        type="text"
                        value={labourWorkers}
                        onChange={(e) => setLabourWorkers(e.target.value)}
                        placeholder="e.g. 3 Skilled Tree Climbers"
                        className={`w-full p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-[#07100C] border-[#1E3A2B] text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] text-gray-400 font-bold uppercase">Daily Wage (₹)</label>
                      <input
                        type="text"
                        value={labourWage}
                        onChange={(e) => setLabourWage(e.target.value)}
                        placeholder="e.g. ₹900/day + food"
                        className={`w-full p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-[#07100C] border-[#1E3A2B] text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">Post Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    newFlair === 'Labour Request'
                      ? "e.g. 3 Tree Climbers Needed for Arecanut Harvesting in Belthangady"
                      : "Title: e.g. Yellow leaf spots appearing after yesterday's rain"
                  }
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">Text Content</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    newFlair === 'Labour Request'
                      ? "Specify work dates, location/taluk, lodging or food arrangements, contact preference..."
                      : "Describe crop symptoms, spray details, or question..."
                  }
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none resize-none ${
                    isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Photo Attachment: From Device Camera or File or URL */}
              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wider text-gray-400">
                  Attach Photo (Camera / Device or URL)
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
                    <span>Upload Photo from Device</span>
                  </button>
                  {newImageUrl && (
                    <button
                      type="button"
                      onClick={() => setNewImageUrl('')}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
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
                  placeholder="Or paste an image URL (/samples/sample_arecanut.jpg)"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-bold text-xs bg-[#275637] hover:bg-[#1E462B] text-white shadow-xs cursor-pointer"
                >
                  Post
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
          className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-[#275637] hover:bg-[#1E462B] text-white shadow-xl flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#91BA94]/50"
          title="Reddit-style 1-on-1 Farmer Chat"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span>Farmer Chat (Private)</span>
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

    </div>
  );
}
