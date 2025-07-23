import { useState } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { MessageForm } from "@/components/MessageForm";
import { StatsSection } from "@/components/StatsSection";

const Index = () => {
  const [messageCount, setMessageCount] = useState(289);

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);
    setMessageCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-ngl relative overflow-hidden font-sans">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          {/* Dice emoji at the top */}
          <div className="text-center mb-2">
            <span className="text-3xl">🎲</span>
          </div>

          {/* Profile Section */}
          <div className="mb-6">
            <ProfileCard 
              username="NGL" 
              avatar="/placeholder.svg"
              isOnline={true}
            />
          </div>

          {/* Message Form */}
          <MessageForm onSendMessage={handleSendMessage} />

          {/* Stats and Download Section */}
          <div className="pt-6">
            <StatsSection friendCount={messageCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;