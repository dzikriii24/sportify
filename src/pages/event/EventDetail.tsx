import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  Calendar, Clock, MapPin, Users, ArrowLeft,
  Share2, ShieldCheck, Banknote, AlertCircle, ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

// --- Interfaces ---
interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  location: string;
  capacity: number;
  registered_count: number;
  fee: number;
  level: string;
  status: string;
  cover_url: string;
  venue?: { name: string }; // Optional jika join table venue
  community: {
    id: string;
    name: string;
    slug: string;
    avatar_url?: string; // Asumsi ada avatar
  };
}

interface Participant {
  user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Untuk loading tombol join

  // --- 1. Fetch Data Event & Participants ---
  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);

      // A. Get User Session (untuk cek isJoined)
      const { data: { user } } = await supabase.auth.getUser();

      // B. Get Event Detail
      const { data: eventData, error: eventError } = await supabase
        .from('eventsnew')
        .select(`
          *,
          community:01_komunitas (id, name, slug),
          venue:venuesnew (name)
        `)
        .eq('id', id)
        .single();

      if (eventError || !eventData) {
        toast.error("Event tidak ditemukan");
        navigate('/dashboard');
        return;
      }
      setEvent(eventData);

      // C. Get Participants List (Join ke profile)
      const { data: partData, error: partError } = await supabase
        .from('004_event_partisipants')
        .select(`
          user:profile_user_fixs (id, full_name, username, avatar_url)
        `)
        .eq('event_id', id);

      if (partData) {
        // @ts-ignore (Supabase type fix)
        setParticipants(partData);

        // Cek apakah user yg login sudah ada di list ini
        if (user) {
          const amIJoined = partData.some((p: any) => p.user.id === user.id);
          setIsJoined(amIJoined);
        }
      }

      setIsLoading(false);
    };

    if (id) fetchEventData();
  }, [id, navigate]);

  // --- 2. Handle Join Event ---
  const handleJoin = async () => {
    setIsProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Login dulu untuk join event!");
      setIsProcessing(false);
      navigate('/login');
      return;
    }

    if (!event) return;

    if (event.registered_count >= event.capacity) {
      toast.error("Yah, Event sudah penuh! 😭");
      setIsProcessing(false);
      return;
    }

    // 1. Insert ke tabel partisipan
    const { error: joinError } = await supabase
      .from('004_event_partisipants')
      .insert({
        event_id: event.id,
        user_id: user.id
      });

    if (joinError) {
      toast.error("Gagal join event.");
      console.error(joinError);
    } else {
      toast.success("Berhasil Join! Siapkan raketmu! 🎾");
      setIsJoined(true);

      // --- PERUBAHAN DISINI ---
      // Kita TIDAK PERLU update database 'eventsnew' manual lagi (sudah otomatis via SQL Trigger)

      // Cukup Update UI State (Optimistic UI) agar angka berubah di layar user saat ini
      setEvent(prev => prev ? ({ ...prev, registered_count: prev.registered_count + 1 }) : null);

      // Update list avatar peserta
      const { data: profile } = await supabase.from('profile_user_fixs').select('*').eq('id', user.id).single();
      if (profile) {
        // @ts-ignore
        setParticipants(prev => [...prev, { user: profile }]);
      }
    }
    setIsProcessing(false);
  };

  // --- 3. Handle Leave Event ---
  const handleLeave = async () => {
    if (!confirm("Yakin mau batal join? Slotmu akan diberikan ke orang lain.")) return;

    setIsProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !event) return;

    // 1. Delete dari tabel partisipan
    const { error } = await supabase
      .from('004_event_partisipants')
      .delete()
      .eq('event_id', event.id)
      .eq('user_id', user.id);

    if (error) {
      toast.error("Gagal leave event");
    } else {
      toast.success("Yah, sampai jumpa di event lain 👋");
      setIsJoined(false);

      // --- PERUBAHAN DISINI ---
      // Tidak perlu update DB manual. Cukup update UI State saja.
      setEvent(prev => prev ? ({ ...prev, registered_count: Math.max(0, prev.registered_count - 1) }) : null);

      // Hapus avatar user dari list
      setParticipants(prev => prev.filter(p => p.user.id !== user.id));
    }
    setIsProcessing(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading details...</div>;
  }

  if (!event) return null;

  // Helpers
  const isFull = event.registered_count >= event.capacity;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (time: string) => time.substring(0, 5);
  const formatRupiah = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* --- HERO IMAGE HEADER --- */}
      <div className="relative h-64 md:h-80 w-full bg-gray-900">
        <img
          src={event.cover_url || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000"}
          className="w-full h-full object-cover opacity-60"
          alt="Event Cover"
        />
        <div className="absolute top-0 left-0 w-full p-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3">

            {/* --- LEFT COLUMN: MAIN INFO --- */}
            <div className="lg:col-span-2 p-6 md:p-8">

              {/* Tags */}
              <div className="flex gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {event.level} Level
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {isFull ? 'Full Booked' : 'Open Slots'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-col gap-3 text-gray-600 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#006989]" size={20} />
                  <span className="font-medium">{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-[#006989]" size={20} />
                  <span className="font-medium">{formatTime(event.start_time)} WIB</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-[#006989]" size={20} />
                  <span className="font-medium">{event.venue?.name || event.location || 'Location TBA'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About Event</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {event.description || "Tidak ada deskripsi untuk event ini."}
                </p>
              </div>

              {/* Participants Grid */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Participants
                    <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {event.registered_count}/{event.capacity}
                    </span>
                  </h3>
                </div>

                {participants.length === 0 ? (
                  <div className="text-gray-400 italic text-sm">Belum ada peserta. Jadilah yang pertama!</div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {participants.map((p) => (
                      <div key={p.user.id} className="flex flex-col items-center group">
                        <div className="relative">
                          <img
                            src={p.user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.user.username}`}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover group-hover:scale-105 transition"
                            alt={p.user.full_name}
                            title={p.user.full_name}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
                          {p.user.username}
                        </span>
                      </div>
                    ))}
                    {/* Slot Kosong Placeholder */}
                    {[...Array(Math.max(0, event.capacity - event.registered_count))].slice(0, 5).map((_, i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <span className="text-gray-300 text-xs">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- RIGHT COLUMN: STICKY SIDEBAR --- */}
            <div className="bg-gray-50 p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col h-full">

              {/* Hosted By */}
              <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-blue-200 transition"
                onClick={() => navigate(`/community/${event.community.slug}`)}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  {event.community.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Hosted by</p>
                  <p className="font-semibold text-gray-900 truncate max-w-[150px]">{event.community.name}</p>
                </div>
              </div>

              {/* Price & Join Box */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Registration Fee</p>
                  <div className="flex items-baseline gap-1">
                    <h2 className="text-3xl font-extrabold text-[#006989]">
                      {formatRupiah(event.fee)}
                    </h2>
                    {event.fee > 0 && <span className="text-gray-400">/person</span>}
                  </div>
                </div>

                {/* Logic Tombol Join */}
                {isJoined ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center justify-center gap-2 font-bold border border-green-200">
                      <ShieldCheck size={20} />
                      Kamu Terdaftar!
                    </div>
                    <button
                      onClick={handleLeave}
                      disabled={isProcessing}
                      className="w-full py-3 text-red-500 font-semibold hover:bg-red-50 rounded-xl transition text-sm disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Batal Join (Leave)'}
                    </button>
                  </div>
                ) : isFull ? (
                  <button disabled className="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                    <AlertCircle size={20} /> Slot Penuh
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={isProcessing}
                    className="w-full py-4 bg-[#006989] hover:bg-[#005a75] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>Join Event <ArrowRight size={20} /></>
                    )}
                  </button>
                )}

                <div className="mt-6 flex justify-center">
                  <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-medium transition">
                    <Share2 size={16} /> Share Event
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;