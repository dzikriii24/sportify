import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  level: string;
  status: "open" | "full" | "upcoming";
}

const EventCard = ({ title, date, time, location, participants, maxParticipants, level, status }: EventCardProps) => {
  const statusColors = {
    open: "bg-green-500/10 text-green-600 border-green-500/20",
    full: "bg-red-500/10 text-red-600 border-red-500/20",
    upcoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50 group animate-scale-in text-[#006989]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex-1">
            {title}
          </h3>
          <Badge className={statusColors[status]}>
            {status.toUpperCase()}
          </Badge>
        </div>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>

        {/* Participants & Level */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              <span className="font-semibold">{participants}</span>
              <span className="text-muted-foreground">/{maxParticipants}</span>
            </span>
          </div>
          <Badge variant="default" className="text-xs">
            {level}
          </Badge>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full mt-2 bg-[#006989]/80 hover:bg-[#006989] text-[#EAEBED]"
          disabled={status === "full"}
        >
          {status === "full" ? "Event Full" : "Join Event"}
        </Button>
      </div>
    </Card>
  );
};

export default EventCard;
