import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Instagram, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    id: string;
    content: string;
    created_at: string;
  };
  username: string;
}

const ReplyModal = ({ isOpen, onClose, message, username }: ReplyModalProps) => {
  const [reply, setReply] = useState("");
  const { toast } = useToast();

  const handleShare = () => {
    const shareText = `Someone asked me: "${message.content}"\n\nAsk me anything anonymously!`;
    const shareUrl = `${window.location.origin}/${username}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Anonymous Q&A",
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share this on your Instagram story",
      });
    }
  };

  const handleInstagramShare = () => {
    // Create a story-friendly URL for Instagram
    const instagramUrl = `https://www.instagram.com/stories/camera/`;
    window.open(instagramUrl, '_blank');
    
    toast({
      title: "Opening Instagram",
      description: "Create a story with your message!",
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Message copied!",
      description: "You can now paste it anywhere",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-3xl border-0 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-black">
            Anonymous Message
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-2">
          {/* Message Display */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-gray-800 text-base leading-relaxed">
              "{message.content}"
            </p>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(message.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-full font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share to Story
            </Button>
            
            <Button
              onClick={handleInstagramShare}
              variant="outline"
              className="w-full py-3 rounded-full font-semibold border-2 border-pink-400 text-pink-600 hover:bg-pink-50"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Open Instagram
            </Button>
            
            <Button
              onClick={handleCopyMessage}
              variant="outline"
              className="w-full py-3 rounded-full font-semibold border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Message
            </Button>
          </div>

          {/* Reply Section */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Quick Reply (Optional)</div>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a public reply..."
              className="min-h-[80px] border-0 bg-gray-50 resize-none text-gray-700 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-0 rounded-2xl p-3"
              maxLength={200}
            />
            <div className="text-xs text-gray-400 text-right">
              {reply.length}/200
            </div>
            
            <Button
              disabled={!reply.trim()}
              className="w-full bg-black text-white py-2 rounded-full font-medium disabled:opacity-50"
            >
              Post Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyModal;