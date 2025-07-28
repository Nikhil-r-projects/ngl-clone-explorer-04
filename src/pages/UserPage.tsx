import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

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
  const [senderUsername, setSenderUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user logs in and we have a stored redirect, handle it
        if (session?.user && localStorage.getItem('redirectAfterLogin')) {
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath === window.location.pathname) {
            localStorage.removeItem('redirectAfterLogin');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If no session, redirect to auth immediately
      if (!session?.user) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate("/auth");
        return;
      }
    });

    if (username) {
      fetchRecipientUser();
    }

    return () => subscription.unsubscribe();
  }, [username, navigate]);

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
    // Check if user is authenticated
    if (!user || !session) {
      // Store intended route for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate("/auth");
      return;
    }

    if (!message.trim() || !recipientUser) return;
    
    try {
      // Get the authenticated user's profile to get their username
      const { data: senderProfile } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('messages')
        .insert({
          content: message,
          recipient_id: recipientUser.id,
          sender_username: senderProfile?.username || null
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
      setSenderUsername("");
      setFriendCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGetOwnLink = () => {
    // Check if user is authenticated
    if (!user || !session) {
      // Store intended route for redirect after login
      localStorage.setItem('redirectAfterLogin', '/');
      navigate("/auth");
      return;
    }
    
    // If authenticated, go to homepage (Play page)
    navigate("/");
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
              onClick={handleGetOwnLink}
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
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-white text-2xl font-bold">
            Send a message to {username}
          </h1>
        </div>

        {/* Profile Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-4 ring-white/20">
              <AvatarImage src={recipientUser.avatar_url} alt={username} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white text-lg font-bold">
                {username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-bold text-black text-lg">@{username}</div>
              <div className="text-gray-600 text-sm">Send me anonymous messages!</div>
            </div>
          </div>
        </Card>

        {/* Message Input */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-3xl p-6 shadow-xl">
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your anonymous message..."
              className="min-h-[140px] border-0 bg-gray-50/80 resize-none text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-0 rounded-2xl p-4 text-base font-medium shadow-inner"
              maxLength={300}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={getRandomPrompt}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform duration-200 bg-white/80 hover:bg-white rounded-full w-12 h-12 shadow-lg"
              title="Get random prompt"
            >
              🎲
            </Button>
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {message.length}/300
            </div>
          </div>
        </Card>

        {/* Optional Sender Username */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-3xl p-4 shadow-xl">
          <Input
            value={senderUsername}
            onChange={(e) => setSenderUsername(e.target.value)}
            placeholder="Your username (optional - for admin tracking)"
            className="border-0 bg-gray-50/80 text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-0 rounded-2xl text-sm"
            maxLength={50}
          />
        </Card>

        {/* Anonymous Badge */}
        <div className="flex items-center justify-center">
          <span className="text-white bg-white/20 px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/30">
            🔒 100% Anonymous
          </span>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Message ✨
        </Button>

        {/* Stats */}
        <div className="text-center text-white/90 text-base font-medium">
          💌 {friendCount} messages sent today
        </div>

        {/* Get Own Link Button */}
        <Button
          onClick={handleGetOwnLink}
          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 py-3 text-base font-semibold rounded-full backdrop-blur-sm transition-all duration-200"
          variant="outline"
        >
          Get your own messages!
        </Button>

        {/* Footer Links */}
        <div className="flex justify-center gap-8 text-white/60 text-sm mt-6">
          <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
        </div>
      </div>
    </div>
  );
};

export default UserPage;