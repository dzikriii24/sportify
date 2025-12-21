import { Users, TrendingUp, Clock, CheckCircle, Plus, ChevronRight, Crown, MapPin } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface CommunityCardProps {
  name: string;
  sport: string;
  memberCount: number;
  members: { id: number; avatar: string }[];
  level: string;
  description: string;
  is_trending?: boolean;
  cover_url?: string;
  memberStatus?: 'pending' | 'approved' | 'rejected' | string;
  showQuickEvent?: boolean;
  onQuickEvent?: (e: React.MouseEvent) => void;
  onJoin?: () => void;
}

const CommunityCard = ({
  name,
  sport,
  memberCount,
  members,
  level,
  description,
  is_trending,
  cover_url,
  memberStatus,
  showQuickEvent,
  onQuickEvent,
  onJoin
}: CommunityCardProps) => {

  const renderStatusBadge = () => {
    if (memberStatus === 'approved') {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs">
          <CheckCircle size={12} /> Member
        </Badge>
      );
    }
    if (memberStatus === 'pending') {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200 gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs">
          <Clock size={12} className="animate-pulse" /> Pending
        </Badge>
      );
    }
    return null;
  };

  const levelColors: Record<string, string> = {
    'Pemula': 'bg-blue-100 text-blue-700',
    'Menengah': 'bg-green-100 text-green-700',
    'Lanjutan': 'bg-purple-100 text-purple-700',
    'Expert': 'bg-red-100 text-red-700',
    'All Levels': 'bg-gray-100 text-gray-700'
  };

  return (
    <Card
      onClick={onJoin}
      // PERBAIKAN 1: Gunakan flex-col dan h-full agar kartu mengisi grid tapi tingginya fleksibel
      className="group relative flex flex-col h-full overflow-hidden border border-gray-200 bg-white hover:border-[#006989]/50 hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-2xl active:scale-[0.99]"
    >
      {/* PERBAIKAN 2: Image Section (Header) 
          Menggunakan aspect-video (16:9) agar gambar responsif dan tidak menimpa teks */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={cover_url || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&h=300&fit=crop"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Badges Overlay on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
           <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm border-0 font-semibold shadow-sm">
              {sport}
           </Badge>
        </div>

        {is_trending && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 shadow-lg px-2 py-1 gap-1">
              <TrendingUp size={12} /> <span className="hidden xs:inline">Trending</span>
            </Badge>
          </div>
        )}
      </div>

      {/* PERBAIKAN 3: Content Body
          flex-1 membuat bagian ini mengisi sisa ruang. Jika teks membesar, dia mendorong footer ke bawah. */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Header Title & Level */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
             <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#006989] transition-colors break-words leading-tight">
                {name}
             </h3>
             <Badge className={`${levelColors[level] || 'bg-gray-100 text-gray-700'} border-0 font-semibold text-[10px] px-2 py-0.5 whitespace-nowrap`}>
                {level}
             </Badge>
          </div>
          
          <div className="mt-2 flex items-center gap-2">
             {renderStatusBadge()}
          </div>
        </div>

        {/* Description 
            flex-grow memastikan deskripsi mengambil ruang kosong, dan tidak terpotong (hapus line-clamp jika ingin semua teks tampil saat zoom) */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-grow break-words">
          {description}
        </p>

        {/* Footer - mt-auto memaksa footer selalu di bawah */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-end justify-between gap-2">
            
            {/* Left Section (Actions/Status) */}
            <div className="flex-1">
              {showQuickEvent ? (
                // LEADER VIEW
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Crown size={14} className="text-yellow-500 shrink-0" />
                    <span className="text-xs font-semibold text-yellow-600">Admin</span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Mencegah trigger onJoin saat klik tombol ini
                      onQuickEvent?.(e);
                    }}
                    size="sm"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#006989] to-[#009ab5] text-white hover:from-[#005a75] hover:to-[#008094] shadow-md h-8 text-xs"
                  >
                    <Plus size={14} className="mr-1.5" /> Buat Event
                  </Button>
                </div>
              ) : !memberStatus ? (
                // NON-MEMBER VIEW
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users size={14} />
                    <span className="text-xs font-medium">{memberCount} Anggota</span>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1 text-[#006989] text-xs font-bold animate-in fade-in">
                     <span>Gabung</span> <ChevronRight size={14} />
                  </div>
                </div>
              ) : (
                // MEMBER VIEW
                <div className="flex items-center gap-2 text-gray-500">
                    <Users size={14} />
                    <span className="text-xs font-medium">{memberCount} Anggota</span>
                </div>
              )}
            </div>

            {/* Right Section - Avatars */}
            <div className="flex -space-x-2 overflow-hidden pl-2">
              {members.slice(0, 3).map((member) => (
                <Avatar
                  key={member.id}
                  className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-white bg-gray-100 shrink-0"
                >
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-[10px]">U</AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 3 && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-gray-500">
                    +{memberCount - 3}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </Card>
  );
};

export default CommunityCard;