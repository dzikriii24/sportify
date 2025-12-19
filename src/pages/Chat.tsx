import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  Send, Image, Smile, Paperclip, 
  Users, Search, Info, ArrowLeft, 
  CheckCheck, Crown, Shield, MessageSquare
} from 'lucide-react';
// Pastikan file toast.ts sudah dibuat di folder src/utils/
import { showToast } from '../utils/toast';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level?: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  community_id: string;
  users: UserProfile;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  cover_url: string;
}

interface CommunityMember {
  role: 'member' | 'moderator' | 'leader' | 'admin';
  users: UserProfile;
}

const ChatPage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [community, setCommunity] = useState<Community | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Realtime State
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Refs (FIXED HERE)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Fix: Tambahkan | null dan inisialisasi dengan null
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 1. Initial Load
  useEffect(() => {
    if (communityId) {
      loadData();
    }
    
    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  // 2. Auto Scroll ke bawah saat ada pesan baru
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/login');
        return;
      }

      // Load Current User Profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (userData) setCurrentUser(userData);

      // Load Community Info
      const { data: communityData } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();
      setCommunity(communityData);

      // Check Membership
      const { data: membership } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', authUser.id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        showToast.error('Anda harus bergabung dengan komunitas ini terlebih dahulu.');
        navigate(`/community/${communityId}`);
        return;
      }

      // Load Messages
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select(`
          *,
          users (id, username, full_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;
      if (messagesData) setMessages(messagesData);

      // Load Members List
      const { data: membersData } = await supabase
        .from('community_members')
        .select(`
          role,
          users (id, username, full_name, avatar_url, level)
        `)
        .eq('community_id', communityId)
        .eq('status', 'active');

      if (membersData) setMembers(membersData as unknown as CommunityMember[]);

      // Setup Realtime setelah data user dimuat
      setupRealtimeSubscription(authUser.id);

    } catch (error: any) {
      console.error('Error loading data:', error);
      showToast.error('Gagal memuat chat.');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = (userId: string) => {
    if (!communityId) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase.channel(`room:${communityId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `community_id=eq.${communityId}`
      }, async (payload) => {
        const { data: senderUser } = await supabase
          .from('users')
          .select('id, username, full_name, avatar_url')
          .eq('id', payload.new.user_id)
          .single();

        const newMessageWithUser = {
          ...payload.new,
          users: senderUser
        } as Message;

        setMessages((prev) => [...prev, newMessageWithUser]);
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        
        const onlineIds = Object.keys(newState);
        setOnlineUsers(onlineIds);

        const typingIds = onlineIds.filter((key) => {
          const state = newState[key] as any[];
          return state[0]?.isTyping === true && key !== userId;
        });
        setTypingUsers(typingIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString(), isTyping: false });
        }
      });

    channelRef.current = channel;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !communityId || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          community_id: communityId,
          user_id: currentUser.id,
          content: messageContent,
        });

      if (error) throw error;

      setNewMessage('');
      setShowEmojiPicker(false);
      
      if (channelRef.current) {
        await channelRef.current.track({ isTyping: false });
      }

    } catch (error: any) {
      showToast.error('Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!channelRef.current || !currentUser) return;

    await channelRef.current.track({ isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      if (channelRef.current) {
        await channelRef.current.track({ isTyping: false });
      }
    }, 2000);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="text-yellow-600" size={14} />;
      case 'admin': return <Shield className="text-blue-600" size={14} />;
      case 'moderator': return <Shield className="text-green-600" size={14} />;
      default: return null;
    }
  };

  const getAvatarUrl = (avatarUrl: string | null | undefined, username: string | undefined) => {
    if (avatarUrl) return avatarUrl;
    const name = username || 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
  };

  const filteredMembers = members.filter(member =>
    member.users.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.users.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#006989] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-600">Memuat percakapan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Members */}
      {showMembers && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-20 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg md:shadow-none">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Anggota</h2>
              <button onClick={() => setShowMembers(false)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
                <ArrowLeft size={20} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anggota..."
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#006989] focus:bg-white transition text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                  <div className="relative">
                    <img
                      src={getAvatarUrl(member.users.avatar_url, member.users.username)}
                      alt={member.users.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {onlineUsers.includes(member.users.id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {member.users.full_name || member.users.username}
                      </div>
                      {getRoleIcon(member.role)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={`${onlineUsers.includes(member.users.id) ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        {onlineUsers.includes(member.users.id) ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/community/${community?.slug}`)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={community?.cover_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000'}
                    alt={community?.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-sm md:text-base">{community?.name}</h1>
                  <div className="flex items-center gap-2 text-xs">
                    {typingUsers.length > 0 ? (
                      <span className="text-[#006989] font-medium animate-pulse">
                        {typingUsers.length > 1 ? `${typingUsers.length} orang mengetik...` : 'Seseorang sedang mengetik...'}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {onlineUsers.length} online • {members.length} anggota
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className={`p-2 rounded-lg transition ${showMembers ? 'bg-[#006989] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Anggota"
              >
                <Users size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hidden md:block" title="Info">
                <Info size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] relative">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada pesan</h3>
              <p className="text-gray-500 max-w-xs text-sm">
                Jadilah yang pertama memulai percakapan di {community?.name}!
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-2">
              {messages.map((message, index) => {
                const isCurrentUser = message.user_id === currentUser?.id;
                const prevMessage = messages[index - 1];
                
                const showDate = index === 0 || 
                  new Date(message.created_at).toDateString() !== 
                  new Date(prevMessage.created_at).toDateString();

                const showAvatar = !isCurrentUser && (
                   !prevMessage || prevMessage.user_id !== message.user_id || showDate
                );

                return (
                  <React.Fragment key={message.id}>
                    {showDate && (
                      <div className="flex justify-center my-6 sticky top-0 z-0">
                        <div className="bg-gray-200/80 backdrop-blur-sm text-gray-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex group ${isCurrentUser ? 'justify-end' : 'justify-start items-end gap-2'}`}>
                      {!isCurrentUser && (
                        <div className="w-8 h-8 flex-shrink-0 mb-1">
                          {showAvatar ? (
                            <img
                              src={getAvatarUrl(message.users?.avatar_url, message.users?.username)}
                              alt={message.users?.username}
                              className="w-8 h-8 rounded-full border border-gray-200"
                            />
                          ) : <div className="w-8" />}
                        </div>
                      )}
                      
                      <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        {!isCurrentUser && showAvatar && (
                          <span className="text-xs text-gray-500 ml-1 mb-1 font-medium flex items-center gap-1">
                            {message.users?.full_name || message.users?.username}
                            {members.find(m => m.users.id === message.user_id)?.role !== 'member' && 
                              getRoleIcon(members.find(m => m.users.id === message.user_id)?.role || '')}
                          </span>
                        )}

                        <div 
                          className={`
                            relative px-4 py-2 shadow-sm break-words text-sm md:text-base
                            ${isCurrentUser 
                              ? 'bg-[#006989] text-white rounded-2xl rounded-tr-sm' 
                              : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm border border-gray-100'}
                          `}
                        >
                          {message.content}
                          <div className={`text-[10px] mt-1 text-right leading-none opacity-70 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                            {formatTime(message.created_at)}
                            {isCurrentUser && <CheckCheck size={12} className="inline ml-1 opacity-100" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input Area */}
        <div className="bg-white border-t border-gray-200 p-3 md:p-4">
          <div className="relative max-w-4xl mx-auto w-full">
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-4 z-50 shadow-xl rounded-lg border border-gray-200">
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={400}
                />
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex gap-1 pb-2">
                 <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
                  title="Emoji"
                >
                  <Smile size={22} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition hidden md:block" title="Lampirkan File">
                  <Paperclip size={22} />
                </button>
                 <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition hidden md:block" title="Gambar">
                  <Image size={22} />
                </button>
              </div>

              <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-[#006989] focus-within:bg-white transition-all border border-transparent">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ketik pesan..."
                  className="w-full bg-transparent focus:outline-none text-gray-800 max-h-32 py-1"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className={`
                  p-3 rounded-full shadow-md transition-all duration-200 flex items-center justify-center
                  ${!newMessage.trim() || isSending 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#006989] text-white hover:bg-[#005a75] hover:scale-105 active:scale-95'}
                `}
              >
                {isSending ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={20} className={newMessage.trim() ? "ml-0.5" : ""} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;