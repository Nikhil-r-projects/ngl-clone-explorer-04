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
    <div className="min-h-screen bg-gradient-ngl relative overflow-hidden font-sans">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="fixed top-4 right-4 flex gap-2">
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

        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-3xl">🎲</span>
            <h1 className="text-2xl font-bold text-white mt-2">NGL</h1>
            <p className="text-white/80 text-sm">anonymous q&a</p>
          </div>

          {/* Profile Card */}
          <Card className="bg-white border-0 shadow-card rounded-3xl p-6 text-center">
            <div className="w-20 h-20 bg-gradient-ngl rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-medium text-black mb-2">
              @{userProfile.username}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              send me anonymous messages!
            </p>
            <Badge className="bg-yellow-badge text-black text-sm px-3 py-1 rounded-full">
              {messageCount} messages received
            </Badge>
          </Card>

          {/* Share Section */}
          <Card className="bg-white border-0 shadow-card rounded-3xl p-6">
            <h3 className="text-lg font-medium text-black mb-4 text-center">
              Step 1: Copy your link
            </h3>
            <div className="bg-text-area rounded-2xl p-3 mb-4">
              <p className="text-gray-600 text-sm break-all">
                {profileLink}
              </p>
            </div>
            <Button 
              onClick={copyLink}
              variant="outline"
              className="w-full py-3 text-base font-medium rounded-2xl border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </Card>

          {/* Share Button */}
          <Card className="bg-white border-0 shadow-card rounded-3xl p-6">
            <h3 className="text-lg font-medium text-black mb-4 text-center">
              Step 2: Share link on your story
            </h3>
            <Button 
              onClick={shareLink}
              variant="ngl"
              className="w-full py-3 text-base font-medium bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share!
            </Button>
          </Card>
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