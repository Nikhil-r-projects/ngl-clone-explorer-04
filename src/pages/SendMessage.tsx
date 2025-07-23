import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProfileCard } from "@/components/ProfileCard";
import { MessageForm } from "@/components/MessageForm";
import { StatsSection } from "@/components/StatsSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SendMessage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [recipientUser, setRecipientUser] = useState<any>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchRecipientUser();
    }
  }, [username]);

  const fetchRecipientUser = async () => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
        return;
      }

      setRecipientUser(data);
      
      // Fetch message count for this user
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', data.id);
        
      setMessageCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!recipientUser) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: message,
          recipient_id: recipientUser.id
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-ngl flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!recipientUser) {
    return (
      <div className="min-h-screen bg-gradient-ngl flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p className="mb-6">The profile you're looking for doesn't exist.</p>
          <Button
            variant="ngl"
            onClick={() => navigate("/")}
            className="px-6 py-2"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-ngl relative overflow-hidden font-sans">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Back button */}
        <div className="fixed top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Dice emoji at the top */}
          <div className="text-center mb-2">
            <span className="text-3xl">🎲</span>
          </div>

          {/* Profile Section */}
          <div className="mb-6">
            <ProfileCard 
              username={recipientUser.username} 
              avatar={recipientUser.avatar_url || "/placeholder.svg"}
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

export default SendMessage;