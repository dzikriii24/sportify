  import { Users, TrendingUp, Clock, CheckCircle, Plus, ChevronRight, MoreVertical, Crown } from "lucide-react";
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
          <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 gap-1.5 px-3 py-1">
            <CheckCircle size={12} /> Member
          </Badge>
        );
      }
      if (memberStatus === 'pending') {
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200 gap-1.5 px-3 py-1">
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
        onClick={onJoin} // Ini akan memanggil handleCommunityClick dari DashboardCommunity
        className="group relative overflow-hidden border border-gray-200 bg-white hover:border-[#006989]/50 hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-2xl h-full active:scale-[0.99]"
      >
        {/* Background Image with Gradient Overlay */}
        {cover_url && (
          <div className="absolute inset-0 z-0">
            <img
              src={cover_url}
              alt={name}
              className="w-full h-40 object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/95 to-white"></div>
          </div>
        )}

        {/* Trending Badge */}
        {is_trending && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 shadow-lg px-3 py-1 gap-1.5">
              <TrendingUp size={12} /> Trending
            </Badge>
          </div>
        )}

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006989] to-[#009ab5] flex items-center justify-center text-white font-bold">
                  {name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#006989] transition-colors truncate">
                    {name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs font-medium text-gray-600 border-gray-300">
                      {sport}
                    </Badge>
                    {renderStatusBadge()}
                  </div>
                </div>
              </div>
            </div>

            {/* Level Badge */}
            <Badge className={`${levelColors[level] || 'bg-gray-100 text-gray-700'} border-0 font-semibold px-3 py-1`}>
              {level}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-6 min-h-[40px] leading-relaxed">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-end justify-between pt-5 border-t border-gray-100">
            {/* Left Section */}
            <div className="flex flex-col justify-center">
              {showQuickEvent ? (
                // LEADER VIEW
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown size={14} className="text-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-600">Anda adalah Admin</span>
                  </div>
                  <Button
                    onClick={onQuickEvent}
                    size="sm"
                    className="bg-gradient-to-r from-[#006989] to-[#009ab5] text-white hover:from-[#005a75] hover:to-[#008094] shadow-md"
                  >
                    <Plus size={14} className="mr-2" /> Buat Event
                  </Button>
                </div>
              ) : !memberStatus ? (
                // NON-MEMBER VIEW
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {memberCount} members
                    </span>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-2 text-[#006989] text-sm font-bold animate-in fade-in slide-in-from-left-2">
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    Klik untuk gabung
                  </div>
                </div>
              ) : (
                // MEMBER VIEW
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {memberCount} members
                    </span>
                  </div>
                  {memberStatus === 'approved' && (
                    <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                      <CheckCircle size={12} /> Anggota aktif
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Section - Avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    className="w-9 h-9 border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm hover:scale-110 transition-transform"
                  >
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                ))}
                {memberCount > 4 && (
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-500">
                      +{memberCount - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#006989]/20 pointer-events-none transition-all duration-300"></div>
      </Card>
    );
  };

  export default CommunityCard;