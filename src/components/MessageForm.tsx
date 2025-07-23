import { useState } from "react";
import { Send, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MessageFormProps {
  onSendMessage?: (message: string) => void;
}

const prompts = [
  "do u believe in second chances?",
  "are u single?",
  "what's your biggest secret?",
  "who do you have a crush on?",
  "what's your biggest fear?",
  "what's something you've never told anyone?",
  "what's your most embarrassing moment?",
  "if you could change one thing about yourself, what would it be?",
  "what's your dream job?",
];

export const MessageForm = ({ onSendMessage }: MessageFormProps) => {
  const [message, setMessage] = useState("do u believe in second chances?");
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim()) return;
    
    onSendMessage?.(message);
    toast({
      title: "Message sent! 📤",
      description: "Your anonymous message has been delivered",
    });
    setMessage("");
  };

  const getRandomPrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setMessage(randomPrompt);
  };

  return (
    <Card className="bg-white border-0 shadow-card rounded-3xl max-w-sm mx-auto overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder=""
            className="min-h-[100px] border-0 bg-text-area resize-none text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:outline-none rounded-2xl p-4 font-normal text-gray-700"
            maxLength={300}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={getRandomPrompt}
            className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
          >
            🎲
          </Button>
        </div>
        
        <div className="flex items-center justify-center">
          <span className="text-sm text-black bg-yellow-badge px-3 py-1 rounded-full font-medium">
            🔒 anonymous q&a
          </span>
        </div>

        <Button 
          onClick={handleSend}
          disabled={!message.trim()}
          variant="ngl"
          className="w-full py-3 text-base font-medium"
        >
          Send!
        </Button>
      </div>
    </Card>
  );
};