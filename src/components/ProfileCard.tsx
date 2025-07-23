import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface ProfileCardProps {
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

export const ProfileCard = ({ username, avatar, isOnline = true }: ProfileCardProps) => {
  return (
    <Card className="bg-white border-0 shadow-card p-4 rounded-3xl max-w-sm mx-auto">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-11 h-11">
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback className="bg-gradient-ngl text-white font-medium text-sm">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="font-medium text-black text-base">@{username}</div>
          <div className="text-sm text-gray-600 font-normal">send me anonymous messages!</div>
        </div>
      </div>
    </Card>
  );
};