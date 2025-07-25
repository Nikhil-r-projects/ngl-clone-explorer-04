import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Heart, MessageCircle, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import ReplyModal from "@/components/ReplyModal";

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const InboxPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

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
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setIsReplyModalOpen(true);
    
    // Mark message as read
    if (!message.is_read) {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', message.id);
          
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id ? { ...msg, is_read: true } : msg
          )
        );
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return messageTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-white text-purple-600 px-8 py-3 rounded-full hover:bg-gray-100"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-white text-xl font-bold">Inbox</h1>
            <p className="text-white/80 text-sm">{messages.length} messages</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💌</div>
            <h2 className="text-white text-xl font-bold mb-2">No messages yet</h2>
            <p className="text-white/80 mb-6">Share your link to start receiving anonymous messages!</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-white text-purple-600 px-8 py-3 rounded-full hover:bg-gray-100"
            >
              Share Your Link
            </Button>
          </div>
        ) : (
          messages.map((message) => (
            <Card 
              key={message.id}
              className="bg-white/95 backdrop-blur-sm border-0 rounded-2xl p-4 cursor-pointer hover:bg-white transition-all duration-200 shadow-lg"
              onClick={() => handleMessageClick(message)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">👤</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Anonymous</span>
                    <div className="flex items-center gap-2">
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(message.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 text-sm leading-relaxed line-clamp-2">
                    {message.content}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-pink-600 p-1"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-purple-600 p-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {selectedMessage && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setSelectedMessage(null);
          }}
          message={selectedMessage}
          username={username || "user"}
        />
      )}
    </div>
  );
};

export default InboxPage;