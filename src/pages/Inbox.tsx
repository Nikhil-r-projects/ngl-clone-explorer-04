import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const Inbox = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('recipient_id', user.id);

      if (!error) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-ngl relative overflow-hidden font-sans">
      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium text-white">Inbox</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="max-w-md mx-auto space-y-4">
          {loading ? (
            <div className="text-center text-white/80 py-8">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <Card className="bg-white border-0 shadow-card rounded-3xl p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No messages yet</h3>
              <p className="text-gray-600 text-sm">
                Share your link to start receiving anonymous messages!
              </p>
            </Card>
          ) : (
            messages.map((message) => (
              <Card 
                key={message.id}
                className="bg-white border-0 shadow-card rounded-3xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => !message.is_read && markAsRead(message.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${!message.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {!message.is_read ? 'New' : 'Read'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(message.created_at)}
                  </span>
                </div>
                <p className="text-black text-base leading-relaxed">
                  {message.content}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;