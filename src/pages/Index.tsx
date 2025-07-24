import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Copy, Share2, Settings, Inbox } from "lucide-react";
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
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    const link = `${window.location.origin}/send/${userProfile?.username || user?.id}`;
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

  const profileLink = `${window.location.origin}/send/${userProfile?.username || user?.id}`;

  return (
    <div className="min-h-screen bg-black/80 relative overflow-hidden font-sans flex items-center justify-center">
      {/* Phone Container */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Phone Frame */}
        <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
          {/* Screen */}
          <div className="bg-gradient-ngl rounded-[2.5rem] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 py-2 text-white text-sm">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-2 h-1 bg-white rounded-sm m-0.5"></div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 flex flex-col h-full p-4 pb-6">
              {/* Header */}
              <div className="fixed top-16 right-6 flex gap-2 z-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/inbox")}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <Inbox className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-6 mt-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-center gap-8 mb-4">
                  <Button variant="ghost" className="text-white/60 hover:text-white">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">👁</span>
                    </div>
                  </Button>
                  <h1 className="text-xl font-bold text-white">PLAY</h1>
                  <h1 className="text-xl font-bold text-white/40">INBOX</h1>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Button variant="ghost" className="text-white/60 hover:text-white">
                    <Settings className="w-6 h-6" />
                  </Button>
                </div>

                {/* Story Template Preview */}
                <div className="bg-gradient-to-br from-amber-900 to-amber-700 rounded-3xl p-8 text-center relative mx-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-white text-xl font-bold mb-2">
                    send me anonymous<br />messages!
                  </h2>
                  <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🎲</span>
                  </div>
                  {/* Dots indicator */}
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                  </div>
                </div>

                {/* Step 1: Copy Link */}
                <div className="text-center space-y-4 px-4">
                  <h3 className="text-xl font-bold text-black">
                    Step 1: Copy your link
                  </h3>
                  <p className="text-gray-500 text-sm">
                    NGL.LINK/{userProfile?.username?.toUpperCase() || user?.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <Button 
                    onClick={copyLink}
                    variant="outline"
                    className="px-8 py-3 text-base font-medium rounded-full border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                  >
                    📎 copy link
                  </Button>
                </div>

                {/* Step 2: Share Button */}
                <div className="text-center space-y-4 px-4 pb-4">
                  <h3 className="text-xl font-bold text-black">
                    Step 2: Share link on your story
                  </h3>
                  <Button 
                    onClick={shareLink}
                    className="w-full py-4 text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 rounded-full text-white"
                  >
                    Share!
                  </Button>
                </div>
              </div>
            </div>
          </div>
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