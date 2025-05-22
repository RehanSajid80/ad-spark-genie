
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import ChatBox from './ChatBox';
import { useIsMobile } from '@/hooks/use-mobile';
import { Maximize, Minimize, X } from 'lucide-react';

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
  const isMobile = useIsMobile();

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
  
  // If not open or no suggestion, don't render anything
  if (!isOpen || !chatSuggestion) return null;
  
  const toggleDialogSize = () => {
    setIsExpanded(!isExpanded);
  };

  console.log("ImageRefinementDialog rendering with isOpen:", isOpen);

  // Use Sheet for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="text-lg font-medium">Image Refinement</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ChatBox
              suggestion={chatSuggestion}
              messages={messages}
              onSendMessage={onSendMessage}
              isProcessing={isProcessing}
              isDialogMode={true}
              onToggleDialogSize={toggleDialogSize}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay />
      <DialogContent className={`${isExpanded ? 'max-w-4xl h-[80vh]' : 'max-w-xl h-[600px]'} p-0 flex flex-col`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="text-lg font-medium">Image Refinement</h3>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDialogSize}
                className="h-8 w-8"
              >
                {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-grow overflow-hidden">
            <ChatBox
              suggestion={chatSuggestion}
              messages={messages}
              onSendMessage={onSendMessage}
              isProcessing={isProcessing}
              isDialogMode={true}
              onToggleDialogSize={toggleDialogSize}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageRefinementDialog;
