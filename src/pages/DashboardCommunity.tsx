import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Plus, Users, Calendar,
  Search, ChevronDown,
  Sparkles, ArrowRight,
  Loader2,
  MapPin,
  Users as UsersIcon
} from "lucide-react";
import Navbar from "../manual-components/NavbarComunity";
import LeftSidebar from "../manual-components/LeftSidebar";
import RightSidebar from "../manual-components/RightSideBar";
import CommunityCard from "../manual-components/CommunityCard";
import EventCard from "../manual-components/EventCard";
import toast from "react-hot-toast";

// --- Interfaces ---
interface Community {
  id: string;
  name: string;
  sport_type: string;
  memberCount: number;
  members: any[];
  level: string;
  description: string;
  slug: string;
  location?: string;
  is_trending?: boolean;
  cover_url?: string;
}

interface Event {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  location: string;
  venue: string;
  participants: number;
  max_participants: number;
  level: string;
  status: "open" | "full" | "upcoming" | "closed";
  community_slug: string;
  community_name: string;
  fee: number;
  cover_url: string;
  registered_count: number;
  capacity: number;
}

interface MembershipInfo {
  status: 'pending' | 'approved' | 'rejected';
  role: 'member' | 'leader';
}

const DashboardCommunity = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"community" | "event">("community");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  // Data State
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Logic Membership (Map: community_id -> { status, role })
  const [myMemberships, setMyMemberships] = useState<Map<string, MembershipInfo>>(new Map());

  // --- Fetch Data Functions ---

  // 1. Cek User Gabung Dimana Saja & Statusnya
  const fetchMyMemberships = async (userId: string) => {
    const { data, error } = await supabase
      .from('02_anggota')
      .select('community_id, status, role')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching memberships:", error);
      return;
    }

    if (data) {
      const membershipMap = new Map<string, MembershipInfo>();
      data.forEach((item: any) => {
        membershipMap.set(item.community_id, {
          status: item.status,
          role: item.role
        });
      });
      setMyMemberships(membershipMap);
    }
  };

  // 2. Fetch Communities dengan cover_url dan location
  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('01_komunitas')
        .select(`
          *,
          members:02_anggota(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        sport: c.sport_type,
        sport_type: c.sport_type,
        memberCount: c.members[0]?.count || 0,
        members: [
          { id: 1, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}1` },
          { id: 2, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}2` },
          { id: 3, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}3` },
        ],
        level: c.level || "All Levels",
        description: c.description || "Komunitas olahraga yang seru dan aktif",
        slug: c.slug,
        location: c.location || "Jakarta",
        cover_url: c.cover_url || `https://images.unsplash.com/photo-${['1546519638-68e109498ffc', '1571019613454-76cb819af1f7', '1549060279-7e168fce7090'][Math.floor(Math.random() * 3)]}?q=80&w=1000&h=300&fit=crop`,
        is_trending: (c.members[0]?.count || 0) > 15
      }));

      setCommunities(formattedData);
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Gagal memuat komunitas");
    }
  };

  // 3. Fetch Events yang benar (dari table eventsnew)
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('eventsnew')
        .select(`
          *,
          community:01_komunitas(name, slug),
          venue:venuesnew(name, address)
        `)
        .order('start_date', { ascending: true })
        .limit(20);

      if (error) throw error;

      const formattedEvents = data.map((e: any) => {
        const startDate = new Date(`${e.start_date}T${e.start_time}`);
        const now = new Date();
        const isPast = startDate < now;

        let status: "open" | "full" | "upcoming" | "closed" = "upcoming";

        if (isPast) {
          status = "closed";
        } else if (e.registered_count >= e.capacity) {
          status = "full";
        } else if (e.status === 'upcoming' || e.status === 'open') {
          status = "open";
        }

        return {
          id: e.id,
          title: e.title,
          start_date: e.start_date,
          end_date: e.end_date,
          start_time: e.start_time,
          end_time: e.end_time,
          location: e.venue?.address || "Lokasi belum ditentukan",
          venue: e.venue?.name || "Venue",
          participants: e.registered_count || 0,
          max_participants: e.capacity || 16,
          level: e.level || "All Levels",
          status: status,
          community_slug: e.community?.slug,
          community_name: e.community?.name || "Umum",
          fee: e.fee || 0,
          cover_url: e.cover_url || `https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&h=300&fit=crop&seed=${e.id}`,
          registered_count: e.registered_count,
          capacity: e.capacity
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Gagal memuat event");
    }
  };

  // --- MAIN AUTH & LOAD LOGIC ---
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      setIsLoading(true);

      // 1. Cek Sesi User
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Anda harus login untuk mengakses halaman ini");
        navigate('/login');
        return;
      }

      setUserId(session.user.id);

      // 2. Load semua data paralel
      try {
        await Promise.all([
          fetchMyMemberships(session.user.id),
          fetchCommunities(),
          fetchEvents()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [navigate]);

  // --- Handlers & Logic ---

  const handleCreateCommunity = () => {
    setShowCreateMenu(false);
    navigate("/create-community");
  };

  const handleCreateEvent = (communitySlug?: string) => {
    setShowCreateMenu(false);
    if (communitySlug) navigate(`/create-event/${communitySlug}`);
    else navigate("/create-event");
  };

  const handleViewEvent = (id: string) => navigate(`/event/${id}`);

  // FIX: HANDLE COMMUNITY CLICK - NAVIGASI KE CHAT PAGE
  const handleCommunityClick = (community: Community) => {
    const membership = myMemberships.get(community.id);
    const status = membership?.status;

    if (status === 'approved') {
      // Navigasi ke page chat komunitas
      navigate(`/community/${community.slug}`);
      return;
    }
    

    // Jika belum approved, tampilkan popup join request
    if (status === 'pending') {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black/5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">Request dalam Review</p>
                <p className="mt-1 text-sm text-gray-500">Request kamu untuk {community.name} sedang ditinjau admin</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      ));
      return;
    }

    // Jika belum join, tampilkan popup konfirmasi
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex flex-col ring-1 ring-black/5`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900">Gabung ke {community.name}?</p>
              <p className="mt-1 text-sm text-gray-500">Request join untuk mengakses chat, event, dan fitur eksklusif komunitas ini.</p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-200">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              if (!userId) {
                toast.error("Sesi habis, silakan login ulang");
                navigate('/login');
                return;
              }

              // Optimistic UI Update
              setMyMemberships(prev => {
                const newMap = new Map(prev);
                newMap.set(community.id, { status: 'pending', role: 'member' });
                return newMap;
              });

              const { error } = await supabase
                .from('02_anggota')
                .insert({
                  community_id: community.id,
                  user_id: userId,
                  role: 'member',
                  status: 'pending'
                });

              if (error) {
                console.error("Error joining community:", error);

                // Revert state kalau gagal
                setMyMemberships(prev => {
                  const newMap = new Map(prev);
                  newMap.delete(community.id);
                  return newMap;
                });

                if (error.code === '23505') {
                  toast.error("Kamu sudah mengirim request join sebelumnya");
                } else {
                  toast.error("Gagal mengirim request join");
                }
              } else {
                toast.success(`Request terkirim ke admin ${community.name}`);

                // Update member count di community
                setCommunities(prev => prev.map(c => {
                  if (c.id === community.id) {
                    return { ...c, memberCount: c.memberCount + 1 };
                  }
                  return c;
                }));
              }
            }}
            className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Kirim Request
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 border-l border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    ));
  };

  // Filter Logic
  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sport_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.community_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-gray-200 border-t-[#006989] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#006989] to-[#009ab5] animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-600">Memuat dashboard...</p>
        <p className="text-sm text-gray-400">Mohon tunggu sebentar</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden font-sans">

      {/* 1. Navbar Fixed */}
      <div className="sticky top-0 z-50 shadow-sm">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* 2. Layout Container */}
      <div className="flex">

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth" id="main-content">
          <div className="max-w-7xl mx-auto pb-20">

            {/* Header Section */}
            <div className="mb-10 animate-fade-in">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-1 bg-gradient-to-b from-[#006989] to-[#009ab5] rounded-full"></div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                        {activeTab === "community" ? "🏸 Komunitas Olahraga" : "📅 Event & Turnamen"}
                      </h1>
                      <p className="text-gray-500 text-lg mt-2">
                        {activeTab === "community"
                          ? "Temukan komunitas dan teman main di sekitarmu"
                          : "Ikuti event seru dan tingkatkan skillmu"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Create Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                    className="flex items-center gap-3 bg-gradient-to-r from-[#006989] to-[#009ab5] text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <div className="relative">
                      <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </div>
                    <span>Buat Baru</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {showCreateMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowCreateMenu(false)}
                      />
                      <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 space-y-1">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">Buat baru</p>
                            <p className="text-xs text-gray-500">Pilih opsi di bawah</p>
                          </div>

                          <button
                            onClick={handleCreateCommunity}
                            className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Users size={24} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600">Komunitas</div>
                              <div className="text-xs text-gray-500">Buat grup olahraga baru</div>
                            </div>
                            <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                          </button>

                          <button
                            onClick={() => handleCreateEvent()}
                            className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Calendar size={24} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-purple-600">Event</div>
                              <div className="text-xs text-gray-500">Jadwalkan sesi latihan/turnamen</div>
                            </div>
                            <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content Switcher */}
            {activeTab === "community" ? (
              <>
                {/* Trending Section */}
                {communities.some(c => c.is_trending) && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-6 w-1 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-yellow-500 fill-yellow-500" size={22} />
                        <h2 className="text-2xl font-bold text-gray-900">Trending 🔥</h2>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {communities.filter(c => c.is_trending).map((community) => (
                        <div
                          key={`trending-${community.id}`}
                          onClick={() => handleCommunityClick(community)}
                          className="cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <CommunityCard
                            {...community}
                            sport={community.sport_type}
                            memberStatus={myMemberships.get(community.id)?.status}
                            onJoin={() => handleCommunityClick(community)}
                            showQuickEvent={myMemberships.get(community.id)?.role === 'leader'}
                            onQuickEvent={(e) => {
                              e?.stopPropagation();
                              handleCreateEvent(community.slug);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Communities List */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 w-1 bg-gradient-to-b from-[#006989] to-[#009ab5] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Semua Komunitas</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {filteredCommunities.length} komunitas
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#006989]/20 to-transparent"></div>
                  </div>

                  {filteredCommunities.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-4">
                        <Search className="text-gray-400" size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada komunitas ditemukan</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Coba gunakan kata kunci lain atau buat komunitas baru sendiri
                      </p>
                      <button
                        onClick={handleCreateCommunity}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#006989] to-[#009ab5] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        <Plus size={18} /> Buat Komunitas
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredCommunities.map((community) => (
                        <div
                          key={community.id}
                          // HAPUS onClick DI SINI (ini penyebab konflik/double trigger)
                          // onClick={() => handleCommunityClick(community)} 
                          className="h-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <CommunityCard
                            {...community}
                            sport={community.sport_type}
                            memberStatus={myMemberships.get(community.id)?.status}
                            // Pastikan onJoin terpasang di sini
                            onJoin={() => handleCommunityClick(community)}

                            showQuickEvent={myMemberships.get(community.id)?.role === 'leader'}
                            onQuickEvent={(e) => {
                              e?.stopPropagation();
                              handleCreateEvent(community.slug);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Event Tab Content
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Event Terbaru</h2>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {filteredEvents.length} event
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent"></div>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-4">
                      <Calendar className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum ada event</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Mulai buat event pertama atau tunggu event dari komunitas yang kamu ikuti
                    </p>
                    <button
                      onClick={() => handleCreateEvent()}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#006989] to-[#009ab5] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <Plus size={18} /> Buat Event
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        {...event}
                        onView={() => handleViewEvent(event.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Banner */}
            <div className="mt-16 p-8 bg-gradient-to-br from-[#006989] via-[#008ba3] to-[#006989] rounded-3xl text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                    Ingin membangun <span className="text-yellow-300">komunitas olahraga</span> sendiri?
                  </h3>
                  <p className="text-blue-100 text-base lg:text-lg max-w-2xl">
                    Jadilah admin komunitas, atur jadwal latihan, kelanggarkan event turnamen,
                    dan bangun jaringan pertemanan yang solid di satu platform.
                  </p>
                </div>
                <button
                  onClick={handleCreateCommunity}
                  className="px-8 py-4 bg-white text-[#006989] rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 flex items-center gap-3 whitespace-nowrap shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus size={20} />
                  Mulai Sekarang
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-10 -bottom-20 w-80 h-80 bg-white opacity-[0.03] rounded-full blur-3xl"></div>
              <div className="absolute -left-10 -top-20 w-60 h-60 bg-blue-300 opacity-[0.05] rounded-full blur-3xl"></div>
            </div>

          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default DashboardCommunity;