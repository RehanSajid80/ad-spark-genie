
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import ChatBox from './ChatBox';
import { useMediaQuery } from '@/hooks/use-mobile';

interface ImageRefinementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AdSuggestion | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  imageUrl?: string | null;
}

const ImageRefinementDialog: React.FC<ImageRefinementDialogProps> = ({
  isOpen,
  onClose,
  suggestion,
  messages,
  onSendMessage,
  isProcessing,
  imageUrl
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  // If we don't have a suggestion but have an imageUrl, create a temporary suggestion object
  const chatSuggestion = suggestion || (imageUrl ? {
    id: 'temp-refinement',
    platform: 'linkedin',
    headline: "Image Refinement",
    description: "Use the chat to refine your image",
    imageRecommendation: "Describe what you want to see in your image",
    dimensions: '1200 x 627 pixels',
    generatedImageUrl: imageUrl,
    revisedPrompt: null
  } : null);
  
  if (!chatSuggestion) return null;
  
  const toggleDialogSize = () => {
    setIsExpanded(!isExpanded);
  };

  // Use Sheet for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <div className="h-full">
            <ChatBox
              suggestion={chatSuggestion}
              messages={messages}
              onSendMessage={onSendMessage}
              isProcessing={isProcessing}
              isDialogMode={true}
              onToggleDialogSize={toggleDialogSize}
            />
            <div className="p-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isExpanded ? 'max-w-4xl h-[80vh]' : 'max-w-xl'} p-0`}>
        <div className="h-full">
          <ChatBox
            suggestion={chatSuggestion}
            messages={messages}
            onSendMessage={onSendMessage}
            isProcessing={isProcessing}
            isDialogMode={true}
            onToggleDialogSize={toggleDialogSize}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageRefinementDialog;
