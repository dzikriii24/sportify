import { Calendar, MapPin, Users, Clock, DollarSign, Award, ChevronRight } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface EventCardProps {
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
  community_name: string;
  fee: number;
  cover_url: string;
  onView: () => void;
}

const EventCard = ({ 
  id,
  title, 
  start_date, 
  start_time, 
  end_time,
  location, 
  venue,
  participants, 
  max_participants, 
  level, 
  status,
  community_name,
  fee,
  cover_url,
  onView
}: EventCardProps) => {
  const statusColors = {
    open: "bg-green-100 text-green-700 border-green-200",
    full: "bg-red-100 text-red-700 border-red-200",
    upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    closed: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusText = {
    open: "TERBUKA",
    full: "PENUH",
    upcoming: "SEGERA",
    closed: "SELESAI"
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Card 
      onClick={onView}
      className="group relative overflow-hidden border border-gray-200 bg-white hover:border-[#006989]/50 hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-2xl animate-fade-in"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={cover_url} 
          alt={title}
          className="w-full h-48 object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/90 to-white"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header with Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#006989] rounded-full"></div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {community_name}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#006989] transition-colors line-clamp-2 mb-2">
              {title}
            </h3>
          </div>
          <Badge className={`${statusColors[status]} border px-3 py-1 font-semibold text-xs`}>
            {statusText[status]}
          </Badge>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{formatDate(start_date)}</p>
              <p className="text-xs text-gray-500">
                {formatTime(start_time)} - {formatTime(end_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{venue}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Level: {level}</p>
              <p className="text-xs text-gray-500">
                {fee > 0 ? (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Rp {fee.toLocaleString('id-ID')}
                  </span>
                ) : 'Gratis'}
              </p>
            </div>
          </div>
        </div>

        {/* Participants & Action */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
                >
                  <Users className="w-3 h-3 text-blue-600" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {participants} / {max_participants}
              </p>
              <p className="text-xs text-gray-500">Peserta</p>
            </div>
          </div>

          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            disabled={status === "full" || status === "closed"}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 
              ${status === "open" 
                ? "bg-gradient-to-r from-[#006989] to-[#009ab5] hover:from-[#005a75] hover:to-[#008094] text-white shadow-lg hover:shadow-xl" 
                : status === "upcoming"
                ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:bg-blue-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              } flex items-center gap-2`}
          >
            {status === "open" && "Daftar Sekarang"}
            {status === "full" && "Event Penuh"}
            {status === "upcoming" && "Segera Dibuka"}
            {status === "closed" && "Event Selesai"}
            <ChevronRight size={16} className={`${status === "open" ? "group-hover:translate-x-1" : ""} transition-transform`} />
          </Button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#006989]/20 pointer-events-none transition-all duration-300"></div>
    </Card>
  );
};

export default EventCard;