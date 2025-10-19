import { Users, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface CommunityCardProps {
  name: string;
  sport: string;
  memberCount: number;
  members: { id: number; avatar: string }[];
  level: string;
  description: string;
  trending?: boolean;
}

const CommunityCard = ({ name, sport, memberCount, members, level, description, trending }: CommunityCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50 group animate-scale-in text-[#006989]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors text-[#006989]">
                {name}
              </h3>
              {trending && (
                <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
              )}
            </div>
            <Badge variant="default" className="text-xs">
              {sport}
            </Badge>
          </div>
          <Badge className="bg-primary/10 text-[#006989] hover:text-primary hover:bg-primary/20">
            {level}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Members Section */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {memberCount} members
            </span>
          </div>

          {/* Member Avatars */}
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member) => (
              <Avatar
                key={member.id}
                className="w-8 h-8 border-2 bg-white border-[#006989]/50 transition-transform hover:scale-110 hover:z-10"
              >
                <AvatarImage src={member.avatar} />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
            ))}
            {memberCount > 4 && (
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#006989]/50 flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  +{memberCount - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CommunityCard;
