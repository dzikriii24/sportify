<<<<<<< HEAD
import { Calendar, MapPin, Users, DollarSign, Award, ChevronRight } from "lucide-react";
=======
import { Calendar, MapPin, Users, DollarSign, Award, ChevronRight, Clock } from "lucide-react";
>>>>>>> c3b976e27226ab57c90b65d0f76a1e4f877ec5f7
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
      className="group relative flex flex-col h-full overflow-hidden border border-gray-200 bg-white hover:border-[#006989]/50 hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-2xl active:scale-[0.99]"
    >
      {/* 1. HEADER IMAGE SECTION (Aspect Video) */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img 
          src={cover_url} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Badges on Image */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-[#006989] backdrop-blur-sm border-0 font-bold shadow-sm uppercase tracking-wider text-[10px]">
            {community_name}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
           <Badge className={`${statusColors[status]} border shadow-sm px-2 py-0.5 font-bold text-[10px]`}>
            {statusText[status]}
          </Badge>
        </div>
      </div>

      {/* 2. CONTENT BODY (Flex-1) */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#006989] transition-colors break-words leading-tight">
            {title}
          </h3>
        </div>

        {/* Event Details Grid - Flex Grow pushes footer down */}
        <div className="space-y-3 flex-grow mb-6">
          
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatDate(start_date)}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={10} />
                {formatTime(start_time)} - {formatTime(end_time)}
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{venue}</p>
              <p className="text-xs text-gray-500 truncate">{location}</p>
            </div>
          </div>

          {/* Level & Fee */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-4 h-4 text-orange-600" />
            </div>
            <div>
               <div className="flex items-center gap-2">
                 <p className="text-sm font-semibold text-gray-900">{level}</p>
                 <span className="text-gray-300">•</span>
                 <p className={`text-sm font-semibold ${fee > 0 ? 'text-[#006989]' : 'text-green-600'}`}>
                    {fee > 0 ? (
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" /> {fee.toLocaleString('id-ID')}
                      </span>
                    ) : 'Gratis'}
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* 3. FOOTER (Action & Participants) */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2">
            
            {/* Participants */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0"
                  >
                    <Users className="w-3 h-3 text-gray-500" />
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <span className="font-bold text-gray-900">{participants}</span>
                <span className="text-gray-500">/{max_participants}</span>
              </div>
            </div>

            {/* Button */}
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              disabled={status === "full" || status === "closed"}
              size="sm"
              className={`rounded-lg font-semibold transition-all duration-300 text-xs h-9 px-4
                ${status === "open" 
                  ? "bg-gradient-to-r from-[#006989] to-[#009ab5] hover:from-[#005a75] hover:to-[#008094] text-white shadow-md hover:shadow-lg" 
                  : status === "upcoming"
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                } flex items-center gap-1.5`}
            >
              {status === "open" && "Daftar"}
              {status === "full" && "Penuh"}
              {status === "upcoming" && "Segera"}
              {status === "closed" && "Selesai"}
              <ChevronRight size={14} className={`${status === "open" ? "group-hover:translate-x-0.5" : ""} transition-transform`} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventCard;