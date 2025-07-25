import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const prompts = [
  "how tall r u",
  "are u single?",
  "what's your biggest secret?",
  "who do you have a crush on?",
  "what's your biggest fear?",
  "what's something you've never told anyone?",
  "what's your most embarrassing moment?",
  "if you could change one thing about yourself, what would it be?",
  "what's your dream job?",
  "do u believe in second chances?",
];

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [recipientUser, setRecipientUser] = useState<any>(null);
  const [message, setMessage] = useState("how tall r u");
  const [loading, setLoading] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [friendCount, setFriendCount] = useState(305);

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
        .maybeSingle();

      if (error) {
        console.error('Error fetching user:', error);
      }

      setRecipientUser(data);
      
      if (data) {
        // Fetch message count for this user
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', data.id);
          
        setFriendCount(count || 305);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomPrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setMessage(randomPrompt);
  };

  const handleSend = async () => {
    if (!message.trim() || !recipientUser) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: message,
          recipient_id: recipientUser.id
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setShowThankYou(true);
      setMessage("");
      setFriendCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!recipientUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p className="mb-6">The profile you're looking for doesn't exist.</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex flex-col items-center justify-center p-4 text-white">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold">Message sent!</h1>
          <p className="text-lg opacity-90">Your anonymous message has been delivered</p>
          
          <div className="space-y-4 mt-8">
            <div className="text-yellow-300 text-lg">
              👇 {friendCount} friends just tapped the button 👇
            </div>
            
            <Button
              onClick={() => navigate("/")}
              className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 text-lg font-semibold w-full max-w-sm"
            >
              Get your own messages!
            </Button>
            
            <div className="flex gap-4 text-sm opacity-75 mt-6">
              <span>Terms</span>
              <span>Privacy</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 text-white text-sm">
        <span>8:58 PM</span>
        <div className="flex items-center gap-1">
          <span className="text-xs">📶</span>
          <span className="text-xs">📶</span>
          <span className="text-xs">🔋</span>
          <span className="text-xs bg-white text-black px-1 rounded">81</span>
        </div>
      </div>

      {/* URL Bar */}
      <div className="px-4 py-2">
        <div className="bg-gray-800 rounded-full px-4 py-2 text-white text-sm flex items-center gap-2">
          <span>🏠</span>
          <span>🔀</span>
          <span className="flex-1">ngl.link/{username}</span>
          <span>➕</span>
          <span className="bg-white text-black rounded px-2">10</span>
          <span>⋮</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-3xl p-4 w-full max-w-sm">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={recipientUser.avatar_url} alt={username} />
              <AvatarFallback className="bg-gray-300 text-gray-600">
                {username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-black">@{username}</div>
              <div className="text-sm text-gray-600">send me anonymous messages!</div>
            </div>
          </div>
        </Card>

        {/* Message Input */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 rounded-3xl p-4 w-full max-w-sm">
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[120px] border-0 bg-pink-100/50 resize-none text-gray-700 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:outline-none rounded-2xl p-4 text-base"
              maxLength={300}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={getRandomPrompt}
              className="absolute bottom-3 right-3 text-gray-500 hover:text-gray-700 p-1 h-8 w-8 text-lg"
            >
              🎲
            </Button>
          </div>
        </Card>

        {/* Anonymous Badge */}
        <div className="flex items-center justify-center">
          <span className="text-yellow-300 bg-yellow-300/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            🔒 anonymous q&a
          </span>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-full max-w-sm bg-black text-white py-4 text-lg font-semibold rounded-full hover:bg-gray-800 disabled:opacity-50"
        >
          Send!
        </Button>

        {/* Stats */}
        <div className="text-center text-yellow-300 text-lg mt-8">
          👇 {friendCount} friends just tapped the button 👇
        </div>

        {/* Get Own Link Button */}
        <Button
          onClick={() => navigate("/")}
          className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 text-lg font-semibold w-full max-w-sm"
        >
          Get your own messages!
        </Button>

        {/* Footer Links */}
        <div className="flex gap-6 text-white/75 text-sm mt-4">
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>
    </div>
  );
};

export default UserPage;