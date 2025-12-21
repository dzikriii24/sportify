import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; 
import { 
  Hash, Users, Send, Search, MapPin, Crown, ArrowLeft, Check, X, ShieldAlert, Clock, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import LeftSidebar from '../manual-components/LeftSidebar';

// --- Interfaces ---
interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  sender: Profile; // Relasi ke profile_user_fixs
}

interface Community {
  id: string;
  name: string;
  description: string;
  sport_type: string;
  slug: string;
  location: string;
  cover_url: string;
}

interface Member {
  id: string;
  role: string;
  status: 'pending' | 'approved';
  user: Profile; // Relasi ke profile_user_fixs
}

const CommunityChat = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- State Data ---
  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Member Management
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  
  // User & Permission State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [myStatus, setMyStatus] = useState<'pending' | 'approved' | 'guest'>('guest');

  // UI State
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  
  // Refresh Trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- 1. Load Data ---
  useEffect(() => {
    const loadData = async () => {
      if (refreshTrigger === 0) setIsLoading(true);

      // A. Get Auth User
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!user) {
        navigate('/login');
        return;
      }

      // B. Get Community Info
      // Note: Karena nama tabel diawali angka, pakai string biasa aman
      const { data: commData, error: commError } = await supabase
        .from('01_komunitas')
        .select('*')
        .eq('slug', slug)
        .single();

      if (commError || !commData) {
        console.error("Community Error:", commError);
        toast.error("Komunitas tidak ditemukan");
        navigate('/dashboard-community');
        return;
      }
      setCommunity(commData);

      // C. Get Chat History
      if (refreshTrigger === 0) {
        // Kita join ke profile_user_fixs sebagai 'sender'
        // Pastikan FK chat_community_fix.user_id -> profile_user_fixs.id ada di DB
        const { data: chatData, error: chatError } = await supabase
          .from('chat_community_fix')
          .select(`
            id, message, created_at, user_id,
            sender:profile_user_fixs(id, username, full_name, avatar_url)
          `)
          .eq('community_id', commData.id)
          .order('created_at', { ascending: true });
        
        if (chatError) console.error("Chat Error:", chatError);

        if (chatData) {
          const formattedChats = chatData.map((chat: any) => ({
             ...chat,
             // Handle jika sender null (misal user dihapus)
             sender: Array.isArray(chat.sender) ? chat.sender[0] : (chat.sender || { 
               id: chat.user_id, full_name: 'Unknown User', username: 'unknown' 
             })
          }));
          setMessages(formattedChats);
        }
      }

      // D. Get Members & Permission Check
      await fetchMembers(commData.id, user.id);

      if (refreshTrigger === 0) setIsLoading(false);
    };

    if (slug) loadData();
  }, [slug, navigate, refreshTrigger]);

  // Function: Fetch Members
  const fetchMembers = async (communityId: string, currentUserId: string) => {
    // Join ke profile_user_fixs sebagai 'user'
    const { data: memberData, error } = await supabase
      .from('02_anggota')
      .select(`
        id, role, status,
        user:profile_user_fixs(id, username, full_name, avatar_url)
      `)
      .eq('community_id', communityId);

    if (error) {
        console.error("Error fetching members:", error);
    }

    if (memberData) {
        const formattedMembers: Member[] = memberData
        .filter((m:any) => m.user) // Filter data yang usernya valid
        .map((m: any) => ({
           id: m.id,
           role: m.role,
           status: m.status || 'approved',
           user: Array.isArray(m.user) ? m.user[0] : m.user
        }));

        setActiveMembers(formattedMembers.filter(m => m.status === 'approved'));
        setPendingMembers(formattedMembers.filter(m => m.status === 'pending'));

        // Cek Status Saya
        const myMembership = formattedMembers.find(m => m.user.id === currentUserId);
        
        if (myMembership) {
            setMyStatus(myMembership.status);
            setIsLeader(myMembership.role === 'leader');
        } else {
            // Jika tidak ada di tabel anggota, set sebagai guest
            setMyStatus('guest'); 
            setIsLeader(false);
        }
    }
  };

  // --- 2. Realtime Subscription (Chat) ---
  useEffect(() => {
    if (!community) return;

    // Subscribe ke insert baru di tabel chat
    const channel = supabase
      .channel(`chat_room_${community.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_community_fix', 
          filter: `community_id=eq.${community.id}` 
        },
        async (payload) => {
          const newMsgRaw = payload.new;
          
          // Fetch sender info manual karena payload realtime ga bawa data join
          const { data: senderProfile } = await supabase
            .from('profile_user_fixs')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMsgRaw.user_id)
            .single();
          
          const completeMsg: ChatMessage = {
            id: newMsgRaw.id,
            message: newMsgRaw.message,
            created_at: newMsgRaw.created_at,
            user_id: newMsgRaw.user_id,
            sender: senderProfile || { 
                id: newMsgRaw.user_id, 
                username: 'Unknown', 
                full_name: 'Unknown', 
                avatar_url: '' 
            }
          };
          setMessages((prev) => [...prev, completeMsg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [community]);

  // Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Handlers ---
  
  // 1. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: Harus Approved atau Leader
    if (myStatus !== 'approved' && !isLeader) {
        return toast.error("Kamu belum menjadi anggota aktif.");
    }
    
    if (!newMessage.trim() || !currentUser || !community) return;

    const msgToSend = newMessage;
    setNewMessage(""); 

    // Insert ke chat table
    const { error } = await supabase
      .from('chat_community_fix')
      .insert({ 
          community_id: community.id, 
          user_id: currentUser.id, 
          message: msgToSend 
      });

    if (error) {
      console.error("Send Error:", error);
      toast.error("Gagal mengirim pesan");
      setNewMessage(msgToSend);
    }
  };

  // 2. Approve Member (ACC)
  const handleApproveMember = async (memberId: string) => {
    const toastId = toast.loading("Sedang memproses...");
    
    const { error } = await supabase
        .from('02_anggota')
        .update({ status: 'approved' })
        .eq('id', memberId);

    if (!error) {
        toast.success("Anggota berhasil diterima!", { id: toastId });
        setRefreshTrigger(prev => prev + 1);
    } else {
        console.error(error);
        toast.error("Gagal update database.", { id: toastId });
    }
  };

  // 3. Reject Member (Tolak)
  const handleRejectMember = async (memberId: string) => {
    if(!window.confirm("Yakin ingin menolak permintaan ini?")) return;
    
    const toastId = toast.loading("Sedang memproses...");
    const { error } = await supabase
        .from('02_anggota')
        .delete()
        .eq('id', memberId);

    if (!error) {
        toast.success("Permintaan ditolak", { id: toastId });
        setRefreshTrigger(prev => prev + 1);
    } else {
        toast.error("Gagal memproses.", { id: toastId });
    }
  };

  // 4. Join Community Request
  const handleJoinRequest = async () => {
    if (!currentUser || !community) return;
    const toastId = toast.loading("Mengirim request...");

    const { error } = await supabase
        .from('02_anggota')
        .insert({
            community_id: community.id,
            user_id: currentUser.id,
            role: 'member',
            status: 'pending'
        });

    if (!error) {
        toast.success("Request terkirim!", { id: toastId });
        setRefreshTrigger(prev => prev + 1);
    } else {
        console.error(error);
        toast.error("Gagal mengirim request.", { id: toastId });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    return isToday 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // --- FILTERED MESSAGES ---
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(msg => 
        msg.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
        msg.sender.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);


  // --- RENDER ---
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 animate-pulse font-medium">Memuat Komunitas...</div>;
  if (!community) return null;

  // ------------------------------------------------------------------
  //  VIEW: WAITING ROOM / GUEST VIEW
  // ------------------------------------------------------------------
  if ((myStatus === 'pending' || myStatus === 'guest') && !isLeader) {
    return (
        <div className="flex h-screen bg-gray-50 items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ${myStatus === 'pending' ? 'bg-orange-50 text-orange-500 ring-orange-100 animate-pulse' : 'bg-blue-50 text-blue-500 ring-blue-100'}`}>
                    {myStatus === 'pending' ? <Clock size={40} /> : <Users size={40} />}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {myStatus === 'pending' ? 'Permintaan Terkirim!' : `Gabung ${community.name}`}
                </h2>
                
                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                    {myStatus === 'pending' 
                        ? "Admin sedang meninjau permintaanmu untuk bergabung. Harap tunggu sebentar ya."
                        : "Kamu belum menjadi anggota komunitas ini. Yuk gabung untuk mulai mengobrol!"
                    }
                </p>
                
                <div className="flex flex-col gap-3">
                    {myStatus === 'guest' ? (
                        <button 
                            onClick={handleJoinRequest}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200"
                        >
                            Gabung Sekarang
                        </button>
                    ) : (
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium shadow-lg shadow-gray-200"
                        >
                            Refresh Status
                        </button>
                    )}
                    
                    <button 
                          onClick={() => navigate('/dashboard-community')}
                          className="w-full py-3 px-4 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition text-sm font-medium"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // ------------------------------------------------------------------
  //  VIEW: MAIN CHAT
  // ------------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-800">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="hidden md:block">
        <LeftSidebar /> 
      </div>

      {/* 2. CENTER: CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] md:border-r border-gray-200 relative">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white shadow-sm z-20 sticky top-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/dashboard-community')}
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white shadow-sm overflow-hidden">
                        {community.cover_url ? (
                            <img src={community.cover_url} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <Hash size={20} />
                        )}
                    </div>
                    <div>
                      <h1 className="font-bold text-gray-800 text-lg leading-tight">{community.name}</h1>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                            {community.sport_type}
                        </span>
                      </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500">
                {/* Search Input */}
                <div className="hidden lg:flex relative group">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari pesan..." 
                        className="bg-gray-100 text-sm rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-40 transition-all focus:w-64 border border-transparent focus:border-blue-500/30" 
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                          </button>
                    )}
                </div>
                
                <button 
                  className={`p-2 rounded-full transition-all ${showRightSidebar ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => setShowRightSidebar(!showRightSidebar)}
                >
                  <Users size={20} />
                </button>
            </div>
        </header>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#efeae2] scroll-smooth" ref={scrollRef} 
             style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundBlendMode: 'soft-light' }}>
            
            {filteredMessages.length === 0 && searchQuery && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white/50 backdrop-blur-sm rounded-xl m-4">
                    <Search size={40} className="mb-2 opacity-50" />
                    <p>Tidak ada pesan: "<strong>{searchQuery}</strong>"</p>
                </div>
            )}
            
            {messages.length === 0 && !searchQuery && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="bg-white/60 p-4 rounded-full mb-2"><Send size={24} className="opacity-50" /></div>
                    <p className="text-sm font-medium">Belum ada pesan. Mulai obrolan!</p>
                 </div>
            )}

            {filteredMessages.map((msg, index) => {
                const isSequence = index > 0 && filteredMessages[index - 1].user_id === msg.user_id;
                const isMe = msg.user_id === currentUser?.id;

                return (
                    <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isSequence ? 'mt-1' : 'mt-4'}`}>
                        <div className={`flex max-w-[75%] md:max-w-[60%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar */}
                            <div className="w-8 flex-shrink-0 flex flex-col items-end">
                                {!isSequence && !isMe && (
                                    <img 
                                        src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.username}`} 
                                        className="w-8 h-8 rounded-full object-cover shadow-sm bg-white"
                                        alt="avatar"
                                    />
                                )}
                            </div>

                            {/* Bubble */}
                            <div className={`relative px-4 py-2 shadow-sm ${isMe ? 'bg-[#d9fdd3] rounded-l-xl rounded-tr-xl rounded-br-none' : 'bg-white rounded-r-xl rounded-tl-xl rounded-bl-none'} ${isSequence && isMe ? 'rounded-br-xl rounded-tr-sm' : ''} ${isSequence && !isMe ? 'rounded-bl-xl rounded-tl-sm' : ''}`}>
                                
                                {!isSequence && !isMe && (
                                    <div className="text-[12px] font-bold text-orange-600 mb-0.5 cursor-pointer hover:underline">
                                        {msg.sender?.full_name || msg.sender?.username}
                                    </div>
                                )}

                                <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.message}
                                </p>

                                <div className={`text-[10px] mt-1 flex ${isMe ? 'justify-end text-green-800/60' : 'justify-end text-gray-400'}`}>
                                    {formatTime(msg.created_at)}
                                    {isMe && <Check size={12} className="ml-1 text-blue-500" />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-[#F0F2F5] border-t border-gray-200">
            <div className="bg-white rounded-2xl flex items-end p-2 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200 transition-all shadow-sm">
                <form onSubmit={handleSendMessage} className="flex-1 flex items-center mx-2 mb-0.5">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="bg-transparent w-full text-gray-800 placeholder-gray-500 focus:outline-none text-[15px] py-2 max-h-32 overflow-y-auto"
                    />
                </form>
                <button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()} 
                    className={`p-2 rounded-full transition-all mb-0.5 ${!newMessage.trim() ? 'text-gray-400 bg-transparent' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform active:scale-95'}`}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR */}
      {showRightSidebar && (
        <div className="w-80 bg-white flex-shrink-0 flex flex-col border-l border-gray-200 h-full overflow-hidden transition-all duration-300 shadow-xl z-10">
            
            {/* A. Cover & Info */}
            <div className="relative group h-40 flex-shrink-0">
                 <img 
                    src={community.cover_url || "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000"} 
                    className="w-full h-full object-cover" 
                    alt="Cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                 <div className="absolute bottom-4 left-4 text-white right-4">
                    <h2 className="font-bold text-xl leading-tight shadow-sm drop-shadow-md mb-1">{community.name}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-gray-200">
                        <MapPin size={12} className="text-red-400" /> 
                        <span className="truncate">{community.location || 'Indonesia'}</span>
                    </div>
                 </div>
            </div>

            {/* B. Description */}
            <div className="p-5 bg-white border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                    <Info size={12} /> Deskripsi
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {community.description || 'Tidak ada deskripsi.'}
                </p>
            </div>

            {/* C. Scrollable Lists */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6 bg-gray-50">
                
                {/* --- PENDING REQUESTS (HANYA MUNCUL DI LEADER) --- */}
                {isLeader && pendingMembers.length > 0 && (
                    <div className="bg-white border border-orange-200 rounded-xl p-3 shadow-sm ring-1 ring-orange-100">
                        <div className="flex items-center justify-between mb-3 border-b border-orange-50 pb-2">
                            <h3 className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert size={14} /> Requests 
                            </h3>
                            <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{pendingMembers.length}</span>
                        </div>
                        <div className="space-y-2">
                            {pendingMembers.map((m) => (
                                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-orange-50 hover:bg-orange-100/50 transition border border-transparent hover:border-orange-200">
                                     <div className="flex items-center gap-2 overflow-hidden">
                                        <img src={m.user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user.username}`} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" alt="avt" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-gray-800 truncate max-w-[80px]">{m.user.full_name}</span>
                                            <span className="text-[9px] text-gray-500">Ingin bergabung</span>
                                        </div>
                                     </div>
                                     <div className="flex gap-1">
                                        <button onClick={() => handleApproveMember(m.id)} className="w-7 h-7 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm"><Check size={14} strokeWidth={3} /></button>
                                        <button onClick={() => handleRejectMember(m.id)} className="w-7 h-7 flex items-center justify-center bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-50 shadow-sm"><X size={14} strokeWidth={3} /></button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- MEMBER LIST --- */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Anggota</h3>
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">{activeMembers.length}</span>
                    </div>

                    <div className="space-y-1">
                        {activeMembers.map((m, idx) => (
                            <div key={idx} className="group flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer transition-all duration-200">
                                 <div className="relative">
                                    <img 
                                        src={m.user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user.username}`} 
                                        className={`w-10 h-10 rounded-full object-cover border-2 ${m.role === 'leader' ? 'border-yellow-400' : 'border-transparent group-hover:border-white'}`} 
                                        alt="avt" 
                                    />
                                    {m.role === 'leader' ? (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-[3px] rounded-full shadow-sm ring-2 ring-white">
                                            <Crown size={8} fill="currentColor" />
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700 truncate">{m.user.full_name}</span>
                                        {m.role === 'leader' && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Owner</span>}
                                    </div>
                                    <span className="text-[10px] text-gray-400 truncate block">
                                        {m.role === 'leader' ? 'Community Leader' : 'Online'}
                                    </span>
                                 </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChat;