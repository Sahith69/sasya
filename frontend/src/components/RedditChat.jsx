// src/components/RedditChat.jsx - Reddit-Style 1-on-1 Farmer Private Conversations
// 100% Anonymous: Strict pseudonymous handles (u/username), zero phone numbers, zero land records
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Shield, ShieldCheck, Minimize2, Maximize2, 
  MessageSquare, User, Check, MoreVertical, Ban, Trash2, 
  Sparkles, CheckCircle2, Search, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage, getChatMessages } from '../services/api';

const INITIAL_CONVERSATIONS = [
  {
    id: 'dr_agronomist',
    username: 'Dr_Agronomist',
    displayName: 'Dr. Agronomist',
    badge: 'Agronomy Specialist',
    badgeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    avatar: 'DA',
    crop: 'Arecanut Pathology',
    location: 'Bantwal Centroid',
    online: true,
    unread: 1,
    messages: [
      {
        id: 1,
        sender: 'Dr_Agronomist',
        text: 'Namaskara! Saw your post regarding Koleroga in Venur. What is the current bunch age in that north-slope block?',
        time: '10:14 AM',
        isMe: false
      },
      {
        id: 2,
        sender: 'me',
        text: 'Around 3 to 3.5 months, doctor. Calyx water-soaking just started after 2 days of mist.',
        time: '10:20 AM',
        isMe: true
      },
      {
        id: 3,
        sender: 'Dr_Agronomist',
        text: 'Good catch early. Stick to 1% neutral Bordeaux mixture + rosin sticker before 3 PM today. If rain starts tonight, hold off on chemical sprays until the canopy is dry.',
        time: '10:28 AM',
        isMe: false
      }
    ]
  },
  {
    id: 'prashanth',
    username: 'Prashanth_P',
    displayName: 'Prashanth',
    badge: 'Young Farmer Club',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    avatar: 'PP',
    crop: 'Arecanut (12ac)',
    location: 'Tirthahalli Centroid',
    online: true,
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'Prashanth_P',
        text: 'Hey! Are you still looking to rent the 50ft power sprayer tomorrow morning? Another grower from Sullia asked for the afternoon slot.',
        time: '9:05 AM',
        isMe: false
      },
      {
        id: 2,
        sender: 'me',
        text: 'Yes! Need it from 7 AM to 11 AM to cover 2 acres on my upper terrace.',
        time: '9:12 AM',
        isMe: true
      },
      {
        id: 3,
        sender: 'Prashanth_P',
        text: 'Done, reserved for you. Let us coordinate equipment pickup here on chat.',
        time: '9:15 AM',
        isMe: false
      }
    ]
  },
  {
    id: 'suresh',
    username: 'Suresh_Koppa',
    displayName: 'Suresh',
    badge: 'Grower',
    badgeColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    avatar: 'SK',
    crop: 'Arecanut & Paddy',
    location: 'Koppa Centroid',
    online: false,
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'Suresh_Koppa',
        text: 'How is the fruit rot situation on your hill slope? We had 18mm rain yesterday in Koppa and humidity is above 94%.',
        time: 'Yesterday',
        isMe: false
      }
    ]
  }
];

export default function RedditChat({ 
  isOpen, 
  onClose, 
  targetUser = null, 
  isDark = false,
  currentUser = null
}) {
  const auth = useAuth?.() || {};
  const t = auth.t || ((k) => k);
  const currentLoggedInUser = currentUser || auth.user;
  const myUsername = currentLoggedInUser?.username || 'me';

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('sasya_reddit_dms');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [activeConvId, setActiveConvId] = useState('dr_agronomist');
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showToast, setShowToast] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Live Cloud Synchronization (Fetches real messages sent by other devices / users)
  const syncCloudMessages = async () => {
    if (!activeConv?.username) return;
    const partner = activeConv.username;
    const me = myUsername;

    try {
      const cloudMsgs = await getChatMessages(me, partner);
      if (Array.isArray(cloudMsgs) && cloudMsgs.length > 0) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.username.toLowerCase() === partner.toLowerCase() || c.id === activeConvId) {
              const currentMsgs = [...c.messages];
              let hasNew = false;

              for (const cm of cloudMsgs) {
                const exists = currentMsgs.some(
                  (m) => (m.text?.trim() === cm.text?.trim() && m.sender?.toLowerCase() === cm.sender?.toLowerCase()) || m.id === cm.id
                );
                if (!exists) {
                  currentMsgs.push(cm);
                  hasNew = true;
                }
              }

              if (hasNew) {
                return { ...c, messages: currentMsgs };
              }
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.warn("Could not sync cloud chat:", err);
    }
  };

  // Poll cloud messages on active conversation change and every 3.5 seconds
  useEffect(() => {
    syncCloudMessages();
    const interval = setInterval(syncCloudMessages, 3500);
    return () => clearInterval(interval);
  }, [activeConvId, myUsername]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConvId, isTyping]);

  // Persist conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sasya_reddit_dms', JSON.stringify(conversations));
    } catch (e) {
      console.warn("Could not save chat state", e);
    }
  }, [conversations]);

  // Real-Time Cross-Tab & Cross-Window Live Synchronization
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel('sasya_reddit_farmer_chat');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CHAT_MESSAGE') {
          const { convId, message } = event.data;
          setConversations((prev) => 
            prev.map((c) => {
              if (c.id === convId && !c.messages.some((m) => m.id === message.id)) {
                return { ...c, messages: [...c.messages, message] };
              }
              return c;
            })
          );
        }
      };
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'sasya_reddit_dms' && e.newValue) {
        try {
          setConversations(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Open direct chat when targetUser prop changes
  useEffect(() => {
    if (targetUser) {
      const existing = conversations.find(c => 
        c.username.toLowerCase() === targetUser.username.toLowerCase() || 
        c.id === targetUser.id
      );

      if (existing) {
        setActiveConvId(existing.id);
        setIsMinimized(false);
      } else {
        // Create new conversation thread
        const newConv = {
          id: `conv_${Date.now()}`,
          username: targetUser.username,
          displayName: targetUser.name || targetUser.username,
          badge: targetUser.badge || 'Fellow Grower',
          badgeColor: targetUser.badgeColor || 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          avatar: targetUser.username.substring(0, 2).toUpperCase(),
          crop: targetUser.crop || 'Crop Cultivator',
          location: targetUser.village || 'Regional Centroid',
          online: true,
          unread: 0,
          messages: [
            {
              id: Date.now(),
              sender: targetUser.username,
              text: `Namaskara! Started private discussion with you from community feed.`,
              time: 'Just now',
              isMe: false
            }
          ]
        };

        setConversations([newConv, ...conversations]);
        setActiveConvId(newConv.id);
        setIsMinimized(false);
      }
    }
  }, [targetUser]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const getSimulatedReply = (partnerName, userMsg) => {
    const lower = userMsg.toLowerCase();
    if (partnerName.includes('Agronomist') || partnerName.includes('Doctor') || partnerName.includes('Dr')) {
      if (lower.includes('bordeaux') || lower.includes('koleroga') || lower.includes('spray')) {
        return 'Neutralize the Bordeaux mix carefully (pH 7.0-7.2) and add 100g Rosin sticker per 100L. Spray before 3 PM while foliage is dry.';
      }
      if (lower.includes('blast') || lower.includes('paddy')) {
        return 'For blast lesions, apply Tricyclazole 75% WP @ 0.6g/L during early morning hours. Drain standing basin water if humidity is above 90%.';
      }
      return 'Namaskara! I am reviewing the satellite bioclimatic telemetry for your taluk. Ensure prophylactic canopy protection before evening showers.';
    }
    if (lower.includes('labour') || lower.includes('worker') || lower.includes('climber') || lower.includes('wage')) {
      return 'Namaskara! We have a group of skilled climbers and harvesters available this week. Can coordinate directly at the village junction.';
    }
    if (lower.includes('rent') || lower.includes('sprayer') || lower.includes('equipment')) {
      return 'Equipment is cleaned, pressure-tested, and ready for pickup. Will keep the brass atomizing nozzle set aside for you.';
    }
    return `Namaskara! Received your message regarding ${activeConv?.crop || 'crop cultivation'}. Tracking field conditions here.`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConv) return;

    if (blockedUsers.includes(activeConv.username)) {
      setShowToast(`Cannot message blocked user u/${activeConv.username}`);
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    const newMsg = {
      id: `local_${Date.now()}`,
      sender: myUsername,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    const targetConvId = activeConv.id;
    const targetUsername = activeConv.username;

    const nextConvs = conversations.map(c => {
      if (c.id === targetConvId) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    setConversations(nextConvs);
    setInputText('');
    try {
      localStorage.setItem('sasya_reddit_dms', JSON.stringify(nextConvs));
    } catch {}

    // Broadcast across local browser tabs
    try {
      const channel = new BroadcastChannel('sasya_reddit_farmer_chat');
      channel.postMessage({ type: 'CHAT_MESSAGE', convId: targetConvId, message: newMsg });
      channel.close();
    } catch {}

    // Transmit to Cloud Relay (Delivers in real time to other devices / phones)
    try {
      await sendChatMessage({
        sender: myUsername,
        recipient: targetUsername,
        text: text
      });
    } catch (err) {
      console.info("Chat saved locally:", err);
    }

    // AI Agronomist Simulation: Only auto-replies when messaging Dr_Agronomist / Doctor persona
    const isAiPersona = targetUsername.toLowerCase().includes('agronomist') || targetUsername.toLowerCase().includes('doctor');
    if (isAiPersona) {
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        const replyText = getSimulatedReply(targetUsername, text);
        const replyMsg = {
          id: `bot_${Date.now()}`,
          sender: targetUsername,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };

        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: [...c.messages, replyMsg]
              };
            }
            return c;
          });
          try {
            localStorage.setItem('sasya_reddit_dms', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        try {
          const channel = new BroadcastChannel('sasya_reddit_farmer_chat');
          channel.postMessage({ type: 'CHAT_MESSAGE', convId: targetConvId, message: replyMsg });
          channel.close();
        } catch {}

        try {
          await sendChatMessage({
            sender: targetUsername,
            recipient: myUsername,
            text: replyText
          });
        } catch {}
      }, 1300);
    }
  };

  const handleBlockUser = () => {
    if (!activeConv) return;
    setBlockedUsers([...blockedUsers, activeConv.username]);
    setShowOptionsMenu(false);
    setShowToast(`u/${activeConv.username} has been blocked.`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleClearHistory = () => {
    if (!activeConv) return;
    setConversations(conversations.map(c => {
      if (c.id === activeConv.id) {
        return { ...c, messages: [] };
      }
      return c;
    }));
    setShowOptionsMenu(false);
    setShowToast(`Chat history with u/${activeConv.username} cleared.`);
    setTimeout(() => setShowToast(null), 3000);
  };

  if (!isOpen) return null;

  // Filter conversations by search
  const filteredConversations = conversations.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`fixed z-50 rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-card-in ${
      isMinimized 
        ? 'bottom-20 right-2 sm:bottom-4 sm:right-4 h-14 w-[calc(100vw-1rem)] sm:w-80' 
        : 'bottom-20 inset-x-2 sm:bottom-4 sm:inset-x-auto sm:right-4 h-[520px] max-h-[75vh] w-auto sm:w-[480px] md:w-[600px]'
    } ${
      isDark ? 'bg-[#0B1712] border-[#1E3A2B] text-white' : 'bg-[#FFFFFF] border-[#D8E4DA] text-[#275637]'
    }`}>
      
      {/* ── CHAT TOP HEADER ── */}
      <div className={`h-14 px-4 flex items-center justify-between border-b shrink-0 ${
        isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E4DA]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#275637] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            💬
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
              <span>Reddit Chat (Direct Messages)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Anonymous
              </span>
            </div>
            <div className={`text-[10px] font-mono ${isDark ? 'text-gray-400' : 'text-[#556B5C]'}`}>
              Zero phone numbers or real identities exposed
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
            title={isMinimized ? "Expand Chat" : "Minimize Chat"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {showToast && (
        <div className="p-2.5 bg-emerald-700 text-white text-xs font-bold text-center animate-fadeIn shrink-0">
          {showToast}
        </div>
      )}

      {/* ── CHAT BODY: 2 COLUMN (Conversations List + Active Message Thread) ── */}
      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: CONVERSATION LIST (Hidden on small mobile if thread is active) */}
          <div className={`w-36 sm:w-48 border-r flex flex-col shrink-0 ${
            isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#D8E4DA]'
          }`}>
            
            {/* Search DMs */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('placeholder_search_dms') || "Search DMs..."}
                className={`w-full px-2.5 py-1 text-xs rounded-lg border outline-none ${
                  isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-white border-[#D8E4DA] text-gray-800'
                }`}
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/40">
              {filteredConversations.map((c) => {
                const isActive = activeConv?.id === c.id;
                const isBlocked = blockedUsers.includes(c.username);
                const lastMsg = c.messages[c.messages.length - 1];

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full p-2.5 text-left flex items-start gap-2 transition-colors cursor-pointer ${
                      isActive 
                        ? isDark ? 'bg-[#163022]' : 'bg-[#E8F2EA]'
                        : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-[#275637] text-white flex items-center justify-center text-[10px] font-bold">
                        {c.avatar}
                      </div>
                      {c.online && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border border-white dark:border-[#0B1712]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] truncate">
                          u/{c.username}
                        </span>
                        {isBlocked && (
                          <span className="text-[9px] text-rose-500 font-bold">Blocked</span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {lastMsg ? lastMsg.text : 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reddit Privacy Footer Notice */}
            <div className={`p-2 border-t text-[10px] leading-tight flex items-center gap-1.5 ${
              isDark ? 'border-[#1E3A2B] text-gray-400' : 'border-[#D8E4DA] text-[#556B5C]'
            }`}>
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Strict pseudonymous privacy</span>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE THREAD */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
              
              {/* Active User Top Bar */}
              <div className={`p-2.5 px-3 border-b flex items-center justify-between shrink-0 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E4DA]'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#275637] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {activeConv.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs flex items-center gap-1.5 truncate">
                      <span>u/{activeConv.username}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${activeConv.badgeColor}`}>
                        {activeConv.badge}
                      </span>
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>{activeConv.crop}</span>
                      <span>•</span>
                      <span>{activeConv.location}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showOptionsMenu && (
                    <div className={`absolute right-0 mt-1 w-44 rounded-xl border shadow-xl py-1.5 z-20 text-xs ${
                      isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white' : 'bg-white border-[#D8E4DA] text-gray-800'
                    }`}>
                      <button
                        onClick={handleBlockUser}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Block u/{activeConv.username}</span>
                      </button>
                      <button
                        onClick={handleClearHistory}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Chat History</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Thread Scrollable Area */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                
                {/* Reddit Privacy Disclaimer Header */}
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-300' : 'bg-[#EBF3ED] border-[#91BA94] text-[#275637]'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Privacy Protection:</strong> Phone numbers, personal identity, and exact GPS farm boundaries are never revealed. Messages are private between you and <strong>u/{activeConv.username}</strong>.
                  </div>
                </div>

                {/* Messages */}
                {activeConv.messages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400 italic">
                    Start a private discussion with u/{activeConv.username}.
                  </div>
                ) : (
                  activeConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.isMe
                          ? 'bg-[#275637] text-white rounded-br-xs shadow-xs'
                          : isDark ? 'bg-[#142C1E] text-gray-200 border border-[#1E3A2B] rounded-bl-xs' : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-xs'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono mt-0.5 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start animate-fadeIn">
                    <div className={`rounded-2xl px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                      isDark ? 'bg-[#142C1E] text-emerald-400 border border-[#1E3A2B]' : 'bg-gray-100 text-emerald-700'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[10px] ml-1 font-semibold">u/{activeConv.username} is typing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Message Input Bar */}
              <form onSubmit={handleSendMessage} className={`p-2.5 border-t flex items-center gap-2 shrink-0 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-[#D8E4DA]'
              }`}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('placeholder_message_user') || `Message u/${activeConv.username}...`}
                  className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-medium ${
                    isDark ? 'bg-[#07100C] border-[#1E3A2B] text-white focus:border-[#22C55E]' : 'bg-white border-[#D8E4DA] text-gray-800 focus:border-[#275637]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-[#275637] hover:bg-[#1E462B] text-white shadow-xs cursor-pointer disabled:opacity-40 transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              Select a conversation to start chatting
            </div>
          )}

        </div>
      )}

    </div>
  );
}
