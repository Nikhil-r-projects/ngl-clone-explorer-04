import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface StatsSectionProps {
  friendCount?: number;
}

export const StatsSection = ({ friendCount = 289 }: StatsSectionProps) => {
  return (
    <div className="text-center space-y-6 max-w-sm mx-auto">
      <div className="text-yellow-badge text-base font-medium">
        👇 {friendCount} friends just tapped the button 👇
      </div>
      
      <Button 
        variant="ngl-dark" 
        className="px-8 py-3 text-base font-medium"
        onClick={() => window.open('https://apps.apple.com/us/app/ngl-anonymous-q-a/id1596550932', '_blank')}
      >
        Get your own messages!
      </Button>
      
      <div className="flex justify-center gap-6 text-sm text-white/70">
        <button className="hover:text-white transition-colors underline">
          Terms
        </button>
        <button className="hover:text-white transition-colors underline">
          Privacy
        </button>
      </div>
    </div>
  );
};