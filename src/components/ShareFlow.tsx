import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ShareFlowProps {
  isOpen: boolean;
  onClose: () => void;
  userLink: string;
  username: string;
}

const ShareFlow = ({ isOpen, onClose, userLink, username }: ShareFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: "Click the 🔗 button",
      description: "Open Instagram and start creating a new story. Look for the sticker button in the top menu.",
      image: "/placeholder-step1.png",
      instruction: "Click the sticker button at the top of your Instagram story"
    },
    {
      title: "Click the LINK sticker",
      description: "Find and tap the 'LINK' sticker from the sticker options.",
      image: "/placeholder-step2.png", 
      instruction: "Select the LINK sticker from the available options"
    },
    {
      title: "Paste your link!",
      description: "Paste your copied link in the URL field that appears.",
      image: "/placeholder-step3.png",
      instruction: `Paste: ${userLink}`
    },
    {
      title: "Frame the link",
      description: "Customize your story with the anonymous message template.",
      image: "/placeholder-step4.png",
      instruction: "Position and style your story as desired"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - share to Instagram
      shareToInstagram();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const shareToInstagram = () => {
    // Create Instagram story URL with template
    const text = encodeURIComponent("send me anonymous messages!");
    const instagramUrl = `https://www.instagram.com/create/story`;
    
    // Open Instagram in new tab
    window.open(instagramUrl, '_blank');
    onClose();
  };

  const resetFlow = () => {
    setCurrentStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetFlow}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-3xl border-0 p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              How to add the Link to your story
            </DialogTitle>
          </DialogHeader>
          
          {/* Step indicators */}
          <div className="flex justify-center gap-3 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-white text-black' 
                    : step < currentStep 
                      ? 'bg-white/30 text-white'
                      : 'bg-black/20 text-white/70'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current step content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-black">
              {steps[currentStep - 1].title}
            </h3>
            
            {/* Mock phone interface for each step */}
            <div className="bg-gray-100 rounded-2xl p-4 mb-4 min-h-[300px] flex items-center justify-center">
              <div className="text-gray-500 text-sm">
                {steps[currentStep - 1].instruction}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1 py-3 rounded-2xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className={`flex-1 py-3 rounded-2xl text-white font-medium ${
                currentStep === steps.length
                  ? 'bg-black hover:bg-black/90'
                  : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90'
              }`}
            >
              {currentStep === steps.length ? (
                "Share on Instagram!"
              ) : (
                <>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareFlow;