import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Copy, Share2, Settings, Inbox, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import ShareFlow from "@/components/ShareFlow";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isShareFlowOpen, setIsShareFlowOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchMessageCount();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMessageCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id);

      if (error) {
        console.error('Error fetching message count:', error);
      } else {
        setMessageCount(count || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/${userProfile?.username || user?.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied! 📋",
      description: "Share this link to receive anonymous messages",
    });
  };

  const shareLink = () => {
    setIsShareFlowOpen(true);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-ngl flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const profileLink = `${window.location.origin}/${userProfile?.username || user?.id}`;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-4 bg-white">
        <Eye className="w-6 h-6 text-gray-600" />
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-black">PLAY</span>
          </div>
          <button 
            onClick={() => navigate("/inbox")}
            className="text-base font-semibold text-gray-600"
          >
            INBOX
          </button>
        </div>
        
        <Settings className="w-6 h-6 text-gray-600" />
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Main Card */}
        <Card className="bg-gradient-to-br from-amber-900 to-amber-700 rounded-2xl p-8 text-center relative shadow-md">
          <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gray-300 text-gray-600">
                {userProfile?.username?.charAt(0)?.toUpperCase() || '👤'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-black rounded-full border-2 border-white flex items-center justify-center">
              <Copy className="w-2 h-2 text-white" />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold">
            send me anonymous<br />messages!
          </h2>
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">👤</span>
          </div>
        </Card>

        {/* Step 1: Copy Link */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-black">
            Step 1: Copy your link
          </h3>
          <div className="bg-gray-100 rounded-full px-4 py-3 flex items-center justify-between">
            <span className="text-gray-700 text-sm">
              NGL.LINK/{userProfile?.username?.toUpperCase() || user?.id?.slice(0, 8).toUpperCase()}
            </span>
            <Copy className="w-5 h-5 text-gray-500" />
          </div>
          <Button 
            onClick={copyLink}
            variant="outline"
            className="px-8 py-3 text-base font-medium rounded-full border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
          >
            📎 copy link
          </Button>
        </div>

        {/* Step 2: Share Button */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-black">
            Step 2: Share link on your story
          </h3>
          <Button 
            onClick={shareLink}
            className="w-full h-12 text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 rounded-full text-white"
          >
            Share!
          </Button>
        </div>
      </div>

      <ShareFlow
        isOpen={isShareFlowOpen}
        onClose={() => setIsShareFlowOpen(false)}
        userLink={profileLink}
        username={userProfile?.username || user?.id}
      />
    </div>
  );
};

export default Index;